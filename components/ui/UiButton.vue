<template>
	<button
		class="ui-button"
		:class="[
			`ui-button--${variant}`,
			`ui-button--${size}`,
			{ 'ui-button--block': block, 'is-disabled': isDisabled },
		]"
		:disabled="isDisabled"
		:hover-class="isDisabled ? 'none' : 'ui-button--pressed'"
		@tap="handleTap"
	>
		<view v-if="loading" class="ui-button__spinner" aria-hidden="true" />
		<slot>{{ loading ? loadingText : label }}</slot>
	</button>
</template>

<script>
export default {
	name: "UiButton",
	props: {
		label: { type: String, default: "" },
		loadingText: { type: String, default: "处理中" },
		variant: {
			type: String,
			default: "primary",
			validator: (value) =>
				["primary", "secondary", "ghost", "text", "danger"].includes(
					value,
				),
		},
		size: {
			type: String,
			default: "md",
			validator: (value) => ["sm", "md", "lg"].includes(value),
		},
		block: { type: Boolean, default: false },
		disabled: { type: Boolean, default: false },
		loading: { type: Boolean, default: false },
	},
	emits: ["select"],
	computed: {
		isDisabled() {
			return this.disabled || this.loading;
		},
	},
	methods: {
		handleTap(event) {
			if (!this.isDisabled) this.$emit("select", event);
		},
	},
};
</script>

<style scoped>
.ui-button {
	width: auto;
	min-width: var(--control-min-width-default);
	min-height: var(--control-height-medium);
	margin: 0;
	padding: 0 var(--control-padding-default);
	box-sizing: border-box;
	flex-shrink: 0;
	border: var(--border-width) solid transparent;
	border-radius: var(--control-radius-default);
	background: var(--color-primary);
	color: var(--color-text-inverse);
	font-size: var(--control-font-default);
	font-weight: var(--control-font-weight);
	line-height: 1.2;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: var(--control-icon-gap);
	white-space: nowrap;
}
.ui-button--sm {
	height: var(--control-height-small);
	min-width: var(--control-min-width-compact);
	min-height: var(--control-height-small);
	border-radius: var(--control-radius-small);
	font-size: var(--control-font-small);
}
.ui-button--md {
	height: var(--control-height-medium);
}
.ui-button--lg {
	height: var(--control-height-large);
	min-width: var(--control-min-width-default);
	min-height: var(--control-height-large);
	font-size: var(--control-font-emphasis);
	font-weight: var(--control-font-weight-emphasis);
}
.ui-button--block {
	width: 100%;
}
.ui-button--secondary {
	border-color: var(--color-border-strong);
	background: var(--color-surface);
	color: var(--color-primary);
}
.ui-button--ghost {
	border-color: transparent;
	background: var(--color-primary-soft);
	color: var(--color-primary);
}
.ui-button--text {
	min-width: 0;
	padding-right: var(--spacing-xs);
	padding-left: var(--spacing-xs);
	border-color: transparent;
	background: transparent;
	color: var(--color-primary);
}
.ui-button--danger {
	border-color: var(--color-error);
	background: var(--color-surface);
	color: var(--color-error);
}
.ui-button--pressed {
	opacity: 0.84;
}
.ui-button.is-disabled {
	border-color: var(--color-border);
	background: var(--color-surface-muted);
	color: var(--color-text-disabled);
	opacity: 1;
}
.ui-button__spinner {
	width: 24rpx;
	height: 24rpx;
	border: 3rpx solid currentColor;
	border-right-color: transparent;
	border-radius: var(--radius-round);
	animation: ui-button-spin 0.8s linear infinite;
}
@keyframes ui-button-spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
