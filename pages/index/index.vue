<template>
	<view class="app-stage"
		><view class="phone-shell">
			<StatusBar /><view class="tf-home-brand"
				><text>淡古茶序</text></view
			>
			<scroll-view scroll-y class="shell-scroll-viewport shell-scroll--flow-bottom-nav tf-home-scroll"
				><view class="tf-home-content">
					<view class="tf-home-hero" @tap="go('invite')">
						<image
							:src="hero.image"
							mode="aspectFill"
							@error="heroFailed = true"
						/>
						<view class="tf-home-hero-copy"
							><text>{{ hero.kicker }}</text
							><text v-for="line in hero.title" :key="line">{{
								line
							}}</text
							><text>{{ hero.subtitle }}</text
							><text class="tf-home-hero-link"
								>邀请茶友 · 查看活动 ›</text
							></view
						>
						<text v-if="heroFailed" class="tf-image-note"
							>图片加载失败，请重新进入</text
						>
					</view>
					<view class="tf-home-entries">
						<view
							v-for="(entry, index) in entries"
							:key="entry.key"
							:class="[
								'tf-home-entry',
								{ 'tf-home-entry-tall': index === 0 },
							]"
							@tap="go(entry.route)"
						>
							<image
								:src="entry.image"
								mode="aspectFill"
								@error="entryFailures[entry.key] = true"
							/>
							<view
								><text>{{ entry.title }}</text
								><text>{{ entry.subtitle }}</text></view
							><text
								v-if="entryFailures[entry.key]"
								class="tf-image-note"
								>图片加载失败</text
							>
						</view>
					</view>
					<view class="tf-sale-header"
						><text>好茶臻选</text
						><button @tap="go('category')">商品分类 ›</button
						><button @tap="go('productList')">全部商品 ›</button
						><button
							class="tf-cart-entry"
							aria-label="购物车"
							@tap="go('cart')"
						>
							<TeaIcon name="cart" :size="22" /><text
								v-if="cartCount"
								class="tf-cart-badge"
								>{{ cartCount }}</text
							>
						</button></view
					>
					<view class="tf-home-tabs"
						><button
							v-for="(group, index) in groups"
							:key="group.key"
							:class="{ active: currentGroup === index }"
							@tap="currentGroup = index"
						>
							{{ group.title }}
						</button></view
					>
					<view v-if="configError" class="tf-home-state"
						><text>{{ configError }}</text
						><button @tap="loadHomeConfig">重新加载</button></view
					>
					<swiper
						v-else
						class="tf-home-products"
						:style="{ height: productPanelHeight + 'px' }"
						:current="currentGroup"
						@change="currentGroup = $event.detail.current"
					>
						<swiper-item v-for="group in groups" :key="group.key">
							<view class="tf-product-pane"
								><view class="tf-home-grid">
									<view
										v-for="product in group.products"
										:key="product.id"
										class="tf-home-product"
										@tap="openProduct(product)"
									>
										<image
											:src="product.image"
											mode="aspectFill"
											@error="
												productFailures[product.id] =
													true
											"
										/><text
											v-if="productFailures[product.id]"
											class="tf-product-image-error"
											>图片加载失败</text
										>
										<text>{{ product.short }}</text
										><MallPrice
											:value="product.price"
											:precision="2"
											size="card"
										/>
										<text v-if="product.pointsPercent != null">预计 {{ Math.floor(Number(product.price || 0) * Number(product.pointsPercent) / 100) }} 积分，以实付为准</text>
									</view> </view
								><view
									v-if="!group.products.length"
									class="tf-home-state"
									>{{
										mallLoading
											? "正在加载商品…"
											: "暂无上架商品"
									}}</view
								></view
							>
						</swiper-item>
					</swiper>
					<text class="tf-home-hint"
						>左右滑动切换礼包、茶叶和茶具</text
					>
				</view></scroll-view
			><BottomNav
				active="home"
				:cart-count="cartCount"
				@select="nav"
			/> </view
	></view>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import BottomNav from "@/components/BottomNav.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import mallPage from "@/shared/mall-page.js";
import mallApi from "@/shared/mall-api.js";
export default {
	components: { StatusBar, BottomNav, TeaIcon },
	mixins: [mallPage],
	data() {
		return {
			currentGroup: 0,
			productPanelHeight: 180,
			homeConfig: null,
			configError: "",
			heroFailed: false,
			entryFailures: {},
			productFailures: {},
		};
	},
	onShow() {
		this.loadHomeConfig();
	},
	onReady() {
		this.measureProducts();
	},
	onResize() {
		this.measureProducts();
	},
	watch: {
		groups() {
			this.measureProducts();
		},
		currentGroup() {
			this.measureProducts();
		},
		productFailures: {
			deep: true,
			handler() { this.measureProducts(); },
		},
	},
	computed: {
		hero() {
			return (
				this.homeBanners[0] || {
					image: this.imageFor("longjing-hero-v2"),
					kicker: "好茶相伴",
					title: ["共享清欢"],
					subtitle: "邀请茶友，一起品好茶",
				}
			);
		},
		entries() {
			return [
				[
					"home.partner-entry",
					"城市合伙人",
					"了解合伙人计划",
					"partnerIntro",
					"longjing-dark-v2",
				],
				[
					"home.community-entry",
					"留言板",
					"与茶友分享日常",
					"community",
					"tea-gift-v2",
				],
				[
					"home.science-entry",
					"茶叶那些事",
					"认识一杯好茶",
					"teaScience",
					"longjing-hero-v2",
				],
			]
				.filter(([key]) => this.decoration(key)?.status !== "1")
				.map(([key, title, subtitle, route, image]) => ({
					key,
					title: this.decorationValue(key, "title", title),
					subtitle: this.decorationValue(key, "subtitle", subtitle),
					route:
						this.decorationValue(key, "jumpTarget", route) || route,
					image: this.decorationImage(key, this.imageFor(image)),
				}));
		},
		groups() {
			const limit = Number(this.homeConfig?.homeItemLimit || 6),
				products = this.products || [];
			return [
				{
					key: "gift",
					title: "礼包",
					products: products
						.filter((p) => Number(p.isTrialGift) === 1)
						.slice(0, limit),
				},
				{
					key: "tea",
					title: "茶叶",
					products: products
						.filter(
							(p) =>
								!Number(p.isTrialGift) &&
								this.productRoot(p) === "茶叶",
						)
						.slice(0, limit),
				},
				{
					key: "ware",
					title: "茶具",
					products: products
						.filter(
							(p) =>
								!Number(p.isTrialGift) &&
								this.productRoot(p) === "茶具",
						)
						.slice(0, limit),
				},
			];
		},
	},
	methods: {
		measureProducts() {
			this.$nextTick(() => {
				const query = uni.createSelectorQuery().in(this);
				query
					.selectAll(".tf-product-pane")
					.boundingClientRect((rects) => {
						const rect = rects?.[this.currentGroup];
						if (rect?.height)
							this.productPanelHeight =
								Math.ceil(rect.height) + 2;
					})
					.exec();
			});
		},
		async loadHomeConfig() {
			try {
				this.homeConfig = await mallApi.teaFriendConfig();
				this.configError = "";
			} catch (e) {
				this.configError = e.message || "活动配置加载失败";
			}
		},
		productRoot(product) {
			let node = this.categories.find(
				(c) => Number(c.id) === Number(product.categoryId),
			);
			const seen = new Set();
			while (node?.parentId && !seen.has(node.id)) {
				seen.add(node.id);
				node = this.categories.find(
					(c) => Number(c.id) === Number(node.parentId),
				);
			}
			return node?.name || "";
		},
	},
};
</script>
<style scoped>
.tf-sale-header > .tf-cart-entry {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 58rpx;
	min-height: 64rpx;
	padding: 0;
	flex-shrink: 0;
}
.tf-home-brand {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 20rpx;
	position: relative;
	min-height: 88rpx;
	padding: 14rpx 96rpx;
	color: #193d2e;
	font-family: var(--font-family-heading);
	font-size: 36rpx;
	text-align: center;
	flex-shrink: 0;
}
.tf-home-brand > button {
	position: absolute;
	right: 24rpx;
	top: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 64rpx;
	height: 64rpx;
	padding: 0;
	margin: 0;
	background: transparent;
}
.tf-cart-badge {
	position: absolute;
	right: 0;
	top: 0;
	min-width: 28rpx;
	height: 28rpx;
	border-radius: 20rpx;
	background: #ac6236;
	color: #fff;
	font: 20rpx/28rpx sans-serif;
	padding: 0 5rpx;
}
.tf-home-scroll {
	flex: 1 1 0%;
	height: 0;
	min-height: 0;
}
.tf-home-content {
	padding: 20rpx 24rpx 28rpx;
}
.tf-home-hero {
	position: relative;
	border-radius: 24rpx;
	overflow: hidden;
	background: #e7eadf;
}
.tf-home-hero > image {
	display: block;
	width: 100%;
	height: 350rpx;
}
.tf-home-hero-copy {
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: flex-start;
	gap: 8rpx;
	padding: 26rpx;
	color: #fff;
	text-shadow: 0 1px 4px #304a35;
	font-size: 42rpx;
}
.tf-home-hero-copy > text:first-child {
	font-size: 22rpx;
	letter-spacing: 3rpx;
}
.tf-home-hero-copy > text:nth-last-child(2) {
	font-size: 22rpx;
	max-width: 92%;
	line-height: 1.6;
}
.tf-home-hero-copy > .tf-home-hero-link {
	font-size: 23rpx;
	margin-top: 10rpx;
}
.tf-home-entries {
	display: grid;
	grid-template-columns: 1fr 1.6fr;
	gap: 16rpx;
	margin: 22rpx 0;
}
.tf-home-entry {
	position: relative;
	min-height: 120rpx;
	border-radius: 18rpx;
	overflow: hidden;
	background: #e4e9df;
}
.tf-home-entry-tall {
	grid-row: span 2;
}
.tf-home-entry > image {
	position: absolute;
	width: 100%;
	height: 100%;
	inset: 0;
}
.tf-home-entry > view {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	min-height: 120rpx;
	height: 100%;
	padding: 18rpx;
	color: #fff;
	text-align: center;
	text-shadow: 0 1px 5px #123f2a;
}
.tf-home-entry > view > text:first-child {
	font-size: 30rpx;
	font-weight: 600;
}
.tf-home-entry > view > text:last-child {
	font-size: 22rpx;
}
.tf-sale-header {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin: 22rpx 0 16rpx;
}
.tf-sale-header > text {
	flex: 1;
	font-size: 30rpx;
	color: #29533c;
}
.tf-sale-header > button {
	padding: 10rpx 0;
	margin: 0;
	font-size: 22rpx;
	line-height: 1.5;
	background: transparent;
	color: #7c857a;
}
.tf-home-tabs {
	display: flex;
	gap: 16rpx;
	margin-bottom: 18rpx;
}
.tf-home-tabs > button {
	flex: 1;
	min-width: 0;
	padding: 17rpx 8rpx;
	margin: 0;
	border: 1px solid #d8dccf;
	border-radius: 12rpx;
	font-size: 28rpx;
	line-height: 1.4;
	text-align: center;
	background: #fff;
	color: #285a40;
}
.tf-home-tabs > button.active {
	background: var(--color-primary, #07543e);
	color: #fff;
	border-color: var(--color-primary, #07543e);
}
.tf-home-products {
	width: 100%;
}
.tf-product-pane {
	height: auto;
	min-height: 0;
}
.tf-home-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 18rpx;
	padding-bottom: 12rpx;
}
.tf-home-product {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
	min-width: 0;
	padding: 0 0 20rpx;
	border: 1px solid #e5dfcf;
	border-radius: 18rpx;
	background: #fff;
	overflow: hidden;
	text-align: center;
}
.tf-home-product > image {
	width: 100%;
	height: 270rpx;
}
.tf-home-product > text {
	font-size: 27rpx;
	padding: 0 10rpx;
	line-height: 1.5;
}
.tf-home-hint {
	display: block;
	text-align: center;
	color: #999;
	font-size: 21rpx;
	margin-top: 16rpx;
}
.tf-home-state {
	padding: 50rpx 20rpx;
	text-align: center;
	color: #888;
	font-size: 26rpx;
	line-height: 1.7;
}
.tf-image-note {
	position: absolute;
	left: 12rpx;
	bottom: 10rpx;
	font-size: 20rpx;
	color: #fff;
	background: #555;
	padding: 8rpx;
}
.tf-home-product > .tf-product-image-error {
	font-size: 22rpx;
	color: #986c43;
}
</style>
