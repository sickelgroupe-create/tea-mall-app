<template>
	<view class="app-stage"
		><view class="phone-shell">
			<StatusBar /><TopBar :title="tab === 'ledger' ? inviteScoreLabel + '明细' : '茶友专属兑换'" @back="back" />
			<scroll-view
				scroll-y
				class="shell-scroll-viewport shell-scroll--flow-bottom-nav tf-exchange-scroll"
				><view class="tf-exchange-content">
					<view v-if="friendError" class="tf-state"
						><text>{{ friendError }}</text
						><button @tap="loadFriendCenter">重新加载</button></view
					>
					<view v-else-if="!friendData" class="tf-state"
						>正在加载…</view
					>
					<template v-else>
						<view class="tf-balance"
							><text>可用{{ inviteScoreLabel }}</text
							><text>{{ score(friendData.balance) }}</text
							><text>专属茶友礼遇 · 与购物积分分开</text
							><text v-if="Number(friendData.debt) > 0"
								>待补扣
								{{ score(friendData.debt) }} {{ inviteScoreLabel }}</text
							></view
						>
						<view class="tf-tabs"
							><button
								v-for="item in tabs"
								:key="item.key"
								:class="{ active: tab === item.key }"
								@tap="tab = item.key"
							>
								{{ item.label }}
							</button></view
						>
						<template v-if="tab === 'rewards'">
							<view class="tf-address" @tap="go('addresses')"
								><TeaIcon name="location" :size="22" /><view
									><text>收货地址</text
									><text>{{
										selectedAddress
											? selectedAddress.name +
												" " +
												selectedAddress.phone
											: "请先添加收货地址"
									}}</text></view
								><text>›</text></view
							>
							<picker
								v-if="addresses.length"
								:range="addressLabels"
								:value="addressIndex"
								@change="
									addressIndex = Number($event.detail.value)
								"
								><view class="tf-address-choice"
									>选择：{{
										addressLabels[addressIndex]
									}}
									›</view
								></picker
							>
							<view class="tf-gifts">
								<view
									v-for="reward in friendData.rewards"
									:key="reward.id"
									class="tf-gift"
								>
									<image
										:src="imageFor(reward.imageKey)"
										mode="aspectFill"
										@error="imageFailures[reward.id] = true"
									/><text
										v-if="imageFailures[reward.id]"
										class="tf-image-error"
										>图片暂未加载</text
									>
									<text class="tf-gift-name">{{
										reward.name
									}}</text
									><text class="tf-gift-cost"
										>{{
											score(reward.inviteCost)
										}}
										{{ inviteScoreLabel }}</text
									><text class="tf-stock"
										>库存 {{ reward.stock }} 件</text
									>
									<button
										:disabled="
											busy ||
											Number(reward.stock) < 1 ||
											Number(friendData.balance) <
												Number(reward.inviteCost)
										"
										@tap="redeem(reward)"
									>
										立即兑换
									</button>
								</view>
							</view>
							<view
								v-if="!friendData.rewards.length"
								class="tf-state"
								>暂无可兑换奖品</view
							>
							<view class="tf-rule"
								>每次兑换一件，可多次兑换。大额或频繁兑换且好友购买比例不足30%时需审核；规则未配置时统一审核，未通过会退回{{ inviteScoreLabel }}和库存。</view
							>
						</template>
						<template v-else-if="tab === 'records'">
							<view
								v-for="row in friendData.exchanges"
								:key="row.id"
								class="tf-record"
							>
								<view class="tf-record-title"
									><text>{{ row.name }} × {{ row.qty }}</text
									><text>{{ row.status }}</text></view
								>
								<text>{{ row.exchangeNo }}</text
								><text>使用 {{ score(row.cost) }} {{ inviteScoreLabel }}</text
								><text v-if="row.reviewReason">{{
									row.reviewReason
								}}</text
								><text v-if="row.trackingNo"
									>{{ row.carrier }}：{{
										row.trackingNo
									}}</text
								>
								<view class="tf-record-actions"
									><button
										v-if="
											[
												'待审核',
												'待处理',
												'待发货',
											].includes(row.status)
										"
										:disabled="busy"
										@tap="cancel(row)"
									>
										取消兑换</button
									><button
										v-if="
											['配送中', '待收货'].includes(
												row.status,
											)
										"
										:disabled="busy"
										@tap="receive(row)"
									>
										确认收货
									</button></view
								>
							</view>
							<view
								v-if="!friendData.exchanges.length"
								class="tf-state"
								>暂无兑换记录</view
							>
							<button
								v-if="
									friendData.exchanges.length <
									friendData.exchangesTotal
								"
								class="tf-load-more"
								:loading="historyBusy"
								@tap="moreHistory('exchanges')"
							>
								加载更多兑换记录
							</button>
						</template>
						<template v-else>
							<view
								v-for="row in friendData.ledger"
								:key="row.id"
								class="tf-ledger"
								><view
									><text>{{ row.description }}</text
									><text>{{
										date(row.createTime)
									}}</text></view
								><text
									:class="{
										negative: Number(row.amount) < 0,
									}"
									>{{ Number(row.amount) > 0 ? "+" : ""
									}}{{ score(row.amount) }}</text
								></view
							>
							<view
								v-if="!friendData.ledger.length"
								class="tf-state"
								>暂无{{ inviteScoreLabel }}记录</view
							>
							<button
								v-if="
									friendData.ledger.length <
									friendData.ledgerTotal
								"
								class="tf-load-more"
								:loading="historyBusy"
								@tap="moreHistory('ledger')"
							>
								加载更多{{ inviteScoreLabel }}记录
							</button>
						</template>
					</template>
				</view></scroll-view
			><BottomNav active="invite" @select="nav" /> </view
	></view>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import BottomNav from "@/components/BottomNav.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import mallPage from "@/shared/mall-page.js";
import teaFriends from "@/shared/tea-friends.js";
import mallApi from "@/shared/mall-api.js";
export default {
	components: { StatusBar, TopBar, BottomNav, TeaIcon },
	mixins: [mallPage, teaFriends],
	data() {
		return {
			tab: "rewards",
			busy: false,
			addressIndex: 0,
			pendingRequest: null,
			imageFailures: {},
		};
	},
	onLoad(query) {
		if (["records", "ledger"].includes(query?.tab)) this.tab = query.tab;
	},
	computed: {
		tabs() { return [{key:"rewards",label:"兑换奖品"},{key:"records",label:"兑换记录"},{key:"ledger",label:this.inviteScoreLabel+"明细"}]; },
		addressLabels() {
			return this.addresses.map(
				(a) => a.name + " " + a.phone + " " + a.line1 + " " + a.line2,
			);
		},
		selectedAddress() {
			return this.addresses[this.addressIndex] || null;
		},
	},
	methods: {
		date(value) {
			return String(value || "")
				.replace("T", " ")
				.slice(0, 19);
		},
		ask(title, content) {
			return new Promise((resolve) =>
				uni.showModal({
					title,
					content,
					confirmText: "确认",
					cancelText: "再想想",
					success: (r) => resolve(r.confirm),
					fail: () => resolve(false),
				}),
			);
		},
		async redeem(reward) {
			if (this.busy) return;
			if (!this.selectedAddress) {
				this.go("addresses");
				return;
			}
			if (
				!(await this.ask(
					"确认兑换",
					reward.name +
						" × 1，将扣除 " +
						this.score(reward.inviteCost) +
						" " + this.inviteScoreLabel + "。",
				))
			)
				return;
			this.busy = true;
			const payload = {
				rewardId: reward.id,
				addressId: this.selectedAddress.id,
				qty: 1,
			};
			if (
				!this.pendingRequest ||
				this.pendingRequest.rewardId !== payload.rewardId ||
				this.pendingRequest.addressId !== payload.addressId
			)
				this.pendingRequest = {
					...payload,
					requestNo: mallApi.createRequestId(),
				};
			try {
				const result = await mallApi.exchangeTeaFriendReward(
					this.pendingRequest,
				);
				this.pendingRequest = null;
				this.tab = "records";
				await this.loadFriendCenter();
				uni.showToast({
					title:
						result.status === "待审核"
							? "兑换已提交审核"
							: "兑换成功",
					icon: "none",
				});
			} catch (e) {
				uni.showToast({
					title: e.message || "兑换失败，请重试",
					icon: "none",
				});
			} finally {
				this.busy = false;
			}
		},
		async cancel(row) {
			if (!(await this.ask("取消兑换", "取消后将退回" + this.inviteScoreLabel + "，是否继续？")))
				return;
			this.busy = true;
			try {
				await mallApi.cancelExchange(row.exchangeNo);
				await this.loadFriendCenter();
			} catch (e) {
				uni.showToast({ title: e.message, icon: "none" });
			} finally {
				this.busy = false;
			}
		},
		async receive(row) {
			if (!(await this.ask("确认收货", "请确认已收到兑换礼品。"))) return;
			this.busy = true;
			try {
				await mallApi.confirmExchangeReceipt(row.exchangeNo);
				await this.loadFriendCenter();
			} catch (e) {
				uni.showToast({ title: e.message, icon: "none" });
			} finally {
				this.busy = false;
			}
		},
	},
};
</script>
<style scoped>
.tf-load-more {
	margin: 20rpx auto;
	padding: 18rpx;
	text-align: center;
	background: #fff;
	color: #285a40;
	font-size: 26rpx;
	line-height: 1.5;
}
.tf-exchange-scroll {
	flex: 1 1 0%;
	height: 0;
	min-height: 0;
}
.tf-exchange-content {
	padding: 24rpx 24rpx 32rpx;
}
.tf-balance {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
	padding: 34rpx 22rpx;
	border-radius: 24rpx;
	background: var(--color-primary, #07543e);
	color: #fff;
	text-align: center;
	font-size: 25rpx;
}
.tf-balance > text:nth-child(2) {
	font-size: 68rpx;
	color: #f0d884;
	font-variant-numeric: tabular-nums;
}
.tf-balance > text:nth-child(3) {
	font-size: 22rpx;
	opacity: 0.8;
}
.tf-tabs {
	display: flex;
	gap: 12rpx;
	margin: 24rpx 0;
}
.tf-tabs button {
	flex: 1;
	min-width: 0;
	margin: 0;
	padding: 20rpx 6rpx;
	font-size: 24rpx;
	line-height: 1.4;
	background: #eeece5;
	color: #666;
	border-radius: 14rpx;
}
.tf-tabs button.active {
	background: #e0ebe2;
	color: #12533e;
}
.tf-address {
	display: flex;
	align-items: center;
	gap: 18rpx;
	padding: 24rpx;
	background: #fff;
	border-radius: 18rpx;
	font-size: 26rpx;
}
.tf-address > view {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}
.tf-address > view > text:last-child {
	font-size: 23rpx;
	color: #777;
}
.tf-address-choice {
	padding: 18rpx 6rpx;
	font-size: 23rpx;
	line-height: 1.5;
	color: #53735c;
}
.tf-gifts {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 18rpx;
	margin-top: 20rpx;
}
.tf-gift {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
	padding: 16rpx;
	background: #fff;
	border: 1px solid #e6dfcf;
	border-radius: 20rpx;
	min-width: 0;
	text-align: center;
}
.tf-gift > image {
	width: 100%;
	height: 240rpx;
	border-radius: 14rpx;
}
.tf-gift-name {
	font-size: 27rpx;
	line-height: 1.5;
	overflow-wrap: anywhere;
}
.tf-gift-cost {
	color: #a38948;
	font-size: 27rpx;
}
.tf-stock {
	color: #888;
	font-size: 22rpx;
}
.tf-gift > button {
	width: 100%;
	margin: 0;
	margin-top: auto;
	padding: 18rpx 8rpx;
	line-height: 1.4;
	border-radius: 12rpx;
	background: var(--color-primary, #07543e);
	color: #fff;
	font-size: 25rpx;
}
.tf-gift > button[disabled] {
	background: #e4e6e1;
	color: #999;
}
.tf-state {
	padding: 44rpx 20rpx;
	text-align: center;
	color: #888;
	font-size: 25rpx;
	line-height: 1.7;
}
.tf-rule {
	margin-top: 24rpx;
	color: #888;
	font-size: 22rpx;
	line-height: 1.7;
}
.tf-record {
	display: flex;
	flex-direction: column;
	gap: 14rpx;
	background: #fff;
	border-radius: 18rpx;
	margin-bottom: 18rpx;
	padding: 24rpx;
	font-size: 24rpx;
	color: #777;
	overflow-wrap: anywhere;
}
.tf-record-title {
	display: flex;
	justify-content: space-between;
	gap: 18rpx;
	color: #23563d;
	font-size: 27rpx;
}
.tf-record-actions {
	display: flex;
	justify-content: flex-end;
	gap: 12rpx;
}
.tf-record-actions > button {
	margin: 0;
	padding: 14rpx 24rpx;
	line-height: 1.4;
	font-size: 24rpx;
	color: #24533d;
	border: 1px solid #b8c9b9;
	border-radius: 12rpx;
	background: #fff;
}
.tf-ledger {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 24rpx 18rpx;
	background: #fff;
	border-bottom: 1px solid #eee9e0;
	font-size: 26rpx;
}
.tf-ledger > view {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}
.tf-ledger > view > text:last-child {
	font-size: 22rpx;
	color: #999;
}
.tf-ledger > text {
	color: #a38844;
	flex-shrink: 0;
}
.tf-ledger > text.negative {
	color: #777;
}
.tf-image-error {
	font-size: 22rpx;
	color: #99794b;
}
</style>
