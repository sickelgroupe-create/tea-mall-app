<template>
	<view class="top-bar" :style="topBarStyle">
		<view class="side left" @tap="$emit('back')"
			><TeaIcon v-if="back" class="back" name="back" :size="25"
		/></view>
		<text class="top-title">{{ title }}</text>
		<view class="side right" @tap="$emit('right')"
			><slot name="right"
				><text>{{ right }}</text></slot
			></view
		>
	</view>
</template>

<script>
import TeaIcon from "@/components/TeaIcon.vue";
import { getDeviceLayout } from "@/shared/device-layout.js";

export default {
	name: "TopBar",
	components: { TeaIcon },
	props: {
		title: { type: String, default: "" },
		back: { type: Boolean, default: true },
		right: { type: String, default: "" },
	},
	emits: ["back", "right"],
	data() {
		return { deviceLayout: getDeviceLayout() };
	},
	computed: {
		topBarStyle() {
			const layout = this.deviceLayout;
			return {
				"--dynamic-top-bar-height": `${layout.topBarHeight}px`,
				// capsuleRightInset 已经是胶囊左边缘到屏幕右侧的完整宽度。
				// 旧公式再次叠加胶囊宽度，窄屏会把标题列压成 0。
				"--capsule-reserve": `${Math.max(52, layout.capsuleRightInset)}px`,
			};
		},
	},
};
</script>

<style scoped>
.top-bar {
	height: var(--dynamic-top-bar-height, var(--top-bar-height));
	min-height: var(--dynamic-top-bar-height, var(--top-bar-height));
	flex-shrink: 0;
	display: grid;
	grid-template-columns:
		var(--capsule-reserve, 104rpx) minmax(0, 1fr)
		var(--capsule-reserve, 104rpx);
	align-items: center;
	background: rgba(255, 255, 255, 0.98);
	color: var(--color-text-primary);
	position: relative;
	z-index: 2;
	border-bottom: var(--border-width) solid var(--color-border);
}
.side {
	height: 100%;
	display: flex;
	align-items: center;
	padding: 0 var(--page-padding);
	box-sizing: border-box;
	font-size: var(--font-size-body);
	white-space: nowrap;
	min-width: 0;
}
.right {
	justify-content: flex-end;
	color: var(--color-text-secondary);
}
.back {
	color: var(--color-primary);
}
.top-title {
	text-align: center;
	font-weight: var(--font-weight-semibold);
	font-size: 32rpx;
	line-height: 1.35;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	letter-spacing: 0;
}
</style>
