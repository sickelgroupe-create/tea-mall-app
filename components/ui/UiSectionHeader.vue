<template>
	<view class="ui-section-header">
		<view class="ui-section-header__copy">
			<text class="ui-section-header__title">{{ title }}</text>
			<text v-if="description" class="ui-section-header__description">{{
				description
			}}</text>
		</view>
		<view
			v-if="$slots.action || action"
			class="ui-section-header__action"
			@tap="$emit('action')"
		>
			<slot name="action"
				><text>{{ action }}</text></slot
			>
		</view>
	</view>
</template>

<script>
export default {
	name: "UiSectionHeader",
	props: {
		title: { type: String, required: true },
		description: { type: String, default: "" },
		action: { type: String, default: "" },
	},
	emits: ["action"],
};
</script>

<style scoped>
.ui-section-header {
	min-height: 67rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--spacing-sm);
	margin: var(--spacing-lg) 0 var(--spacing-sm);
}
.ui-section-header__copy {
	min-width: 0;
	display: flex;
	align-items: baseline;
	gap: var(--spacing-xs);
}
.ui-section-header__title {
	color: var(--color-text-primary);
	font-size: var(--font-size-title);
	font-weight: var(--font-weight-semibold);
	line-height: var(--line-height-title);
	white-space: nowrap;
}
.ui-section-header__description {
	min-width: 0;
	color: var(--color-text-secondary);
	font-size: var(--font-size-caption);
	font-weight: var(--font-weight-regular);
	line-height: var(--line-height-caption);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.ui-section-header__action {
	flex: 0 0 auto;
	min-height: 67rpx;
	display: flex;
	align-items: center;
	color: var(--color-primary);
	font-size: var(--font-size-caption);
	font-weight: var(--font-weight-medium);
	line-height: var(--line-height-caption);
}
</style>
