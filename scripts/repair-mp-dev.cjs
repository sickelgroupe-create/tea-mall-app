const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
// CLI 构建当前输出到 dist/dev；仍允许显式传入旧版 HBuilderX 的 unpackage 路径。
const requestedOutput = process.argv[2] || path.join("dist", "dev", "mp-weixin");
const devDir = path.resolve(projectRoot, requestedOutput);
const relativeDevDir = path.relative(projectRoot, devDir);

if (relativeDevDir.startsWith("..") || path.isAbsolute(relativeDevDir)) {
  throw new Error(`拒绝清理项目目录外路径：${devDir}`);
}
if (!fs.existsSync(path.join(devDir, "app.json"))) {
  throw new Error("未找到微信小程序开发输出，请先运行开发构建");
}

const projectConfigFile = path.join(devDir, "project.config.json");
const projectConfig = JSON.parse(fs.readFileSync(projectConfigFile, "utf8"));
delete projectConfig.miniprogramRoot;
projectConfig.packOptions = {
  ...(projectConfig.packOptions || {}),
  ignore: (projectConfig.packOptions?.ignore || []).filter(
    (item) => item?.value !== "static/images",
  ),
};
projectConfig.setting = {
  ...(projectConfig.setting || {}),
  es6: true,
  minified: true,
  minifyWXSS: true,
  minifyWXML: true,
};
fs.writeFileSync(projectConfigFile, `${JSON.stringify(projectConfig, null, 2)}\n`, "utf8");

const appConfigFile = path.join(devDir, "app.json");
const appConfig = JSON.parse(fs.readFileSync(appConfigFile, "utf8"));
appConfig.lazyCodeLoading = "requiredComponents";
fs.writeFileSync(appConfigFile, `${JSON.stringify(appConfig, null, 2)}\n`, "utf8");

// 首屏及离线兜底图片必须保留在开发包中，避免开发者工具因忽略规则显示空白。
const runtimeImages = [
  "longjing-dark-v2.webp",
  "longjing-hero-v2.webp",
  "login-art-v2.webp",
  "tea-gift-v2.webp",
  "biluochun.jpg",
  "invite-poster-v2.webp",
];
const sourceImagesDir = path.resolve(projectRoot, "static", "images");
const outputImagesDir = path.resolve(devDir, "static", "images");
fs.mkdirSync(outputImagesDir, { recursive: true });
for (const fileName of runtimeImages) {
  const sourceFile = path.join(sourceImagesDir, fileName);
  const outputFile = path.join(outputImagesDir, fileName);
  if (!fs.existsSync(sourceFile)) throw new Error(`缺少运行时图片：${sourceFile}`);
  fs.copyFileSync(sourceFile, outputFile);
  if (!fs.readFileSync(sourceFile).equals(fs.readFileSync(outputFile))) {
    throw new Error(`开发包图片字节校验失败：${fileName}`);
  }
}

if ((projectConfig.packOptions.ignore || []).some((item) => item?.value === "static/images")) {
  throw new Error("project.config.json 仍在忽略 static/images");
}

const files = [];
function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(fullPath);
    else files.push(fullPath);
  }
}
collect(devDir);
const bytes = files.reduce((sum, file) => sum + fs.statSync(file).size, 0);
console.log(`微信开发目录已修复：${devDir}`);
console.log(`文件数：${files.length}，当前体积：${(bytes / 1024 / 1024).toFixed(3)}MB`);
