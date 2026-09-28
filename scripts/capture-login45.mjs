import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "file:///C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const outputDir = path.resolve("docs/login45-special");
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({
	headless: true,
	executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
const page = await browser.newPage({
	viewport: { width: 448, height: 1489 },
	deviceScaleFactor: 1,
});
const consoleMessages = [];
const requests = [];
const failedRequests = [];
page.on("console", (message) =>
	consoleMessages.push({ type: message.type(), text: message.text(), location: message.location() }),
);
page.on("response", (response) =>
	requests.push({ status: response.status(), url: response.url() }),
);
page.on("requestfailed", (request) =>
	failedRequests.push({ url: request.url(), failure: request.failure() }),
);
const captureUrl =
	process.env.LOGIN45_CAPTURE_URL ||
	"http://127.0.0.1:5173/#/pages/login/login?visualAudit=1&auditWidth=448";
await page.goto(
	captureUrl,
	{ waitUntil: "networkidle", timeout: 30000 },
);
await page.screenshot({
	path: path.join(outputDir, "45-login-h5-448x1489.png"),
	fullPage: false,
});
const layout = await page.evaluate(() => {
	const selectors = [
		".login-hero",
		".login-hero-copy",
		".login-card",
		".auth-tabs",
		".login-fields .input-row:nth-child(1)",
		".login-fields .input-row:nth-child(2)",
		".login-submit",
		".login-wechat",
		".agreement",
		".member-ritual",
		".member-benefits",
		".bottom-nav",
	];
	return Object.fromEntries(
		selectors.map((selector) => {
			const element = document.querySelector(selector);
			if (!element) return [selector, null];
			const rect = element.getBoundingClientRect();
			const style = getComputedStyle(element);
			return [
				selector,
				{
					x: Math.round(rect.x * 10) / 10,
					y: Math.round(rect.y * 10) / 10,
					width: Math.round(rect.width * 10) / 10,
					height: Math.round(rect.height * 10) / 10,
					borderRadius: style.borderRadius,
					fontSize: style.fontSize,
					lineHeight: style.lineHeight,
				},
			];
		}),
	);
});
await writeFile(
	path.join(outputDir, "h5-runtime-evidence.json"),
	JSON.stringify({ captureUrl, layout, consoleMessages, requests, failedRequests }, null, 2),
	"utf8",
);
await browser.close();
