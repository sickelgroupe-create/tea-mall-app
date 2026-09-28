<template>
	<view
		class="app-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell partner-shell"
			><StatusBar /><TopBar
				title="茶叶科普详情"
				@back="back"
			/><scroll-view scroll-y class="shell-scroll-viewport tea-sales-scroll"
				><view v-if="phaseLoading" class="phase-message"
					>内容加载中…</view
				><view v-else-if="phaseError" class="phase-message"
					>{{ phaseError }}<button @tap="load">重新加载</button></view
				><template v-else-if="articleData"
					><image
						class="article-cover"
						:src="articleCover"
						mode="aspectFill"
						@load="
							onImageLoad(
								'article-cover',
								articleData.coverImageKey,
								articleCover,
								$event,
							)
						"
						@error="
							onImageError(
								'article-cover',
								articleData.coverImageKey,
								articleCover,
								$event,
							)
						"
					/><view class="article-body"
						><text style="letter-spacing: 5rpx; color: #486153">{{
							articleData.categoryName
						}}</text>
						<text class="article-title">{{
							articleData.title
						}}</text>
						<view class="article-meta"
							>{{ articlePublishedAt }} ·
							{{ articleData.viewCount }} 次阅读</view
						><rich-text
							class="article-html"
							:nodes="articleData.bodyHtml"
						/><view class="article-actions"
							><button
								class="partner-secondary"
								@tap="toggleFavorite"
							>
								{{
									articleData.favorite ? "已收藏" : "收藏文章"
								}}</button
							><button
								class="partner-primary"
								@tap="shareArticle"
							>
								分享
							</button></view
						><text class="partner-section-title">推荐好茶</text
						><view
							v-for="p in articleProducts"
							:key="p.id"
							class="article-product"
							@tap="go('productDetail', { id: p.id })"
							><image
								:src="imageFor(p.imageKey)"
								mode="aspectFill"
								@load="
									onImageLoad(
										'article-product-' + p.id,
										p.imageKey,
										imageFor(p.imageKey),
										$event,
									)
								"
								@error="
									onImageError(
										'article-product-' + p.id,
										p.imageKey,
										imageFor(p.imageKey),
										$event,
									)
								" /><view class="partner-grow"
								><text>{{ p.name }}</text
								><text>库存 {{ p.stock }}</text
								><MallPrice
									class="partner-number"
									:value="p.price"
									:precision="2" /></view></view
						><view class="partner-collection"
							><image
								:src="decorationImage('partner.intro')"
								mode="aspectFill"
								@load="
									onImageLoad(
										'article-partner',
										decoration('partner.intro')?.imageUrl,
										decorationImage('partner.intro'),
										$event,
									)
								"
								@error="
									onImageError(
										'article-partner',
										decoration('partner.intro')?.imageUrl,
										decorationImage('partner.intro'),
										$event,
									)
								"
							/><text>读茶 · 懂茶 · 分享茶</text></view
						></view
					></template
				></scroll-view
			></view
		></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import mallPage from "@/shared/mall-page.js";
import phase from "@/shared/phase33-40.js";
import mallApi from "@/shared/mall-api.js";
import { staticImageUrl } from "@/shared/image-assets.js";
export default {
	components: { StatusBar, TopBar },
	mixins: [mallPage, phase],
	data() {
		return { slug: "yesterday-tea-visit" };
	},
	onLoad(q) {
		this.slug = q.slug || this.slug;
	},
	onShow() {
		this.load();
	},
	onShareAppMessage() {
		return {
			title: this.articleData?.title || "茶叶销售",
			path: `/pages/tea-sales/tea-sales?slug=${this.slug}`,
		};
	},
	onShareTimeline() {
		return {
			title: this.articleData?.title || "茶叶销售",
			query: `slug=${this.slug}`,
		};
	},
	computed: {
		articleCover() {
			return this.imageFor(
				this.articleData?.coverImageKey,
				"longjing-pale.jpg",
			);
		},
		articlePublishedAt() {
			const raw = String(this.articleData?.publishedAt || "").trim();
			if (!raw) return "";
			return raw
				.replace("T", " ")
				.replace(/\.\d+Z?$/, "")
				.slice(0, 16);
		},
		articleProducts() {
			const related = Array.isArray(this.articleData?.products)
				? this.articleData.products
				: [];
			const source = related.length
				? related
				: (this.products || []).filter((item) =>
						String(item.category || "").includes("绿茶"),
					);
			return source
				.slice(0, 2)
				.map((item) => this.normalizeProduct(item));
		},
	},
	methods: {
		async load() {
			try {
				this.articleData = await this.phaseRun(() =>
					mallApi.article(this.slug),
				);
			} catch (_) {}
		},
		imageFor(key, fallback) {
			const map = {
				"longjing-hero-v2": staticImageUrl("longjing-hero-v2.webp"),
				"longjing-dark-v2": staticImageUrl("longjing-dark-v2.webp"),
				"tea-gift-v2": staticImageUrl("tea-gift-v2.webp"),
			};
			return (
				map[key] ||
				staticImageUrl(key || fallback || "longjing-hero-v2.webp")
			);
		},
		async toggleFavorite() {
			try {
				const next = !this.articleData.favorite;
				await mallApi.favoriteArticle(this.articleData.id, next);
				this.articleData.favorite = next;
				this.phaseToast(next ? "收藏成功" : "已取消收藏");
			} catch (e) {
				this.phaseToast(e.message);
			}
		},
		shareArticle() {
			/* #ifdef H5 */ const url = location.href;
			if (navigator.share)
				navigator
					.share({ title: this.articleData.title, url })
					.catch(() => {});
			else uni.setClipboardData({ data: url });
			/* #endif */ /* #ifndef H5 */ this.phaseToast(
				"请使用右上角分享给好友或朋友圈",
			); /* #endif */
		},
	},
};
</script>
