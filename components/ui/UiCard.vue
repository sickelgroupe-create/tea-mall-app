<template>
	<view
		class="ui-card"
		:class="[
			`ui-card--${variant}`,
			{ 'ui-card--interactive': interactive },
		]"
		@tap="handleTap"
	>
		<slot />
	</view>
</template>

<script>
export default {
	name: "UiCard",
	props: {
		variant: {
			type: String,
			default: "surface",
			validator: (value) =>
				["surface", "muted", "accent"].includes(value),
		},
		interactive: { type: Boolean, default: false },
	},
	emits: ["select"],
	methods: {
		handleTap() {
			if (this.interactive) this.$emit("select");
		},
	},
};
</script>

<style scoped>
.ui-card {
	width: 100%;
	min-width: 0;
	padding: var(--spacing-md);
	border: var(--border-width) solid var(--color-border);
	border-radius: var(--radius-lg);
	background: var(--color-surface);
	box-shadow: var(--shadow-card);
}
.ui-card--muted {
	background: var(--color-surface-muted);
}
.ui-card--accent {
	border-color: var(--color-primary-muted);
	background: var(--color-primary-soft);
}
.ui-card--interactive:active {
	border-color: var(--color-border-strong);
	background: var(--color-surface-muted);
}
</style>
