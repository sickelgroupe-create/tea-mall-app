const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const targets = ["styles", "pages", "components"];
const ratio = 750 / 448;
let changedFiles = 0;
let convertedValues = 0;

function walk(directory) {
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const full = path.join(directory, entry.name);
		if (entry.isDirectory()) walk(full);
		else if (/\.(css|vue)$/.test(entry.name)) normalizeFile(full);
	}
}

function convertCss(css) {
	const media = [];
	css = css.replace(/@media\s*\([^)]*\)/g, (value) => {
		media.push(value);
		return `__TEA_MEDIA_${media.length - 1}__`;
	});
	css = css.replace(/(-?\d*\.?\d+)px\b/g, (whole, raw) => {
		const value = Number(raw);
		if (!Number.isFinite(value) || Math.abs(value) <= 1) return whole;
		convertedValues += 1;
		const converted = Math.round(value * ratio * 10) / 10;
		return `${Number(converted.toFixed(1))}rpx`;
	});
	return css.replace(/__TEA_MEDIA_(\d+)__/g, (_, index) => media[Number(index)]);
}

function normalizeFile(file) {
	const source = fs.readFileSync(file, "utf8");
	let output = source;
	if (file.endsWith(".css")) output = convertCss(source);
	else output = source.replace(/<style([^>]*)>([\s\S]*?)<\/style>/g, (_, attrs, css) => `<style${attrs}>${convertCss(css)}</style>`);
	if (output !== source) {
		fs.writeFileSync(file, output);
		changedFiles += 1;
	}
}

for (const target of targets) walk(path.join(root, target));
console.log(JSON.stringify({ ratio, changedFiles, convertedValues }));
