<template>
	<view
		class="ui-list-item"
		:class="{ 'is-disabled': disabled, 'ui-list-item--divided': divided }"
		@tap="handleTap"
	>
		<view v-if="icon || $slots.icon" class="ui-list-item__icon">
			<slot name="icon"
				><TeaIcon
					:name="icon"
					:size="22"
					:tone="disabled ? 'muted' : 'green'"
			/></slot>
		</view>
		<view class="ui-list-item__copy">
			<text class="ui-list-item__title">{{ title }}</text>
			<text v-if="description" class="ui-list-item__description">{{
				description
			}}</text>
		</view>
		<view
			v-if="value || $slots.action || chevron"
			class="ui-list-item__action"
		>
			<slot name="action">
				<text v-if="value" class="ui-list-item__value">{{
					value
				}}</text>
				<TeaIcon
					v-if="chevron"
					name="chevronRight"
					:size="18"
					tone="muted"
				/>
			</slot>
		</view>
	</view>
</template>

<script>
import TeaIcon from "@/components/TeaIcon.vue";

export default {
	name: "UiListItem",
	components: { TeaIcon },
	props: {
		icon: { type: String, default: "" },
		title: { type: String, required: true },
		description: { type: String, default: "" },
		value: { type: String, default: "" },
		chevron: { type: Boolean, default: false },
		divided: { type: Boolean, default: true },
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
.ui-list-item {
	width: 100%;
	min-height: var(--list-item-min-height);
	min-width: 0;
	padding: var(--spacing-xs) 0;
	display: grid;
	grid-template-columns: auto minmax(0, 1fr) auto;
	align-items: center;
	gap: var(--spacing-sm);
}
.ui-list-item--divided {
	box-shadow: inset 0 -1px 0 var(--color-border);
}
.ui-list-item__icon {
	width: 53.6rpx;
	height: 53.6rpx;
	border-radius: var(--radius-sm);
	background: var(--color-primary-soft);
	display: flex;
	align-items: center;
	justify-content: center;
}
.ui-list-item__copy {
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 3.3rpx;
}
.ui-list-item__title {
	color: var(--color-text-primary);
	font-size: var(--font-size-body);
	font-weight: var(--font-weight-medium);
	line-height: var(--line-height-body);
	overflow-wrap: break-word;
}
.ui-list-item__description {
	color: var(--color-text-secondary);
	font-size: var(--font-size-caption);
	font-weight: var(--font-weight-regular);
	line-height: var(--line-height-caption);
	overflow-wrap: break-word;
}
.ui-list-item__action {
	min-width: 0;
	display: flex;
	align-items: center;
	gap: var(--spacing-2xs);
	color: var(--color-text-secondary);
}
.ui-list-item__value {
	max-width: 241.1rpx;
	color: var(--color-text-secondary);
	font-size: var(--font-size-caption);
	line-height: var(--line-height-caption);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.ui-list-item:active {
	background: var(--color-surface-muted);
}
.ui-list-item.is-disabled .ui-list-item__title,
.ui-list-item.is-disabled .ui-list-item__description,
.ui-list-item.is-disabled .ui-list-item__value {
	color: var(--color-text-disabled);
}
</style>
