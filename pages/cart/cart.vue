<template>
	<view
		class="app-stage catalog-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell catalog-shell"
			><StatusBar /><TopBar title="购物车" @back="back"
				><template #right
					><text @tap="editCart = !editCart">{{
						editCart ? "完成" : "编辑"
					}}</text></template
				></TopBar
			>
			<scroll-view
				scroll-y
				class="shell-scroll-viewport catalog-page catalog-page--cart catalog-page--tab shell-scroll--with-bottom-nav"
			>
				<view v-if="mallLoading && !authReady" class="catalog-state"
					><text>购物车同步中…</text></view
				>
				<view v-else-if="!cartItems.length" class="catalog-state"
					><TeaIcon name="cart" :size="34" /><text
						>购物车还是空的</text
					><text>去挑一款当季好茶吧</text
					><button @tap="go('home')">去逛逛</button></view
				>
				<view v-else class="catalog-cart-list"
					><view
						v-for="(item, i) in cartItems"
						:key="`${item.id}-${item.skuId}`"
						><view
							class="catalog-check"
							@tap="toggleCartItem(item)"
							>{{ item.checked ? "✓" : "" }}</view
						><image
							:src="item.image"
							mode="aspectFill"
							@tap="openProduct(item)"
						/><view
							><text @tap="openProduct(item)">{{
								item.short
							}}</text
							><text>{{ item.spec }}</text
							><MallPrice :value="item.price" :precision="2" />
							<view class="catalog-stepper"
								><button
									:disabled="
										cartUpdatingSkuId === item.skuId ||
										item.qty <= 1
									"
									@tap="changeQty(i, -1)"
								>
									−</button
								><text>{{ item.qty }}</text
								><button
									:disabled="
										cartUpdatingSkuId === item.skuId ||
										item.qty >= item.stock
									"
									@tap="changeQty(i, 1)"
								>
									＋
								</button></view
							></view
						></view
					></view
				>
				<template v-if="cartItems.length"
					><text class="catalog-cart-heading">优惠权益</text
					><view class="catalog-benefits"
						><view @tap="go('coupons')"
							><TeaIcon name="ticket" :size="20" /><text
								>优惠活动</text
							><text>查看可用优惠 ›</text></view
						><view @tap="go('pointsCenter')"
							><TeaIcon name="star" :size="20" /><text
								>茶友积分</text
							><text
								>可用
								{{
									Number(
										customer.points || 0,
									).toLocaleString()
								}}
								积分 ›</text
							></view
						></view
					>
					<view class="catalog-topic-story catalog-topic-story--cart"
						><image
							:src="decorationImage('account.member')"
							mode="aspectFill"
						/><view
							><text>CURATED TEA RITUAL</text><text>御选春藏</text
							><text
								>核心产区，一季一采。从茶园、工艺到器物，建立完整的私人品鉴档案。</text
							><text>◇　36席</text><text>♔　2026春</text
							><text>◇　收藏级</text></view
						></view
					></template
				>
			</scroll-view>
			<view class="catalog-cart-total"
				><view class="catalog-check" @tap="toggleAllCart">{{
					allCartChecked ? "✓" : ""
				}}</view
				><text @tap="toggleAllCart">全选</text
				><text
					>合计：<MallPrice
						:value="cartTotal"
						:precision="2"
						size="emphasis" /></text
				><button
					:disabled="!checkoutItems.length"
					@tap="editCart ? removeSelectedCartItems() : goCheckout()"
				>
					{{ editCart ? "删除" : "去结算" }}
				</button></view
			>
			<BottomNav
				active="cart"
				:cart-count="cartCount"
				@select="nav"
			/><view v-if="toastText" class="toast">{{ toastText }}</view>
		</view></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import BottomNav from "@/components/BottomNav.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import mallPage from "@/shared/mall-page.js";
export default {
	components: { StatusBar, TopBar, BottomNav, TeaIcon },
	mixins: [mallPage],
};
</script>
