export const BUILD_ID = "20260909-commercial-fixes-1-0-29";
export const BUILD_VERSION = "1.0.29";

export function activePageRoute() {
	try {
		const pages =
			typeof getCurrentPages === "function" ? getCurrentPages() : [];
		return pages[pages.length - 1]?.route || "unknown";
	} catch (_) {
		return "unknown";
	}
}

export function imageDiagnostic(level, label, rawSrc, resolvedSrc, event) {
	const detail = event?.detail || {};
	const record = {
		buildId: BUILD_ID,
		page: activePageRoute(),
		label: String(label || "image"),
		rawSrc: String(rawSrc || ""),
		resolvedSrc: String(resolvedSrc || ""),
		width: Number(detail.width || 0),
		height: Number(detail.height || 0),
		errMsg: String(detail.errMsg || event?.errMsg || ""),
	};
	const output = `[TEA_IMAGE_${level}] ${JSON.stringify(record)}`;
	if (level === "ERROR") console.error(output);
	else console.info(output);
	return record;
}
