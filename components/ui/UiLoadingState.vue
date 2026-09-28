<template>
	<view
		class="ui-loading-state"
		:class="{ 'ui-loading-state--inline': inline }"
	>
		<view class="ui-loading-state__spinner" aria-hidden="true" />
		<text v-if="text" class="ui-loading-state__text">{{ text }}</text>
	</view>
</template>

<script>
export default {
	name: "UiLoadingState",
	props: {
		text: { type: String, default: "正在加载" },
		inline: { type: Boolean, default: false },
	},
};
</script>

<style scoped>
.ui-loading-state {
	width: 100%;
	min-height: 267.9rpx;
	padding: var(--spacing-lg);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: var(--spacing-sm);
}
.ui-loading-state--inline {
	width: auto;
	min-height: 0;
	padding: var(--spacing-xs);
	flex-direction: row;
}
.ui-loading-state__spinner {
	width: 40.2rpx;
	height: 40.2rpx;
	border: 3.3rpx solid var(--color-primary-muted);
	border-top-color: var(--color-primary);
	border-radius: var(--radius-round);
	animation: ui-loading-spin 0.8s linear infinite;
}
.ui-loading-state__text {
	color: var(--color-text-secondary);
	font-size: var(--font-size-caption);
	line-height: var(--line-height-caption);
}
@keyframes ui-loading-spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
