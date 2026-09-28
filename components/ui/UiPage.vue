<template>
	<view class="ui-page" :class="{ 'ui-page--with-bottom': withBottom }">
		<slot name="status" />
		<slot name="header" />
		<scroll-view
			v-if="scroll"
			scroll-y
			class="ui-page__scroll"
			:show-scrollbar="false"
		>
			<view class="ui-page__content" :class="contentClass"><slot /></view>
		</scroll-view>
		<view
			v-else
			class="ui-page__content ui-page__content--static"
			:class="contentClass"
		>
			<slot />
		</view>
		<view v-if="$slots.bottom" class="ui-page__bottom"
			><slot name="bottom"
		/></view>
	</view>
</template>

<script>
export default {
	name: "UiPage",
	props: {
		scroll: { type: Boolean, default: true },
		withBottom: { type: Boolean, default: false },
		contentClass: { type: [String, Array, Object], default: "" },
	},
};
</script>

<style scoped>
.ui-page {
	width: 100%;
	min-height: 100%;
	height: 100%;
	min-width: 0;
	background: var(--color-background);
	color: var(--color-text-primary);
	display: flex;
	flex-direction: column;
	overflow: hidden;
}
.ui-page__scroll {
	flex: 1 1 auto;
	height: 0;
	min-height: 0;
}
.ui-page__content {
	width: 100%;
	max-width: var(--content-max-width);
	margin: 0 auto;
	padding: var(--spacing-md) var(--page-padding) var(--spacing-lg);
}
.ui-page__content--static {
	flex: 1 1 auto;
}
.ui-page--with-bottom .ui-page__content {
	padding-bottom: var(--spacing-xl);
}
.ui-page__bottom {
	flex: 0 0 auto;
	width: 100%;
}
@media (min-width: 768px) {
	.ui-page__content {
		padding-right: var(--spacing-lg);
		padding-left: var(--spacing-lg);
	}
}
</style>
