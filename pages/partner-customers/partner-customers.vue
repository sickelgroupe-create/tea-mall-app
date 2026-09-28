<template>
	<view
		class="app-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell partner-shell"
			><StatusBar /><TopBar title="我的客户" @back="back" /><scroll-view
				scroll-y
				class="shell-scroll-viewport partner-scroll with-tab shell-scroll--with-bottom-nav"
				><view class="partner-search"
					><input
						v-model.trim="keyword"
						placeholder="搜索昵称或手机号"
						confirm-type="search"
						@confirm="load"
					/><button @tap="load">搜索</button></view
				><view class="partner-tabs"
					><view
						v-for="t in tabs"
						:key="t.value"
						class="partner-tab"
						:class="{ active: segment === t.value }"
						@tap="
							segment = t.value;
							load();
						"
						>{{ t.label }}</view
					></view
				><view v-if="phaseLoading" class="phase-message"
					>客户数据加载中…</view
				><view v-else-if="phaseError" class="phase-message"
					>{{ phaseError }}<button @tap="load">重新加载</button></view
				><view v-else class="partner-card"
					><view
						v-for="item in partnerClients"
						:key="item.id"
						class="partner-client"
						@tap="
							go('partnerCustomerOrders', { customerId: item.id })
						"
						><image
							class="partner-avatar"
							:src="
								imageFor(
									item.avatarUrl ||
										imageFor('longjing-hero-v2'),
								)
							"
							mode="aspectFill"
						/><view class="partner-grow"
							><text>{{ item.nickname || "茶友" }}</text
							><text
								>{{ item.phone || "未绑定手机" }} ·
								{{ item.orderCount }} 笔订单</text
							><text
								>最近购买
								{{ item.recentPurchase || "暂无" }}</text
							></view
						><view
							><MallPrice
								class="partner-number"
								:value="item.salesAmount"
								:precision="2"
							/><text> ›</text></view
						></view
					><view v-if="!partnerClients.length" class="phase-message"
						>暂无符合条件的客户</view
					></view
				><view class="partner-collection"
					><image
						:src="decorationImage('partner.intro')"
						mode="aspectFill"
					/><text>以诚相待 · 以茶相知</text></view
				></scroll-view
			><BottomNav
				active="mine"
				:cart-count="cartCount"
				@select="nav" /></view
	></view>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import BottomNav from "@/components/BottomNav.vue";
import mallPage from "@/shared/mall-page.js";
import phase from "@/shared/phase33-40.js";
import mallApi from "@/shared/mall-api.js";
export default {
	components: { StatusBar, TopBar, BottomNav },
	mixins: [mallPage, phase],
	data() {
		return {
			keyword: "",
			segment: "all",
			tabs: [
				{ label: "全部客户", value: "all" },
				{ label: "近30日", value: "month" },
				{ label: "高价值", value: "valuable" },
			],
		};
	},
	onShow() {
		this.load();
	},
	methods: {
		async load() {
			try {
				const data = await this.phaseRun(() =>
					mallApi.partnerCustomers({
						keyword: this.keyword,
						segment: this.segment,
						page: 1,
						pageSize: 50,
					}),
				);
				this.partnerClients = data.items || [];
			} catch (_) {}
		},
	},
};
</script>
