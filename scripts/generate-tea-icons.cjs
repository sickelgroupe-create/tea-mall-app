const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const componentPath = path.join(root, "components", "TeaIcon.vue");
const source = fs.readFileSync(componentPath, "utf8");
const match = source.match(/const icons = (\{[\s\S]*?\n\});\n\nexport default/);

if (!match) {
	throw new Error("Unable to read the TeaIcon path map");
}

const icons = Function(`"use strict"; return (${match[1]});`)();
const tones = {
	green: "#245334",
	muted: "#747d76",
	dark: "#1d2921",
	white: "#ffffff",
};

async function build() {
	for (const [tone, color] of Object.entries(tones)) {
		const outputDir = path.join(root, "static", "icons", tone);
		fs.mkdirSync(outputDir, { recursive: true });
		for (const [name, paths] of Object.entries(icons)) {
			const content = paths
				.map((d) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`)
				.join("");
			const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">${content}</svg>`;
			await sharp(Buffer.from(svg)).png().toFile(path.join(outputDir, `${name}.png`));
		}
	}
	const importLines = [];
	const toneMaps = [];
	for (const tone of Object.keys(tones)) {
		const entries = [];
		for (const name of Object.keys(icons)) {
			const variable = `${tone}_${name}`;
			importLines.push(`import ${variable} from "@/static/icons/${tone}/${name}.png";`);
			entries.push(`\t\t${name}: ${variable}`);
		}
		toneMaps.push(`\t${tone}: {\n${entries.join(",\n")}\n\t}`);
	}
	const assetModule = `${importLines.join("\n")}\n\nexport default {\n${toneMaps.join(",\n")}\n};\n`;
	fs.writeFileSync(path.join(root, "shared", "tea-icon-assets.js"), assetModule);
	console.log(`Generated ${Object.keys(icons).length * Object.keys(tones).length} icon assets.`);
}

build().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
