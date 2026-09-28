<template>
	<view
		class="app-stage catalog-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell catalog-shell"
			><StatusBar /><TopBar title="商品详情" @back="back" />
			<scroll-view scroll-y class="shell-scroll-viewport catalog-page catalog-page--detail">
				<view
					v-if="mallLoading && !selectedProduct.id"
					class="catalog-state"
					><text>商品加载中…</text></view
				><view
					v-else-if="catalogError && !selectedProduct.id"
					class="catalog-state catalog-state--error"
					><text>{{ catalogError }}</text
					><button @tap="loadPageSpecificData">重新加载</button></view
				>
				<template v-else>
					<swiper
						class="catalog-detail-gallery"
						:circular="productGallery.length > 1"
						@change="onDetailGalleryChange"
						><swiper-item
							v-for="(img, i) in productGallery"
							:key="i"
							><image
								:src="img"
								mode="aspectFill"
								@load="
									onImageLoad(
										'product-detail-' + i,
										selectedProduct.imageKey,
										img,
										$event,
									)
								"
								@error="
									onImageError(
										'product-detail-' + i,
										selectedProduct.imageKey,
										img,
										$event,
									)
								" /></swiper-item
					></swiper>
					<view class="catalog-detail-copy"
						><text>{{ selectedProduct.short }}</text
						><MallPrice
							:value="displayProductPrice"
							:precision="2"
							size="emphasis"
						/><text>预计获得 {{ Math.floor(Number(displayProductPrice || 0) * Number(selectedProduct.pointsPercent || 0) / 100) }} 积分 / 件，实付后以订单为准</text><text
							>{{ selectedProduct.origin }} ·
							{{ selectedProduct.gradeName }} · 鲜爽回甘</text
						><view
							><text>顺丰包邮</text><text>正品保障</text
							><text>7天无理由</text></view
						></view
					>
					<view class="catalog-spec-section"
						><view><text>规格</text><text>请选择 ›</text></view
						><view class="catalog-spec-grid"
							><button
								v-for="sku in selectedProduct.skus"
								:key="sku.skuId"
								:class="{
									active:
										Number(selectedSkuId) ===
										Number(sku.skuId),
								}"
								:disabled="
									String(sku.status) !== '0' ||
									Number(sku.stock) <= 0
								"
								@tap="selectSku(sku)"
							>
								{{ sku.spec
								}}<text v-if="Number(sku.stock) <= 0">
									已售罄</text
								>
							</button></view
						></view
					>
					<view class="catalog-qty-row"
						><text>数量</text
						><view
							><button
								@tap="changeProductQtyAndSyncCart(-1)"
								:disabled="
									productCartUpdating || productQty <= 1
								"
							>
								−</button
							><text>{{ productQty }}</text
							><button
								@tap="changeProductQtyAndSyncCart(1)"
								:disabled="
									productCartUpdating ||
									productQty >=
										Number(selectedSku?.stock || 0)
								"
							>
								＋
							</button></view
						></view
					>
					<view
						class="catalog-category-collection catalog-detail-collection"
						><image
							class="catalog-detail-collection__image"
							:src="decorationImage('home.collection')"
							mode="aspectFill"
							@load="
								onImageLoad(
									'product-detail-collection',
									decoration('home.collection')?.imageUrl,
									decorationImage('home.collection'),
									$event,
								)
							"
							@error="
								onImageError(
									'product-detail-collection',
									decoration('home.collection')?.imageUrl,
									decorationImage('home.collection'),
									$event,
								)
							"
						/><view class="catalog-detail-collection__shade"></view
						><view class="catalog-category-collection__content"
							><text>PRIVATE COLLECTION</text><text>御选春藏</text
							><text
								>核心产区 ·
								一季一采。以克制的仪式感，呈现真正稀缺的茶与器。</text
							><view class="catalog-category-collection__metrics"
								><text
									>36席<text class="catalog-metric-note"
										>一对一服务</text
									></text
								><text
									>2026春<text class="catalog-metric-note"
										>优先礼遇</text
									></text
								><text
									>收藏级<text class="catalog-metric-note"
										>全程保障</text
									></text
								></view
							></view
						></view
					>
					<view class="catalog-detail-info"
						><text>商品信息</text
						><view
							><text>产地</text
							><text>{{
								selectedProduct.origin || "以商品信息为准"
							}}</text></view
						><view
							><text>等级 / 工艺</text
							><text>{{
								selectedProduct.gradeName || "以商品信息为准"
							}}</text></view
						><view
							><text>保质期</text
							><text>{{
								selectedProduct.shelfLife || "以包装标示为准"
							}}</text></view
						><text>{{ selectedProduct.description }}</text></view
					>
				</template>
			</scroll-view>
			<view class="catalog-detail-actions"
				><view @tap="toggleFavorite"
					><TeaIcon
						:name="isFavorite ? 'star' : 'heart'"
						:size="21"
					/><text>{{ isFavorite ? "已收藏" : "收藏" }}</text></view
				><view @tap="go('cart')" class="catalog-detail-cart-link"
					><view class="catalog-detail-cart-icon"
						><TeaIcon name="cart" :size="21" /><text
							v-if="cartCount"
							class="catalog-detail-cart-badge"
							>{{ cartCount > 99 ? "99+" : cartCount }}</text
						></view
					><text>购物车</text></view
				><button
					:disabled="!selectedSku || Number(selectedSku.stock) <= 0"
					@tap="buyNow"
				>
					立即下单
				</button></view
			>
			<view v-if="toastText" class="toast">{{ toastText }}</view>
		</view></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import mallPage from "@/shared/mall-page.js";
export default {
	components: { StatusBar, TopBar, TeaIcon },
	mixins: [mallPage],
	data() {
		return { productCartUpdating: false };
	},
	methods: {
		async changeProductQtyAndSyncCart(step) {
			if (this.productCartUpdating) return;
			const previousQty = Number(this.productQty || 1);
			this.changeProductQty(step);
			if (Number(this.productQty) === previousQty) return;
			this.productCartUpdating = true;
			const synced = await this.addToCart(
				this.selectedProduct,
				Number(this.productQty),
			);
			if (!synced) this.productQty = previousQty;
			this.productCartUpdating = false;
		},
	},
};
</script>
