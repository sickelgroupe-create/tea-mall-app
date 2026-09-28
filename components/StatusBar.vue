<template>
	<view class="status-bar" :style="statusStyle">
		<!-- #ifdef H5 -->
		<text class="status-time">{{ currentTime }}</text>
		<view class="status-icons" aria-hidden="true">
			<view class="signal">
				<view class="signal-bar"></view>
				<view class="signal-bar"></view>
				<view class="signal-bar"></view>
				<view class="signal-bar"></view>
			</view>
			<TeaIcon class="wifi" name="wifi" :size="15" />
			<view class="battery"><view class="battery-fill"></view></view>
		</view>
		<!-- #endif -->
	</view>
</template>

<script>
import TeaIcon from "@/components/TeaIcon.vue";
import { getDeviceLayout } from "@/shared/device-layout.js";

export default {
	name: "StatusBar",
	components: { TeaIcon },
	data() {
		return { currentTime: "", statusBarHeight: 0 };
	},
	mounted() {
		this.statusBarHeight = getDeviceLayout().statusBarHeight;
		const update = () => {
			const now = new Date();
			this.currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
		};
		update();
		this.clockTimer = setInterval(update, 30000);
	},
	beforeUnmount() {
		clearInterval(this.clockTimer);
	},
	computed: {
		statusStyle() {
			return this.statusBarHeight
				? { "--status-bar-height": `${this.statusBarHeight}px` }
				: {};
		},
	},
};
</script>

<style scoped>
.status-bar {
	height: 57rpx;
	min-height: 57rpx;
	flex-shrink: 0;
	padding: 0 var(--page-padding);
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	box-sizing: border-box;
	color: var(--color-text-primary);
	font-weight: var(--font-weight-semibold);
	font-size: 23rpx;
	line-height: 1;
	background: rgba(252, 251, 248, 0.96);
}
.status-time {
	padding-bottom: 12rpx;
}
.status-icons {
	height: 43.5rpx;
	display: flex;
	align-items: center;
	gap: 8.4rpx;
}
.signal {
	height: 20.1rpx;
	display: flex;
	align-items: flex-end;
	gap: 3.3rpx;
}
.signal-bar {
	display: block;
	width: 3.3rpx;
	border-radius: 3.3rpx;
	background: #0b0d0b;
}
.signal-bar:nth-child(1) {
	height: 6.7rpx;
}
.signal-bar:nth-child(2) {
	height: 10rpx;
}
.signal-bar:nth-child(3) {
	height: 15.1rpx;
}
.signal-bar:nth-child(4) {
	height: 20.1rpx;
}
.wifi {
	display: flex;
	align-items: center;
	justify-content: center;
}
.battery {
	position: relative;
	width: 33.5rpx;
	height: 16.7rpx;
	border: 2.5rpx solid #111;
	border-radius: 4.2rpx;
	padding: 1px;
	box-sizing: border-box;
}
.battery::after {
	content: "";
	position: absolute;
	right: -5rpx;
	top: 5rpx;
	width: 2.5rpx;
	height: 6.7rpx;
	background: #111;
	border-radius: 0 1px 1px 0;
}
.battery-fill {
	width: 23.4rpx;
	height: 100%;
	background: #111;
	border-radius: 1px;
}

/* A real mobile browser already owns the system status area. Hiding the H5
 * mock prevents a duplicated clock and keeps page controls clear of browser UI. */
/* #ifdef H5 */
@media (max-width: 640px) {
	.status-bar {
		display: none;
		height: 0;
		min-height: 0;
	}
}
/* #endif */

/* #ifdef MP-WEIXIN */
.status-bar {
	height: var(--status-bar-height, 41.9rpx);
	min-height: var(--status-bar-height, 41.9rpx);
	padding: 0;
}
/* #endif */
</style>
