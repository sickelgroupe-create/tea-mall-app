<template>
	<view class="app-stage catalog-stage order-phase">
		<view class="phone-shell">
			<StatusBar />
			<TopBar title="支付未完成" @back="back" />
			<scroll-view v-if="selectedOrder" scroll-y class="shell-scroll-viewport screen payment-failure-screen shell-scroll--with-action">
				<view class="payment-state-card">
					<view class="payment-state-icon"><TeaIcon name="wallet" :size="30" /></view>
					<text class="payment-state-title">待支付</text>
					<text class="payment-state-description">本次测试支付未成功，订单仍保留在待付款状态</text>
					<MallPrice :value="selectedOrder.paidAmount" :precision="2" size="emphasis" />
					<text class="payment-state-order">订单编号 {{ selectedOrder.no }}</text>
				</view>

				<view class="payment-order-card">
					<text class="payment-order-title">订单信息</text>
					<view v-for="item in selectedOrder.items || []" :key="item.orderItemId || item.skuId" class="payment-order-item">
						<image :src="item.image" mode="aspectFill" />
						<view><text>{{ item.name }}</text><text>{{ item.spec || "默认规格" }} ×{{ item.qty || 1 }}</text></view>
					</view>
				</view>
			</scroll-view>
			<scroll-view v-else scroll-y class="shell-scroll-viewport screen payment-failure-screen shell-scroll--with-action">
				<view class="commercial-empty order-missing-empty">
					<text>订单仍待支付</text>
					<text>请进入我的订单重新选择待付款订单。</text>
				</view>
			</scroll-view>
			<view class="payment-failure-actions">
				<button class="outline-button" @tap="openSelectedOrderDetail">查看订单详情</button>
				<button class="primary-button" :disabled="!selectedOrder" @tap="openPayment(selectedOrder)">重新支付</button>
			</view>
			<view v-if="toastText" class="toast">{{ toastText }}</view>
		</view>
	</view>
</template>

<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import mallPage from "@/shared/mall-page.js";

export default {
	components: { StatusBar, TopBar, TeaIcon },
	mixins: [mallPage],
};
</script>

<style scoped>
.payment-failure-screen {
	padding: 30rpx 24rpx;
	background: #f5f3ee;
}
.payment-state-card,
.payment-order-card {
	width: 100%;
	margin-bottom: 22rpx;
	padding: 30rpx;
	border: 1px solid #e4dfd5;
	background: #fff;
}
.payment-state-card {
	display: flex;
	align-items: center;
	flex-direction: column;
	gap: 14rpx;
	text-align: center;
}
.payment-state-icon {
	display: flex;
	width: 64rpx;
	height: 64rpx;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: #f6efe1;
	color: #9b5b2f;
}
.payment-state-title {
	color: #183f2d;
	font-size: 34rpx;
	font-weight: 600;
}
.payment-state-description,
.payment-state-order {
	color: #77756f;
	font-size: 22rpx;
	line-height: 1.55;
}
.payment-state-order {
	font-variant-numeric: tabular-nums;
}
.payment-order-title {
	display: block;
	margin-bottom: 18rpx;
	color: #183f2d;
	font-size: 28rpx;
	font-weight: 600;
}
.payment-order-item {
	display: grid;
	grid-template-columns: 104rpx minmax(0, 1fr);
	gap: 18rpx;
	align-items: center;
}
.payment-order-item image {
	width: 104rpx;
	height: 104rpx;
	border-radius: 10rpx;
}
.payment-order-item > view {
	display: flex;
	min-width: 0;
	flex-direction: column;
	gap: 8rpx;
}
.payment-order-item > view text:first-child {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 25rpx;
}
.payment-order-item > view text:last-child {
	color: #8a8780;
	font-size: 21rpx;
}
.payment-failure-actions {
	display: grid;
	flex: 0 0 auto;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16rpx;
	padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
	border-top: 1px solid #e4ded2;
	background: #fff;
}
.payment-failure-actions button {
	width: 100%;
	min-width: 0;
	margin: 0;
}
</style>
