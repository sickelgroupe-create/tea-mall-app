<template>
	<view class="app-stage"
		><view class="phone-shell"
			><StatusBar /><TopBar title="茶友详情" @back="back" /><scroll-view
				scroll-y
				class="shell-scroll-viewport screen friend-detail-screen"
				><view v-if="loading" class="state">正在加载…</view
				><view v-else-if="errorText" class="state"
					><text>{{ errorText }}</text
					><button @tap="loadDetail">重新加载</button></view
				><template v-else-if="friend"
					><view class="profile-card"
						><view class="avatar"
							><TeaIcon name="user" :size="35" /></view
						><view
							><text>{{ friend.nickname }}</text
							><text
								>茶友编号：{{ friend.id }} ·
								{{
									friend.levelNo === 1
										? "一级茶友"
										: "二级茶友"
								}}</text
							><text>{{ friend.phone }}</text></view
						></view
					><text class="title">茶友数据</text
					><view class="metric-card"
						><view
							><MallPrice
								:value="friend.consumption"
								:precision="0"
								size="emphasis"
							/><text>累计消费</text></view
						><view
							><text>{{
								Number(friend.commission || 0).toFixed(2)
							}}</text
							><text>贡献收益</text></view
						><view
							><text>{{ friend.orderCount || 0 }}</text
							><text>订单数</text></view
						></view
					><view class="title-line"
						><text>交易记录</text
						><text
							@tap="
								go('teaFriendOrders', { friendId: friend.id })
							"
							>查看全部 ›</text
						></view
					><view class="mini-orders"
						><view
							v-for="order in recent"
							:key="order.orderNo"
							@tap="
								go('teaFriendOrders', { friendId: friend.id })
							"
							><view class="order-icon"
								><TeaIcon name="package" :size="18" /></view
							><view
								><text>{{ order.productName }}</text
								><text>{{
									dateOnly(order.createTime)
								}}</text></view
							><MallPrice
								:value="order.amount"
								:precision="0" /></view
						><view v-if="!recent.length" class="empty"
							>暂无真实购买记录</view
						></view
					><InvitationClub
						:decoration="
							decoration('invite.club')
						" /></template></scroll-view></view
	></view>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import InvitationClub from "@/components/InvitationClub.vue";
import mallPage from "@/shared/mall-page.js";
import mallApi from "@/shared/mall-api.js";
export default {
	components: { StatusBar, TopBar, TeaIcon, InvitationClub },
	mixins: [mallPage],
	data() {
		return { friend: null, loading: false, errorText: "" };
	},
	computed: {
		recent() {
			return (this.friend?.recentOrders || []).slice(0, 3);
		},
	},
	methods: {
		dateOnly(v) {
			return String(v || "").slice(0, 10);
		},
		async loadDetail() {
			const id = Number(this.pageQuery.friendId);
			if (!id) {
				this.errorText = "缺少茶友参数";
				return;
			}
			this.loading = true;
			this.errorText = "";
			try {
				this.friend = await mallApi.teaFriend(id);
			} catch (e) {
				if (!e.authenticationRequired) this.errorText = e.message;
			} finally {
				this.loading = false;
			}
		},
	},
	async onShow() {
		await this.loadDetail();
	},
};
</script>
<style scoped>
.friend-detail-screen {
	padding: 23.4rpx;
	box-sizing: border-box;
}
.profile-card {
	min-height: 167.4rpx;
	padding: 30.1rpx;
	display: flex;
	align-items: center;
	gap: 25.1rpx;
	border-radius: 21.8rpx;
	background: #075238;
	color: #fff;
}
.avatar {
	width: 103.8rpx;
	height: 103.8rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f6f1e7;
	color: #064d36;
}
.profile-card > view:last-child {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}
.profile-card > view:last-child text:first-child {
	font:
		600 31.8rpx SimSun,
		serif;
}
.profile-card > view:last-child text:not(:first-child) {
	font-size: 18.4rpx;
}
.title {
	display: block;
	margin: 23.4rpx 3.3rpx 13.4rpx;
	font:
		33.5rpx SimSun,
		serif;
}
.metric-card {
	min-height: 251.1rpx;
	border-radius: 21.8rpx;
	background: #064d36;
	color: #fff;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	align-items: start;
	padding-top: 63.6rpx;
}
.metric-card > view {
	text-align: center;
	border-right: 1px solid rgba(255, 255, 255, 0.22);
	display: flex;
	flex-direction: column;
	gap: 8.4rpx;
}
.metric-card > view:last-child {
	border: 0;
}
.metric-card text:first-child {
	color: #ffe88a;
	font: 600 31.8rpx Georgia;
}
.metric-card text:last-child {
	font-size: 16.7rpx;
}
.title-line {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 25.1rpx 3.3rpx 13.4rpx;
}
.title-line text:first-child {
	font:
		33.5rpx SimSun,
		serif;
}
.title-line text:last-child {
	color: #866f49;
	font-size: 18.4rpx;
}
.mini-orders {
	margin-bottom: 30.1rpx;
	border: 1px solid #eadfca;
	border-radius: 21.8rpx;
	background: #fff;
	overflow: hidden;
}
.mini-orders > view:not(.empty) {
	min-height: 123.9rpx;
	padding: 0 21.8rpx;
	display: grid;
	grid-template-columns: 67rpx 1fr auto;
	align-items: center;
	border-bottom: 1px solid #eee6d8;
}
.order-icon {
	width: 58.6rpx;
	height: 58.6rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #edf6f0;
}
.mini-orders > view > view:nth-child(2) {
	display: flex;
	flex-direction: column;
	gap: 8.4rpx;
}
.mini-orders > view > view:nth-child(2) text:first-child {
	font-weight: 600;
}
.mini-orders > view > view:nth-child(2) text:last-child {
	color: #888;
	font-size: 16.7rpx;
}
.mini-orders > view > text {
	color: #b55b22;
	font: 600 25.1rpx Georgia;
}
.empty,
.state {
	padding: 70.3rpx 26.8rpx;
	text-align: center;
	color: #888;
}
.state button {
	width: 217.6rpx;
	margin-top: 23.4rpx;
}
</style>
