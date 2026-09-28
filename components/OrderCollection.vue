<template>
	<view
		class="order-collection"
		:class="`is-${variant}`"
		@tap="$emit('open')"
	>
		<image :src="image" mode="aspectFill" @load="onLoad" @error="onError" />
		<view class="order-collection__veil"></view>
		<view class="order-collection__copy">
			<text class="order-collection__kicker">TEA RITUAL · 私享茶礼</text>
			<text class="order-collection__title">{{ title }}</text>
			<text class="order-collection__desc"
				>从山场到茶席，珍藏每一次抵达的香气。</text
			>
			<text class="order-collection__link">探索当季茶选　›</text>
		</view>
	</view>
</template>

<script>
import { staticImageUrl } from "@/shared/image-assets.js";
import { imageDiagnostic } from "@/shared/build-info.js";

export default {
	name: "OrderCollection",
	props: {
		variant: { type: String, default: "dark" },
		title: { type: String, default: "一盏茶的归途" },
		decoration: { type: Object, default: () => ({}) },
	},
	emits: ["open"],
	computed: {
		defaultImage() {
			return this.variant === "pale"
				? staticImageUrl("longjing-hero-v2.webp")
				: staticImageUrl("longjing-dark-v2.webp");
		},
		image() {
			return (
				staticImageUrl(this.decoration?.imageUrl) || this.defaultImage
			);
		},
	},
	methods: {
		onLoad(event) {
			imageDiagnostic(
				"LOAD",
				"order-collection",
				this.decoration?.imageUrl,
				this.image,
				event,
			);
		},
		onError(event) {
			imageDiagnostic(
				"ERROR",
				"order-collection",
				this.decoration?.imageUrl,
				this.image,
				event,
			);
		},
	},
};
</script>

<style scoped>
.order-collection {
	position: relative;
	height: 250rpx;
	overflow: hidden;
	color: #fff;
	background: #173527;
}
.order-collection image,
.order-collection__veil {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
}
.order-collection__veil {
	background: linear-gradient(
		90deg,
		rgba(12, 34, 25, 0.92),
		rgba(12, 34, 25, 0.4)
	);
}
.order-collection__copy {
	position: relative;
	z-index: 1;
	height: 100%;
	padding: 42rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}
.order-collection__kicker {
	font-size: 17rpx;
	letter-spacing: 3rpx;
	opacity: 0.72;
}
.order-collection__title {
	margin-top: 14rpx;
	font-family: SimSun, STSong, serif;
	font-size: 40rpx;
	line-height: 1.15;
}
.order-collection__desc {
	margin-top: 12rpx;
	width: 76%;
	font-size: 21rpx;
	line-height: 1.65;
	opacity: 0.82;
}
.order-collection__link {
	margin-top: auto;
	padding-bottom: 2rpx;
	border-bottom: 1px solid rgba(255, 255, 255, 0.5);
	font-size: 20rpx;
}
.is-pale {
	color: #263d31;
	background: #e8eadf;
}
.is-pale .order-collection__veil {
	background: linear-gradient(
		90deg,
		rgba(239, 241, 229, 0.95),
		rgba(239, 241, 229, 0.55)
	);
}
</style>
