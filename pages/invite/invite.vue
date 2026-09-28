<template>
	<view class="app-stage"
		><view class="phone-shell">
			<StatusBar /><TopBar title="我的茶友们" @back="back" />
			<scroll-view scroll-y class="shell-scroll-viewport shell-scroll--flow-bottom-nav tf-scroll"
				><view class="tf-content">
					<view v-if="friendError" class="tf-state"
						><text>{{ friendError }}</text
						><button @tap="loadFriendCenter">重新加载</button></view
					>
					<view v-else-if="!friendData" class="tf-state"
						>正在加载茶友数据…</view
					>
					<template v-else>
						<view class="tf-summary">
							<view class="tf-stat-lines">
								<view
									><text>已邀请好友</text
									><text
										>{{ friendData.invitedCount }} 人</text
									></view
								>
								<view
									><text>注册成功</text
									><text
										>{{
											friendData.registeredCount
										}}
										人</text
									></view
								>
								<view
									><text>获得{{ inviteScoreLabel }}</text
									><text class="tf-gold">{{
										score(friendData.earned)
									}}</text></view
								>
							</view>
							<button
								class="tf-redeem"
								@tap="go('inviteRewards')"
							>
								去兑换<text>›</text>
							</button>
						</view>
						<text class="tf-note"
							>邀请人数以已绑定的直属好友统计；有效好友
							{{ friendData.qualifiedCount }} 人。</text
						>
						<view class="tf-invite-card">
							<view
								><text>{{ friendData.rule.inviteCardTitle }}</text
								><text class="tf-rule-number"
									>{{ friendData.rule.rewardPrefix }}
									{{
										score(friendData.rule.pointsPerFriend)
									}}
									{{ friendData.rule.scoreUnitLabel }}</text
								></view
							>
							<button class="tf-primary" @tap="go('share')">
								{{ friendData.rule.inviteButtonText }}
							</button>
						</view>
						<text v-if="friendData.rule.trialGiftCount === 0" class="tf-note">试喝礼包暂未配置，当前新订单暂不产生{{ inviteScoreLabel }}，请等待商城配置。</text>
						<text v-if="friendData.rule.effectiveDescription" class="tf-note">{{ friendData.rule.effectiveDescription }}</text>
						<view class="tf-shortcuts">
							<button @tap="go('inviteRecords')">
								<TeaIcon name="users" :size="22" /><text
									>我的茶友</text
								>
							</button>
							<button
								@tap="go('inviteRewards', { tab: 'ledger' })"
							>
								<TeaIcon name="clipboard" :size="22" /><text
									>{{ inviteScoreLabel }}明细</text
								>
							</button>
						</view>
						<MonthlyRewards :refresh-key="friendData" />
						<view class="tf-ranking-head"
								><text>累计邀请榜</text
							><text>按有效茶友人数排名</text></view
						>
						<view class="tf-rank-tabs"
							><button
								:class="{ selected: !nearby }"
								@tap="nearby = false"
							>
								全国前50名</button
							><button
								:class="{ selected: nearby }"
								@tap="nearby = true"
							>
								我的附近排名
							</button></view
						>
						<view v-if="!nearby && podium.length" class="tf-podium">
							<view
								v-for="row in podium"
								:key="row.rank"
								:class="['tf-podium-item', 'place-' + row.rank]"
							>
								<view class="tf-avatar"
									><image
										v-if="row.avatarUrl"
										:src="row.avatarUrl"
										mode="aspectFill" /><TeaIcon
										v-else
										name="user"
										:size="24"
								/></view>
								<text class="tf-rank-name">{{
									row.nickname
								}}</text
								><text class="tf-position"
									>第 {{ row.rank }} 名</text
								><text>{{ row.qualifiedCount }} 位茶友</text>
							</view>
						</view>
						<view class="tf-rank-list">
							<view
								v-for="row in rankingRows"
								:key="row.rank"
								:class="['tf-rank-row', { self: row.self }]"
							>
								<text>{{ row.rank }}</text
								><view class="tf-avatar"
									><image
										v-if="row.avatarUrl"
										:src="row.avatarUrl"
										mode="aspectFill" /><TeaIcon
										v-else
										name="user"
										:size="20" /></view
								><text
									>{{ row.nickname
									}}{{ row.self ? "（我）" : "" }}</text
								><text>{{ row.qualifiedCount }} 人</text>
							</view>
							<view
								v-if="
									!rankingRows.length &&
									(nearby || !podium.length)
								"
								class="tf-state"
								>{{
									nearby
										? "满足邀请门槛后即可参与排名"
										: "暂无有效邀请排名"
								}}</view
							>
						</view>
						<view class="tf-rules"
							><text>邀请说明</text
							><text
								>好友注册成功并购买试喝礼包后计入，每位好友仅计一次。{{ inviteScoreLabel }}用于茶友专属兑换，与购物积分分开。</text
							><text
								>礼包退款导致资格失效时撤回对应{{ inviteScoreLabel }}；不足部分记为待补扣。</text
							><text v-if="Number(friendData.debt) > 0"
								>当前待补扣：{{
									score(friendData.debt)
								}}
								{{ inviteScoreLabel }}</text
							></view
						>
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
import MonthlyRewards from "@/components/MonthlyRewards.vue";
export default {
	components: { StatusBar, TopBar, BottomNav, TeaIcon, MonthlyRewards },
	mixins: [mallPage, teaFriends],
	data() {
		return { nearby: false };
	},
	computed: {
		podium() {
			const top = this.friendData?.ranking?.top || [];
			return [top[1], top[0], top[2]].filter(Boolean);
		},
		rankingRows() {
			return this.nearby
				? this.friendData?.ranking?.nearby || []
				: (this.friendData?.ranking?.top || []).slice(3);
		},
	},
};
</script>
<style scoped>
.tf-scroll {
	flex: 1 1 0%;
	height: 0;
	min-height: 0;
	box-sizing: border-box;
}
.tf-content {
	padding: 24rpx 24rpx 32rpx;
}
.tf-summary {
	display: flex;
	align-items: stretch;
	gap: 24rpx;
	padding: 28rpx;
	border-radius: 24rpx;
	background: var(--color-primary, #07543e);
	color: #fff;
}
.tf-stat-lines {
	flex: 1;
	min-width: 0;
}
.tf-stat-lines > view {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12rpx;
	padding: 16rpx 0;
	border-bottom: 1px solid rgba(240, 216, 132, 0.35);
	font-size: 27rpx;
}
.tf-stat-lines > view:last-child {
	border: 0;
}
.tf-gold {
	color: #f0d884;
	font-size: 38rpx;
	font-variant-numeric: tabular-nums;
}
.tf-redeem {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	width: 120rpx;
	flex-shrink: 0;
	margin: 0;
	padding: 16rpx;
	background: #f2ead5;
	color: #175340;
	font-size: 28rpx;
	line-height: 1.5;
	border-radius: 16rpx;
}
.tf-redeem > text {
	font-size: 40rpx;
}
.tf-note {
	display: block;
	margin: 14rpx 4rpx 24rpx;
	font-size: 22rpx;
	line-height: 1.6;
	color: #777;
}
.tf-invite-card {
	display: flex;
	align-items: center;
	gap: 18rpx;
	padding: 26rpx;
	background: #fff;
	border: 1px solid #e6dfd0;
	border-radius: 20rpx;
}
.tf-invite-card > view {
	word-break: break-word;
	display: flex;
	flex: 1;
	min-width: 0;
	flex-direction: column;
	gap: 12rpx;
	font-size: 24rpx;
	text-align: center;
}
.tf-rule-number {
	color: #a58a46;
	font-size: 28rpx;
	font-weight: 600;
}
.tf-primary {
	flex-shrink: 0;
	white-space: normal;
	word-break: break-word;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 86rpx;
	width: 164rpx;
	margin: 0;
	padding: 12rpx;
	background: var(--color-primary, #07543e);
	color: #fff;
	font-size: 26rpx;
	line-height: 1.5;
	border-radius: 14rpx;
}
.tf-shortcuts {
	display: flex;
	gap: 18rpx;
	margin: 20rpx 0;
}
.tf-shortcuts > button {
	display: flex;
	flex: 1;
	min-width: 0;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	min-height: 100rpx;
	margin: 0;
	padding: 16rpx;
	border: 1px solid #e6dfd0;
	border-radius: 18rpx;
	background: #fff;
	font-size: 26rpx;
	color: #23533e;
	line-height: 1.4;
}
.tf-monthly {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
	padding: 24rpx;
	text-align: center;
	background: #f1ecde;
	border-radius: 18rpx;
	font-size: 26rpx;
}
.tf-ranking-head {
	text-align: center;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	margin: 32rpx 0 20rpx;
}
.tf-ranking-head > text:first-child {
	font-size: 34rpx;
	font-weight: 600;
	color: #23533e;
}
.tf-ranking-head > text:last-child {
	font-size: 22rpx;
	color: #888;
}
.tf-rank-tabs {
	display: flex;
	gap: 16rpx;
	margin-bottom: 24rpx;
}
.tf-rank-tabs > button {
	flex: 1;
	margin: 0;
	padding: 16rpx 8rpx;
	line-height: 1.4;
	font-size: 24rpx;
	background: #eeede7;
	color: #666;
	border-radius: 12rpx;
}
.tf-rank-tabs > button.selected {
	background: #e5eee7;
	color: #14543e;
}
.tf-podium {
	display: flex;
	align-items: flex-end;
	gap: 14rpx;
	margin-bottom: 20rpx;
}
.tf-podium-item {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	padding: 24rpx 8rpx;
	border-radius: 22rpx 22rpx 12rpx 12rpx;
	background: #e7ede5;
	text-align: center;
	font-size: 22rpx;
	color: #295642;
}
.tf-podium-item.place-1 {
	padding-top: 42rpx;
	padding-bottom: 34rpx;
	background: #efe5c9;
}
.tf-rank-name {
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 25rpx;
}
.tf-position {
	font-size: 28rpx;
	font-weight: 600;
}
.tf-avatar {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff;
	flex-shrink: 0;
}
.tf-avatar image {
	width: 100%;
	height: 100%;
}
.tf-rank-list {
	background: #fff;
	border-radius: 20rpx;
	overflow: hidden;
}
.tf-rank-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 22rpx 20rpx;
	border-bottom: 1px solid #eee9df;
	font-size: 25rpx;
}
.tf-rank-row > text:first-child {
	width: 36rpx;
	text-align: center;
	color: #9b854d;
}
.tf-rank-row > text:nth-last-child(2) {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.tf-rank-row.self {
	background: #eaf1e9;
}
.tf-rules {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
	margin-top: 24rpx;
	padding: 24rpx;
	background: #f2eee3;
	border-radius: 18rpx;
	color: #777;
	font-size: 23rpx;
	line-height: 1.7;
}
.tf-rules > text:first-child {
	font-size: 28rpx;
	color: #254e3b;
	text-align: center;
}
.tf-state {
	padding: 44rpx 20rpx;
	text-align: center;
	color: #888;
	font-size: 25rpx;
	line-height: 1.7;
}
.tf-state button {
	margin-top: 20rpx;
}
</style>
