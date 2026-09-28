<template>
	<view
		class="ui-action-bar"
		:class="[`ui-action-bar--${mode}`, { 'ui-action-bar--safe': safeArea }]"
	>
		<view v-if="$slots.summary" class="ui-action-bar__summary"
			><slot name="summary"
		/></view>
		<view class="ui-action-bar__actions"><slot /></view>
	</view>
</template>

<script>
export default {
	name: "UiActionBar",
	props: {
		mode: {
			type: String,
			default: "static",
			validator: (value) => ["static", "sticky", "fixed"].includes(value),
		},
		safeArea: { type: Boolean, default: true },
	},
};
</script>

<style scoped>
.ui-action-bar {
	width: 100%;
	min-height: 107.1rpx;
	padding: var(--spacing-xs) var(--page-padding);
	border-top: var(--border-width) solid var(--color-border);
	background: rgba(255, 255, 255, 0.98);
	display: flex;
	align-items: center;
	gap: var(--spacing-sm);
}
.ui-action-bar--safe {
	padding-bottom: calc(var(--spacing-xs) + env(safe-area-inset-bottom));
}
.ui-action-bar--sticky {
	position: sticky;
	bottom: 0;
	z-index: var(--z-sticky);
}
.ui-action-bar--fixed {
	position: fixed;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: var(--z-navigation);
}
.ui-action-bar__summary {
	flex: 1 1 auto;
	min-width: 0;
}
.ui-action-bar__actions {
	flex: 0 0 auto;
	min-width: 0;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: var(--spacing-xs);
}
.ui-action-bar__actions:only-child {
	width: 100%;
}
@media (min-width: 768px) {
	.ui-action-bar {
		padding-right: var(--spacing-lg);
		padding-left: var(--spacing-lg);
	}
	.ui-action-bar__summary,
	.ui-action-bar__actions {
		max-width: calc(var(--content-max-width) / 2);
	}
}
</style>
