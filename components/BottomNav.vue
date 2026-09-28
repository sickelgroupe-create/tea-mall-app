<template>
	<view class="bottom-nav">
		<view
			v-for="item in items"
			:key="item.key"
			class="nav-item"
			:class="{ active: active === item.key }"
			@tap="$emit('select', item.key)"
		>
			<view class="nav-icon" :class="item.key">
				<TeaIcon
					:name="item.icon"
					:size="23"
					:tone="active === item.key ? 'green' : 'muted'"
				/>
				<text v-if="item.key === 'cart' && cartCount" class="badge">{{
					cartCount
				}}</text>
			</view>
			<text>{{ item.label }}</text>
		</view>
	</view>
</template>

<script>
import TeaIcon from "@/components/TeaIcon.vue";

export default {
	name: "BottomNav",
	components: { TeaIcon },
	props: {
		active: { type: String, default: "home" },
		cartCount: { type: Number, default: 0 },
	},
	emits: ["select"],
	computed: {
		items() {
			return [
				{ key: "home", icon: "home", label: "首页" },
				{ key: "invite", icon: "users", label: "茶友" },
				{ key: "points", icon: "points", label: "积分" },
				{ key: "mine", icon: "user", label: "我的" },
			];
		},
	},
};
</script>

<style scoped>
.bottom-nav {
	height: calc(112rpx + var(--bottom-safe-space));
	min-height: calc(112rpx + var(--bottom-safe-space));
	padding: 8rpx 20rpx calc(8rpx + var(--bottom-safe-space));
	box-sizing: border-box;
	border-top: var(--border-width) solid var(--color-border);
	background: rgba(255, 255, 255, 0.98);
	display: flex;
	flex: 0 0 auto;
	align-items: center;
	justify-content: stretch;
	position: relative;
	z-index: 40;
	box-shadow: none;
}
.nav-item {
	flex: 1 1 25%;
	min-width: 0;
	min-height: 88rpx;
	color: var(--color-text-tertiary);
	font-size: 20rpx;
	line-height: 1.3;
	font-weight: var(--font-weight-regular);
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--spacing-2xs);
	justify-content: center;
	transition: color var(--motion-base) ease;
}
.nav-icon {
	position: relative;
	width: 46rpx;
	height: 42rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.nav-item.active {
	color: var(--color-primary);
	font-weight: var(--font-weight-semibold);
}
.nav-item.active .nav-icon {
	color: var(--color-primary);
}
.nav-item:active {
	opacity: 0.72;
}
.badge {
	position: absolute;
	right: -6.7rpx;
	top: -6.7rpx;
	min-width: 25.1rpx;
	height: 25.1rpx;
	padding: 0 5rpx;
	box-sizing: border-box;
	border-radius: 13.4rpx;
	background: var(--color-warning);
	color: var(--color-text-inverse);
	font-family: var(--font-family-base);
	font-size: 16.7rpx;
	font-weight: var(--font-weight-medium);
	line-height: 25.1rpx;
}
.nav-item.points .nav-icon {
	font-size: 33.5rpx;
}
</style>
