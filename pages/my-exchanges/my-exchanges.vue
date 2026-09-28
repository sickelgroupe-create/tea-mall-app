<template>
	<view class="app-stage"
		><view class="phone-shell phase-points-shell"
			><StatusBar /><TopBar title="我的兑换" @back="back" /><view
				class="phase-tabs"
				><text
					v-for="(tab, i) in ['全部', '配送中', '已完成']"
					:key="tab"
					:class="{ active: exchangeTab === i }"
					@tap="exchangeTab = i"
					>{{ tab }}</text
				></view
			><scroll-view scroll-y class="shell-scroll-viewport screen phase-points-scroll with-tab shell-scroll--with-bottom-nav"
				><view class="phase-list-card"
					><view
						v-for="item in filtered"
						:key="item.exchangeNo"
						class="phase-exchange-row"
						@tap="open(item)"
						><image :src="item.image" mode="aspectFill" /><view
							><text>{{ item.name }}</text
							><text
								>{{ String(item.createTime || '').slice(0, 10) }} ·
								{{ item.status }}</text
							><text class="phase-number">{{ item.pointsCost }}积分</text
							><text v-if="item.trackingNo"
								>{{ item.carrier }} {{ item.trackingNo }}</text
							><button
								v-if="canConfirmReceipt(item)"
								class="phase-exchange-receive"
								:disabled="exchangeSubmitting"
								@tap.stop="askConfirmReceipt(item)"
							>
								确认收货
							</button></view
						><text>›</text></view
					><view v-if="!filtered.length" class="phase-empty-line"
						>暂无兑换记录</view
					></view
				><PointsCollection
					:decoration="decoration('points.promo')"
					tone="photo" /></scroll-view
			><BottomNav active="points" :cart-count="cartCount" @select="nav" />
			<view v-if="detail" class="sheet-mask"
				><view class="phase-confirm"
					><text>兑换详情</text
					><text>{{ detail.exchangeNo }} · {{ detail.status }}</text
					><text>{{ detail.receiverAddress }}</text
					><text v-if="detail.trackingNo"
						>{{ detail.carrier }} {{ detail.trackingNo }}</text
					><view
						><button @tap="detail = null">关闭</button
						><button
							v-if="['待处理', '待发货'].includes(detail.status)"
							:disabled="exchangeSubmitting"
							@tap="cancel"
						>
							取消兑换
						</button
						><button
							v-else-if="canConfirmReceipt(detail)"
							:disabled="exchangeSubmitting"
							@tap="askConfirmReceipt(detail)"
						>
							确认收货
						</button></view
					></view
				></view
			><view v-if="receiptTarget" class="sheet-mask receipt-confirm-mask"
				><view class="phase-confirm"
					><text>确认收货</text
					><text>{{ receiptTarget.name }}</text
					><text>{{ receiptTarget.exchangeNo }}</text
					><text>确认已收到兑换礼品吗？确认后兑换单将变为“已完成”。</text
					><view
						><button :disabled="exchangeSubmitting" @tap="receiptTarget = null">暂不确认</button
						><button :disabled="exchangeSubmitting" @tap="confirmReceipt">
							{{ exchangeSubmitting ? "处理中…" : "确认收货" }}
						</button></view
					></view
				></view
			><view v-if="toastText" class="toast">{{ toastText }}</view></view
		></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import BottomNav from "@/components/BottomNav.vue";
import PointsCollection from "@/components/PointsCollection.vue";
import mallPage from "@/shared/mall-page.js";
export default {
	components: { StatusBar, TopBar, BottomNav, PointsCollection },
	mixins: [mallPage],
	data() {
		return { exchangeTab: 0, detail: null, receiptTarget: null };
	},
	computed: {
		filtered() {
			if (this.exchangeTab === 1)
				return this.exchanges.filter((item) =>
					["待发货", "配送中", "待收货"].includes(item.status),
				);
			if (this.exchangeTab === 2)
				return this.exchanges.filter((item) => item.status === "已完成");
			return this.exchanges;
		},
	},
	methods: {
		canConfirmReceipt(item) {
			return ["配送中", "待收货"].includes(item?.status);
		},
		askConfirmReceipt(item) {
			if (!this.canConfirmReceipt(item) || this.exchangeSubmitting) return;
			this.receiptTarget = item;
		},
		async confirmReceipt() {
			const exchangeNo = this.receiptTarget?.exchangeNo;
			if (!exchangeNo || this.exchangeSubmitting) return;
			try {
				await this.confirmExchangeReceipt(exchangeNo);
				this.receiptTarget = null;
				this.detail = this.selectedExchangeOrder;
			} catch (error) {}
		},
		async open(item) {
			await this.loadExchangeOrder(item.exchangeNo);
			this.detail = this.selectedExchangeOrder;
		},
		async cancel() {
			await this.cancelExchangeOrder(this.detail.exchangeNo);
			this.detail = this.selectedExchangeOrder;
		},
	},
};
</script>
