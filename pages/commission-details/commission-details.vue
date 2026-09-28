<template>
	<view
		class="app-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell account-shell"
			><StatusBar /><TopBar title="佣金与提现明细" @back="back" /><view
				class="account-tabs"
				><text
					v-for="(t, i) in ['佣金明细', '提现记录', '结算规则']"
					:key="t"
					:class="{ active: detailTab === i }"
					@tap="detailTab = i"
					>{{ t }}</text
				></view
			><scroll-view scroll-y class="shell-scroll-viewport account-scroll account-detail-scroll"
				><view v-if="accountLoading" class="account-state"
					>正在核对佣金账本…</view
				><view v-else-if="accountError" class="account-state"
					><text>{{ accountError }}</text
					><button @tap="loadCommissionDetails">
						重新加载
					</button></view
				><template v-else-if="commissionDetail"
					><view class="account-hero"
						><text>收益总览</text
						><MallPrice
							class="account-main"
							:value="commissionDetail.total"
							:precision="2"
							size="emphasis"
							tone="gold"
						/>
						<view
							><view
								><MallPrice
									:value="commissionDetail.pending"
									:precision="2"
									tone="gold"
								/><text>待结算</text></view
							><view
								><MallPrice
									:value="commissionDetail.withdrawn"
									:precision="2"
									tone="gold"
								/><text>已提现</text></view
							><view
								><MallPrice
									:value="commissionDetail.available"
									:precision="2"
									tone="gold"
								/><text>可提现</text></view
							></view
						></view
					><template v-if="detailTab === 0"
						><view class="account-section-head"
							><text>佣金流水</text><text>全部时间</text></view
						><view class="account-list"
							><view
								v-for="c in commissionDetail.commissions"
								:key="c.id"
								><TeaIcon
									:name="c.levelNo === 1 ? 'user' : 'users'"
									:size="21"
								/><view
									><text>{{
										Number(c.levelNo) === 1
											? "直属佣金"
											: "历史佣金"
									}}</text
									><text>订单号 {{ c.orderNo }}</text></view
								><view
									><text
										:class="{
											negative: String(c.status).includes(
												'冲',
											),
										}"
										>{{
											String(c.status).includes("冲")
												? "-"
												: "+"
										}}{{ accountMoney(c.amount) }}</text
									><text>{{ c.status }}</text></view
								></view
							><view
								v-if="!commissionDetail.commissions.length"
								class="account-empty"
								>暂无佣金记录</view
							></view
						></template
					><template v-else-if="detailTab === 1"
						><view class="account-section-head"
							><text>提现记录</text
							><text>{{ withdrawals.length }} 笔</text></view
						><view class="account-list"
							><view v-for="w in withdrawals" :key="w.id"
								><TeaIcon name="wallet" :size="21" /><view
									><text
										>{{ w.accountType }}
										{{ w.accountNo }}</text
									><text>{{ w.createTime }}</text></view
								><view
									><text>-{{ accountMoney(w.amount) }}</text
									><text>{{ w.status }}</text></view
								></view
							><view
								v-if="!withdrawals.length"
								class="account-empty"
								>暂无提现记录</view
							></view
						></template
					><CommissionRules v-else />
					<button class="account-primary" @tap="go('withdraw')">
						申请提现</button
					><view class="account-dark-card"
						><text>臻享会员礼序</text
						><text
							>每笔佣金均关联真实订单、规则与客户，取消或退款会形成冲正记录。</text
						></view
					></template
				></scroll-view
			></view
		></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import CommissionRules from "@/components/CommissionRules.vue";
import mallPage from "@/shared/mall-page.js";
import phase from "@/shared/phase41-48.js";
export default {
	components: { StatusBar, TopBar, TeaIcon, CommissionRules },
	mixins: [mallPage, phase],
	data() {
		return { detailTab: 0 };
	},
	onShow() {
		this.loadCommissionDetails();
	},
};
</script>
