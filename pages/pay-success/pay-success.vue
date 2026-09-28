<template>
	<view class="app-stage catalog-stage order-phase" :style="visualAuditStyle">
		<view class="phone-shell">
			<StatusBar />
			<TopBar :title="cashierTitle" @back="back" />
			<scroll-view v-if="selectedOrder" scroll-y class="shell-scroll-viewport screen pay-screen cashier-screen">
				<view v-if="isPendingPayment" class="cashier-amount-card">
					<text>待支付金额</text>
					<MallPrice :value="selectedOrder.paidAmount" :precision="2" size="emphasis" />
					<text class="cashier-order-no">订单编号 {{ selectedOrder.no }}</text>
				</view>
				<view v-else class="cashier-success-card">
					<view class="success-mark"><TeaIcon name="check" :size="42" /></view>
					<text class="pay-title">支付成功</text>
					<text>订单已进入待发货，后台订单状态已同步</text>
					<MallPrice :value="selectedOrder.paidAmount" :precision="2" size="emphasis" />
				</view>

				<view class="cashier-section">
					<text class="cashier-section__title">订单信息</text>
					<view v-for="item in selectedOrder.items || []" :key="item.skuId || item.productId" class="cashier-product">
						<image :src="item.image" mode="aspectFill" />
						<view><text>{{ item.name }}</text><text>{{ item.spec || "默认规格" }} ×{{ item.qty || 1 }}</text></view>
						<MallPrice :value="item.price" :precision="2" tone="neutral" />
					</view>
					<view class="cashier-row"><text>收货人</text><text>{{ receiverSummary }}</text></view>
					<view class="cashier-row"><text>支付方式</text><text>测试支付（不调用微信支付）</text></view>
					<view class="cashier-row"><text>预计获得积分</text><text>{{ selectedOrder.rewardPoints || 0 }} 积分</text></view>
				</view>

				<button v-if="isPendingPayment" class="primary-button cashier-pay-button" :disabled="paymentSubmitting" @tap="testPayOrder(selectedOrder)">
					<text>{{ paymentSubmitting ? "支付处理中…" : "测试支付" }}</text>
					<MallPrice v-if="!paymentSubmitting" :value="selectedOrder.paidAmount" :precision="2" size="inherit" tone="inverse" />
				</button>
				<view v-if="isPendingPayment" class="cashier-secondary-actions">
					<button class="outline-button" @tap="cancelPayment(selectedOrder)">取消支付</button>
					<button class="outline-button" @tap="openSelectedOrderDetail">查看订单详情</button>
				</view>
				<button v-else class="primary-button" @tap="openSelectedOrderDetail">查看订单详情</button>
				<button v-if="!isPendingPayment" class="outline-button" @tap="go('home')">返回首页</button>
			</scroll-view>
			<scroll-view v-else scroll-y class="shell-scroll-viewport screen pay-screen">
				<view class="commercial-empty order-missing-empty">
					<view class="empty-state-icon"><TeaIcon name="clipboard" :size="29" /></view>
					<text>未找到待支付订单</text>
					<text>请返回订单列表重新选择，系统不会使用其他缓存订单替代。</text>
					<button @tap="go('orders')">查看我的订单</button>
				</view>
			</scroll-view>
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
	computed: {
		isPendingPayment() {
			return this.selectedOrder?.status === "待付款" && this.selectedOrder?.paymentStatus !== "已支付";
		},
		cashierTitle() {
			return this.isPendingPayment ? "支付订单" : "支付成功";
		},
		receiverSummary() {
			const order = this.selectedOrder || {};
			return [order.receiverName, order.receiverPhone].filter(Boolean).join(" ") || "待补充";
		},
	},
};
</script>

<style scoped>
.cashier-screen { padding-bottom: calc(48rpx + env(safe-area-inset-bottom)); }
.cashier-amount-card,
.cashier-success-card,
.cashier-section { box-sizing: border-box; width: 100%; margin-bottom: 22rpx; background: #fff; border: 1px solid #e4dfd5; }
.cashier-amount-card,
.cashier-success-card { display: flex; flex-direction: column; align-items: center; gap: 14rpx; padding: 42rpx 28rpx; text-align: center; }
.cashier-amount-card > text:first-child { color: #6f6c65; font-size: 24rpx; }
.cashier-order-no { color: #8b877f; font-size: 21rpx; font-variant-numeric: tabular-nums; }
.cashier-success-card > text { color: #5f655f; font-size: 23rpx; }
.cashier-section { padding: 26rpx; }
.cashier-section__title { display: block; margin-bottom: 22rpx; color: #173f2d; font-family: var(--font-family-title); font-size: 29rpx; font-weight: 700; }
.cashier-product { display: flex; min-width: 0; align-items: center; gap: 18rpx; padding: 16rpx 0; border-bottom: 1px solid #eee9e0; }
.cashier-product image { width: 92rpx; height: 92rpx; flex: 0 0 92rpx; border-radius: 10rpx; }
.cashier-product > view { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 8rpx; }
.cashier-product > view text:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #232a25; font-size: 24rpx; }
.cashier-product > view text:last-child { color: #8c8982; font-size: 20rpx; }
.cashier-row { display: flex; min-width: 0; align-items: flex-start; justify-content: space-between; gap: 24rpx; padding-top: 22rpx; color: #6d6a64; font-size: 23rpx; }
.cashier-row text:last-child { min-width: 0; text-align: right; color: #263029; }
.cashier-pay-button { display: flex; width: 100%; align-items: center; justify-content: center; gap: 10rpx; }
.cashier-secondary-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16rpx; margin-top: 16rpx; }
.cashier-secondary-actions button { width: 100%; min-width: 0; }
</style>
