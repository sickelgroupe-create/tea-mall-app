import { randomBytes } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "file:///C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const root = path.resolve(".");
const site = process.env.CHAYE_TEST_H5_BASE || "http://127.0.0.1:18084";
const apiBase = process.env.CHAYE_TEST_MALL_BASE || "http://127.0.0.1:18083/mall";
const phone = process.env.CHAYE_TEST_PHONE;
const password = process.env.CHAYE_TEST_PASSWORD;
const widths = [320, 360, 375, 390, 414, 430, 448];
const routes = JSON.parse(await readFile(path.join(root, "pages.json"), "utf8")).pages.map(
	(item) => item.path,
);
if (!phone || !password || routes.length < 52) {
	throw new Error(`Live audit prerequisites missing: credentials=${Boolean(phone && password)}, routes=${routes.length}`);
}

async function api(endpoint, { method = "GET", token, body } = {}) {
	const response = await fetch(`${apiBase}${endpoint}`, {
		method,
		headers: {
			"Content-Type": "application/json",
			...(token ? { "X-Mall-Session": token } : {}),
		},
		body: body === undefined ? undefined : JSON.stringify(body),
	});
	const payload = await response.json();
	if (!response.ok || payload.code !== 200) {
		throw new Error(`${method} ${endpoint}: ${response.status} ${payload.msg || payload.code}`);
	}
	return payload.data;
}

const guestToken = `audit_live_${randomBytes(24).toString("hex")}`;
await api("/bootstrap", { token: guestToken });
const login = await api("/session/login", {
	method: "POST",
	token: guestToken,
	body: { phone, password },
});
const token = login.sessionToken;
const state = await api("/bootstrap", { token });
const topicSlug = state.topics?.[0]?.slug || "spring-private-selection";
const firstOrder = state.orders?.[0]?.orderNo || state.orders?.[0]?.no || "";
const firstFriend = state.teaFriends?.[0]?.id || "";
const routeQuery = {
	"pages/home-topic/home-topic": `slug=${encodeURIComponent(topicSlug)}`,
	"pages/product-detail/product-detail": "id=1",
	"pages/store/store": "id=1",
	"pages/confirm/confirm": "buyNow=1&skuId=1",
	"pages/order-detail/order-detail": firstOrder ? `orderNo=${encodeURIComponent(firstOrder)}` : "",
	"pages/logistics/logistics": firstOrder ? `orderNo=${encodeURIComponent(firstOrder)}` : "",
	"pages/tier-reward-detail/tier-reward-detail": "id=1",
	"pages/tea-friend-detail/tea-friend-detail": firstFriend ? `friendId=${firstFriend}` : "",
	"pages/tea-friend-orders/tea-friend-orders": firstFriend ? `friendId=${firstFriend}` : "",
	"pages/tea-sales/tea-sales": "slug=longjing-basics",
};

const report = {
	status: "PASS",
	environment: { site, apiBase, routes: routes.length, widths, authenticated: true },
	checks: [],
	consoleErrors: [],
	requestFailures: [],
	httpErrors: [],
	imageFailures: [],
	horizontalOverflows: [],
	controlClipping: [],
	scrollFailures: [],
	fixedContentOverlaps: [],
	businessErrorText: [],
};
const browser = await chromium.launch({
	headless: true,
	executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
try {
	for (const width of widths) {
		const page = await browser.newPage({ viewport: { width, height: 900 } });
		let currentRoute = "";
		await page.addInitScript((session) => {
			localStorage.setItem("teaMallSessionToken", session);
			localStorage.setItem("teaSession", "1");
		}, token);
		await page.route("https://chaye.okam.top/api/mall/**", async (route) => {
			const request = route.request();
			const target = request.url().replace("https://chaye.okam.top/api/mall", apiBase);
			const response = await fetch(target, {
				method: request.method(),
				headers: request.headers(),
				body: ["GET", "HEAD"].includes(request.method()) ? undefined : request.postDataBuffer(),
			});
			await route.fulfill({
				status: response.status,
				headers: { "content-type": response.headers.get("content-type") || "application/json" },
				body: Buffer.from(await response.arrayBuffer()),
			});
		});
		await page.route("https://chaye.okam.top/static/images/**", async (route) => {
			const target = route.request().url().replace("https://chaye.okam.top", site);
			const response = await fetch(target);
			await route.fulfill({ status: response.status, body: Buffer.from(await response.arrayBuffer()) });
		});
		page.on("console", (message) => {
			if (message.type() === "error")
				report.consoleErrors.push({ width, route: currentRoute, text: message.text() });
		});
		page.on("requestfailed", (request) => {
			report.requestFailures.push({
				width,
				route: currentRoute,
				url: request.url(),
				error: request.failure()?.errorText,
			});
		});
		page.on("response", (response) => {
			if (response.status() >= 400)
				report.httpErrors.push({
					width,
					route: currentRoute,
					status: response.status(),
					url: response.url(),
				});
		});
		for (const route of routes) {
			currentRoute = route;
			const query = routeQuery[route] ? `&${routeQuery[route]}` : "";
			await page.goto(`${site}/#/${route}?visualAudit=1&auditWidth=${width}${query}`, {
				waitUntil: "domcontentloaded",
				timeout: 30000,
			});
			await page.waitForTimeout(route === "pages/index/index" ? 1000 : 500);
			const check = await page.evaluate(async () => {
				const shell = document.querySelector(".phone-shell") || document.body;
				const shellRect = shell.getBoundingClientRect();
				const visible = (node) => {
					const style = getComputedStyle(node);
					const rect = node.getBoundingClientRect();
					return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
				};
				const images = [...document.querySelectorAll("img")].filter(visible).map((node) => {
					const rect = node.getBoundingClientRect();
					return {
						src: node.currentSrc || node.src,
						naturalWidth: node.naturalWidth,
						naturalHeight: node.naturalHeight,
						width: rect.width,
						height: rect.height,
					};
				});
				const buttons = [...document.querySelectorAll("button")].filter(visible);
				const fixed = [...document.querySelectorAll(
					".submit-bar,.exchange-submit,.detail-actions,.cart-total,.bottom-nav,.catalog-detail-actions,.order-payment-actions",
				)].filter(visible);
				const scrollables = [...document.querySelectorAll("*")].filter((node) => {
					const style = getComputedStyle(node);
					return visible(node) && node.scrollHeight > node.clientHeight + 2 &&
						(/auto|scroll/.test(style.overflowY) || node.tagName === "UNI-SCROLL-VIEW");
				});
				for (const node of scrollables) node.scrollTop = node.scrollHeight;
				await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
				const scrollChecks = scrollables.map((node) => ({
					className: String(node.className || node.tagName).slice(0, 100),
					clientHeight: node.clientHeight,
					scrollHeight: node.scrollHeight,
					scrollTop: node.scrollTop,
					reachesBottom: Math.abs(node.scrollHeight - node.clientHeight - node.scrollTop) <= 3,
				}));
				const fixedContentOverlaps = fixed.filter((bar) => {
					const style = getComputedStyle(bar);
					if (!['fixed', 'absolute'].includes(style.position)) return false;
					const rect = bar.getBoundingClientRect();
					return [...document.querySelectorAll('.screen,.settings-screen,.account-scroll,.science-scroll,.partner-scroll')]
						.filter(visible)
						.some((content) => {
							const contentRect = content.getBoundingClientRect();
							return contentRect.bottom > rect.top + 1 && contentRect.top < rect.bottom - 1;
						});
				}).map((node) => node.className);
				const text = document.body.innerText || "";
				return {
					hash: location.hash.split("?")[0],
					documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
					shellOverflow: shell.scrollWidth - shell.clientWidth,
					images,
					clippedButtons: buttons
						.filter((node) => node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1)
						.map((node) => ({ className: node.className, text: node.textContent.trim().slice(0, 50) })),
					fixedOutsideShell: fixed
						.filter((node) => {
							const rect = node.getBoundingClientRect();
							return rect.left < shellRect.left - 1 || rect.right > shellRect.right + 1;
						})
						.map((node) => node.className),
					scrollChecks,
					fixedContentOverlaps,
					businessError: /Character u is neither|undefined|NaN|加载失败|请求冲突/.test(text)
						? text.match(/.{0,40}(?:Character u is neither|undefined|NaN|加载失败|请求冲突).{0,80}/)?.[0]
						: "",
				};
			});
			report.checks.push({ width, route, ...check });
			const brokenImages = check.images.filter((item) => !item.src || item.naturalWidth <= 0 || item.naturalHeight <= 0);
			if (brokenImages.length) report.imageFailures.push({ width, route, images: brokenImages });
			if (check.documentOverflow > 1 || check.shellOverflow > 1)
				report.horizontalOverflows.push({ width, route, documentOverflow: check.documentOverflow, shellOverflow: check.shellOverflow });
			if (check.clippedButtons.length || check.fixedOutsideShell.length)
				report.controlClipping.push({ width, route, clippedButtons: check.clippedButtons, fixedOutsideShell: check.fixedOutsideShell });
			if (check.businessError) report.businessErrorText.push({ width, route, text: check.businessError });
			const failedScrolls = check.scrollChecks.filter((item) => !item.reachesBottom);
			if (failedScrolls.length) report.scrollFailures.push({ width, route, scrolls: failedScrolls });
			if (check.fixedContentOverlaps.length)
				report.fixedContentOverlaps.push({ width, route, bars: check.fixedContentOverlaps });
		}
		await page.close();
		console.log(`audited width ${width}: ${routes.length} routes`);
	}
} finally {
	await browser.close();
}

const failures = [
	report.consoleErrors,
	report.requestFailures,
	report.httpErrors,
	report.imageFailures,
	report.horizontalOverflows,
	report.controlClipping,
	report.scrollFailures,
	report.fixedContentOverlaps,
	report.businessErrorText,
].reduce((sum, rows) => sum + rows.length, 0);
report.status = failures ? "FAIL" : "PASS";
const outputDir = path.join(root, "docs", "adaptation-audit");
await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, "responsive-live.json"), JSON.stringify(report, null, 2), "utf8");
console.log(
	JSON.stringify({
		status: report.status,
		routes: routes.length,
		widths,
		checks: report.checks.length,
		consoleErrors: report.consoleErrors.length,
		requestFailures: report.requestFailures.length,
		httpErrors: report.httpErrors.length,
		imageFailures: report.imageFailures.length,
		horizontalOverflows: report.horizontalOverflows.length,
		controlClipping: report.controlClipping.length,
		scrollFailures: report.scrollFailures.length,
		fixedContentOverlaps: report.fixedContentOverlaps.length,
		businessErrorText: report.businessErrorText.length,
	}, null, 2),
);
if (report.status !== "PASS") process.exitCode = 1;
