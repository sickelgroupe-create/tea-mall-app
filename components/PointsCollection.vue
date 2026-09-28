<template>
	<view :class="['points-collection', `tone-${tone}`]"
		><image
			:src="image"
			mode="aspectFill"
			@load="onLoad"
			@error="onError"
		/><view class="points-collection-copy"
			><text>{{ decoration?.englishTitle || "CURATED TEA RITUAL" }}</text
			><text>{{ decoration?.title || "典藏礼遇" }}</text
			><text>{{
				decoration?.description ||
				"积分不止兑换，更显身份。从茶园、工艺到器物，建立完整的私人品鉴档案。"
			}}</text
			><view
				><text>◇ 御选礼单</text><text>♕ 限定编号</text
				><text>◉ 优先品鉴</text></view
			></view
		></view
	>
</template>
<script>
import { staticImageUrl } from "@/shared/image-assets.js";
import { imageDiagnostic } from "@/shared/build-info.js";

export default {
	props: {
		tone: { type: String, default: "dark" },
		decoration: { type: Object, default: () => ({}) },
	},
	computed: {
		image() {
			return (
				staticImageUrl(this.decoration?.imageUrl) ||
				staticImageUrl("tea-gift-v2.webp")
			);
		},
	},
	methods: {
		onLoad(event) {
			imageDiagnostic(
				"LOAD",
				"points-collection",
				this.decoration?.imageUrl,
				this.image,
				event,
			);
		},
		onError(event) {
			imageDiagnostic(
				"ERROR",
				"points-collection",
				this.decoration?.imageUrl,
				this.image,
				event,
			);
		},
	},
};
</script>
