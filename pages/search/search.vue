<template>
	<view
		class="app-stage catalog-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell catalog-shell"
			><StatusBar /><TopBar title="搜索" @back="back" />
			<view class="catalog-search-pill catalog-search-pill--input"
				><TeaIcon name="search" :size="18" /><input
					v-model="searchQuery"
					placeholder="明前龙井"
					confirm-type="search"
					@input="scheduleCatalogSearch"
					@confirm="refreshCatalogProducts"
				/><text
					v-if="searchQuery"
					@tap="
						searchQuery = '';
						refreshCatalogProducts();
					"
					>×</text
				></view
			>
			<view class="catalog-filter-row"
				><text
					v-for="tab in ['综合', '销量', '价格', '新品']"
					:key="tab"
					:class="{ active: searchSort === tab }"
					@tap="selectSearchSort(tab)"
					>{{ tab
					}}{{
						tab === "价格" && searchSort === "价格"
							? priceAscending
								? " ↑"
								: " ↓"
							: ""
					}}</text
				><text @tap="filterOpen = !filterOpen">筛选</text></view
			>
			<view v-if="filterOpen" class="catalog-price-filter"
				><button
					v-for="item in [
						{ k: 'low', t: '0–199' },
						{ k: 'mid', t: '200–399' },
						{ k: 'high', t: '400以上' },
					]"
					:key="item.k"
					:class="{ active: priceFilter === item.k }"
					@tap="
						priceFilter = priceFilter === item.k ? '' : item.k;
						refreshCatalogProducts();
					"
				>
					{{ item.t }}
				</button></view
			>
			<scroll-view
				scroll-y
				class="shell-scroll-viewport catalog-page catalog-page--search catalog-page--tab shell-scroll--with-bottom-nav"
				@scrolltolower="loadMoreCatalogProducts"
				><view class="catalog-section-title"
					><text>搜索结果</text
					><text>共 {{ searchTotal }} 件商品</text></view
				>
				<view v-if="catalogLoading" class="catalog-state"
					><text>正在搜索…</text></view
				><view
					v-else-if="catalogError"
					class="catalog-state catalog-state--error"
					><text>{{ catalogError }}</text
					><button @tap="refreshCatalogProducts">
						重新加载
					</button></view
				>
				<view
					v-else-if="filteredProducts.length"
					class="catalog-product-grid"
					><view
						v-for="p in filteredProducts"
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
							<text class="catalog-product-meta"
								>已售 {{ p.sales }} 件</text
							></view
						></view
					></view
				>
				<view v-else class="catalog-state"
					><text>没有找到符合条件的商品</text
					><button
						@tap="
							searchQuery = '';
							priceFilter = '';
							refreshCatalogProducts();
						"
					>
						清除条件
					</button></view
				>
				<view v-if="catalogLoadingMore" class="catalog-loading-more"
					>继续加载商品…</view
				>
				<view class="catalog-collection catalog-collection--short"
					><image
						:src="decorationImage('home.collection')"
						mode="aspectFill"
					/><view class="catalog-collection__shade" /><view
						class="catalog-collection__copy"
						><text>PRIVATE COLLECTION</text><text>御选春藏</text
						><text>核心产区 · 一季一采</text></view
					></view
				> </scroll-view
			><BottomNav
				active="category"
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
