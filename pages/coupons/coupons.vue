<template>
	<view
		class="app-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell account-shell"
			><StatusBar /><TopBar title="我的优惠券" @back="back" /><view
				class="account-tabs"
				><text
					v-for="(t, i) in ['可使用', '已使用', '已过期']"
					:key="t"
					:class="{ active: couponTab === i }"
					@tap="
						couponTab = i;
						loadCoupons();
					"
					>{{ t }}</text
				></view
			><scroll-view scroll-y class="shell-scroll-viewport account-scroll coupon-scroll with-tab shell-scroll--with-bottom-nav"
				><view v-if="accountLoading" class="account-state"
					>正在加载优惠券…</view
				><view v-else-if="accountError" class="account-state"
					><text>{{ accountError }}</text
					><button @tap="loadCoupons">重新加载</button></view
				><template v-else
					><view
						class="real-coupon"
						v-for="(c, i) in accountCoupons"
						:key="c.id"
						:class="{
							orange: i % 2,
							disabled: c.status !== '未使用',
						}"
						><view
							><MallPrice
								:value="c.discountAmount"
								:precision="0"
								size="emphasis"
								tone="inverse"
							/>
							<text
								>满{{
									Number(c.minOrderAmount).toFixed(0)
								}}可用</text
							></view
						><view
							><text>{{ c.name }}</text
							><text
								>{{ c.scopeType }} · 有效期至
								{{ dateOnly(c.validTo) }}</text
							><button
								v-if="c.status === '未使用'"
								@tap="go('home')"
							>
								立即使用</button
							><text v-else>{{ c.status }}</text></view
						></view
					><view
						v-if="!accountCoupons.length"
						class="account-empty-card"
						><TeaIcon name="ticket" :size="30" /><text>{{
							availableCoupons.length
								? "有可领取优惠券"
								: "暂无相关优惠券"
						}}</text
						><button
							v-for="c in availableCoupons"
							:key="c.id"
							:disabled="accountSubmitting"
							@tap="claim(c)"
						>
							领取 {{ c.name }}
						</button></view
					><text class="account-title">使用说明</text
					><text class="coupon-description"
						>优惠券不可提现、不可转赠；订单优惠金额由 Java
						后端根据有效期、门槛、适用商品和订单状态重新计算。取消未支付订单后会幂等释放。</text
					><view class="account-collection coupon-collection"
						><image
							:src="decorationImage('account.member')"
							mode="aspectFill"
						/><view
							><text>臻享会员礼序</text
							><text>专属茶师 · 稀缺配额 · 私享雅集</text></view
						></view
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
import mallPage from "@/shared/mall-page.js";
import phase from "@/shared/phase41-48.js";
import mallApi from "@/shared/mall-api.js";
export default {
	components: { StatusBar, TopBar, BottomNav, TeaIcon },
	mixins: [mallPage, phase],
	data() {
		return { availableCoupons: [] };
	},
	onShow() {
		this.loadCoupons();
	},
	methods: {
		async loadCoupons() {
			const states = ["未使用", "已使用", "已过期"];
			try {
				const result = await this.accountRun(() =>
					Promise.all([
						mallApi.accountCoupons(states[this.couponTab]),
						mallApi.availableCoupons(),
					]),
				);
				this.accountCoupons = result[0] || [];
				this.availableCoupons = result[1] || [];
			} catch (_) {}
		},
		async claim(c) {
			if (this.accountSubmitting) return;
			this.accountSubmitting = true;
			try {
				await mallApi.claimCoupon(c.id);
				this.accountToast("优惠券领取成功");
				await this.loadCoupons();
			} catch (e) {
				this.accountToast(e.message || "领取失败");
			} finally {
				this.accountSubmitting = false;
			}
		},
	},
};
</script>
