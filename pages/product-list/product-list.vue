<template>
	<view
		class="app-stage catalog-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell catalog-shell"
			><StatusBar /><TopBar title="商品列表" @back="back" />
			<scroll-view scroll-x class="catalog-list-tabs"
				><text
					v-for="cat in categoryNames"
					:key="cat"
					:class="{ active: (listingCategory || '全部') === cat }"
					@tap="
						listingCategory = cat === '全部' ? '' : cat;
						refreshCatalogProducts();
					"
					>{{ cat }}</text
				></scroll-view
			>
			<scroll-view
				scroll-y
				class="shell-scroll-viewport catalog-page catalog-page--list catalog-page--tab shell-scroll--with-bottom-nav"
			>
				<view v-if="catalogLoading" class="catalog-state"
					><text>商品加载中…</text></view
				><view
					v-else-if="catalogError"
					class="catalog-state catalog-state--error"
					><text>{{ catalogError }}</text
					><button @tap="refreshCatalogProducts">
						重新加载
					</button></view
				>
				<view v-else class="catalog-product-rows"
					><view
						v-for="p in listingProducts"
						:key="p.id"
						@tap="openProduct(p)"
						><image
							:src="p.image"
							mode="aspectFill"
							@load="
								onImageLoad(
									'product-list-' + p.id,
									p.imageKey,
									p.image,
									$event,
								)
							"
							@error="
								onImageError(
									'product-list-' + p.id,
									p.imageKey,
									p.image,
									$event,
								)
							"
						/><view
							><text>{{ p.short }}</text
							><text>{{ p.origin }} · {{ p.spec }}</text
							><MallPrice
								:value="p.price"
								:precision="0"
								size="card"
							/>
							<text v-if="p.pointsPercent != null">预计 {{ Math.floor(Number(p.price || 0) * Number(p.pointsPercent) / 100) }} 积分 / 件，以实付为准</text>
							<text>已售 {{ p.sales }} 件</text></view
						></view
					></view
				>
				<view
					v-if="!catalogLoading && !listingProducts.length"
					class="catalog-state"
					><text>当前分类暂无在售商品</text
					><button
						@tap="
							listingCategory = '';
							refreshCatalogProducts();
						"
					>
						查看全部
					</button></view
				>
				<view class="catalog-topic-story catalog-topic-story--list"
					><image
						:src="decorationImage('home.collection')"
						mode="aspectFill"
						@load="
							onImageLoad(
								'product-list-collection',
								decoration('home.collection')?.imageUrl,
								decorationImage('home.collection'),
								$event,
							)
						"
						@error="
							onImageError(
								'product-list-collection',
								decoration('home.collection')?.imageUrl,
								decorationImage('home.collection'),
								$event,
							)
						"
					/><view
						><text>CURATED TEA RITUAL</text><text>御选春藏</text
						><text
							>核心产区，一季一采。从茶园、工艺到器物，建立完整的私人品鉴档案。</text
						><text>◇　36席</text><text>♔　2026春</text
						><text>◇　收藏级</text></view
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
import mallPage from "@/shared/mall-page.js";
export default {
	components: { StatusBar, TopBar, BottomNav },
	mixins: [mallPage],
};
</script>
