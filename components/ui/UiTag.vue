<template>
	<text class="ui-tag" :class="[`ui-tag--${tone}`, `ui-tag--${size}`]"
		><slot>{{ label }}</slot></text
	>
</template>

<script>
export default {
	name: "UiTag",
	props: {
		label: { type: String, default: "" },
		tone: {
			type: String,
			default: "neutral",
			validator: (value) =>
				["neutral", "primary", "success", "warning", "error"].includes(
					value,
				),
		},
		size: {
			type: String,
			default: "md",
			validator: (value) => ["sm", "md"].includes(value),
		},
	},
};
</script>

<style scoped>
.ui-tag {
	width: fit-content;
	border: var(--border-width) solid transparent;
	border-radius: var(--radius-round);
	display: inline-flex;
	align-items: center;
	justify-content: center;
	white-space: nowrap;
}
.ui-tag--sm {
	min-height: 33.5rpx;
	padding: 0 11.7rpx;
	font-size: 16.7rpx;
	line-height: 26.8rpx;
}
.ui-tag--md {
	min-height: 40.2rpx;
	padding: 1px var(--spacing-xs);
	font-size: var(--font-size-caption);
	line-height: var(--line-height-caption);
}
.ui-tag--neutral {
	border-color: var(--color-border);
	background: var(--color-surface-muted);
	color: var(--color-text-secondary);
}
.ui-tag--primary {
	background: var(--color-primary-soft);
	color: var(--color-primary);
}
.ui-tag--success {
	background: var(--color-success-soft);
	color: var(--color-success);
}
.ui-tag--warning {
	background: var(--color-warning-soft);
	color: var(--color-warning);
}
.ui-tag--error {
	background: var(--color-error-soft);
	color: var(--color-error);
}
</style>
