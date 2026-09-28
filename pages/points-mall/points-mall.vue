<template>
	<view class="app-stage"
		><view class="phone-shell phase-points-shell"
			><StatusBar /><TopBar title="积分商城" @back="back" />
			<scroll-view scroll-y class="shell-scroll-viewport screen phase-points-scroll with-tab shell-scroll--with-bottom-nav"
				><view class="phase-balance-card"
					><text>可用积分</text
					><text class="phase-number">{{
						Number(customer.points || 0).toLocaleString()
					}}</text></view
				><view class="phase-chip-row"
					><text
						v-for="(tab, i) in ['精选', '茶叶', '茶具', '周边']"
						:key="tab"
						:class="{ active: pointsCategory === i }"
						@tap="pointsCategory = i"
						>{{ tab }}</text
					></view
				><view class="phase-section-head"
					><text>积分好礼</text
					><text @tap="go('myExchanges')">兑换记录 ›</text></view
				><view class="phase-gift-grid"
					><view
						v-for="p in filteredPointsProducts"
						:key="p.id"
						:class="[
							'phase-gift-card',
							{ sold: Number(p.stockCount) <= 0 },
						]"
						@tap="openExchange(p)"
						><image :src="p.image" mode="aspectFill" /><text>{{
							p.name
						}}</text
						><text class="phase-number">{{ p.points }} 积分</text
						><text>{{
							Number(p.stockCount) <= 0
								? "已售罄"
								: `库存${p.stockCount}${p.stockUnit || "件"}`
						}}</text></view
					></view
				><view
					v-if="!filteredPointsProducts.length"
					class="phase-empty-line"
					>该分类暂无可兑换商品</view
				><PointsCollection
					:decoration="decoration('points.promo')"
					tone="split" /></scroll-view
			><BottomNav
				active="points"
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
import PointsCollection from "@/components/PointsCollection.vue";
import mallPage from "@/shared/mall-page.js";
export default {
	components: { StatusBar, TopBar, BottomNav, PointsCollection },
	mixins: [mallPage],
	onShow() {
		this.loadPointsDomain();
	},
};
</script>
