<template>
	<view class="invitation-club" :class="variant">
		<image :src="image" mode="aspectFill" @load="onLoad" @error="onError" />
		<view class="club-shade"></view>
		<view class="club-copy">
			<text class="eyebrow">{{
				decoration?.englishTitle ||
				(variant === "light" ? "CURATED TEA RITUAL" : "INVITATION ONLY")
			}}</text>
			<text class="club-title">{{ decoration?.title || "私享茶会" }}</text
			><view class="club-line"></view>
			<text class="club-desc">{{
				decoration?.description ||
				"以茶为礼 · 只赠知己。以克制的仪式感，呈现真正稀缺的茶与器。"
			}}</text>
			<view class="club-benefits"
				><view
					><TeaIcon name="gift" :size="17" /><text
						>稀缺茶样</text
					></view
				><view
					><TeaIcon name="star" :size="17" /><text
						>雅集席位</text
					></view
				><view
					><TeaIcon name="check" :size="17" /><text
						>专属礼序</text
					></view
				></view
			>
		</view>
	</view>
</template>
<script>
import TeaIcon from "@/components/TeaIcon.vue";
import { staticImageUrl } from "@/shared/image-assets.js";
import { imageDiagnostic } from "@/shared/build-info.js";
export default {
	name: "InvitationClub",
	components: { TeaIcon },
	props: {
		variant: { type: String, default: "dark" },
		decoration: { type: Object, default: () => ({}) },
	},
	computed: {
		image() {
			return (
				staticImageUrl(this.decoration?.imageUrl) ||
				staticImageUrl("invite-poster-v2.webp")
			);
		},
	},
	methods: {
		onLoad(event) {
			imageDiagnostic(
				"LOAD",
				"invitation-club",
				this.decoration?.imageUrl,
				this.image,
				event,
			);
		},
		onError(event) {
			imageDiagnostic(
				"ERROR",
				"invitation-club",
				this.decoration?.imageUrl,
				this.image,
				event,
			);
		},
	},
};
</script>
<style scoped>
.invitation-club {
	position: relative;
	min-height: 1339.3rpx;
	border: 1px solid #d6bf8c;
	border-radius: 23.4rpx;
	overflow: hidden;
	background: #063f2c;
	color: #fff;
}
.invitation-club > image {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
}
.club-shade {
	position: absolute;
	inset: 0;
	background: rgba(0, 61, 42, 0.78);
}
.club-copy {
	position: relative;
	z-index: 1;
	padding: 45.2rpx 38.5rpx;
}
.eyebrow,
.club-title,
.club-desc {
	display: block;
}
.eyebrow {
	color: #e2c476;
	font-size: 16.7rpx;
	letter-spacing: 5rpx;
}
.club-title {
	margin-top: 13.4rpx;
	font-family: SimSun, STSong, serif;
	font-size: 45.2rpx;
	line-height: 1.3;
}
.club-line {
	width: 60.3rpx;
	height: 1px;
	margin: 23.4rpx 0;
	background: #c89b43;
}
.club-desc {
	max-width: 535.7rpx;
	color: rgba(255, 255, 255, 0.82);
	font-size: 20.1rpx;
	line-height: 1.8;
}
.club-benefits {
	display: flex;
	gap: 13.4rpx;
	margin-top: 40.2rpx;
}
.club-benefits > view {
	flex: 1;
	min-width: 0;
	height: 147.3rpx;
	border: 1px solid rgba(226, 196, 118, 0.4);
	border-radius: 15.1rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 13.4rpx;
	color: #e2c476;
}
.club-benefits text {
	color: #fff;
	font-family: SimSun, STSong, serif;
	font-size: 21.8rpx;
}
.light {
	min-height: 1133.4rpx;
	background: #faf6eb;
	color: #073f2d;
}
.light .club-shade {
	background: linear-gradient(
		90deg,
		rgba(255, 252, 244, 0.05) 0 46%,
		rgba(255, 252, 244, 0.96) 46%
	);
}
.light .club-copy {
	width: 48%;
	margin-left: auto;
	padding: 46.9rpx 30.1rpx;
	box-sizing: border-box;
}
.light .club-title,
.light .club-desc,
.light .club-benefits text {
	color: #073f2d;
}
.light .club-benefits {
	display: block;
}
.light .club-benefits > view {
	height: auto;
	border: 0;
	flex-direction: row;
	justify-content: flex-start;
	margin: 30.1rpx 0;
}
.light .eyebrow {
	color: #a66a2b;
}
</style>
