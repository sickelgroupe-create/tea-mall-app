<template>
	<view v-if="visible" class="ui-sheet-layer" @touchmove.stop.prevent>
		<view class="ui-sheet-layer__mask" @tap="handleMask" />
		<view class="ui-sheet" :class="[`ui-sheet--${placement}`]" @tap.stop>
			<view class="ui-sheet__header">
				<view class="ui-sheet__copy">
					<text class="ui-sheet__title">{{ title }}</text>
					<text v-if="description" class="ui-sheet__description">{{
						description
					}}</text>
				</view>
				<UiIconButton
					v-if="closable"
					label="关闭"
					size="sm"
					@select="$emit('close')"
				>
					<text class="ui-sheet__close">×</text>
				</UiIconButton>
			</view>
			<view class="ui-sheet__body"><slot /></view>
			<view v-if="$slots.footer" class="ui-sheet__footer"
				><slot name="footer"
			/></view>
		</view>
	</view>
</template>

<script>
import UiIconButton from "@/components/ui/UiIconButton.vue";

export default {
	name: "UiSheet",
	components: { UiIconButton },
	props: {
		visible: { type: Boolean, default: false },
		title: { type: String, default: "" },
		description: { type: String, default: "" },
		placement: {
			type: String,
			default: "bottom",
			validator: (value) => ["bottom", "center"].includes(value),
		},
		closable: { type: Boolean, default: true },
		closeOnMask: { type: Boolean, default: true },
	},
	emits: ["close"],
	methods: {
		handleMask() {
			if (this.closeOnMask) this.$emit("close");
		},
	},
};
</script>

<style scoped>
.ui-sheet-layer {
	position: fixed;
	inset: 0;
	z-index: var(--z-overlay);
	display: flex;
	align-items: flex-end;
	justify-content: center;
}
.ui-sheet-layer__mask {
	position: fixed;
	inset: 0;
	background: var(--color-mask);
}
.ui-sheet {
	position: relative;
	z-index: var(--z-modal);
	width: 100%;
	max-width: 870.5rpx;
	max-height: calc(100% - 80.4rpx);
	border-radius: var(--radius-xl) var(--radius-xl) 0 0;
	background: var(--color-surface);
	box-shadow: var(--shadow-floating);
	overflow: hidden;
	display: flex;
	flex-direction: column;
}
.ui-sheet--center {
	width: calc(100% - 53.6rpx);
	max-width: 703.1rpx;
	margin: auto;
	border-radius: var(--radius-xl);
}
.ui-sheet__header {
	flex: 0 0 auto;
	min-height: 120.5rpx;
	padding: var(--spacing-md);
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: var(--spacing-sm);
}
.ui-sheet__copy {
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: var(--spacing-2xs);
}
.ui-sheet__title {
	color: var(--color-text-primary);
	font-size: var(--font-size-title);
	font-weight: var(--font-weight-semibold);
	line-height: var(--line-height-title);
}
.ui-sheet__description {
	color: var(--color-text-secondary);
	font-size: var(--font-size-caption);
	line-height: var(--line-height-caption);
	overflow-wrap: break-word;
}
.ui-sheet__close {
	color: var(--color-text-secondary);
	font-size: 33.5rpx;
	line-height: 1;
}
.ui-sheet__body {
	min-height: 0;
	padding: 0 var(--spacing-md) var(--spacing-md);
	overflow-y: auto;
}
.ui-sheet__footer {
	flex: 0 0 auto;
	padding: var(--spacing-sm) var(--spacing-md)
		calc(var(--spacing-sm) + env(safe-area-inset-bottom));
	border-top: var(--border-width) solid var(--color-border);
	background: var(--color-surface);
}
</style>
