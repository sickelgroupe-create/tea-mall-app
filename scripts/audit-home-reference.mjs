import { createServer } from "node:http";
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "file:///C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const root = path.resolve("dist", "build", "h5");
const widths = [320, 360, 375, 390, 414, 430, 448];
const expectedEntries = [
	["成为合伙人", "/pages/partner-intro/partner-intro"],
	["茶叶科普", "/pages/tea-science/tea-science"],
	["留言板", "/pages/community/community"],
	["售卖栏", "/pages/category/category"],
];
const contentTypes = {
	".css": "text/css; charset=utf-8",
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".png": "image/png",
	".svg": "image/svg+xml",
	".webp": "image/webp",
};

const server = createServer(async (request, response) => {
	try {
		const pathname = decodeURIComponent(
			new URL(request.url, "http://audit").pathname,
		);
		const relative =
			pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
		let target = path.resolve(root, relative);
		if (
			!target.startsWith(root + path.sep) &&
			target !== path.join(root, "index.html")
		) {
			response.writeHead(403).end();
			return;
		}
		try {
			if ((await stat(target)).isDirectory())
				target = path.join(target, "index.html");
		} catch {
			target = path.join(root, "index.html");
		}
		const body = await readFile(target);
		response.writeHead(200, {
			"content-type":
				contentTypes[path.extname(target)] ||
				"application/octet-stream",
		});
		response.end(body);
	} catch (error) {
		response.writeHead(500, {
			"content-type": "text/plain; charset=utf-8",
		});
		response.end(error.message);
	}
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const site = `http://127.0.0.1:${address.port}`;
const report = {
	status: "PASS",
	widths,
	layout: [],
	categoryLayout: [],
	routes: {},
	errors: [],
};

const bootstrap = {
	authenticated: true,
	sessionExpired: false,
	customer: {
		id: 900001,
		nickname: "布局验收",
		phone: "13800000000",
		points: 2680,
	},
	pageDecorations: [
		{
			id: 1,
			moduleKey: "home.exchange-center",
			englishTitle: "新品臻享",
			title: "春日好茶 · 限时甄选",
			subtitle: "西湖产区当季鲜采，茶香清雅，回甘悠长。",
			imageUrl: "/static/images/longjing-hero-v2.webp",
			jumpTarget: "exchangeCenter",
			config: {},
		},
		{
			id: 2,
			moduleKey: "home.collection",
			englishTitle: "PRIVATE COLLECTION",
			title: "御选春藏",
			subtitle: "核心产区 · 一季一采",
			description: "每一罐均拥有独立茶档与品鉴记录。",
			imageUrl: "/static/images/longjing-dark-v2.webp",
			config: {},
		},
		...expectedEntries.map(([title], index) => ({
			id: 10 + index,
			moduleKey: [
				"home.partner-entry",
				"home.science-entry",
				"home.community-entry",
				"home.sales-entry",
			][index],
			title,
			jumpTarget: ["partnerIntro", "teaScience", "community", "category"][
				index
			],
			config: {},
		})),
		{
			id: 20,
			moduleKey: "exchange.points",
			englishTitle: "SHOPPING POINTS",
			title: "购物积分",
			subtitle: "购买商品获得积分",
			jumpTarget: "pointsCenter",
			config: {},
		},
		{
			id: 21,
			moduleKey: "exchange.invite",
			englishTitle: "INVITE REWARDS",
			title: "邀请奖励",
			jumpTarget: "inviteRewards",
			config: {},
		},
	],
	products: [
		{
			id: 1,
			name: "明前西湖龙井 100g",
			short: "明前西湖龙井 100g",
			price: 268,
			spec: "100g",
			category: "绿茶",
			origin: "西湖产区",
			imageKey: "longjing-hero-v2",
		},
		{
			id: 2,
			name: "雨前龙井 100g",
			short: "雨前龙井 100g",
			price: 168,
			spec: "100g",
			category: "绿茶",
			origin: "钱塘产区",
			imageKey: "longjing-dark-v2",
		},
	],
	topics: [
		{
			id: 1,
			slug: "spring",
			title: "春日好茶",
			subtitle: "当季鲜采",
			heroImageKey: "longjing-hero-v2",
			storyImageKey: "longjing-dark-v2",
		},
	],
	store: {},
	categories: [
		{
			id: 1,
			parentId: 0,
			name: "茶叶",
			categoryGroup: "TEA",
			productCount: 2,
			status: "0",
		},
		{
			id: 2,
			parentId: 1,
			name: "绿茶",
			categoryGroup: "TEA",
			productCount: 2,
			status: "0",
		},
		{
			id: 3,
			parentId: 0,
			name: "茶具",
			categoryGroup: "TEAWARE",
			productCount: 0,
			status: "0",
		},
	],
	cart: [],
	orders: [],
	addresses: [],
	favorites: [],
	storeFavorites: [],
	topicFavorites: [],
	notifications: [],
	rewards: [],
	pointLogs: [],
	aftersales: [],
	serviceTickets: [],
	exchanges: [],
	reviews: [],
	distribution: null,
};

function apiData(url) {
	const pathname = new URL(url).pathname;
	if (pathname.endsWith("/bootstrap")) return bootstrap;
	if (pathname.endsWith("/support/documents")) return [];
	if (pathname.endsWith("/exchange-center"))
		return {
			points: {
				availablePoints: 2680,
				pendingPoints: 120,
				rewardCount: 6,
			},
			invite: {
				effectiveInvites: 3,
				claimableRewards: 1,
				tiers: [{ progress: 3, requiredCount: 5, state: "未达到" }],
			},
		};
	return [];
}

async function configure(page) {
	await page.addInitScript(() =>
		localStorage.setItem("teaMallSessionToken", "home_reference_audit"),
	);
	await page.route("**/api/mall/**", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				code: 200,
				msg: "success",
				data: apiData(route.request().url()),
			}),
		});
	});
	page.on("pageerror", (error) =>
		report.errors.push(`pageerror: ${error.message}`),
	);
	page.on("console", (message) => {
		if (message.type() === "error")
			report.errors.push(`console: ${message.text()}`);
	});
}

async function openHome(page) {
	await page.goto(`${site}/#/pages/index/index`, {
		waitUntil: "domcontentloaded",
	});
	await page
		.locator(".home-collection-entries")
		.waitFor({ state: "visible" });
}

async function waitForImages(page, selector) {
	await page.waitForFunction(
		(target) =>
			[...document.querySelectorAll(target)].every((node) => {
				const image =
					node.tagName === "IMG" ? node : node.querySelector("img");
				return Boolean(image?.complete && image.naturalWidth > 0);
			}),
		selector,
		{ timeout: 10000 },
	);
}

const browser = await chromium.launch({
	headless: true,
	executablePath:
		"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
try {
	for (const width of widths) {
		const page = await browser.newPage({
			viewport: { width, height: 1000 },
		});
		await configure(page);
		await openHome(page);
		await waitForImages(
			page,
			".catalog-home-hero image,.catalog-product-card__image,.catalog-collection > image",
		);
		const result = await page.evaluate(() => {
			const rect = (selector) =>
				document.querySelector(selector)?.getBoundingClientRect();
			const hero = rect(".catalog-home-hero");
			const recommendation = [
				...document.querySelectorAll(".catalog-section-title"),
			]
				.find((node) => node.textContent.includes("今日推荐"))
				?.getBoundingClientRect();
			const collection = rect(".catalog-collection");
			const entries = rect(".home-collection-entries");
			const copy = rect(".catalog-collection__copy");
			const entryNodes = [
				...document.querySelectorAll(".home-collection-entry"),
			];
			return {
				documentOverflow:
					document.documentElement.scrollWidth -
					document.documentElement.clientWidth,
				shellOverflow:
					document.querySelector(".phone-shell").scrollWidth -
					document.querySelector(".phone-shell").clientWidth,
				whiteCardCount: document.querySelectorAll(
					".home-feature-grid,.home-feature-card",
				).length,
				entryCount: entryNodes.length,
				correctVerticalOrder:
					hero.bottom <= recommendation.top &&
					recommendation.top < collection.top,
				entriesInsideImage:
					entries.left >= collection.left - 1 &&
					entries.right <= collection.right + 1 &&
					entries.top >= collection.top - 1 &&
					entries.bottom <= collection.bottom + 1,
				copyClearOfEntries: copy.bottom <= entries.top + 1,
				labels: entryNodes.map((node) => ({
					text: node.textContent.replace("›", "").trim(),
					writingMode: getComputedStyle(node).writingMode,
					whiteSpace: getComputedStyle(node.firstElementChild)
						.whiteSpace,
					overflowX: node.scrollWidth - node.clientWidth,
					overflowY: node.scrollHeight - node.clientHeight,
				})),
				imagesLoaded: [
					...document.querySelectorAll(
						".catalog-home-hero image,.catalog-product-card__image,.catalog-collection > image",
					),
				].every((node) => {
					const image =
						node.tagName === "IMG"
							? node
							: node.querySelector("img");
					return Boolean(image?.naturalWidth > 0);
				}),
			};
		});
		report.layout.push({ width, ...result });
		if (
			result.documentOverflow > 1 ||
			result.shellOverflow > 1 ||
			result.whiteCardCount !== 0 ||
			result.entryCount !== 4 ||
			!result.correctVerticalOrder ||
			!result.entriesInsideImage ||
			!result.copyClearOfEntries ||
			!result.imagesLoaded ||
			result.labels.some(
				(item) =>
					item.writingMode !== "horizontal-tb" ||
					item.whiteSpace !== "nowrap" ||
					item.overflowX > 1 ||
					item.overflowY > 1,
			)
		)
			report.status = "FAIL";

		await page.goto(`${site}/#/pages/category/category`, {
			waitUntil: "domcontentloaded",
		});
		await page
			.locator(".catalog-category-collection__image")
			.waitFor({ state: "visible" });
		await waitForImages(page, ".catalog-category-collection__image");
		const categoryResult = await page.evaluate(() => {
			const shell = document.querySelector(".phone-shell");
			const card = document.querySelector(".catalog-category-collection");
			const image = document.querySelector(
				".catalog-category-collection__image",
			);
			const metrics = document.querySelector(
				".catalog-category-collection__metrics",
			);
			const cardRect = card.getBoundingClientRect();
			const imageRect = image.getBoundingClientRect();
			const metricsRect = metrics.getBoundingClientRect();
			return {
				documentOverflow:
					document.documentElement.scrollWidth -
					document.documentElement.clientWidth,
				shellOverflow: shell.scrollWidth - shell.clientWidth,
				imageLoaded:
					(image.tagName === "IMG"
						? image
						: image.querySelector("img")
					)?.naturalWidth > 0,
				imageCoversCard:
					imageRect.left <= cardRect.left + 1 &&
					imageRect.right >= cardRect.right - 1 &&
					imageRect.top <= cardRect.top + 1 &&
					imageRect.bottom >= cardRect.bottom - 1,
				metricsInsideCard:
					metricsRect.left >= cardRect.left - 1 &&
					metricsRect.right <= cardRect.right + 1 &&
					metricsRect.bottom <= cardRect.bottom + 1,
			};
		});
		report.categoryLayout.push({ width, ...categoryResult });
		if (
			categoryResult.documentOverflow > 1 ||
			categoryResult.shellOverflow > 1 ||
			!categoryResult.imageLoaded ||
			!categoryResult.imageCoversCard ||
			!categoryResult.metricsInsideCard
		)
			report.status = "FAIL";
		await page.close();
	}

	const page = await browser.newPage({
		viewport: { width: 390, height: 1000 },
	});
	await configure(page);
	await openHome(page);
	await page.locator(".catalog-home-hero").click();
	await page.waitForFunction(() =>
		location.hash.includes("/pages/exchange-center/exchange-center"),
	);
	report.routes.topImage = new URL(page.url()).hash.split("?")[0];

	for (let index = 0; index < expectedEntries.length; index += 1) {
		await openHome(page);
		await page.locator(".home-collection-entry").nth(index).click();
		await page.waitForFunction(
			(target) => location.hash.includes(target),
			expectedEntries[index][1],
		);
		report.routes[expectedEntries[index][0]] = new URL(
			page.url(),
		).hash.split("?")[0];
	}

	await page.goto(`${site}/#/pages/exchange-center/exchange-center`, {
		waitUntil: "domcontentloaded",
	});
	await page.locator(".exchange-columns").waitFor({ state: "visible" });
	report.exchangeCopy = await page.locator(".exchange-scroll").innerText();
	if (
		!report.exchangeCopy.includes("购物积分") ||
		!report.exchangeCopy.includes("购买商品获得积分") ||
		report.exchangeCopy.includes("购买积分")
	)
		report.status = "FAIL";
	await page.getByText("进入积分商城", { exact: true }).click();
	await page.waitForFunction(() =>
		location.hash.includes("/pages/points-center/points-center"),
	);
	report.routes.pointsSummary = new URL(page.url()).hash.split("?")[0];
	await page.goto(`${site}/#/pages/exchange-center/exchange-center`, {
		waitUntil: "domcontentloaded",
	});
	await page.locator(".exchange-columns").waitFor({ state: "visible" });
	await page.getByText("进入邀请奖励", { exact: true }).click();
	await page.waitForFunction(() =>
		location.hash.includes("/pages/invite-rewards/invite-rewards"),
	);
	report.routes.inviteSummary = new URL(page.url()).hash.split("?")[0];
	await page.close();
} finally {
	await browser.close();
	await new Promise((resolve) => server.close(resolve));
}

if (report.errors.length) report.status = "FAIL";
await writeFile(
	path.resolve("docs", "home-reference-audit.json"),
	JSON.stringify(report, null, 2),
	"utf8",
);
console.log(
	JSON.stringify(
		{
			status: report.status,
			widths: report.layout.map((item) => ({
				width: item.width,
				documentOverflow: item.documentOverflow,
				shellOverflow: item.shellOverflow,
				whiteCardCount: item.whiteCardCount,
				entryCount: item.entryCount,
				correctVerticalOrder: item.correctVerticalOrder,
				entriesInsideImage: item.entriesInsideImage,
				copyClearOfEntries: item.copyClearOfEntries,
				imagesLoaded: item.imagesLoaded,
			})),
			categoryWidths: report.categoryLayout,
			routes: report.routes,
			forbiddenCopyPresent:
				report.exchangeCopy?.includes("购买积分") || false,
			errors: report.errors,
		},
		null,
		2,
	),
);
if (report.status !== "PASS") process.exitCode = 1;
