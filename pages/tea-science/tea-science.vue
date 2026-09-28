<template>
	<view class="app-stage"
		><view class="phone-shell"
			><StatusBar /><TopBar title="茶叶科普" @back="back" /><scroll-view
				scroll-y
				class="shell-scroll-viewport science-scroll"
				><scroll-view scroll-x class="science-tabs"
					><view class="science-tab-row"
						><view
							v-for="cat in scienceCategories"
							:key="cat.categoryCode"
							class="science-tab"
							:class="{ active: selected === cat.categoryCode }"
							@tap="select(cat)"
							><text>{{ cat.categoryName }}</text></view
						></view
					></scroll-view
				><view v-if="scienceError" class="phase-message">
					<text>{{ scienceError }}</text><button @tap="load">重新加载</button>
				</view><view v-else-if="loading" class="phase-message"
					>正在加载科普内容…</view
				><view v-else-if="!articles.length" class="phase-message"
					>当前分类暂无已发布文章</view
				><view
					v-for="article in articles"
					:key="article.id"
					class="science-card"
					@tap="go('teaSales', { slug: article.slug })"
					><image
						:src="imageFor(article.coverImageKey)"
						mode="aspectFill"
						@load="
							onImageLoad(
								'science-' + article.id,
								article.coverImageKey,
								imageFor(article.coverImageKey),
								$event,
							)
						"
						@error="
							onImageError(
								'science-' + article.id,
								article.coverImageKey,
								imageFor(article.coverImageKey),
								$event,
							)
						"
					/><view
						><text>{{ article.title }}</text
						><text>{{ article.summary }}</text
						><text>阅读详情 ›</text></view
					></view
				></scroll-view
			></view
		></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import mallPage from "@/shared/mall-page.js";
import mallApi from "@/shared/mall-api.js";
export default {
	components: { StatusBar, TopBar },
	mixins: [mallPage],
	data() {
		return {
			scienceCategories: [],
			scienceError: "",
			scienceLoadId: 0,
			articles: [],
			selected: "TEA_SCIENCE",
			loading: false,
		};
	},
	onShow() {
		this.load();
	},
	methods: {
		async load() {
			const loadId = ++this.scienceLoadId;
			this.loading = true;
			this.scienceError = "";
			try {
				const [cats, articles] = await Promise.all([
					mallApi.contentCategories(),
					mallApi.contentArticles(this.selected),
				]);
				if (loadId !== this.scienceLoadId) return;
				const all = Array.isArray(cats) ? cats.filter(Boolean) : [];
				const root = all.find((x) => x.categoryCode === "TEA_SCIENCE");
				const scoped = root
					? all.filter(
							(x) =>
								x.id === root.id ||
								Number(x.parentId) === Number(root.id),
						)
					: [];
				this.scienceCategories = scoped
					.map((item) => ({
						...item,
						categoryCode: String(item.categoryCode || "").trim(),
						categoryName:
							item.id === root?.id
								? "全部"
								: String(item.categoryName || "").trim(),
					}))
					.filter((item) => item.categoryCode && item.categoryName)
					.filter(
						(item, index, rows) =>
							rows.findIndex(
								(row) => row.categoryCode === item.categoryCode,
							) === index,
					);
				this.articles = articles || [];
			} catch (e) {
				if (loadId === this.scienceLoadId) this.scienceError = e.message || "科普内容加载失败";
			} finally {
				if (loadId === this.scienceLoadId) this.loading = false;
			}
		},
		select(cat) {
			this.selected = cat.categoryCode;
			this.load();
		},
	},
};
</script>
<style scoped>
.science-scroll {
	flex: 1 1 0%;
	height: 0;
	min-height: 0;
	padding: 22rpx;
	padding-bottom: calc(22rpx + env(safe-area-inset-bottom, 0px));
	box-sizing: border-box;
}
.science-tabs {
	display: block;
	min-height: 72rpx;
	white-space: nowrap;
	margin-bottom: 18rpx;
}
.science-tab-row {
	display: inline-flex;
	min-width: 100%;
	gap: 12rpx;
}
.science-tab {
	display: flex;
	flex: 0 0 auto;
	min-width: 112rpx;
	min-height: 62rpx;
	align-items: center;
	justify-content: center;
	padding: 14rpx 24rpx;
	border: 1px solid #ded5c4;
	border-radius: 999rpx;
	font-size: 23rpx;
	background: #fff;
}
.science-tab.active {
	background: #07543b;
	color: #fff;
}
.science-card {
	display: grid;
	grid-template-columns: 190rpx minmax(0, 1fr);
	gap: 20rpx;
	margin-bottom: 18rpx;
	padding: 16rpx;
	background: #fff;
	border-radius: 18rpx;
	box-sizing: border-box;
}
.science-card image {
	width: 190rpx;
	height: 150rpx;
	border-radius: 12rpx;
}
.science-card > view {
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}
.science-card > view text:first-child {
	font-size: 28rpx;
	font-weight: 600;
}
.science-card > view text:nth-child(2) {
	font-size: 21rpx;
	line-height: 1.5;
	color: #777;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
.science-card > view text:last-child {
	margin-top: auto;
	font-size: 21rpx;
	color: #0b6245;
}
</style>
