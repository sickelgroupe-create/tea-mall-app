<template>
	<view class="app-stage"
		><view class="phone-shell phase-points-shell"
			><StatusBar /><TopBar title="积分明细" @back="back" />
			<view class="phase-tabs"
				><text
					v-for="(tab, i) in ['全部', '获取', '使用']"
					:key="tab"
					:class="{ active: pointsTab === i }"
					@tap="pointsTab = i"
					>{{ tab }}</text
				></view
			>
			<scroll-view scroll-y class="shell-scroll-viewport screen phase-points-scroll"
				><view v-if="pointsDomainError" class="phase-state"
					><text>{{ pointsDomainError }}</text
					><button @tap="loadPointsDomain">重新加载</button></view
				>
				<view class="invitation-ledger-link">
 <text>购物积分与邀请奖励分别记账</text>
 <text v-if="friendLoading">正在加载邀请奖励…</text>
 <view v-else-if="friendError"><text>邀请奖励加载失败</text><button @tap="loadFriendCenter">重新加载</button></view>
 <text v-else-if="friendData">可用{{ inviteScoreLabel }}：{{ score(friendData.balance) }}</text>
 <text v-if="friendData && !friendError && Number(friendData.debt) > 0">待补扣{{ inviteScoreLabel }}：{{ score(friendData.debt) }}</text>
 <button @tap="go('inviteRewards', { tab: 'ledger' })">查看邀请奖励明细 ›</button>
 </view>
				<view v-if="!pointsDomainError" class="phase-list-card phase-ledger"
					><view
						v-for="log in filteredPointLogs"
						:key="log.id"
						class="phase-log-row"
						><view class="phase-round-icon"
							><TeaIcon :name="log.icon" :size="19" /></view
						><view class="phase-grow"
							><text>{{ log.title }}</text
							><text>{{ log.date || log.createTime }}</text
							><text>{{ log.desc }}</text></view
						><view class="phase-log-value"
							><text :class="{ minus: Number(log.amount) < 0 }"
								>{{ Number(log.amount) > 0 ? "+" : ""
								}}{{ log.amount }}</text
							><text>余额 {{ log.balance }}</text></view
						></view
					><view
						v-if="!filteredPointLogs.length"
						class="phase-empty-line"
						>暂无符合条件的积分流水</view
					></view
				><PointsCollection
					:decoration="decoration('points.promo')"
					tone="photo" /></scroll-view
			><view v-if="toastText" class="toast">{{ toastText }}</view></view
		></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import PointsCollection from "@/components/PointsCollection.vue";
import mallPage from "@/shared/mall-page.js";
import teaFriends from "@/shared/tea-friends.js";
export default {
	components: { StatusBar, TopBar, TeaIcon, PointsCollection },
	mixins: [mallPage, teaFriends],
	onShow() {
		this.loadPointsDomain();
	},
};
</script>

<style scoped>
.invitation-ledger-link > text { display: block; margin-bottom: 12rpx; }
.invitation-ledger-link button { font-size: 25rpx; color: #174b34; background: #fff; }
.invitation-ledger-link { padding: 22rpx; margin-bottom: 20rpx; color: #174b34; background: #edf5f0; border-radius: 18rpx; font-size: 25rpx; line-height: 1.6; }
</style>
