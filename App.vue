<script>
import { BUILD_ID, BUILD_VERSION } from "@/shared/build-info.js";

export default {
	onLaunch: function () {
		console.info(
			`[TEA_BUILD] ${JSON.stringify({ buildId: BUILD_ID, version: BUILD_VERSION, launchedAt: new Date().toISOString() })}`,
		);
		// #ifdef H5
		if (typeof window !== "undefined" && !window.__teaChunkRecoveryBound) {
			window.__teaChunkRecoveryBound = true;
			const recoverChunk = (reason) => {
				const message = String(reason?.message || reason || "");
				if (
					!/Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
						message,
					)
				)
					return;
				const key = "teaChunkRecovery";
				const recoveredAt = Number(sessionStorage.getItem(key) || 0);
				if (Date.now() - recoveredAt < 30000) return;
				sessionStorage.setItem(key, String(Date.now()));
				window.location.reload();
			};
			window.addEventListener("error", (event) =>
				recoverChunk(event.error || event.message),
			);
			window.addEventListener("unhandledrejection", (event) =>
				recoverChunk(event.reason),
			);
		}
		// #endif
	},
	onShow: function () {},
	onHide: function () {},
};
</script>

<style>
@import "@/styles/design-tokens.css";
@import "@/styles/mall.css";
@import "@/styles/commercial.css";
@import "@/styles/ui-foundation.css";
@import "@/styles/core-pages.css";
@import "@/styles/catalog-pages.css";
@import "@/styles/order-pages.css";
@import "@/styles/phase25-32.css";
@import "@/styles/phase25-32-tier.css";
@import "@/styles/phase33-40.css";
@import "@/styles/phase41-48.css";
@import "@/styles/control-system.css";
@import "@/styles/responsive-system.css";

view,
text,
image,
scroll-view,
input,
button {
	box-sizing: border-box;
}
button {
	font-family: inherit;
}
button::after {
	border: none;
}
::-webkit-scrollbar {
	width: 0;
	height: 0;
}

/* #ifdef MP-WEIXIN */
/* 真机本身就是手机视口。桌面 H5 的居中“手机壳”不能再次套进小程序，
 * 否则会同时制造顶部、底部和左右留白，并把所有固定栏裁在内层壳里。 */
page {
	width: 100%;
	height: 100%;
	min-height: 0;
	overflow: hidden;
	background: #f8f6f0;
}
.app-stage {
	display: flex;
	width: 100%;
	height: 100%;
	min-height: 0;
	padding: 0;
	background: #f8f6f0;
}
.phone-shell {
	width: 100%;
	max-width: none;
	height: 100%;
	min-height: 0;
	max-height: none;
	margin: 0;
	border: 0;
	border-radius: 0;
	box-shadow: none;
}
/* #endif */
</style>
