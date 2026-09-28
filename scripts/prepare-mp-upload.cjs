const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const sourceDir = path.join(projectRoot, "dist", "build", "mp-weixin");
// Keep the upload package separate from the directory opened by WeChat
// DevTools for preview/automation. DevTools may keep component JSON files
// open and a copy into that directory can silently become NUL bytes.
let uploadDir = path.join(projectRoot, "dist", "upload", "mp-weixin-ready");
const maxBytes = 2 * 1024 * 1024;

function assertInsideProject(target) {
  const relative = path.relative(projectRoot, target);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`拒绝操作项目目录外路径：${target}`);
  }
}

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(fullPath) : [fullPath];
  });
}

function assertCopiedExactly(source, target) {
  for (const sourceFile of filesIn(source)) {
    const relative = path.relative(source, sourceFile);
    const targetFile = path.join(target, relative);
    if (!fs.existsSync(targetFile)) {
      throw new Error(`上传包缺少构建文件：${relative}`);
    }
    const sourceBytes = fs.readFileSync(sourceFile);
    const targetBytes = fs.readFileSync(targetFile);
    if (!sourceBytes.equals(targetBytes)) {
      throw new Error(`上传包文件复制不完整：${relative}`);
    }
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function enforceWechatReleaseConfig(directory) {
  const projectConfigFile = path.join(directory, "project.config.json");
  const appConfigFile = path.join(directory, "app.json");
  const projectConfig = readJson(projectConfigFile);
  const safeIgnore = (projectConfig.packOptions?.ignore || []).filter(
    (item) => item?.value !== "static/images",
  );
  projectConfig.packOptions = {
    ...(projectConfig.packOptions || {}),
    ignore: safeIgnore,
  };
  projectConfig.setting = {
    ...(projectConfig.setting || {}),
    es6: true,
    minified: true,
    minifyWXSS: true,
    minifyWXML: true,
  };
  writeJson(projectConfigFile, projectConfig);

  const appConfig = readJson(appConfigFile);
  appConfig.lazyCodeLoading = "requiredComponents";
  writeJson(appConfigFile, appConfig);
}

if (!fs.existsSync(path.join(sourceDir, "project.config.json"))) {
  throw new Error("未找到正式小程序构建，请先执行 npm run build:mp-weixin");
}

// uni-app emits imported bitmap paths into common/assets.js but does not copy
// those files for mp-weixin. Materialize them before packaging so icons do not
// disappear on a real device.
const generatedAssetMap = path.join(sourceDir, "common", "assets.js");
if (fs.existsSync(generatedAssetMap)) {
  const assetCode = fs.readFileSync(generatedAssetMap, "utf8");
  const assetPattern = /exports\.(green|muted|dark|white)_([A-Za-z]+)="(\/assets\/[^"]+\.png)"/g;
  let assetMatch;
  while ((assetMatch = assetPattern.exec(assetCode))) {
    const [, tone, iconName, publicPath] = assetMatch;
    const iconSource = path.join(projectRoot, "static", "icons", tone, `${iconName}.png`);
    const iconTarget = path.join(sourceDir, publicPath.replace(/^\//, ""));
    if (!fs.existsSync(iconSource)) {
      throw new Error(`缺少小程序图标资源：${iconSource}`);
    }
    fs.mkdirSync(path.dirname(iconTarget), { recursive: true });
    fs.copyFileSync(iconSource, iconTarget);
  }

  // Template literals such as /static/images/tea-gift-v2.webp are rewritten by
  // uni-app to hashed /assets paths as well. Copy the exact source bytes into
  // that generated path; do not resize, recompress or re-encode originals.
  const imagePattern = /exports\.[A-Za-z0-9_$]+="(\/assets\/([^/".]+)\.[a-f0-9]+\.(png|jpe?g|webp|gif))"/g;
  let imageMatch;
  while ((imageMatch = imagePattern.exec(assetCode))) {
    const [, publicPath, baseName, extension] = imageMatch;
    const imageSource = path.join(projectRoot, "static", "images", `${baseName}.${extension}`);
    if (!fs.existsSync(imageSource)) continue;
    const imageTarget = path.join(sourceDir, publicPath.replace(/^\//, ""));
    fs.mkdirSync(path.dirname(imageTarget), { recursive: true });
    fs.copyFileSync(imageSource, imageTarget);
  }
}

// Runtime images are now static imports emitted as compiler-owned /assets URLs.
// Keeping a second /static/images copy doubles the main package and previously
// left templates pointing at untracked runtime strings, so no duplicate copy is
// produced here.
const requiredRuntimeImages = [];
for (const fileName of requiredRuntimeImages) {
  const imageSource = path.join(projectRoot, "static", "images", fileName);
  const imageTarget = path.join(sourceDir, "static", "images", fileName);
  if (!fs.existsSync(imageSource)) {
    throw new Error(`缺少小程序首屏必需图片：${imageSource}`);
  }
  fs.mkdirSync(path.dirname(imageTarget), { recursive: true });
  fs.copyFileSync(imageSource, imageTarget);
  if (!fs.readFileSync(imageSource).equals(fs.readFileSync(imageTarget))) {
    throw new Error(`小程序首屏图片复制后字节不一致：${fileName}`);
  }
}

// The directory opened directly by WeChat DevTools must also be free of the
// old folder-wide ignore rule, not only the separate upload package.
enforceWechatReleaseConfig(sourceDir);

assertInsideProject(uploadDir);
try {
  fs.rmSync(uploadDir, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
} catch (error) {
  if (error?.code !== "EPERM" && error?.code !== "EBUSY") throw error;
  // 微信开发者工具会锁定已打开的上传目录。保留它供当前调试，
  // 改用稳定的备用目录生成本次可上传包。
  uploadDir = path.join(projectRoot, "dist", "upload", "mp-weixin-release");
  assertInsideProject(uploadDir);
  try {
    fs.rmSync(uploadDir, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
  } catch (releaseError) {
    if (releaseError?.code !== "EPERM" && releaseError?.code !== "EBUSY") throw releaseError;
    // 同时打开预览目录和上一次发布目录时，使用本次独立目录，避免
    // 为构建而强制关闭开发者工具或覆盖仍被读取的文件。
    const buildStamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
    uploadDir = path.join(projectRoot, "dist", "upload", `mp-weixin-release-${buildStamp}`);
    assertInsideProject(uploadDir);
  }
}
fs.mkdirSync(path.dirname(uploadDir), { recursive: true });
fs.cpSync(sourceDir, uploadDir, { recursive: true });
assertCopiedExactly(sourceDir, uploadDir);
enforceWechatReleaseConfig(uploadDir);

const packageFiles = filesIn(uploadDir);
const packageBytes = packageFiles.reduce((total, file) => total + fs.statSync(file).size, 0);
const text = packageFiles
  .filter((file) => /\.(js|json|wxml)$/i.test(file))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

const localAssetRefs = [...text.matchAll(/["'](\/assets\/[^"']+)["']/g)].map((match) => match[1]);
for (const assetRef of new Set(localAssetRefs)) {
  const assetFile = path.join(uploadDir, assetRef.replace(/^\//, ""));
  if (!fs.existsSync(assetFile)) throw new Error(`上传包引用了缺失资源：${assetRef}`);
}
if (packageBytes >= maxBytes) {
  throw new Error(`上传包 ${(packageBytes / 1024 / 1024).toFixed(3)}MB，已超过微信 2MB 主包限制`);
}

const oversizedMedia = packageFiles.filter((file) =>
  /\.(png|jpe?g|gif|webp|svg|mp3|m4a|aac|wav|ogg)$/i.test(file)
  && fs.statSync(file).size > 200 * 1024,
);
if (oversizedMedia.length) {
  throw new Error(`上传包仍有超过200KB的媒体资源：${oversizedMedia.map((file) => path.relative(uploadDir, file)).join(", ")}`);
}

const releaseProjectConfig = readJson(path.join(uploadDir, "project.config.json"));
const releaseAppConfig = readJson(path.join(uploadDir, "app.json"));
if (!releaseProjectConfig.setting?.minified || releaseAppConfig.lazyCodeLoading !== "requiredComponents") {
  throw new Error("微信小程序压缩或组件按需注入配置未生效");
}
if ((releaseProjectConfig.packOptions?.ignore || []).some((item) => item?.value === "static/images")) {
  throw new Error("微信上传包仍错误忽略 static/images");
}
for (const fileName of requiredRuntimeImages) {
  const sourceImage = path.join(projectRoot, "static", "images", fileName);
  const packagedImage = path.join(uploadDir, "static", "images", fileName);
  if (!fs.existsSync(packagedImage) || !fs.readFileSync(sourceImage).equals(fs.readFileSync(packagedImage))) {
    throw new Error(`微信上传包缺少原字节首屏图片：${fileName}`);
  }
}

const sourceVersion = fs.readFileSync(path.join(projectRoot,'manifest.json'),'utf8').match(/"versionName"\s*:\s*"([^"]+)"/)?.[1];
if (!sourceVersion) throw new Error('manifest缺少版本号');
writeJson(path.join(projectRoot, 'dist', 'upload', 'latest-package.json'), { directory: uploadDir, version: sourceVersion });
console.log(`微信小程序上传包：${uploadDir}`);
console.log(`文件数：${packageFiles.length}，主包大小：${(packageBytes / 1024 / 1024).toFixed(3)}MB`);
