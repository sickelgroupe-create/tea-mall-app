<template>
	<view class="app-stage"
		><view class="phone-shell"
			><StatusBar /><TopBar title="我的茶友" @back="back" /><view
				class="record-tabs"
				><text
					v-for="(tab, i) in ['全部', '已达标', '待购买礼包']"
					:key="tab"
					:class="{ active: inviteTab === i }"
					@tap="inviteTab = i"
					>{{ tab }}</text
				></view
			><scroll-view
				scroll-y
				class="shell-scroll-viewport screen invite-record-screen shell-scroll--with-bottom-nav"
				><view v-if="loading" class="state">正在加载邀请记录…</view
				><view v-else-if="errorText" class="state"
					><text>{{ errorText }}</text
					><button @tap="loadRecords">重新加载</button></view
				><template v-else
					><view class="record-list"
						><view
							v-for="(record, i) in filtered"
							:key="record.id"
							class="record-row"
							@tap="
								go('teaFriendDetail', {
									friendId: record.customerId,
								})
							"
							><view class="avatar" :class="{ gold: i % 2 }"
								><TeaIcon name="user" :size="21" /></view
							><view
								><text>{{ record.nickname }}</text
								><text>{{ record.phone }}</text
								><text
									>{{
										dateOnly(record.registerTime)
									}}
									注册</text
								></view
							><text>{{
								record.status === "已完成"
									? "已达标"
									: "待购买礼包"
							}}</text></view
						><view v-if="!filtered.length" class="state"
							>暂无相关邀请记录</view
						></view
					><InvitationClub
						:decoration="
							decoration('invite.club')
						" /></template></scroll-view
			><BottomNav
				active="invite"
				:cart-count="cartCount"
				@select="nav" /></view
	></view>
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
		return { records: [], loading: false, errorText: "" };
	},
	computed: {
		filtered() {
			if (this.inviteTab === 1)
				return this.records.filter((r) => r.status === "已完成");
			if (this.inviteTab === 2)
				return this.records.filter((r) => r.status !== "已完成");
			return this.records;
		},
	},
	watch: {
		authReady(value) {
			if (value && this.authenticated) this.loadRecords();
		},
	},
	methods: {
		dateOnly(v) {
			return String(v || "").slice(0, 10);
		},
		async loadRecords() {
			this.loading = true;
			this.errorText = "";
			try {
				this.records = await mallApi.inviteRecords();
			} catch (e) {
				if (!e.authenticationRequired) this.errorText = e.message;
			} finally {
				this.loading = false;
			}
		},
	},
	async onShow() {
		if (this.authReady && this.authenticated) await this.loadRecords();
	},
};
</script>
<style scoped>
.invite-record-screen {
	padding: 23.4rpx;
	box-sizing: border-box;
}
.record-list {
	margin-bottom: 30.1rpx;
	border: 1px solid #eadfca;
	border-radius: 21.8rpx;
	background: #fff;
	overflow: hidden;
}
.record-row {
	min-height: 122.2rpx;
	padding: 0 21.8rpx;
	display: grid;
	grid-template-columns: 80.4rpx 1fr auto;
	align-items: center;
	border-bottom: 1px solid #eee6d8;
}
.record-row:last-child {
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
	color: #07593f;
}
.avatar.gold {
	background: #f8efdf;
	color: #aa6b20;
}
.record-row > view:nth-child(2) {
	display: flex;
	flex-direction: column;
	gap: 6.7rpx;
}
.record-row > view:nth-child(2) text:first-child {
	font-weight: 600;
}
.record-row > view:nth-child(2) text:not(:first-child) {
	font-size: 16.7rpx;
	color: #888;
}
.record-row > text {
	color: #b55b22;
	font-weight: 600;
}
.state {
	padding: 80.4rpx 26.8rpx;
	text-align: center;
	color: #888;
}
.state button {
	width: 217.6rpx;
	margin-top: 23.4rpx;
}
</style>
