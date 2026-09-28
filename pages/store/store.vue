<template>
	<view
		class="app-stage catalog-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell catalog-shell"
			><StatusBar /><TopBar title="品牌店铺" @back="back" />
			<scroll-view scroll-y class="shell-scroll-viewport catalog-page catalog-page--tab shell-scroll--with-bottom-nav">
				<view v-if="mallLoading && !store" class="catalog-state"
					><text>店铺加载中…</text></view
				><view
					v-else-if="!store"
					class="catalog-state catalog-state--error"
					><text>{{ catalogError || "店铺暂不可用" }}</text
					><button @tap="loadPageSpecificData">重新加载</button></view
				>
				<template v-else>
					<view class="catalog-store-head"
						><view class="catalog-store-logo"
							><image
								v-if="store.logo"
								:src="store.logo"
								mode="aspectFit"
							/><text v-else>⌁</text></view
						><view
							><text>{{ store.name }}</text
							><text
								>{{
									Number(store.rating || 0) > 0
										? `${Number(store.rating).toFixed(1)}分`
										: "暂无评分"
								}}
								· {{ store.products.length }}件在售 ·
								{{
									Number(
										store.actualFollowerCount || 0,
									).toLocaleString()
								}}关注</text
							></view
						><button @tap="toggleStoreFollow">
							{{ store.followed ? "已关注" : "关注" }}
						</button></view
					>
					<view class="catalog-store-promises"
						><text>⌁ 原产地直采</text
						><text>♧ {{ store.shippingPromise }}</text
						><text>◇ {{ store.servicePromise }}</text></view
					>
					<view class="catalog-section-title"
						><text>店铺推荐</text
						><text @tap="go('productList')">全部商品 ›</text></view
					>
					<view class="catalog-product-grid"
						><view
							v-for="p in store.products.slice(0, 4)"
							:key="p.id"
							class="catalog-product-card"
							@tap="openProduct(p)"
							><image :src="p.image" mode="aspectFill" /><view
								><text>{{ p.short }}</text
								><MallPrice
									:value="p.price"
									:precision="0"
									size="card"
								/>
								</view
							></view
						></view
					>
					<view
						class="catalog-section-title catalog-section-title--story"
						><text>品牌故事</text></view
					>
					<view class="catalog-store-story"
						><text>{{ store.story }}</text></view
					>
					<view class="catalog-collection catalog-collection--store"
						><image
							:src="store?.heroImage"
							mode="aspectFill"
						/><view class="catalog-collection__shade" /><view
							class="catalog-collection__copy"
							><text>PRIVATE COLLECTION</text><text>御选春藏</text
							><text>核心产区 · 一季一采</text></view
						><view class="catalog-collection__metrics"
							><text>36席</text><text>2026春</text
							><text>收藏级</text></view
						></view
					>
				</template> </scroll-view
			><BottomNav
				active="home"
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
import mallPage from "@/shared/mall-page.js";
export default {
	components: { StatusBar, TopBar, BottomNav },
	mixins: [mallPage],
};
</script>
