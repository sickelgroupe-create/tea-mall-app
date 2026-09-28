<template>
	<view class="app-stage"
		><view class="phone-shell"
			><StatusBar /><TopBar title="购买记录" @back="back" /><view
				class="friend-tabs"
				><text
					v-for="(tab, i) in tabs"
					:key="tab"
					:class="{ active: tabIndex === i }"
					@tap="tabIndex = i"
					>{{ tab }}</text
				></view
			><scroll-view scroll-y class="shell-scroll-viewport screen purchases-screen shell-scroll--with-bottom-nav"
				><view v-if="loading" class="state">正在加载真实订单…</view
				><view v-else-if="errorText" class="state"
					><text>{{ errorText }}</text
					><button @tap="loadOrders">重新加载</button></view
				><template v-else
					><view class="purchase-list"
						><view
							v-for="order in filteredOrders"
							:key="order.orderNo"
							><image
								:src="imageFor(order.imageKey)"
								mode="aspectFill" /><view
								><text>{{ order.productName }}</text
								><text
									>{{ dateOnly(order.createTime) }} ·
									{{ order.status }}</text
								><MallPrice
									:value="order.amount"
									:precision="0" /></view></view
						><view v-if="!filteredOrders.length" class="state"
							>暂无该状态的真实购买记录</view
						></view
					><InvitationClub
						:decoration="decoration('invite.club')"
						variant="light" /></template></scroll-view
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
import InvitationClub from "@/components/InvitationClub.vue";
import mallPage from "@/shared/mall-page.js";
import mallApi from "@/shared/mall-api.js";
export default {
	components: { StatusBar, TopBar, BottomNav, InvitationClub },
	mixins: [mallPage],
	data() {
		return {
			tabs: ["全部", "已完成", "退款"],
			tabIndex: 0,
			friendOrders: [],
			loading: false,
			errorText: "",
		};
	},
	computed: {
		filteredOrders() {
			if (this.tabIndex === 1)
				return this.friendOrders.filter((o) => o.status === "已完成");
			if (this.tabIndex === 2)
				return this.friendOrders.filter((o) =>
					String(o.status).includes("退款"),
				);
			return this.friendOrders;
		},
	},
	methods: {
		dateOnly(v) {
			return String(v || "").slice(0, 10);
		},
		async loadOrders() {
			const id = Number(this.pageQuery.friendId);
			if (!id) {
				this.errorText = "缺少茶友参数";
				return;
			}
			this.loading = true;
			this.errorText = "";
			try {
				this.friendOrders = await mallApi.teaFriendOrders(id);
			} catch (e) {
				if (!e.authenticationRequired) this.errorText = e.message;
			} finally {
				this.loading = false;
			}
		},
	},
	async onShow() {
		await this.loadOrders();
	},
};
</script>
<style scoped>
.friend-tabs {
	height: 78.7rpx;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	background: #fff;
	border-bottom: 1px solid #e6dfd2;
}
.friend-tabs text {
	display: flex;
	align-items: center;
	justify-content: center;
}
.friend-tabs .active {
	position: relative;
	color: #064d36;
	font-weight: 600;
}
.friend-tabs .active:after {
	content: "";
	position: absolute;
	bottom: 0;
	width: 90.4rpx;
	height: 3.3rpx;
	background: #064d36;
}
.purchases-screen {
	padding: 23.4rpx;
	box-sizing: border-box;
}
.purchase-list {
	margin-bottom: 30.1rpx;
	border: 1px solid #eadfca;
	border-radius: 21.8rpx;
	background: #fff;
	overflow: hidden;
}
.purchase-list > view:not(.state) {
	min-height: 217.6rpx;
	padding: 21.8rpx;
	display: grid;
	grid-template-columns: 194.2rpx 1fr;
	gap: 23.4rpx;
	border-bottom: 1px solid #eee6d8;
}
.purchase-list image {
	width: 194.2rpx;
	height: 174.1rpx;
	border-radius: 8.4rpx;
}
.purchase-list > view > view {
	display: flex;
	flex-direction: column;
	gap: 13.4rpx;
}
.purchase-list > view > view text:first-child {
	font:
		28.5rpx SimSun,
		serif;
}
.purchase-list > view > view text:nth-child(2) {
	color: #888;
	font-size: 16.7rpx;
}
.purchase-list > view > view text:last-child {
	color: #b55b22;
	font: 600 25.1rpx Georgia;
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
