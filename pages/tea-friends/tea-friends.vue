<template>
	<view class="app-stage"
		><view class="phone-shell"
			><StatusBar /><TopBar title="我的茶友" @back="back" /><view
				class="friend-tabs"
				><text
					v-for="(tab, i) in tabs"
					:key="tab"
					:class="{ active: tabIndex === i }"
					@tap="tabIndex = i"
					>{{ tab }}</text
				></view
			><scroll-view scroll-y class="shell-scroll-viewport screen friend-list-screen shell-scroll--with-bottom-nav"
				><view v-if="loading" class="state">正在加载…</view
				><view v-else-if="errorText" class="state"
					><text>{{ errorText }}</text
					><button @tap="loadFriends">重新加载</button></view
				><template v-else
					><view class="friend-list"
						><view
							v-for="(friend, i) in filteredFriends"
							:key="friend.id"
							class="friend-row"
							@tap="
								go('teaFriendDetail', { friendId: friend.id })
							"
							><view class="avatar" :class="{ gold: i % 2 }"
								><TeaIcon name="user" :size="22" /></view
							><view
								><text>{{ friend.nickname }}</text
								><text
									>注册时间：{{
										dateOnly(friend.registerTime)
									}}</text
								></view
							><view
								><MallPrice
									:value="friend.consumption"
									:precision="0"
								/><text>{{
									Number(friend.orderCount) > 0
										? "已消费"
										: "待消费"
								}}</text></view
							></view
						><view v-if="!filteredFriends.length" class="state"
							>暂无{{
								tabs[tabIndex]
							}}，邀请好友注册后会显示在这里</view
						></view
					><InvitationClub
						:decoration="
							decoration('invite.club')
						" /></template></scroll-view
			><BottomNav
				active="mine"
				:cart-count="cartCount"
				@select="nav"
			/><view v-if="toastText" class="toast">{{ toastText }}</view></view
		></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import BottomNav from "@/components/BottomNav.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import InvitationClub from "@/components/InvitationClub.vue";
import mallPage from "@/shared/mall-page.js";
import mallApi from "@/shared/mall-api.js";
export default {
	components: { StatusBar, TopBar, BottomNav, TeaIcon, InvitationClub },
	mixins: [mallPage],
	data() {
		return {
			tabs: ["全部", "一级茶友", "二级茶友"],
			tabIndex: 0,
			friends: [],
			loading: false,
			errorText: "",
		};
	},
	computed: {
		filteredFriends() {
			return this.tabIndex === 0
				? this.friends
				: this.friends.filter(
						(item) => Number(item.levelNo) === this.tabIndex,
					);
		},
	},
	async onShow() {
		await this.loadFriends();
	},
	methods: {
		dateOnly(v) {
			return String(v || "").slice(0, 10);
		},
		async loadFriends() {
			this.loading = true;
			this.errorText = "";
			try {
				this.friends = await mallApi.teaFriends();
			} catch (e) {
				if (!e.authenticationRequired) this.errorText = e.message;
			} finally {
				this.loading = false;
			}
		},
	},
};
</script>
<style scoped>
.friend-tabs {
	height: 78.7rpx;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	border-bottom: 1px solid #e6dfd2;
	background: #fff;
}
.friend-tabs text {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 23.4rpx;
}
.friend-tabs .active {
	color: #064d36;
	font-weight: 600;
	position: relative;
}
.friend-tabs .active:after {
	content: "";
	position: absolute;
	bottom: 0;
	width: 90.4rpx;
	height: 3.3rpx;
	background: #064d36;
}
.friend-list-screen {
	padding: 23.4rpx;
	box-sizing: border-box;
}
.friend-list {
	margin-bottom: 30.1rpx;
	border: 1px solid #eadfca;
	border-radius: 21.8rpx;
	overflow: hidden;
	background: #fff;
}
.friend-row {
	display: grid;
	grid-template-columns: 80.4rpx 1fr auto;
	align-items: center;
	min-height: 122.2rpx;
	padding: 0 21.8rpx;
	border-bottom: 1px solid #eee6d8;
}
.friend-row:last-child {
	border: 0;
}
.avatar {
	width: 63.6rpx;
	height: 63.6rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #edf6f0;
	color: #064d36;
}
.avatar.gold {
	background: #f8efdf;
	color: #a86920;
}
.friend-row > view:nth-child(2) {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}
.friend-row > view:nth-child(2) text:first-child {
	font-weight: 600;
}
.friend-row > view:nth-child(2) text:last-child {
	font-size: 16.7rpx;
	color: #888;
}
.friend-row > view:last-child {
	text-align: right;
	display: flex;
	flex-direction: column;
	gap: 8.4rpx;
}
.friend-row > view:last-child text:first-child {
	font: 600 25.1rpx Georgia;
	color: #b55b22;
}
.friend-row > view:last-child text:last-child {
	font-size: 16.7rpx;
	color: #32834c;
}
.state {
	padding: 80.4rpx 30.1rpx;
	text-align: center;
	color: #888;
}
.state button {
	width: 217.6rpx;
	margin-top: 23.4rpx;
}
</style>
