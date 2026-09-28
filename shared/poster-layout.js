// Off-screen bitmap coordinates are pixels, not responsive page rpx.
// Canvas size, drawing coordinates and the export crop must stay identical.
export const POSTER_WIDTH = 896;
export const POSTER_HEIGHT = 1190;
export const POSTER_CANVAS_STYLE = `width:${POSTER_WIDTH}px;height:${POSTER_HEIGHT}px;left:-10000px;top:0;`;
export const POSTER_EXPORT = Object.freeze({
	x: 0,
	y: 0,
	width: POSTER_WIDTH,
	height: POSTER_HEIGHT,
	destWidth: POSTER_WIDTH,
	destHeight: POSTER_HEIGHT,
	fileType: "png",
});

export function assertPosterCanvasSize(width, height) {
	if (
		Math.abs(Number(width) - POSTER_WIDTH) > 0.5 ||
		Math.abs(Number(height) - POSTER_HEIGHT) > 0.5 ||
		!Number.isFinite(Number(width)) ||
		!Number.isFinite(Number(height))
	) {
		throw new Error("海报画布尺寸异常，请重新进入后重试");
	}
}

export function posterQrLayout(qrSize) {
	if (
		!Number.isInteger(qrSize) ||
		qrSize < 21 ||
		qrSize > 177 ||
		(qrSize - 21) % 4 !== 0
	) {
		throw new Error("邀请二维码数据无效，请重新进入后重试");
	}
	const boxSize = 232;
	const boxX = POSTER_WIDTH - 56 - boxSize;
	const boxY = POSTER_HEIGHT - 72 - boxSize;
	// Integer modules avoid overlapping/antialiased cells. Reserve at least
	// four empty modules on every side, including high-density invite URLs.
	const cell = Math.floor(boxSize / (qrSize + 8));
	if (cell < 2) throw new Error("邀请二维码内容过长，无法清晰生成海报");
	const padding = Math.floor((boxSize - qrSize * cell) / 2);
	if (
		boxX < 0 ||
		boxY < 0 ||
		boxX + boxSize > POSTER_WIDTH ||
		boxY + boxSize > POSTER_HEIGHT ||
		padding < cell * 4
	) {
		throw new Error("海报二维码超出安全范围");
	}
	return {
		boxX,
		boxY,
		boxSize,
		x: boxX + padding,
		y: boxY + padding,
		cell,
		padding,
	};
}

function fillColor(ctx, value) {
	if (typeof ctx.setFillStyle === "function") ctx.setFillStyle(value);
	else ctx.fillStyle = value;
}

export function drawPosterQr(ctx, qrSize, qrCells) {
	const layout = posterQrLayout(qrSize);
	if (
		!Array.isArray(qrCells) ||
		qrCells.length !== qrSize * qrSize ||
		qrCells.some((value) => typeof value !== "boolean")
	) {
		throw new Error("邀请二维码数据不完整，请重新进入后重试");
	}
	fillColor(ctx, "#fff");
	ctx.fillRect(layout.boxX, layout.boxY, layout.boxSize, layout.boxSize);
	fillColor(ctx, "#000");
	qrCells.forEach((dark, i) => {
		if (dark)
			ctx.fillRect(
				layout.x + (i % qrSize) * layout.cell,
				layout.y + Math.floor(i / qrSize) * layout.cell,
				layout.cell,
				layout.cell,
			);
	});
	return layout;
}
