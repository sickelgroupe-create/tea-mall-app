const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const expected = [
	["01", "首页", "pages/index/index"],
	["02", "首页专题", "pages/home-topic/home-topic"],
	["03", "商品分类", "pages/category/category"],
	["04", "搜索", "pages/search/search"],
	["05", "商品列表", "pages/product-list/product-list"],
	["06", "商品详情", "pages/product-detail/product-detail"],
	["07", "品牌店铺", "pages/store/store"],
	["08", "购物车", "pages/cart/cart"],
	["09", "确认订单", "pages/confirm/confirm"],
	["10", "下单成功", "pages/pay-success/pay-success"],
	["10A", "支付未完成", "pages/pay-failure/pay-failure"],
	["11", "我的订单", "pages/orders/orders"],
	["12", "订单详情", "pages/order-detail/order-detail"],
	["13", "物流与售后", "pages/logistics/logistics"],
	["14", "消息中心", "pages/notifications/notifications"],
	["15", "收货地址", "pages/addresses/addresses"],
	["16", "我的收藏", "pages/favorites/favorites"],
	["17", "茶友首页", "pages/invite/invite"],
	["18", "我的茶友", "pages/tea-friends/tea-friends"],
	["19", "茶友详情", "pages/tea-friend-detail/tea-friend-detail"],
	["20", "购买记录", "pages/tea-friend-orders/tea-friend-orders"],
	["21", "邀请礼包", "pages/invite-gift/invite-gift"],
	["22", "一键邀请", "pages/one-click-invite/one-click-invite"],
	["23", "分享方式", "pages/share/share"],
	["24", "邀请记录", "pages/invite-records/invite-records"],
	["25", "阶梯奖励", "pages/tier-rewards/tier-rewards"],
	["26", "阶梯兑换详情", "pages/tier-reward-detail/tier-reward-detail"],
	["27", "积分中心", "pages/points-center/points-center"],
	["28", "积分明细", "pages/points-detail/points-detail"],
	["29", "积分商城", "pages/points-mall/points-mall"],
	["30", "积分兑换详情", "pages/exchange-detail/exchange-detail"],
	["31", "我的兑换", "pages/my-exchanges/my-exchanges"],
	["32", "奖励明细", "pages/points-reward-details/points-reward-details"],
	["33", "合伙人介绍", "pages/partner-intro/partner-intro"],
	["34", "申请合伙人", "pages/partner-apply/partner-apply"],
	["35", "审核状态", "pages/partner-status/partner-status"],
	["36", "合伙人工作台", "pages/partner-workbench/partner-workbench"],
	["37", "我的客户", "pages/partner-customers/partner-customers"],
	[
		"38",
		"客户购买记录",
		"pages/partner-customer-orders/partner-customer-orders",
	],
	["39", "茶叶销售与内容详情", "pages/tea-sales/tea-sales"],
	["40", "留言板与我的", "pages/community/community"],
	["41", "分销与佣金中心", "pages/commission-center/commission-center"],
	["42", "佣金与提现明细", "pages/commission-details/commission-details"],
	["43", "申请提现", "pages/withdraw/withdraw"],
	["44", "我的优惠券", "pages/coupons/coupons"],
	["45", "登录注册", "pages/login/login"],
	["46", "个人中心", "pages/mine/mine"],
	["47", "设置与客服", "pages/settings/settings"],
	["47A", "客服工单详情", "pages/service-ticket-detail/service-ticket-detail"],
	["48", "浏览记录", "pages/history/history"],
	["49", "兑换中心", "pages/exchange-center/exchange-center"],
	["50", "邀请奖励", "pages/invite-rewards/invite-rewards"],
	["51", "茶叶科普", "pages/tea-science/tea-science"],
	["52", "取消订单", "pages/cancel-order/cancel-order"],
	["53", "申请售后", "pages/aftersale-apply/aftersale-apply"],
	["54", "售后详情", "pages/aftersale-detail/aftersale-detail"],
	["55", "填写退货物流", "pages/return-logistics/return-logistics"],
];

const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const pagesJson = JSON.parse(read("pages.json"));
const registered = pagesJson.pages.map((item) => item.path);
const routeSet = new Set(registered);
const errors = [];
const warnings = [];

if (registered.length !== new Set(registered).size)
	errors.push("pages.json contains duplicate routes");
// 业务页之外保留 1 个仅供开发核对视觉系统的 UI preview 页面。
if (registered.length !== expected.length + 1)
	errors.push(
		`expected ${expected.length + 1} registered pages, found ${registered.length}`,
	);

const pageRows = expected.map(([number, name, route]) => {
	const file = `${route}.vue`;
	const absolute = path.join(root, file);
	if (!routeSet.has(route))
		errors.push(`${number} ${route} is not registered`);
	if (!fs.existsSync(absolute)) errors.push(`${number} ${file} is missing`);
	const source = fs.existsSync(absolute)
		? fs.readFileSync(absolute, "utf8")
		: "";
	const template = source.split(/<script(?:\s|>)/i)[0];
	// Match the complete element. A start-tag-only regexp stops too early on Vue
	// expressions containing `>`/`>=`, which previously reported valid buttons as
	// unbound. Native mini-program buttons cannot be nested, so this is stable for
	// the project's templates and still checks the full attribute block.
	const buttons = [
		...template.matchAll(/<button\b([\s\S]*?)<\/button\s*>/gi),
	];
	const unbound = buttons.filter(
		(match) =>
			!/@(?:tap|click)(?:\.[\w-]+)*=|open-type=|form-type=/.test(
				match[1],
			),
	);
	if (unbound.length)
		errors.push(
			`${number} ${route} has ${unbound.length} unbound button(s)`,
		);
	const tabs = (
		template.match(
			/(?:class="[^"]*(?:tabs?|tab)[^"]*"|role="tablist")/gi,
		) || []
	).length;
	const disabled = buttons.filter((match) =>
		/:disabled=|\sdisabled(?:\s|>|=)/.test(match[1]),
	).length;
	const directAssets = [
		...source.matchAll(/(?:src|image)=["'](\/static\/[^"']+)["']/g),
	].map((match) => match[1]);
	for (const asset of directAssets) {
		const assetPath = path.join(root, asset.replace(/^\//, ""));
		if (!fs.existsSync(assetPath))
			errors.push(`${number} ${route} references missing ${asset}`);
	}
	return {
		number,
		name,
		route: `/${route}`,
		buttons: buttons.length,
		disabled,
		tabs,
		directAssets: directAssets.length,
	};
});

for (const [, , route] of expected) {
	const source = read(`${route}.vue`);
	if (
		source.includes("<BottomNav") &&
		!source.includes("shell-scroll--with-bottom-nav") &&
		!source.includes("shell-scroll--flow-bottom-nav")
	)
		errors.push(`${route} does not declare bottom-nav scroll ownership`);
	if (
		/class="(?:submit-bar|double-action|single-action|detail-actions|support-bar|exchange-submit|withdraw-fixed|lifecycle-submit|payment-failure-actions|logout)/.test(
			source,
		) &&
		!source.includes("shell-scroll--with-action") &&
		!source.includes("shell-scroll--with-bottom-nav")
	)
		errors.push(`${route} does not declare action-bar scroll ownership`);
}

const walk = (directory, extensions, result = []) => {
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (["node_modules", "dist", "unpackage"].includes(entry.name))
			continue;
		const full = path.join(directory, entry.name);
		if (entry.isDirectory()) walk(full, extensions, result);
		else if (extensions.includes(path.extname(entry.name)))
			result.push(full);
	}
	return result;
};

const sourceFiles = walk(root, [".vue", ".css", ".js", ".json"]);
const sourceText = sourceFiles
	.map((file) => fs.readFileSync(file, "utf8"))
	.join("\n");
const buttonBlocks = [
	...sourceText.matchAll(/([^{}]*button[^{}]*)\{([^{}]*)\}/gi),
];
const scaledButtons = buttonBlocks.filter((match) =>
	/transform\s*:\s*scale/i.test(match[2]),
);
const negativeButtonMargins = buttonBlocks.filter((match) =>
	/margin(?:-[a-z]+)?\s*:\s*-[\d.]+(?:r?px)/i.test(match[2]),
);
if (scaledButtons.length)
	errors.push(
		`${scaledButtons.length} button CSS block(s) still use transform:scale`,
	);
if (negativeButtonMargins.length)
	errors.push(
		`${negativeButtonMargins.length} button CSS block(s) use negative margin alignment`,
	);

const appVue = read("App.vue");
const controlCss = read("styles/control-system.css");
const catalogCss = read("styles/catalog-pages.css");
const orderCss = read("styles/order-pages.css");
for (const required of [
	'@import "@/styles/control-system.css"',
	"--control-height-large",
	".catalog-spec-grid button.active",
	".login-wechat",
	".commercial-empty button",
	"button::after",
	"align-items: center",
	"justify-content: center",
	"transform: none",
]) {
	if (!(appVue + controlCss).includes(required))
		errors.push(`control system is missing: ${required}`);
}

for (const forbidden of [
	"grid-template-columns: 137.3rpx;",
	"min-height: 1372.8rpx",
	"height: 1138.4rpx",
	"height: 119vw",
	"height: 125vw",
]) {
	if (catalogCss.includes(forbidden))
		errors.push(`catalog responsive CSS still contains: ${forbidden}`);
}
for (const forbidden of [
	"height: 800rpx",
	"height: 900rpx",
	"height: 1100rpx",
	"height: 1050rpx",
]) {
	if (orderCss.includes(forbidden))
		errors.push(`order responsive CSS still contains: ${forbidden}`);
}

const orderListSource = read("pages/orders/orders.vue");
const orderDetailSource = read("pages/order-detail/order-detail.vue");
const logisticsSource = read("pages/logistics/logistics.vue");
const loginSource = read("pages/login/login.vue");
const productDetailSource = read("pages/product-detail/product-detail.vue");
const aftersaleApplySource = read("pages/aftersale-apply/aftersale-apply.vue");
const indexSource = read("pages/index/index.vue");
const teaScienceSource = read("pages/tea-science/tea-science.vue");
const exchangeDetailSource = read("pages/exchange-detail/exchange-detail.vue");
const cancelOrderSource = read("pages/cancel-order/cancel-order.vue");
const routerSource = read("shared/router.js");
const partnerCss = read("styles/phase33-40.css");
const appSource = read("App.vue");
const mallPageSource = read("shared/mall-page.js");
const mallApiSource = read("shared/mall-api.js");
const bottomNavSource = read("components/BottomNav.vue");
const lifecycleCss = read("styles/lifecycle-pages.css");
const responsiveCss = read("styles/responsive-system.css");
for (const required of [
	"order-payment-actions",
	"order-payment-action--secondary",
	"order-payment-action--primary",
]) {
	if (!orderListSource.includes(required))
		errors.push(
			`order list is missing shared payment control: ${required}`,
		);
	if (!orderDetailSource.includes(required))
		errors.push(
			`order detail is missing shared payment control: ${required}`,
		);
	if (!controlCss.includes(required))
		errors.push(
			`control system is missing shared payment control: ${required}`,
		);
}

if (registered[0] !== "pages/login/login")
	errors.push("mini-program launch page must be the login page");
if (/<BottomNav\b/i.test(loginSource))
	errors.push("login page must not expose mall bottom navigation");
if (!mallPageSource.includes('uni.reLaunch({ url: "/pages/login/login" })'))
	errors.push("global unauthenticated login gate is missing");
if (!mallPageSource.includes('String(location.hash || "").match'))
	errors.push("H5 deep-link login gate fallback is missing");
if (!mallPageSource.includes('goPage("payFailure"'))
	errors.push(
		"failed test payment does not navigate to the pending-payment page",
	);
if (
	indexSource.includes("mp-build-badge") ||
	indexSource.includes("homeImageLoadedCount")
)
	errors.push("home page still renders internal image diagnostics");
for (const required of [
	"science-tab",
	"item.id === root?.id",
	"item.categoryCode && item.categoryName",
]) {
	if (!teaScienceSource.includes(required))
		errors.push(
			`tea science category normalization is missing: ${required}`,
		);
}
if (!orderDetailSource.includes("contactService('merchant')"))
	errors.push(
		"order detail customer-service controls are not wired to the service flow",
	);
for (const required of ["uni.redirectTo", "export function replacePage"])
	if (!routerSource.includes(required))
		errors.push(`navigation stack fallback is missing: ${required}`);
if (!cancelOrderSource.includes('replacePage("orderDetail"'))
	errors.push(
		"cancel result still pushes another order detail onto the page stack",
	);
if (/X-Mall-Build-Channel|wechat-devtest/i.test(mallApiSource))
	errors.push(
		"frontend must not be able to unlock test capabilities with a client supplied build channel",
	);
if (
	!exchangeDetailSource.includes('class="exchange-submit"') ||
	exchangeDetailSource.includes("phase-action-pad")
)
	errors.push(
		"exchange detail action is not a normal-flow sibling of its scroll content",
	);
for (const required of [
	"height: 82rpx",
	"min-height: 220rpx",
	"line-height: 1.6",
])
	if (!partnerCss.includes(required))
		errors.push(`partner form control sizing is missing: ${required}`);
if (
	!aftersaleApplySource.includes(
		"data?.url || data?.fileUrl || data?.fileName",
	) ||
	!mallApiSource.includes("payload.url || payload.fileUrl")
)
	errors.push("aftersale upload response normalization is missing");
if (
	/position:\s*absolute/.test(
		bottomNavSource.match(/\.bottom-nav\s*\{[\s\S]*?\}/)?.[0] || "",
	)
)
	errors.push("BottomNav still overlays page content");
if (/\.lifecycle-submit\s*\{[\s\S]*?position:\s*absolute/.test(lifecycleCss))
	errors.push("lifecycle action bar still overlays page content");
if (!responsiveCss.includes("safe area is owned by the bar once"))
	errors.push("shared bottom-safe-area ownership rule is missing");
// Class selectors work for both H5 uni-scroll-view and compiled WeChat nodes.
if (!/\.phone-shell\s*>\s*\.shell-scroll-viewport\s*\{[^}]*flex:\s*1 1 0%[^}]*height:\s*0[^}]*min-height:\s*0/.test(responsiveCss))
	errors.push("shared direct-child scroll flex rule is missing");
for (const required of [
	".phone-shell > .catalog-cart-total",
	".phone-shell > .logout",
])
	if (!responsiveCss.includes(required))
		errors.push(
			`shared normal-flow bottom bar rule is missing: ${required}`,
		);
if (!responsiveCss.includes("max-height: none"))
	errors.push("mobile H5 still inherits the desktop phone-shell max height");
if (
	/height:\s*100vh/.test(
		appSource.match(
			/\/\* #ifdef MP-WEIXIN \*\/[\s\S]*?\/\* #endif \*\//,
		)?.[0] || "",
	)
)
	errors.push(
		"mini-program root still uses 100vh instead of the real page height",
	);
for (const [number, , route] of expected) {
	if (/height\s*:\s*(?:calc\(100vh|100vh)/.test(read(`${route}.vue`)))
		errors.push(
			`${number} ${route} still calculates page height from 100vh`,
		);
}
for (const required of [
	"changeProductQtyAndSyncCart",
	"catalog-detail-cart-badge",
	"cartCount > 99",
]) {
	if (!productDetailSource.includes(required))
		errors.push(
			`product detail cart synchronization is missing: ${required}`,
		);
}
if (!mallPageSource.includes("requestedQty = null"))
	errors.push(
		"cart API helper cannot synchronize an explicit product quantity",
	);
if (/售后进度/.test(logisticsSource))
	errors.push(
		"logistics page still contains a duplicate aftersale progress section",
	);
if (/class="section-card aftersale-progress"/.test(orderDetailSource))
	errors.push(
		"order detail still contains a detached aftersale progress section",
	);
for (const required of [
	"grid-template-columns: repeat(2, minmax(0, 1fr))",
	"height: var(--control-height-large)",
	"min-height: var(--control-height-large)",
	"padding: 0 var(--control-padding-default)",
	"border-radius: var(--control-radius-default)",
	"font-size: var(--control-font-default)",
	"align-items: center",
	"justify-content: center",
]) {
	if (!controlCss.includes(required))
		errors.push(`payment pair metric is missing: ${required}`);
}

const manifest = JSON.parse(
	read("manifest.json")
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/^\s*\/\/.*$/gm, ""),
);
const ignored = manifest?.["mp-weixin"]?.packOptions?.ignore || [];
if (
	ignored.some(
		(item) => item.type === "folder" && item.value === "static/images",
	)
) {
	errors.push("manifest still ignores static/images");
}

const buildDir = path.join(root, "dist", "build", "mp-weixin");
if (fs.existsSync(buildDir)) {
	const buildFiles = walk(buildDir, [".js", ".json", ".wxml", ".wxss"]);
	const buildText = buildFiles
		.map((file) => fs.readFileSync(file, "utf8"))
		.join("\n");
	if (/localhost|127\.0\.0\.1/i.test(buildText))
		errors.push("formal mini-program build contains a loopback address");
	if (!buildText.includes("https://chaye.okam.top/api/mall"))
		errors.push("formal mini-program API URL is missing");
	if (/<managed-image/i.test(buildText))
		errors.push("formal mini-program build still uses ManagedImage");
	const assetsDir = path.join(buildDir, "assets");
	for (const image of [
		"login-art-v2.webp",
		"longjing-dark-v2.webp",
		"longjing-hero-v2.webp",
	]) {
		const extension = path.extname(image);
		const basename = path.basename(image, extension);
		const packaged = fs.existsSync(assetsDir)
			? fs
					.readdirSync(assetsDir)
					.find(
						(file) =>
							file.startsWith(`${basename}.`) &&
							file.endsWith(extension),
					)
			: null;
		if (!packaged) {
			errors.push(`mini-program package is missing ${image}`);
			continue;
		}
		const sourceBytes = fs.readFileSync(
			path.join(root, "static", "images", image),
		);
		const packagedBytes = fs.readFileSync(path.join(assetsDir, packaged));
		if (!sourceBytes.equals(packagedBytes))
			errors.push(`mini-program image bytes changed: ${image}`);
	}
} else {
	warnings.push("dist/build/mp-weixin does not exist yet");
}

const result = {
	status: errors.length ? "FAIL" : "PASS",
	registeredPages: registered.length,
	designPages: pageRows.length,
	buttonCount: pageRows.reduce((sum, row) => sum + row.buttons, 0),
	disabledStateCount: pageRows.reduce((sum, row) => sum + row.disabled, 0),
	tabGroupCount: pageRows.reduce((sum, row) => sum + row.tabs, 0),
	buttonCssBlocks: buttonBlocks.length,
	scaledButtonBlocks: scaledButtons.length,
	negativeButtonMarginBlocks: negativeButtonMargins.length,
	errors,
	warnings,
	pages: pageRows,
};

console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
