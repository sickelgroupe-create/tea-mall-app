<template>
	<view
		class="app-stage catalog-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell catalog-shell"
			><StatusBar /><TopBar title="首页专题" @back="back"
				><template #right
					><text
						class="topic-favorite-link"
						@tap.stop="toggleTopicFavorite"
						>{{ isTopicFavorite ? "已收藏" : "收藏" }}</text
					></template
				></TopBar
			>
			<scroll-view scroll-y class="shell-scroll-viewport catalog-page catalog-page--tab shell-scroll--with-bottom-nav">
				<view v-if="mallLoading && !selectedTopic" class="catalog-state"
					><text>专题加载中…</text></view
				>
				<view
					v-else-if="!selectedTopic"
					class="catalog-state catalog-state--error"
					><text>{{ catalogError || "专题暂不可用" }}</text
					><button @tap="loadPageSpecificData">重新加载</button></view
				>
				<template v-else>
					<view class="catalog-topic-hero"
						><image
							:src="selectedTopic.heroImage"
							mode="aspectFill"
						/><view
							><text>{{ selectedTopic.kicker }}</text
							><text>{{ selectedTopic.title }}</text
							><text>{{ selectedTopic.subtitle }}</text
							><button @tap="go('productList')">
								进入专题
							</button></view
						></view
					>
					<view class="catalog-section-title"
						><text>专题茶单</text
						><text
							>{{ selectedTopic.products.length }} 款</text
						></view
					>
					<view class="catalog-product-grid">
						<view
							v-for="p in selectedTopic.products"
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
						>
					</view>
					<view class="catalog-topic-story"
						><image
							:src="selectedTopic?.storyImage"
							mode="aspectFill"
						/><view
							><text>CURATED TEA RITUAL</text
							><text>{{ selectedTopic.storyTitle }}</text
							><text>{{ selectedTopic.storyContent }}</text
							><text>◇　36席</text><text>♔　2026春</text
							><text>◇　收藏级</text></view
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
