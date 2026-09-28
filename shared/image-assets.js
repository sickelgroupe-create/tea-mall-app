import loginArtV2 from "../static/images/login-art-v2.webp";
import biluochun from "../static/images/biluochun.jpg";
import blackteaRed from "../static/images/blacktea-red.jpg";
import invitePosterV2 from "../static/images/invite-poster-v2.webp";
import longjingDarkV2 from "../static/images/longjing-dark-v2.webp";
import longjingDark from "../static/images/longjing-dark.jpg";
import longjingHeroV2 from "../static/images/longjing-hero-v2.webp";
import longjingPale from "../static/images/longjing-pale.jpg";
import maofengPouch from "../static/images/maofeng-pouch.jpg";
import teaGiftV2 from "../static/images/tea-gift-v2.webp";
import yixingPot from "../static/images/yixing-pot.jpg";

export const MALL_ORIGIN = "https://chaye.okam.top";

// 微信开发者工具可以解码这些 WebP，但部分 iOS 真机只绘制 image
// 容器的底色。线上同时保留了同源、同内容的原始 PNG，因此小程序
// 使用 HTTPS PNG；H5 继续使用体积更小的 WebP。原文件不做任何转码。
const MINI_PROGRAM_COMPATIBLE_IMAGES = Object.freeze({
	// #ifdef MP-WEIXIN
	"invite-poster-v2.webp": "invite-poster-v2.png",
	"login-art-v2.webp": "login-art-v2.png",
	"longjing-dark-v2.webp": "longjing-dark-v2.png",
	"longjing-hero-v2.webp": "longjing-hero-v2.png",
	"tea-gift-v2.webp": "tea-gift-v2.png",
	// #endif
});

// Dynamic /static strings work on H5 but are invisible to the mini-program
// compiler. Static imports make both targets use compiler-owned packaged URLs.
const LOCAL_IMAGES = Object.freeze({
	"biluochun.jpg": biluochun,
	"blacktea-red.jpg": blackteaRed,
	"invite-poster-v2.webp": invitePosterV2,
	"login-art-v2.webp": loginArtV2,
	"longjing-dark-v2.webp": longjingDarkV2,
	"longjing-dark.jpg": longjingDark,
	"longjing-hero-v2.webp": longjingHeroV2,
	"longjing-pale.jpg": longjingPale,
	"maofeng-pouch.jpg": maofengPouch,
	"tea-gift-v2.webp": teaGiftV2,
	"yixing-pot.jpg": yixingPot,
});

// The content API stores stable media keys without an extension while product
// and decoration APIs normally return /static/images paths. Resolve both forms
// to the exact same packaged asset so iOS WeChat never receives a relative URL.
const IMAGE_ALIASES = Object.freeze({
	biluochun: "biluochun.jpg",
	"blacktea-red": "blacktea-red.jpg",
	"invite-poster-v2": "invite-poster-v2.webp",
	"login-art-v2": "login-art-v2.webp",
	"longjing-dark-v2": "longjing-dark-v2.webp",
	"longjing-dark": "longjing-dark.jpg",
	"longjing-hero-v2": "longjing-hero-v2.webp",
	"longjing-pale": "longjing-pale.jpg",
	"maofeng-pouch": "maofeng-pouch.jpg",
	"tea-gift-v2": "tea-gift-v2.webp",
	"yixing-pot": "yixing-pot.jpg",
});

const SERVER_IMAGES = new Set([
	"biluochun.jpg",
	"blacktea-orange.jpg",
	"blacktea-red.jpg",
	"canvas-tote.jpg",
	"invite-poster-v2.webp",
	"longjing-dark.jpg",
	"longjing-pale.jpg",
	"maofeng-pouch.jpg",
	"oolong-category-v1.webp",
	"porcelain-cup.jpg",
	"puer-category-v1.webp",
	"tea-gift.jpg",
	"tea-gift-v2.webp",
	"travel-set.jpg",
	"white-tea-category-v1.webp",
	"wood-tray.jpg",
	"yixing-pot.jpg",
]);

export const MINI_PROGRAM_FALLBACK_IMAGE = longjingDarkV2;

export function staticImageUrl(name) {
	const rawValue = String(name || "").trim();
	if (!rawValue) return "";
	const withoutOrigin = rawValue.startsWith(MALL_ORIGIN)
		? rawValue.slice(MALL_ORIGIN.length)
		: rawValue;
	const requestedFileName = withoutOrigin
		.replace(/^\/static\/images\//, "")
		.split(/[?#]/, 1)[0];
	const fileName = IMAGE_ALIASES[requestedFileName] || requestedFileName;
	const compatibleFileName = MINI_PROGRAM_COMPATIBLE_IMAGES[fileName];
	if (compatibleFileName)
		return `${MALL_ORIGIN}/static/images/${compatibleFileName}`;
	if (LOCAL_IMAGES[fileName]) return LOCAL_IMAGES[fileName];
	if (/^https:\/\//i.test(rawValue)) return rawValue;
	if (
		SERVER_IMAGES.has(fileName) ||
		withoutOrigin.startsWith("/static/images/")
	)
		return `${MALL_ORIGIN}/static/images/${fileName}`;
	return withoutOrigin;
}
