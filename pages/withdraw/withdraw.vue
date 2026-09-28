<template>
	<view
		class="app-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell account-shell"
			><StatusBar /><TopBar title="申请提现" @back="back" /><scroll-view
				scroll-y
				class="shell-scroll-viewport account-scroll withdraw-scroll shell-scroll--with-action"
				><view v-if="accountLoading" class="account-state"
					>正在加载提现配置…</view
				><view v-else-if="accountError" class="account-state"
					><text>{{ accountError }}</text
					><button @tap="load">重新加载</button></view
				><template v-else-if="commissionDetail"
					><view class="account-hero"
						><text>可提现金额</text
						><MallPrice
							class="account-main"
							:value="commissionDetail.available"
							:precision="2"
							size="emphasis"
							tone="gold"
						/>
						<view
							><view
								><MallPrice
									:value="withdrawConfig.minAmount"
									:precision="2"
									tone="gold"
								/><text>最低提现</text></view
							><view
								><text>{{ withdrawConfig.arrivalDays }}</text
								><text>预计到账</text></view
							><view
								><text>{{
									String(withdrawConfig.accountTypes).split(
										",",
									)[0]
								}}</text
								><text>到账方式</text></view
							></view
						></view
					><view class="account-section-head"
						><text>提现记录</text><text>全部</text></view
					><view class="account-list"
						><view v-for="w in withdrawals.slice(0, 5)" :key="w.id"
							><TeaIcon name="wallet" :size="21" /><view
								><text>提现至{{ w.accountType }}</text
								><text>{{ w.createTime }}</text></view
							><view
								><text>-{{ accountMoney(w.amount) }}</text
								><text>{{ w.status }}</text></view
							></view
						><view v-if="!withdrawals.length" class="account-empty"
							>暂无提现记录</view
						></view
					><view class="withdraw-art"
						><image
							:src="decorationImage('account.member')"
							mode="aspectFill"
						/><view
							><text>PRIVATE COLLECTION</text
							><text>臻享会员礼序</text
							><text
								>本阶段仅完成申请、冻结、审核和线下确认，不执行真实资金转账。</text
							></view
						></view
					></template
				></scroll-view
			><button
				class="withdraw-fixed"
				:disabled="
					!commissionDetail ||
					Number(commissionDetail.available) <
						Number(withdrawConfig?.minAmount || 10)
				"
				@tap="panel = true"
			>
				申请提现</button
			><view v-if="panel" class="sheet-mask" @tap="panel = false"
				><view class="action-sheet withdraw-sheet" @tap.stop
					><view class="sheet-head"
						><view
							><text>申请提现</text
							><text>服务端按当前配置计算手续费</text></view
						><text @tap="panel = false">×</text></view
					><view class="withdraw-max"
						><text>本次最多可提现</text
						><MallPrice
							:value="commissionDetail.available"
							:precision="2"
							size="emphasis"
						/>
						</view
					><input
						v-model="amount"
						type="digit"
						placeholder="请输入提现金额"
					/><picker
						:range="accountTypes"
						@change="
							accountType = accountTypes[$event.detail.value]
						"
						><view class="withdraw-picker"
							>到账方式　{{ accountType }}　›</view
						></picker
					><input
						v-model="accountNo"
						maxlength="128"
						placeholder="请输入收款账户"
					/><text class="account-note"
						>手续费和到账金额由服务端重新计算；重复点击不会生成多笔申请。</text
					><button :disabled="accountSubmitting" @tap="submit">
						{{ accountSubmitting ? "正在提交…" : "确认提现" }}
					</button></view
				></view
			></view
		></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import mallPage from "@/shared/mall-page.js";
import phase from "@/shared/phase41-48.js";
import mallApi from "@/shared/mall-api.js";
export default {
	components: { StatusBar, TopBar, TeaIcon },
	mixins: [mallPage, phase],
	data() {
		return {
			panel: false,
			amount: "",
			accountNo: "",
			accountType: "微信",
			accountTypes: ["微信", "银行卡"],
			withdrawRequestNo: "",
		};
	},
	onShow() {
		this.load();
	},
	methods: {
		async load() {
			try {
				this.commissionDetail = await this.accountRun(() =>
					mallApi.commissionDetails(),
				);
				this.withdrawConfig = this.commissionDetail.config;
				this.withdrawals = this.commissionDetail.withdrawals || [];
				this.accountTypes = String(
					this.withdrawConfig.accountTypes || "微信,银行卡",
				).split(",");
				this.accountType = this.accountTypes[0];
			} catch (_) {}
		},
		async submit() {
			if (this.accountSubmitting) return;
			const n = Number(this.amount);
			if (
				!n ||
				n < Number(this.withdrawConfig.minAmount) ||
				n > Number(this.commissionDetail.available)
			)
				return this.accountToast("提现金额或余额不符合规则");
			if (this.accountNo.trim().length < 4)
				return this.accountToast("请填写有效收款账户");
			this.accountSubmitting = true;
			if (!this.withdrawRequestNo)
				this.withdrawRequestNo = this.requestNo("withdraw");
			try {
				await mallApi.createWithdrawal({
					requestNo: this.withdrawRequestNo,
					amount: n,
					accountType: this.accountType,
					accountNo: this.accountNo.trim(),
				});
				this.withdrawRequestNo = "";
				this.panel = false;
				this.amount = "";
				this.accountNo = "";
				this.accountToast("提现申请已提交审核");
				await this.load();
			} catch (e) {
				this.accountToast(e.message || "提现申请失败");
			} finally {
				this.accountSubmitting = false;
			}
		},
	},
};
</script>
