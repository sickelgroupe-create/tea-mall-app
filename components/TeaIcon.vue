<template>
	<view class="tea-icon" :style="iconStyle" aria-hidden="true">
		<image class="tea-icon__image" :src="iconSrc" mode="aspectFit" />
	</view>
</template>

<script>
import teaIconAssets from "@/shared/tea-icon-assets.js";

const icons = {
	search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "m21 21-4.4-4.4"],
	filter: ["M4 5h16l-6 7v6l-4 2v-8z"],
	more: ["M6 12h.01", "M12 12h.01", "M18 12h.01"],
	back: ["m15 18-6-6 6-6"],
	wifi: [
		"M5 10a10.5 10.5 0 0 1 14 0",
		"M8 13a6.2 6.2 0 0 1 8 0",
		"M11 16a2 2 0 0 1 2 0",
		"M12 19h.01",
	],
	coin: [
		"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
		"M9 8.5h4a2 2 0 0 1 0 4H9",
		"M9 12.5h4a2 2 0 0 1 0 4H9",
		"M12 6v12",
	],
	phone: [
		"M6.5 3h11A1.5 1.5 0 0 1 19 4.5v15a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-15A1.5 1.5 0 0 1 6.5 3Z",
		"M10 18h4",
	],
	wechat: [
		"M10 4C5.6 4 2 6.9 2 10.4c0 2 1.1 3.8 3 5l-.7 2.4 2.7-1.3c.9.2 1.9.4 3 .4 4.4 0 8-2.7 8-6.1S14.4 4 10 4Z",
		"M15 9c3.9 0 7 2.5 7 5.5 0 1.7-.9 3.2-2.5 4.2l.6 2-2.3-1.1c-.8.2-1.7.3-2.8.3-3.9 0-7-2.4-7-5.4S11.1 9 15 9Z",
		"M7 9h.01",
		"M12 9h.01",
		"M13 14h.01",
		"M18 14h.01",
	],
	home: ["M3 11.5 12 4l9 7.5", "M5 10.5V20h14v-9.5", "M9 20v-6h6v6"],
	category: [
		"M4 4h6v6H4z",
		"M14 4h6v6h-6z",
		"M4 14h6v6H4z",
		"M14 14h6v6h-6z",
	],
	points: [
		"M12 2.8a9.2 9.2 0 1 0 0 18.4 9.2 9.2 0 0 0 0-18.4Z",
		"M8.7 9.1c.6-1 1.8-1.6 3.3-1.6 2 0 3.4 1 3.4 2.5 0 3.7-6.8 1.2-6.8 4.5 0 1.3 1.4 2.2 3.5 2.2 1.5 0 2.8-.6 3.5-1.6",
		"M12 5.5v13",
	],
	cart: [
		"M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20.3 8H6",
		"M10 20h.01",
		"M17 20h.01",
	],
	user: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M4.5 21a7.5 7.5 0 0 1 15 0"],
	headset: [
		"M4 14v-2a8 8 0 0 1 16 0v2",
		"M4 14a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2v1",
		"M20 14a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2v1",
		"M17 19c-1 1-2.3 1.5-4 1.5",
	],
	settings: [
		"M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
		"M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3.4-.2-.1a1.7 1.7 0 0 0-1.9.1l-1 .6a1.7 1.7 0 0 0-.9 1.5v.2H10v-.2A1.7 1.7 0 0 0 9.1 21l-1-.6a1.7 1.7 0 0 0-1.9-.1l-.2.1L4 17l.1-.1a1.7 1.7 0 0 0 .3-1.9l-.6-1a1.7 1.7 0 0 0-1.5-.8H2v-4h.3A1.7 1.7 0 0 0 3.8 8l.6-1a1.7 1.7 0 0 0-.3-1.9L4 5l2-3.4.2.1a1.7 1.7 0 0 0 1.9-.1l1-.6a1.7 1.7 0 0 0 .9-1.5V-.7h4v.2a1.7 1.7 0 0 0 .9 1.5l1 .6a1.7 1.7 0 0 0 1.9.1l.2-.1L20 5l-.1.1a1.7 1.7 0 0 0-.3 1.9l.6 1a1.7 1.7 0 0 0 1.5.8h.3v4h-.3a1.7 1.7 0 0 0-1.5.8l-.8 1.4Z",
	],
	wallet: [
		"M4 6h14a2 2 0 0 1 2 2v11H5a2 2 0 0 1-2-2V6.5A2.5 2.5 0 0 1 5.5 4H18",
		"M15 11h5v4h-5a2 2 0 0 1 0-4Z",
	],
	package: [
		"M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z",
		"M4 7.5 12 12l8-4.5",
		"M12 12v9",
		"M8 5.2l8 4.5",
	],
	truck: [
		"M3 6h11v10H3z",
		"M14 10h4l3 3v3h-7z",
		"M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
		"M18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
	],
	service: ["M5 4h14v12H8l-3 3z", "M8 8h8", "M8 12h5"],
	location: [
		"M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z",
		"M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
	],
	heart: [
		"M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
	],
	clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7v5l3 2"],
	ticket: ["M3 7h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4z", "M9 7v12"],
	info: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 11v6", "M12 7h.01"],
	shield: ["M12 3 20 6v6c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6z", "m9 12 2 2 4-5"],
	bell: ["M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9", "M10 21h4"],
	lock: ["M6 10h12v11H6z", "M8 10V7a4 4 0 0 1 8 0v3", "M12 14v3"],
	store: [
		"M4 10v10h16V10",
		"M3 4h18l-1 6a3 3 0 0 1-4 1 3 3 0 0 1-4 0 3 3 0 0 1-4 0 3 3 0 0 1-4-1z",
		"M9 20v-6h6v6",
	],
	star: [
		"m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9L7 19.8l1-6.1-4.4-4.3 6.1-.9z",
	],
	check: ["M20 6 9 17l-5-5"],
	gift: [
		"M4 10h16v11H4z",
		"M2 6h20v4H2z",
		"M12 6v15",
		"M12 6H8.5A2.5 2.5 0 1 1 11 3.5L12 6Zm0 0h3.5A2.5 2.5 0 1 0 13 3.5L12 6Z",
	],
	share: ["M12 3v12", "m7 8 5-5 5 5", "M5 13v7h14v-7"],
	download: ["M12 3v12", "m7 10 5 5 5-5", "M5 21h14"],
	link: [
		"M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1",
		"M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1",
	],
	users: [
		"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
		"M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
		"M22 21v-2a4 4 0 0 0-3-3.9",
		"M16 3.1a4 4 0 0 1 0 7.8",
	],
	help: [
		"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
		"M9.5 9a2.7 2.7 0 1 1 4.2 2.2c-1 .7-1.7 1.1-1.7 2.3",
		"M12 17h.01",
	],
	refresh: ["M20 11a8 8 0 1 0 2 5.3", "M20 4v7h-7"],
	clipboard: ["M9 4h6v3H9z", "M7 5H5v16h14V5h-2", "M9 12h6", "M9 16h4"],
	chevronRight: ["m9 18 6-6-6-6"],
	chevronDown: ["m6 9 6 6 6-6"],
};

export default {
	name: "TeaIcon",
	props: {
		name: { type: String, default: "info" },
		size: { type: [Number, String], default: 22 },
		tone: { type: String, default: "green" },
	},
	computed: {
		paths() {
			return icons[this.name] || icons.info;
		},
		iconSrc() {
			const tone = ["green", "muted", "dark", "white"].includes(this.tone)
				? this.tone
				: "green";
			const name = icons[this.name] ? this.name : "info";
			return teaIconAssets[tone]?.[name] || teaIconAssets.green.info;
		},
		iconStyle() {
			let size =
				typeof this.size === "number" ? `${this.size}px` : this.size;
			// Numeric icon props are design-pixel measurements. On WeChat convert
			// them with the same 448px -> 750rpx scale used by the control system.
			// #ifdef MP-WEIXIN
			if (typeof this.size === "number") {
				size = `${Math.round(this.size * (750 / 448) * 10) / 10}rpx`;
			}
			// #endif
			return { width: size, height: size };
		},
	},
};
</script>

<style scoped>
.tea-icon {
	display: inline-flex;
	flex: 0 0 auto;
	align-items: center;
	justify-content: center;
	color: currentColor;
}
.tea-icon__image {
	display: block;
	width: 100%;
	height: 100%;
	background: transparent !important;
}
</style>
