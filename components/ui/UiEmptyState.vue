<template>
	<view class="ui-empty-state">
		<view class="ui-empty-state__icon"
			><slot name="icon"><TeaIcon :name="icon" :size="28" /></slot
		></view>
		<text class="ui-empty-state__title">{{ title }}</text>
		<text v-if="description" class="ui-empty-state__description">{{
			description
		}}</text>
		<view v-if="$slots.action || action" class="ui-empty-state__action">
			<slot name="action"
				><UiButton size="sm" :label="action" @select="$emit('action')"
			/></slot>
		</view>
	</view>
</template>

<script>
import TeaIcon from "@/components/TeaIcon.vue";
import UiButton from "@/components/ui/UiButton.vue";

export default {
	name: "UiEmptyState",
	components: { TeaIcon, UiButton },
	props: {
		icon: { type: String, default: "info" },
		title: { type: String, default: "暂无内容" },
		description: { type: String, default: "" },
		action: { type: String, default: "" },
	},
	emits: ["action"],
};
</script>

<style scoped>
.ui-empty-state {
	width: 100%;
	min-height: 401.8rpx;
	padding: var(--spacing-xl) var(--spacing-lg);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
}
.ui-empty-state__icon {
	width: 87.1rpx;
	height: 87.1rpx;
	margin-bottom: var(--spacing-sm);
	border-radius: var(--radius-round);
	background: var(--color-primary-soft);
	color: var(--color-primary);
	display: flex;
	align-items: center;
	justify-content: center;
}
.ui-empty-state__title {
	color: var(--color-text-primary);
	font-size: var(--font-size-body-lg);
	font-weight: var(--font-weight-semibold);
	line-height: var(--line-height-body-lg);
}
.ui-empty-state__description {
	max-width: 468.8rpx;
	margin-top: var(--spacing-2xs);
	color: var(--color-text-secondary);
	font-size: var(--font-size-body);
	line-height: var(--line-height-body);
	overflow-wrap: break-word;
}
.ui-empty-state__action {
	margin-top: var(--spacing-md);
}
</style>
