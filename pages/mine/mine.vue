<template>
	<view
		class="app-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell account-shell"
			><StatusBar /><TopBar title="我的" /><scroll-view
				scroll-y
				class="shell-scroll-viewport account-scroll mine-account-scroll with-tab shell-scroll--with-bottom-nav"
				><view
					v-if="!authenticated"
					class="mine-login-card"
					@tap="go('login')"
					><TeaIcon name="user" :size="42" /><view
						><text>登录 / 注册</text
						><text>登录后查看订单、积分、优惠券与佣金</text></view
					><text>›</text></view
				><template v-else
					><view v-if="accountLoading" class="account-state"
						>正在汇总账号数据…</view
					><view v-else-if="accountError" class="account-state"
						><text>{{ accountError }}</text
						><button @tap="loadDashboard">重新加载</button></view
					><template v-else-if="accountDashboard"
						><view class="mine-profile-card"
							><image
								:src="
									customer.avatarUrl
										? imageFor(customer.avatarUrl)
										: imageFor('/static/images/biluochun.jpg')
								"
								mode="aspectFill"
							/><view
								><text>{{
									accountDashboard.nickname || "茶友"
								}}</text
								><text>{{
									maskedPhone
								}}</text></view
							><button
								@tap="go('settings', { panel: '个人资料' })"
							>
								编辑资料
							</button></view
						><WechatBinding ref="wechatBinding" /><view class="mine-order-grid"
							><view @tap="go('orders', { tab: 1 })"
								><TeaIcon name="wallet" :size="23" /><text
									>待付款</text
								><text v-if="accountDashboard.unpaid">{{
									accountDashboard.unpaid
								}}</text></view
							><view @tap="go('orders', { tab: 2 })"
								><TeaIcon name="package" :size="23" /><text
									>待发货</text
								><text v-if="accountDashboard.unshipped">{{
									accountDashboard.unshipped
								}}</text></view
							><view @tap="go('orders', { tab: 3 })"
								><TeaIcon name="truck" :size="23" /><text
									>待收货</text
								><text v-if="accountDashboard.unreceived">{{
									accountDashboard.unreceived
								}}</text></view
							><view @tap="go('orders', { tab: 4 })"
								><TeaIcon name="service" :size="23" /><text
									>售后/退款</text
								><text v-if="accountDashboard.aftersale">{{
									accountDashboard.aftersale
								}}</text></view
							></view
						><view class="account-section-head"
							><text>我的服务</text
							><text @tap="go('orders')">全部订单 ›</text></view
						><view class="account-menu mine-account-menu"
							><view @tap="go('commissionCenter')"><TeaIcon name="users" :size="21" /><text>我的收入</text><text>›</text></view
							></view
						><view class="account-menu mine-account-menu"
							><view @tap="go('invite')"><TeaIcon name="users" :size="21" /><text>邀请奖励 / 邀请分</text><text>›</text></view
							><view @tap="go('addresses')"><TeaIcon name="location" :size="21" /><text>收货地址</text><text>›</text></view
							><view @tap="go('notifications')"><TeaIcon name="bell" :size="21" /><text>站内消息</text><text>›</text></view
							><view @tap="go('pointsCenter')"
								><TeaIcon name="award" :size="21" /><text
									>我的积分</text
								><text
									>{{
										accountDashboard.points || 0
									}}
									积分　›</text
								></view
							><view @tap="go('coupons')"
								><TeaIcon name="ticket" :size="21" /><text
									>我的优惠券</text
								><text
									>{{
										accountDashboard.couponCount || 0
									}}
									张　›</text
								></view
							><view @tap="go('favorites')"
								><TeaIcon name="heart" :size="21" /><text
									>我的收藏</text
								><text
									>{{
										accountDashboard.favoriteCount || 0
									}}　›</text
								></view
							><view @tap="go('history')"
								><TeaIcon name="clock" :size="21" /><text
									>浏览记录</text
								><text>›</text></view
							><view @tap="go('settings', { panel: '在线客服' })"
								><TeaIcon name="headset" :size="21" /><text
									>在线客服</text
								><text>›</text></view
							><view @tap="go('settings')"
								><TeaIcon name="settings" :size="21" /><text
									>设置</text
								><text>›</text></view
							></view
						><view class="account-collection mine-collection"
							><image
								:src="decorationImage('account.member')"
								mode="aspectFill"
							/><view
								><text>PRIVATE COLLECTION</text
								><text>臻享会员礼序</text
								><text
									>专属茶师 · 稀缺配额 · 私享雅集</text
								></view
							></view
						></template
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
import WechatBinding from "@/components/WechatBinding.vue";
import mallPage from "@/shared/mall-page.js";
import phase from "@/shared/phase41-48.js";
import mallApi from "@/shared/mall-api.js";
export default {
	components: { StatusBar, TopBar, BottomNav, TeaIcon, WechatBinding },
	mixins: [mallPage, phase],
	computed: {
		maskedPhone() { const p=this.accountDashboard?.phone || ''; return /^1\d{10}$/.test(p) ? p.slice(0,3)+'****'+p.slice(-4) : '未绑定手机号'; }
	},
	onShow() {
		this.loadDashboard();
	},
	methods: {
		async waitForMallLoad() {
			while (this.mallLoading)
				await new Promise((resolve) => setTimeout(resolve, 50));
		},
		async loadDashboard() {
			if (this.mallLoading) await this.waitForMallLoad();
			else await this.loadMallData();
			if (!this.authenticated) return;
			try {
				this.accountDashboard = await this.accountRun(() =>
					mallApi.accountDashboard(),
				);
				await this.$nextTick();
				this.$refs.wechatBinding?.refresh();
			} catch (_) {}
		},
	},
};
</script>
