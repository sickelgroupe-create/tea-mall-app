<template>
	<view
		class="app-stage catalog-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell catalog-shell"
			><StatusBar /><TopBar title="商品分类" @back="back" /><scroll-view
				scroll-y
				class="shell-scroll-viewport catalog-category-page shell-scroll--with-bottom-nav"
			>
				<view class="catalog-search-pill" @tap="go('search')"
					><TeaIcon name="search" :size="18" /><text
						>搜索茶叶、产区或茶具</text
					></view
				>
				<view class="catalog-root-tabs"
					><button
						:class="{ active: catalogGroup === 'TEA' }"
						@tap="switchGroup('TEA')"
					>
						茶叶</button
					><button
						:class="{ active: catalogGroup === 'TEAWARE' }"
						@tap="switchGroup('TEAWARE')"
					>
						茶具
					</button></view
				>
				<view class="catalog-category-layout">
					<view class="catalog-category-rail"
						><view
							v-for="(cat, i) in activeCategoryNames"
							:key="cat"
							:class="[
								'catalog-category-rail__item',
								{ active: categoryIndex === i },
							]"
							@tap="categoryIndex = i"
							>{{ cat }}</view
						></view
					>
					<view class="catalog-category-main">
						<text class="catalog-subheading">热门分类</text>
						<view
							v-if="categoryProducts.length"
							class="catalog-category-grid"
							><view
								v-for="p in categoryProducts.slice(0, 4)"
								:key="p.id"
								@tap="openProduct(p)"
								><image
									:src="p.image"
									mode="aspectFill"
									@load="
										onImageLoad(
											'category-product-' + p.id,
											p.imageKey,
											p.image,
											$event,
										)
									"
									@error="
										onImageError(
											'category-product-' + p.id,
											p.imageKey,
											p.image,
											$event,
										)
									"
								/><text>{{ p.short }}</text></view
							></view
						>
						<view v-else class="catalog-inline-empty"
							><text>该分类暂无上架商品</text
							><button @tap="categoryIndex = 0">
								查看全部
							</button></view
						>
						<text class="catalog-subheading">产区精选</text>
						<view class="catalog-origin-list"
							><view
								v-for="origin in originProducts"
								:key="origin.name"
								@tap="openProduct(origin.product)"
								><text>⌁</text
								><view
									><text>{{ origin.name }}</text
									><text>{{
										origin.product.short
									}}</text></view
								></view
							></view
						>
					</view>
				</view>
				<view class="catalog-category-collection">
					<image
						class="catalog-category-collection__image"
						:src="
							decorationImage(
								'home.collection',
								'longjing-dark-v2.webp',
							)
						"
						mode="aspectFill"
						@load="
							onImageLoad(
								'category-collection',
								decoration('home.collection')?.imageUrl,
								decorationImage(
									'home.collection',
									'longjing-dark-v2.webp',
								),
								$event,
							)
						"
						@error="
							onImageError(
								'category-collection',
								decoration('home.collection')?.imageUrl,
								decorationImage(
									'home.collection',
									'longjing-dark-v2.webp',
								),
								$event,
							)
						"
					/>
					<view class="catalog-category-collection__shade" />
					<view class="catalog-category-collection__content"
						><text>INVITATION ONLY</text><text>御选春藏</text
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
				></scroll-view
			>
			<BottomNav
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
	data() {
		return { catalogGroup: "TEA" };
	},
	computed: {
		activeCategoryNames() {
			const children = this.categories
				.filter(
					(c) =>
						String(c.categoryGroup || "TEA") ===
							this.catalogGroup &&
						c.parentId &&
						c.status === "0",
				)
				.map((c) => c.name);
			return [
				"全部",
				...(children.length ? children : this.categoryNames.slice(1)),
			];
		},
		categoryProducts() {
			const category = this.activeCategoryNames[this.categoryIndex];
			const groupNames = this.categories
				.filter(
					(c) =>
						String(c.categoryGroup || "TEA") ===
							this.catalogGroup && c.parentId,
				)
				.map((c) => c.name);
			if (!category || category === "全部")
				return this.products.filter((p) =>
					groupNames.length ? groupNames.includes(p.category) : true,
				);
			return this.products.filter(
				(p) => String(p.category || "") === category,
			);
		},
	},
	methods: {
		switchGroup(group) {
			this.catalogGroup = group;
			this.categoryIndex = 0;
		},
	},
};
</script>
<style scoped>
.catalog-root-tabs {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 14rpx;
	margin: 0 24rpx 18rpx;
}
.catalog-root-tabs button {
	height: 72rpx;
	line-height: 72rpx;
	border: 1px solid #d8cfbd;
	border-radius: 14rpx;
	background: #fff;
	color: #254538;
	font-size: 26rpx;
}
.catalog-root-tabs button.active {
	background: #07543b;
	color: #fff;
	border-color: #07543b;
}
</style>
