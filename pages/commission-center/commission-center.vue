<template>
	<view
		class="app-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell account-shell"
			><StatusBar /><TopBar
				title="我的收入"
				@back="back" /><scroll-view
				scroll-y
				class="shell-scroll-viewport account-scroll with-tab shell-scroll--with-bottom-nav"
				><view v-if="accountLoading" class="account-state"
					>正在加载佣金账本…</view
				><view v-else-if="accountError" class="account-state"
					><text>{{ accountError }}</text
					><button @tap="loadCommission">重新加载</button></view
				><template v-else-if="commissionData"
					><view class="account-hero"
						><text>累计佣金收入</text
						><MallPrice
							class="account-main"
							:value="commissionData.total"
							:precision="2"
							size="emphasis"
							tone="gold"
						/>
						<view
							><view
								><text>{{
									commissionData.customerCount || 0
								}}</text
								><text>直属客户</text></view
							><view
								><MallPrice
									:value="commissionData.pending"
									:precision="2"
									tone="gold"
								/><text>待结算</text></view
							><view
								><MallPrice
									:value="commissionData.available"
									:precision="2"
									tone="gold"
								/><text>可提现</text></view
							></view
						></view
					><text class="account-title">收入服务</text
					><view class="account-menu"
						><view @tap="go('invite')"
							><TeaIcon name="user-add" :size="22" /><text
								>邀请好友</text
							><text>一起品好茶　›</text></view
						><view @tap="go('partnerCustomers')"
							><TeaIcon name="users" :size="22" /><text
								>我的客户</text
							><text
								>{{
									commissionData.customerCount || 0
								}}
								人　›</text
							></view
						><view @tap="go('partnerCustomers')"
							><TeaIcon name="clipboard" :size="22" /><text
								>客户购买记录</text
							><text>先选择客户　›</text></view
						><view @tap="go('commissionDetails')"
							><TeaIcon name="wallet" :size="22" /><text
								>佣金与提现明细</text
							><text>›</text></view
						><view @tap="go('rewardDetail')"
							><TeaIcon name="coin" :size="22" /><text
								>佣金结算记录</text
							><text>›</text></view
						><view @tap="go('share')"
							><TeaIcon name="share" :size="22" /><text
								>分享方式</text
							><text>›</text></view
						></view
					><view class="account-section-head"
						><text>佣金规则</text><text>规则说明</text></view
					><CommissionRules />
					<view class="account-collection"
						><image
							:src="decorationImage('account.member')"
							mode="aspectFill"
						/><view
							><text>臻享会员礼序</text
							><text>专属茶师 · 稀缺配额 · 私享雅集</text></view
						></view
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
import TeaIcon from "@/components/TeaIcon.vue";
import CommissionRules from "@/components/CommissionRules.vue";
import mallPage from "@/shared/mall-page.js";
import phase from "@/shared/phase41-48.js";
export default {
	components: { StatusBar, TopBar, BottomNav, TeaIcon, CommissionRules },
	mixins: [mallPage, phase],
	onShow() {
		this.loadCommission();
	},
};
</script>
