const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const packageInfo = JSON.parse(fs.readFileSync(path.join(root,'dist/upload/latest-package.json'),'utf8'));
const mp = path.resolve(packageInfo.directory);
const sourceVersion=fs.readFileSync(path.join(root,'manifest.json'),'utf8').match(/"versionName"\s*:\s*"([^"]+)"/)?.[1];
if (!mp.startsWith(path.join(root,'dist','upload')+path.sep) || !sourceVersion || packageInfo.version !== sourceVersion) throw new Error('候选包路径或版本不一致');
const h5 = path.join(root, "dist", "build", "h5");
const images = path.join(root, "static", "images");

function walk(directory) {
	if (!fs.existsSync(directory)) throw new Error(`缺少构建目录：${directory}`);
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const target = path.join(directory, entry.name);
		return entry.isDirectory() ? walk(target) : [target];
	});
}

function sha(file) {
	return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

const mpFiles = walk(mp);
const h5Files = walk(h5);
const readable = [...mpFiles, ...h5Files].filter((file) => /\.(?:js|json|wxml|wxss|html|css|map)$/i.test(file));
const text = readable.map((file) => fs.readFileSync(file, "utf8")).join("\n");
const wxml = mpFiles.filter((file) => /\.wxml$/i.test(file));
const wxmlText = wxml.map((file) => fs.readFileSync(file, "utf8")).join("\n");

const sourceImages = walk(images);
let mpCompared = 0;
let h5Compared = 0;
let mpMismatch = 0;
let h5Mismatch = 0;
for (const source of sourceImages) {
	const relative = path.relative(images, source);
	const parsed = path.parse(relative);
	const mpTarget = mpFiles.find((file) => {
		const candidate = path.parse(file);
		return candidate.ext.toLowerCase() === parsed.ext.toLowerCase()
			&& new RegExp(`^${parsed.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.[0-9a-f]{8}$`, "i").test(candidate.name);
	});
	const h5Target = path.join(h5, "static", "images", relative);
	if (mpTarget && fs.existsSync(mpTarget)) {
		mpCompared += 1;
		if (sha(source) !== sha(mpTarget)) mpMismatch += 1;
	}
	if (fs.existsSync(h5Target)) {
		h5Compared += 1;
		if (sha(source) !== sha(h5Target)) h5Mismatch += 1;
	}
}

const report = {
	status: "PASS",
	wxmlFiles: wxml.length,
	badEntityHits: (wxmlText.match(/&(?:amp;)?(?:gt|lt);/g) || []).length,
	localhostHits: (text.match(/(?:localhost|127\.0\.0\.1)/g) || []).length,
	formalApiHits: (text.match(/https:\/\/chaye\.okam\.top\/api\/mall/g) || []).length,
	sensitiveConfigHits: (text.match(/(?:appsecret|appid_secret|wechat_secret)\s*[:=]/gi) || []).length,
	sourceImages: sourceImages.length,
	mpImagesCompared: mpCompared,
	mpSha256Mismatch: mpMismatch,
	h5ImagesCompared: h5Compared,
	h5Sha256Mismatch: h5Mismatch,
	mpBytes: mpFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0),
	h5Bytes: h5Files.reduce((sum, file) => sum + fs.statSync(file).size, 0),
};
if (report.badEntityHits || report.localhostHits || report.sensitiveConfigHits || report.formalApiHits < 1 || report.mpSha256Mismatch || report.h5Sha256Mismatch) report.status = "FAIL";
console.log(JSON.stringify(report, null, 2));
if (report.status !== "PASS") process.exitCode = 1;
