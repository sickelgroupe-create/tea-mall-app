<template>
	<view
		class="app-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell partner-shell"
			><StatusBar /><TopBar
				title="合伙人工作台"
				@back="back" /><scroll-view
				scroll-y
				class="shell-scroll-viewport partner-scroll with-tab shell-scroll--with-bottom-nav"
				><view v-if="phaseLoading" class="phase-message"
					>正在汇总真实业绩…</view
				><view v-else-if="phaseError" class="phase-message"
					>{{ phaseError }}<button @tap="load">重新加载</button></view
				><template v-else
					><view class="partner-metric-hero"
						><text class="partner-metric-label">累计销售额</text
						><MallPrice
							class="partner-metric-main"
							:value="partnerMetrics.salesAmount"
							:precision="2"
							size="emphasis"
							tone="inverse"
						/>
						<view class="partner-metric-grid"
							><view
								><text class="partner-metric-value">{{
									partnerMetrics.customerCount || 0
								}}</text
								><text>客户数量</text></view
							><view
								><text class="partner-metric-value">{{
									partnerMetrics.activeCustomerCount || 0
								}}</text
								><text>有效客户</text></view
							><view
								><text class="partner-metric-value">{{
									partnerMetrics.orderCount || 0
								}}</text
								><text>有效订单</text></view
							><view
								><text class="partner-metric-value">{{
									partnerMetrics.newCustomerCount || 0
								}}</text
								><text>今日新增</text></view
							></view
						></view
					><view class="partner-links"
						><view
							class="partner-link"
							@tap="go('partnerCustomers')"
							><text>茶</text><text>我的客户</text></view
						><view
							class="partner-link"
							@tap="
								go('teaSales', { slug: 'yesterday-tea-visit' })
							"
							><text>文</text><text>销售内容</text></view
						><view class="partner-link" @tap="go('community')"
							><text>友</text><text>留言板</text></view
						></view
					><view class="partner-card"
						><text class="partner-section-title">收益概览</text
						><view
							class="partner-metric-grid"
							style="background: #ece5d9"
							><view style="background: #fff"
								><MallPrice
									class="partner-number partner-metric-value"
									:value="partnerMetrics.pendingIncome"
									:precision="2"
								/><text>待结算</text></view
							><view style="background: #fff"
								><MallPrice
									class="partner-number partner-metric-value"
									:value="partnerMetrics.settledIncome"
									:precision="2"
								/><text>已结算</text></view
							></view
						></view
					><view class="partner-card"
						><text>今日有效订单</text
						><text
							class="partner-number"
							style="
								display: block;
								font-size: 44rpx;
								margin: 14rpx 0;
							"
							>{{ partnerMetrics.today?.orderCount || 0 }}</text
						><view class="partner-inline-money"
							><text>今日销售</text
							><MallPrice
								:value="partnerMetrics.today?.salesAmount"
								:precision="2" /></view></view
					><view class="partner-collection"
						><image
							:src="decorationImage('partner.intro')"
							mode="aspectFill"
						/><text>与好茶一起成长</text></view
					></template
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
	onShow() {
		this.load();
	},
	methods: {
		async load() {
			try {
				this.partnerMetrics = await this.phaseRun(() =>
					mallApi.partnerWorkbench(),
				);
			} catch (_) {}
		},
	},
};
</script>
