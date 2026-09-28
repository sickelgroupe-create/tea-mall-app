import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const mode = process.argv[2];
if (!new Set(["release", "development"]).has(mode)) {
	throw new Error(
		"usage: node scripts/audit-login45-builds.mjs release|development",
	);
}
const directory =
	mode === "release"
		? path.join(root, "dist", "upload", "mp-weixin-ready")
		: path.join(root, "dist", "build", "mp-weixin");
const output = path.join(
	root,
	"docs",
	"login45-special",
	`mp-${mode}-build-audit.json`,
);
const requiredImages = [
	"login-art-v2.webp",
	"longjing-dark-v2.webp",
	"longjing-hero-v2.webp",
];

function filesIn(current) {
	return fs.readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
		const full = path.join(current, entry.name);
		return entry.isDirectory() ? filesIn(full) : [full];
	});
}

function sha256(file) {
	return crypto
		.createHash("sha256")
		.update(fs.readFileSync(file))
		.digest("hex");
}

const files = filesIn(directory);
const textFiles = files.filter((file) =>
	/\.(?:js|json|wxml|wxss|map|html|css)$/i.test(file),
);
const combined = textFiles
	.map((file) => fs.readFileSync(file, "utf8"))
	.join("\n");
const projectConfig = JSON.parse(
	fs.readFileSync(path.join(directory, "project.config.json"), "utf8"),
);
const apiMatches = [
	...new Set(combined.match(/https?:\/\/[^"'`\s)]+/g) || []),
].sort();
const forbidden = apiMatches.filter((url) =>
	/localhost|127\.0\.0\.1/i.test(url),
);
const expected =
	mode === "release"
		? "https://chaye.okam.top/api/mall"
		: "http://127.0.0.1:18083/mall";
const report = {
	generatedAt: new Date().toISOString(),
	mode,
	directory,
	fileCount: files.length,
	bytes: files.reduce((sum, file) => sum + fs.statSync(file).size, 0),
	expectedApi: expected,
	expectedApiPresent: combined.includes(expected),
	apiMatches,
	forbiddenLocalAddresses: mode === "release" ? forbidden : [],
	staticImagesFolderIgnored: (projectConfig.packOptions?.ignore || []).some(
		(item) => item?.type === "folder" && item?.value === "static/images",
	),
	images: Object.fromEntries(
		requiredImages.map((name) => {
			const source = path.join(root, "static", "images", name);
			const parsed = path.parse(name);
			const packaged = files.find((file) => {
				const candidate = path.parse(file);
				return (
					candidate.ext.toLowerCase() === parsed.ext.toLowerCase() &&
					new RegExp(
						`^${parsed.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.[0-9a-f]{8}$`,
						"i",
					).test(candidate.name)
				);
			});
			return [
				name,
				{
					exists: Boolean(packaged && fs.existsSync(packaged)),
					sourceBytes: fs.statSync(source).size,
					packagedBytes:
						packaged && fs.existsSync(packaged)
							? fs.statSync(packaged).size
							: null,
					sourceSha256: sha256(source),
					packagedSha256:
						packaged && fs.existsSync(packaged)
							? sha256(packaged)
							: null,
					byteIdentical: Boolean(
						packaged &&
						fs.existsSync(packaged) &&
						sha256(source) === sha256(packaged),
					),
				},
			];
		}),
	),
};
if (!report.expectedApiPresent)
	throw new Error(`${mode} 构建缺少预期 API：${expected}`);
if (mode === "release" && report.forbiddenLocalAddresses.length) {
	throw new Error(
		`正式构建包含本机地址：${report.forbiddenLocalAddresses.join(", ")}`,
	);
}
if (report.staticImagesFolderIgnored)
	throw new Error("构建仍忽略 static/images");
for (const [name, detail] of Object.entries(report.images)) {
	if (!detail.exists || !detail.byteIdentical)
		throw new Error(`图片未按原字节进入包内：${name}`);
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ result: "PASS", output, ...report }, null, 2));
