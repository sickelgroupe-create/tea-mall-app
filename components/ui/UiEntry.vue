<template>
	<view
		class="ui-entry"
		:class="[`ui-entry--${variant}`, { 'is-disabled': disabled }]"
		@tap="handleTap"
	>
		<view class="ui-entry__icon">
			<slot name="icon"
				><TeaIcon
					:name="icon"
					:size="24"
					:tone="disabled ? 'muted' : 'green'"
			/></slot>
		</view>
		<view class="ui-entry__copy">
			<text class="ui-entry__title">{{ title }}</text>
			<text v-if="description" class="ui-entry__description">{{
				description
			}}</text>
		</view>
		<view class="ui-entry__action">
			<slot name="action"
				><TeaIcon
					v-if="chevron"
					name="chevronRight"
					:size="18"
					tone="muted"
			/></slot>
		</view>
	</view>
</template>

<script>
import TeaIcon from "@/components/TeaIcon.vue";

export default {
	name: "UiEntry",
	components: { TeaIcon },
	props: {
		icon: { type: String, default: "info" },
		title: { type: String, required: true },
		description: { type: String, default: "" },
		variant: {
			type: String,
			default: "card",
			validator: (value) => ["card", "plain"].includes(value),
		},
		chevron: { type: Boolean, default: true },
		disabled: { type: Boolean, default: false },
	},
	emits: ["select"],
	methods: {
		handleTap() {
			if (!this.disabled) this.$emit("select");
		},
	},
};
</script>

<style scoped>
.ui-entry {
	width: 100%;
	min-height: 120.5rpx;
	min-width: 0;
	padding: var(--spacing-sm);
	border: var(--border-width) solid var(--color-border);
	border-radius: var(--radius-lg);
	background: var(--color-surface);
	display: grid;
	grid-template-columns: 67rpx minmax(0, 1fr) 33.5rpx;
	align-items: center;
	gap: var(--spacing-sm);
}
.ui-entry--plain {
	min-height: var(--list-item-min-height);
	padding: var(--spacing-xs) 0;
	border: 0;
	border-radius: 0;
	box-shadow: inset 0 -1px 0 var(--color-border);
}
.ui-entry__icon {
	width: 67rpx;
	height: 67rpx;
	border-radius: var(--radius-md);
	background: var(--color-primary-soft);
	display: flex;
	align-items: center;
	justify-content: center;
}
.ui-entry__copy {
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: var(--spacing-2xs);
}
.ui-entry__title {
	color: var(--color-text-primary);
	font-size: 25.1rpx;
	font-weight: var(--font-weight-medium);
	line-height: var(--line-height-body);
}
.ui-entry__description {
	color: var(--color-text-secondary);
	font-size: var(--font-size-caption);
	font-weight: var(--font-weight-regular);
	line-height: var(--line-height-caption);
	overflow-wrap: break-word;
}
.ui-entry__action {
	min-width: 33.5rpx;
	display: flex;
	align-items: center;
	justify-content: flex-end;
}
.ui-entry:active {
	background: var(--color-surface-muted);
}
.ui-entry.is-disabled {
	color: var(--color-text-disabled);
	background: var(--color-surface-muted);
}
.ui-entry.is-disabled .ui-entry__title,
.ui-entry.is-disabled .ui-entry__description {
	color: var(--color-text-disabled);
}
</style>
