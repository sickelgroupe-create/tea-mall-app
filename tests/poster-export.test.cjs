// Run with NODE_PATH pointing at the bundled @napi-rs/canvas and tooling jsqr.
// Invokes the actual share.vue save methods; does not substitute drawing code.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createCanvas, Image, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const decodeQr = require("jsqr");
const QRCode = require("qrcode");

const root = path.resolve(__dirname, "..");
const evidence = path.join(root, "docs", "poster-fix-20260903");
const fixtureUrl =
	"https://chaye.okam.top/#/pages/login/login?scene=POSTER_LAYOUT_PREVIEW";
const background = path.join(root, "static", "images", "invite-poster-v2.png");
const widths = [320, 360, 375, 390, 414, 430, 448];

async function main() {
	// The standalone renderer does not load the phone's system font fallback.
	GlobalFonts.registerFromPath("C:/Windows/Fonts/msyh.ttc", "sans-serif");
	GlobalFonts.registerFromPath("C:/Windows/Fonts/msyh.ttc", "Microsoft YaHei");
	GlobalFonts.registerFromPath("C:/Windows/Fonts/simsun.ttc", "SimSun");
	fs.mkdirSync(evidence, { recursive: true });
	const helpers = await import(
		"data:text/javascript;base64," +
			fs
				.readFileSync(path.join(root, "shared", "poster-layout.js"))
				.toString("base64")
	);
	const qrSource = fs
		.readFileSync(path.join(root, "shared", "qr-code.js"), "utf8")
		.replace(/^import QRCode[^;]+;\s*/, "")
		.replace(/export function /g, "function ");
	const qrModule = vm.runInNewContext(`${qrSource}\n({ createInviteQr })`, {
		QRCode,
		Uint8Array,
	});
	const qr = qrModule.createInviteQr(fixtureUrl);
	const qrSize = qr.modules.size;
	const qrCells = Array.from(qr.modules.data, (cell) => cell === 1);
	for (let size = 21; size <= 105; size += 4) {
		const layout = helpers.posterQrLayout(size);
		assert(layout.boxX + layout.boxSize <= helpers.POSTER_WIDTH);
		assert(layout.boxY + layout.boxSize <= helpers.POSTER_HEIGHT);
		assert(layout.padding >= layout.cell * 4);
		assert(Number.isInteger(layout.cell));
	}
	for (const invalid of [undefined, null, NaN, "41", 0, 22, 109, 177, 181]) {
		assert.throws(() => helpers.posterQrLayout(invalid));
	}
	for (const width of widths)
		assert.throws(() =>
			helpers.assertPosterCanvasSize(width, (width * 595) / 448),
		);
	helpers.assertPosterCanvasSize(896, 1190);
	assert.throws(() => helpers.drawPosterQr({}, qrSize, []));

	const source = fs.readFileSync(
		path.join(root, "pages", "share", "share.vue"),
		"utf8",
	);
	assert(source.includes(':style="posterCanvasStyle"'));
	assert(source.indexOf("</scroll-view>") < source.indexOf("<canvas"));
	assert(!/\.poster-canvas\s*\{[^}]*\b(?:width|height):/s.test(source));
	const script = source
		.match(/<script>([\s\S]*?)<\/script>/)[1]
		.replace(/^import\s[\s\S]*?from\s+["'][^"']+["'];\s*/gm, "")
		.replace("export default", "module.exports =");
	let activeCanvas;
	let output;
	let viewWidth = 390;
	let invalidCanvas = false;
	let exportFailure = false;
	let saveFailure = false;
	let h5ExportFailure = false;
	const uni = {
		createSelectorQuery() {
			return {
				in() {
					return this;
				},
				select(selector) {
					assert.equal(selector, "#invitePosterCanvas");
					return this;
				},
				boundingClientRect(callback) {
					this.callback = callback;
					return this;
				},
				exec() {
					const style = helpers.POSTER_CANVAS_STYLE;
					const width = Number(style.match(/width:(\d+)px/)[1]);
					const height = Number(style.match(/height:(\d+)px/)[1]);
					this.callback({
						width: invalidCanvas ? viewWidth : width,
						height,
					});
				},
			};
		},
		createCanvasContext(id) {
			assert.equal(id, "invitePosterCanvas");
			activeCanvas = createCanvas(
				helpers.POSTER_WIDTH,
				helpers.POSTER_HEIGHT,
			);
			const ctx = activeCanvas.getContext("2d");
			return {
				drawImage: (...args) => ctx.drawImage(...args),
				fillRect: (...args) => ctx.fillRect(...args),
				fillText: (...args) => ctx.fillText(...args),
				setFillStyle(value) {
					ctx.fillStyle = value;
				},
				setFontSize(value) {
					ctx.font = `${value}px sans-serif`;
				},
				draw(reserve, callback) {
					assert.equal(reserve, false);
					callback();
				},
			};
		},
		canvasToTempFilePath(options) {
			for (const [key, value] of Object.entries(helpers.POSTER_EXPORT))
				assert.equal(options[key], value);
			if (exportFailure)
				return options.fail({ errMsg: "test export failure" });
			output = activeCanvas.toBuffer("image/png");
			options.success({ tempFilePath: "poster-render-test.png" });
		},
		saveImageToPhotosAlbum(options) {
			assert.equal(options.filePath, "poster-render-test.png");
			if (saveFailure) options.fail({ errMsg: "test album failure" });
			else options.success();
		},
	};
	const document = {
		createElement(tag) {
			if (tag === "canvas") {
				const canvas = createCanvas(1, 1);
				if (h5ExportFailure)
					canvas.toDataURL = () => {
						throw new Error("test export failure");
					};
				return canvas;
			}
			assert.equal(tag, "a");
			return {
				click() {
					output = Buffer.from(this.href.split(",")[1], "base64");
				},
			};
		},
	};
	const context = {
		...helpers,
		module: { exports: {} },
		uni,
		document,
		Image,
		console,
		StatusBar: {},
		TopBar: {},
		TeaIcon: {},
		InvitationClub: {},
		mallPage: {},
		mallApi: {},
		createInviteQr: qrModule.createInviteQr,
	};
	vm.runInNewContext(script, context);
	const component = context.module.exports;
	const posterImage = await loadImage(background);
	const instance = {
		...component.methods,
		qrSize,
		qrCells,
		$nextTick: async () => {},
		showToast() {},
		decorationImage: () => background,
		resolveMiniPosterImage: async () => posterImage,
	};
	assert.equal(
		component.computed.posterCanvasStyle(),
		helpers.POSTER_CANVAS_STYLE,
	);

	async function inspect(bytes, file) {
		const img = await loadImage(bytes);
		assert.equal(img.width, 896);
		assert.equal(img.height, 1190);
		const canvas = createCanvas(img.width, img.height);
		const ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0);
		const pixels = ctx.getImageData(0, 0, img.width, img.height);
		const decoded = decodeQr(
			new Uint8ClampedArray(pixels.data),
			img.width,
			img.height,
		);
		assert.equal(
			decoded?.data,
			fixtureUrl,
			"Exported PNG QR must decode to the original invite URL",
		);
		const layout = helpers.posterQrLayout(qrSize);
		for (let y = layout.boxY; y < layout.boxY + layout.boxSize; y++) {
			for (let x = layout.boxX; x < layout.boxX + layout.boxSize; x++) {
				if (
					x >= layout.x &&
					x < layout.x + qrSize * layout.cell &&
					y >= layout.y &&
					y < layout.y + qrSize * layout.cell
				)
					continue;
				const i = (y * img.width + x) * 4;
				assert.deepEqual(
					Array.from(pixels.data.slice(i, i + 4)),
					[255, 255, 255, 255],
				);
			}
		}
		if (file) fs.writeFileSync(path.join(evidence, file), bytes);
		return {
			width: img.width,
			height: img.height,
			decoded: true,
			quietZonePixels: layout.padding,
			rightMargin: img.width - layout.boxX - layout.boxSize,
			bottomMargin: img.height - layout.boxY - layout.boxSize,
		};
	}

	const results = [];
	let miniBytes;
	for (const width of widths) {
		viewWidth = width;
		await instance.saveMiniPoster();
		if (miniBytes)
			assert.deepEqual(
				output,
				miniBytes,
				"Phone width must not change the exported bitmap",
			);
		miniBytes = output;
		results.push({
			platform: "mini-program-method-harness",
			viewWidth: width,
			...(await inspect(
				output,
				width === 390 ? "poster-preview-mini.png" : null,
			)),
		});
	}
	await instance.saveH5Poster();
	results.push({
		platform: "h5-method-harness",
		...(await inspect(output, "poster-preview-h5.png")),
	});
	invalidCanvas = true;
	await assert.rejects(() => instance.saveMiniPoster(), /画布尺寸异常/);
	invalidCanvas = false;
	exportFailure = true;
	await assert.rejects(() => instance.saveMiniPoster(), /海报生成失败/);
	exportFailure = false;
	saveFailure = true;
	await assert.rejects(() => instance.saveMiniPoster(), /相册权限/);
	saveFailure = false;
	h5ExportFailure = true;
	await assert.rejects(() => instance.saveH5Poster(), /test export failure/);
	const report = {
		status: "PASS",
		fixtureUrl,
		note: "Sample QR is for layout tests, not a issued referral scene. Harness is not real-device album verification.",
		qrSize,
		results,
		malformedQrRejected: true,
		wrongCanvasRejected: true,
		exportAndAlbumFailureHandled: true,
	};
	fs.writeFileSync(
		path.join(evidence, "poster-export-check.json"),
		JSON.stringify(report, null, 2),
	);
	console.log(JSON.stringify(report, null, 2));
}
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
