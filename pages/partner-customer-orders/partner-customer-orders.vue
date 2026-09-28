<template>
	<view
		class="app-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell partner-shell"
			><StatusBar /><TopBar
				title="客户购买记录"
				@back="back"
			/><scroll-view scroll-y class="shell-scroll-viewport partner-scroll"
				><view v-if="customer" class="partner-card"
					><text style="font-size: 32rpx">{{
						customer.nickname || "茶友"
					}}</text
					><text
						style="
							display: block;
							color: #7c887f;
							margin-top: 10rpx;
						"
						>{{ customer.phone }}</text
					></view
				><view v-if="phaseLoading" class="phase-message"
					>订单加载中…</view
				><view v-else-if="phaseError" class="phase-message"
					>{{ phaseError }}<button @tap="load">重新加载</button></view
				><view v-else class="partner-card"
					><view
						v-for="order in partnerOrders"
						:key="order.orderNo"
						class="partner-order"
						@tap="go('orderDetail', { orderNo: order.orderNo })"
						><view class="partner-order-head"
							><text>{{ order.orderNo }}</text
							><text>{{ order.status }}</text></view
						><view class="partner-order-products">{{
							order.products || "商品信息"
						}}</view
						><view class="partner-order-head"
							><text>{{ order.createTime }}</text
							><MallPrice
								class="partner-order-amount"
								:value="order.paidAmount"
								:precision="2" /></view></view
					><view v-if="!partnerOrders.length" class="phase-message"
						>暂无购买记录</view
					></view
				><view class="partner-collection"
					><image
						:src="decorationImage('partner.intro')"
						mode="aspectFill"
					/><text>每一笔记录都真实可循</text></view
				></scroll-view
			></view
		></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import mallPage from "@/shared/mall-page.js";
import phase from "@/shared/phase33-40.js";
import mallApi from "@/shared/mall-api.js";
export default {
	components: { StatusBar, TopBar },
	mixins: [mallPage, phase],
	data() {
		return { customerId: null, customer: null };
	},
	onLoad(q) {
		this.customerId = Number(q.customerId || 0);
	},
	onShow() {
		this.load();
	},
	methods: {
		async load() {
			if (!this.customerId) return;
			try {
				const data = await this.phaseRun(() =>
					mallApi.partnerCustomerOrders(this.customerId, {
						page: 1,
						pageSize: 50,
					}),
				);
				this.customer = data.customer;
				this.partnerOrders = data.items || [];
			} catch (_) {}
		},
	},
};
</script>
