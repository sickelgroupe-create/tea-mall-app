<template>
	<button
		class="ui-icon-button"
		:class="[`ui-icon-button--${size}`, { 'is-disabled': disabled }]"
		:disabled="disabled"
		:hover-class="disabled ? 'none' : 'ui-icon-button--pressed'"
		@tap="handleTap"
	>
		<TeaIcon v-if="icon" :name="icon" :size="iconSize" :tone="tone" />
		<slot />
		<text v-if="label" class="ui-visually-hidden">{{ label }}</text>
	</button>
</template>

<script>
import TeaIcon from "@/components/TeaIcon.vue";

export default {
	name: "UiIconButton",
	components: { TeaIcon },
	props: {
		icon: { type: String, default: "" },
		label: { type: String, default: "" },
		size: {
			type: String,
			default: "md",
			validator: (value) => ["sm", "md", "lg"].includes(value),
		},
		iconSize: { type: [Number, String], default: 22 },
		tone: { type: String, default: "green" },
		disabled: { type: Boolean, default: false },
	},
	emits: ["select"],
	methods: {
		handleTap(event) {
			if (!this.disabled) this.$emit("select", event);
		},
	},
};
</script>

<style scoped>
.ui-icon-button {
	display: inline-flex;
	box-sizing: border-box;
	min-width: 0;
	min-height: 0;
	margin: 0;
	padding: 0;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	border: var(--border-width) solid var(--color-border);
	border-radius: var(--radius-md);
	background: var(--color-surface);
	color: var(--color-primary);
	line-height: 1;
}
.ui-icon-button--sm {
	width: var(--control-height-compact);
	height: var(--control-height-compact);
	border-radius: var(--radius-sm);
}
.ui-icon-button--md {
	width: var(--control-height-medium);
	height: var(--control-height-medium);
}
.ui-icon-button--lg {
	width: var(--control-height-large);
	height: var(--control-height-large);
}
.ui-icon-button--pressed {
	background: var(--color-primary-soft);
}
.ui-icon-button.is-disabled {
	color: var(--color-text-disabled);
	background: var(--color-surface-muted);
}
</style>
