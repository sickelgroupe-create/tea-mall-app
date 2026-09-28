import { goPage, backPage, navPage } from "./router.js";
import mallApi from "./mall-api.js";
import { MALL_ORIGIN, staticImageUrl } from "./image-assets.js";
import { moneyText } from "./money.js";
import { imageDiagnostic } from "./build-info.js";

const remoteImage = (name) => staticImageUrl(name);

const imageMap = {
	"login-art-v2": remoteImage("login-art-v2.webp"),
	biluochun: remoteImage("biluochun.jpg"),
	"blacktea-orange": remoteImage("blacktea-orange.jpg"),
	"blacktea-red": remoteImage("blacktea-red.jpg"),
	"canvas-tote": remoteImage("canvas-tote.jpg"),
	"longjing-dark": remoteImage("longjing-dark.jpg"),
	"longjing-pale": remoteImage("longjing-pale.jpg"),
	"longjing-dark-v2": remoteImage("longjing-dark-v2.webp"),
	"longjing-hero-v2": remoteImage("longjing-hero-v2.webp"),
	"maofeng-pouch": remoteImage("maofeng-pouch.jpg"),
	"porcelain-cup": remoteImage("porcelain-cup.jpg"),
	"tea-gift": remoteImage("tea-gift-v2.webp"),
	"tea-gift-v2": remoteImage("tea-gift-v2.webp"),
	"oolong-category-v1": remoteImage("oolong-category-v1.webp"),
	"white-tea-category-v1": remoteImage("white-tea-category-v1.webp"),
	"puer-category-v1": remoteImage("puer-category-v1.webp"),
	"travel-set": remoteImage("travel-set.jpg"),
	"wood-tray": remoteImage("wood-tray.jpg"),
	"yixing-pot": remoteImage("yixing-pot.jpg"),
};

function defaultHomeBanners() {
	return [
		{
			id: "exchange-center-fallback",
			image: staticImageUrl("longjing-hero-v2.webp"),
			kicker: "新品臻享",
			title: ["春日好茶", "限时甄选"],
			subtitle: "西湖产区当季鲜采，茶香清雅，回甘悠长。",
			target: "exchangeCenter",
		},
	];
}

const emptyProduct = Object.freeze({
	id: null,
	name: "",
	short: "",
	spec: "",
	price: 0,
	category: "",
	reward: 0,
	stock: 0,
	image: "",
	gallery: [],
	detailImages: [],
	rating: null,
	reviewCount: 0,
});
export default {
	data() {
		return {
			visualAudit: false,
			visualAuditWidth: 448,
			visualAuditOffset: 0,
			customer: { id: null, nickname: "游客", phone: "", points: 0 },
			authenticated: false,
			// 正式环境由服务端会话决定登录态；访客会话仅保留公开浏览和独立购物车上下文。
			testMode: false,
			testPaymentEnabled: false,
			authReady: false,
			mallLoading: false,
			distribution: null,
			afterSaleRecords: [],
			serviceTickets: [],
			serviceCategory: "订单咨询",
			serviceMessage: "",
			serviceContact: "",
			serviceSubmitting: false,
			exchangeMonthUsed: 0,
			withdrawalOpen: false,
			withdrawAmount: "",
			withdrawAccountType: "微信",
			withdrawAccount: "",
			refCode: uni.getStorageSync("teaReferralCode") || "",
			backendReady: false,
			pageQuery: {},
			screen: "home",
			history: [],
			phone: "",
			loginPassword: "",
			authMode: "login",
			authSubmitting: false,
			agreed: false,
			protocolPanel: "",
			wechatBindingOpen: false,
			wechatBindingMode: "register",
			wechatTicket: "",
			wechatNickname: "微信茶友",
			searchQuery: "",
			searchSort: "综合",
			priceAscending: true,
			priceFilter: "",
			filterOpen: false,
			categoryIndex: 0,
			listingCategory: "",
			orderTabIndex: 0,
			orderSearchOpen: false,
			orderSearchQuery: "",
			cartCount: 0,
			editCart: false,
			couponOpen: false,
			couponTab: 0,
			checkoutCoupons: [],
			selectedCouponId: null,
			managedDocuments: [],
			favoriteTab: 0,
			messageTab: 0,
			usePoints: false,
			checkoutPanel: "",
			deliveryMethod: "顺丰快递（免运费）",
			invoiceType: "暂不开票",
			invoiceTitle: "",
			taxId: "",
			orderRemark: "",
			orderSubmitting: false,
			checkoutQuoteLoading: false,
			directCheckoutItems: [],
			paymentSubmitting: false,
			orderActionSubmittingNo: "",
			selectedSpec: "",
			selectedSkuId: null,
			productQty: 1,
			catalogProducts: [],
			catalogLoaded: false,
			catalogLoading: false,
			catalogError: "",
			searchTotal: 0,
			catalogPage: 1,
			catalogPageSize: 50,
			catalogLoadingMore: false,
			topics: [],
			selectedTopic: null,
			store: null,
			cartUpdatingSkuId: null,
			pointsTab: 0,
			pointsCategory: 0,
			inviteTab: 0,
			settingsPrefs: {
				orderNotice: true,
				activityNotice: false,
				personalized: true,
				historyEnabled: true,
			},
			localNickname: "",
			localPhone: "",
			newPhone: "",
			phoneChangeCode: "",
			phoneChangeCountdown: 0,
			phoneChangeSubmitting: false,
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
			expandedFaq: -1,
			afterSaleReason: "商品与描述不符",
			afterSaleReasonIndex: 0,
			afterSaleReasons: [
				"商品与描述不符",
				"商品破损或缺件",
				"商品质量问题",
				"少件或漏发",
				"物流配送异常",
				"不喜欢或不想要",
				"其他原因",
			],
			checkedIn: false,
			showAddressForm: false,
			editingAddressIndex: -1,
			addressSelectMode: false,
			addressPurpose: "checkout",
			selectedAddressId: null,
			addressForm: {
				name: "",
				phone: "",
				region: "",
				detail: "",
				isDefault: false,
			},
			exchangeQty: 1,
			exchangeSuccess: false,
			exchanges: [],
			reviews: [],
			reviewTarget: null,
			reviewRating: 5,
			reviewContent: "",
			reviewError: "",
			reviewSubmitting: false,
			afterSaleActive: null,
			servicePanel: "",
			browseHistoryIds: uni.getStorageSync("teaBrowseHistory") || [],
			productPanel: "",
			homeBannerIndex: 0,
			detailGalleryIndex: 0,
			selectedOrderNo: "",
			toastText: "",
			products: [],
			pageDecorations: {},
			selectedProduct: { ...emptyProduct },
			homeBanners: defaultHomeBanners(),
			favoriteProducts: [],
			favoriteStores: [],
			favoriteTopics: [],
			notifications: [],
			categories: [],
			categoryNames: ["全部"],
			cartItems: [],
			orders: [],
			logistics: [],
			aftersales: [
				{
					icon: "wallet",
					title: "退款",
					desc: "未收到货，或与商家协商同意退款",
				},
				{
					icon: "package",
					title: "退货退款",
					desc: "已收到货，需要退回已收到的商品",
				},
				{
					icon: "refresh",
					title: "换货",
					desc: "已收到货，需要更换其他商品",
				},
			],
			pointsProducts: [],
			selectedExchange: {
				id: null,
				name: "",
				points: 0,
				stockCount: 0,
				stock: "",
				image: "",
			},
			exchangeRequestId: "",
			exchangeSubmitting: false,
			pointsDomainLoading: false,
			pointsDomainError: "",
			pointsLedger: null,
			pendingPoints: null,
			debtPoints: null,
			consumptionRule: null,
			pointsTiers: [],
			pointsRewardDetails: [],
			selectedTier: null,
			selectedExchangeOrder: null,
			pointsActionId: "",
			tasks: [
				{
					icon: "cart",
					title: "完成下单",
					desc: "订单完成后按实付金额发放",
					points: "按当前消费积分规则计算",
					action: "去完成",
					screen: "home",
				},
				{
					icon: "service",
					title: "评价商品",
					desc: "每成功评价1次",
					points: "+10 积分",
					action: "去评价",
					screen: "orders",
				},
			],
			pointLogs: [],
			mineMenus: [
				{ icon: "location", title: "收货地址", screen: "addresses" },
				{ icon: "heart", title: "我的收藏", screen: "favorites" },
				{ icon: "clock", title: "浏览记录", screen: "history" },
				{ icon: "ticket", title: "优惠券", screen: "coupons" },
				{
					icon: "headset",
					title: "客服中心",
					screen: "settings",
					panel: "在线客服",
				},
				{ icon: "settings", title: "设置", screen: "settings" },
			],
			addresses: [],
			settings: [
				{ icon: "user", title: "个人资料" },
				{ icon: "shield", title: "账号与安全" },
				{ icon: "bell", title: "消息通知" },
				{ icon: "lock", title: "隐私设置" },
				{ icon: "lock", title: "隐私政策" },
				{ icon: "clipboard", title: "用户协议" },
				{ icon: "info", title: "关于我们" },
			],
			helps: [
				{ icon: "headset", title: "在线客服" },
				{ icon: "help", title: "常见问题" },
				{ icon: "message", title: "意见反馈" },
				{ icon: "clipboard", title: "订单售后" },
			],
			inviteRecords: [],
			rewardSteps: [],
		};
	},
	onLoad(query = {}) {
		// H5 直接刷新 hash 深链时，部分 uni-app 运行时传入的 query 为空。
		// 在页面初始化时把可见 hash 中的 id 固化到普通对象，后续异步数据
		// 到达后仍可恢复商品/积分奖品，避免只能从列表点击进入详情。
		let routeId = query.id;
		if (!routeId && typeof location !== "undefined") {
			const matched = String(location.hash || "").match(/[?&]id=([^&]+)/);
			if (matched) routeId = decodeURIComponent(matched[1]);
		}
		this.pageQuery = routeId ? { ...query, id: routeId } : { ...query };
		this.visualAudit = String(this.pageQuery.visualAudit || "") === "1";
		const requestedAuditWidth = Number(this.pageQuery.auditWidth || 448);
		this.visualAuditWidth = [320, 360, 375, 390, 414, 430, 448].includes(
			requestedAuditWidth,
		)
			? requestedAuditWidth
			: 448;
		this.visualAuditOffset = Math.max(
			0,
			Math.min(769, Number(query.auditOffset || 0) || 0),
		);
		if (this.pageQuery.scene || this.pageQuery.ref) {
			this.refCode = decodeURIComponent(
				String(this.pageQuery.scene || this.pageQuery.ref),
			);
			uni.setStorageSync("teaReferralCode", this.refCode);
		}
		this.applyPageQuery(this.pageQuery);
		this.loadMallData();
	},
	onShow() {
		// 页面从地址管理返回时必须重新读取服务端数据，避免确认订单仍使用旧地址。
		if (this.authReady && !this.mallLoading) this.loadMallData();
	},
	computed: {
		visualAuditStyle() {
			return this.visualAudit
				? `--catalog-audit-width:${this.visualAuditWidth}px;--catalog-audit-offset:${this.visualAuditOffset}px`
				: "";
		},
		selectedSku() {
			const skus = (this.selectedProduct?.skus || []).filter(
				(item) => String(item.status) === "0",
			);
			return (
				skus.find(
					(item) => Number(item.skuId) === Number(this.selectedSkuId),
				) ||
				skus.find((item) => Number(item.isDefault) === 1) ||
				skus[0] ||
				null
			);
		},
		displayProductPrice() {
			return Number(
				this.selectedSku?.price ?? this.selectedProduct?.price ?? 0,
			);
		},
		productGallery() {
			const product = this.selectedProduct || emptyProduct;
			return [
				...new Set(
					[product.image, ...(product.gallery || [])].filter(Boolean),
				),
			].slice(0, 8);
		},
		homeFeaturedProducts() {
			return this.products.slice(0, 2);
		},
		homeCategories() {
			return this.categories.filter(
				(category) =>
					category.status === "0" &&
					Number(category.productCount || 0) > 0,
			);
		},
		originProducts() {
			const rows = [];
			for (const product of this.categoryProducts) {
				const name = String(product.origin || "").trim();
				if (name && !rows.some((item) => item.name === name))
					rows.push({ name, product });
				if (rows.length >= 3) break;
			}
			return rows;
		},
		storeRating() {
			const total = this.products.reduce(
				(sum, item) => sum + Number(item.reviewCount || 0),
				0,
			);
			if (!total) return null;
			const score = this.products.reduce(
				(sum, item) =>
					sum +
					Number(item.rating || 0) * Number(item.reviewCount || 0),
				0,
			);
			return (score / total).toFixed(1);
		},
		categoryProducts() {
			const category = this.categoryNames[this.categoryIndex];
			if (!category || category === "全部") return this.products;
			return this.products.filter((product) =>
				String(product.category || product.name || "").includes(
					category,
				),
			);
		},
		filteredProducts() {
			const q = this.searchQuery.trim();
			let result = this.catalogLoaded
				? this.catalogProducts
				: this.products;
			if (!this.catalogLoaded && q)
				result = result.filter(
					(p) => p.name.includes(q) || p.short.includes(q),
				);
			if (this.priceFilter === "low") {
				result = result.filter((product) => product.price < 200);
			} else if (this.priceFilter === "mid") {
				result = result.filter(
					(product) => product.price >= 200 && product.price < 400,
				);
			} else if (this.priceFilter === "high") {
				result = result.filter((product) => product.price >= 400);
			}
			if (this.searchSort === "价格") {
				result = [...result].sort((a, b) =>
					this.priceAscending ? a.price - b.price : b.price - a.price,
				);
			} else if (this.searchSort === "销量") {
				result = [...result].sort(
					(a, b) => Number(b.sales || 0) - Number(a.sales || 0),
				);
			}
			return result;
		},
		listingTitle() {
			return this.listingCategory || "全部茶品";
		},
		listingProducts() {
			const rows = this.filteredProducts;
			if (this.catalogLoaded) return rows;
			if (!this.listingCategory || this.listingCategory === "全部")
				return rows;
			return rows.filter((product) =>
				String(product.category || product.name || "").includes(
					this.listingCategory,
				),
			);
		},
		cartTotal() {
			return this.checkoutItems.reduce(
				(sum, i) => sum + i.price * i.qty,
				0,
			);
		},
		checkoutItems() {
			return this.directCheckoutItems.length
				? this.directCheckoutItems
				: this.cartItems.filter((item) => item.checked);
		},
		hasCheckoutItems() {
			return this.checkoutItems.length > 0 && this.cartTotal > 0;
		},
		cartPoints() {
			return Math.floor(Number(this.checkoutPayable || 0) * 10);
		},
		allCartChecked() {
			return (
				this.cartItems.length > 0 &&
				this.cartItems.every((item) => item.checked)
			);
		},
		filteredOrders() {
			const statuses = ["", "待付款", "待发货", "待收货"];
			let result = this.orders;
			if (this.orderTabIndex === 4) {
				const aftersaleOrderNos = new Set(
					this.afterSaleRecords.map((item) =>
						String(item.orderNo || ""),
					),
				);
				result = this.orders.filter(
					(order) =>
						order.status === "售后中" ||
						aftersaleOrderNos.has(String(order.no)),
				);
			} else if (statuses[this.orderTabIndex]) {
				result = this.orders.filter(
					(order) => order.status === statuses[this.orderTabIndex],
				);
			}
			const keyword = this.orderSearchQuery.trim().toLowerCase();
			if (keyword) {
				result = result.filter(
					(order) =>
						String(order.no).toLowerCase().includes(keyword) ||
						String(order.name || "")
							.toLowerCase()
							.includes(keyword) ||
						(order.items || []).some((item) =>
							String(item.name || "")
								.toLowerCase()
								.includes(keyword),
						),
				);
			}
			return result;
		},
		selectedOrder() {
			if (this.selectedOrderNo)
				return (
					this.orders.find(
						(order) => order.no === this.selectedOrderNo,
					) || null
				);
			const pages =
				typeof getCurrentPages === "function" ? getCurrentPages() : [];
			const route = pages.slice(-1)[0]?.route || "";
			if (
				[
					"pages/pay-success/pay-success",
					"pages/pay-failure/pay-failure",
					"pages/order-detail/order-detail",
					"pages/logistics/logistics",
				].includes(route)
			)
				return null;
			return this.orders[0] || null;
		},
		selectedAftersale() {
			const orderNo = String(
				this.selectedOrder?.no || this.selectedOrderNo || "",
			);
			return (
				this.afterSaleRecords.find(
					(item) => String(item.orderNo) === orderNo,
				) || null
			);
		},
		selectedProductReviews() {
			return this.reviews.filter(
				(item) =>
					Number(item.productId) === Number(this.selectedProduct?.id),
			);
		},
		filteredPointLogs() {
			if (this.pointsTab === 1)
				return this.pointLogs.filter((item) => Number(item.amount) > 0);
			if (this.pointsTab === 2)
				return this.pointLogs.filter((item) => Number(item.amount) < 0);
			return this.pointLogs;
		},
		filteredInviteRecords() {
			if (this.inviteTab === 1)
				return this.inviteRecords.filter(
					(item) => item.status === "待下单",
				);
			if (this.inviteTab === 2)
				return this.inviteRecords.filter((item) =>
					item.status.includes("完成"),
				);
			return this.inviteRecords;
		},
		inviteCompletedCount() {
			return this.inviteRecords.filter((item) =>
				item.status.includes("完成"),
			).length;
		},
		inviteRewardTotal() {
			return this.inviteRecords.reduce(
				(sum, item) => sum + Number(item.points || 0),
				0,
			);
		},
		filteredPointsProducts() {
			if (this.pointsCategory === 0) return this.pointsProducts;
			return this.pointsProducts.filter((item) => {
				const name = String(item.name || "");
				const category = String(item.category || "");
				const selected = ["精选", "茶叶", "茶具", "周边"][
					this.pointsCategory
				];
				if (category === selected) return true;
				if (this.pointsCategory === 2)
					return /杯|壶|茶盘|茶具/.test(name);
				if (this.pointsCategory === 3) return /帆布|周边|袋/.test(name);
				return /茶(?!具|盘)/.test(name);
			});
		},
		isFavorite() {
			return (
				Boolean(this.selectedProduct?.id) &&
				this.favoriteProducts.some(
					(item) =>
						Number(item.id) === Number(this.selectedProduct.id),
				)
			);
		},
		isTopicFavorite() {
			return (
				Boolean(this.selectedTopic?.id) &&
				this.favoriteTopics.some(
					(item) => Number(item.id) === Number(this.selectedTopic.id),
				)
			);
		},
		isTeaWare() {
			return /茶具|壶|杯|茶盘/.test(
				String(
					this.selectedProduct.category ||
						this.selectedProduct.name ||
						"",
				),
			);
		},
		exchangeProfile() {
			const name = String(this.selectedExchange.name || "");
			if (/杯/.test(name))
				return {
					subtitle: "高温瓷质 · 温润易洁 · 独立防震包装",
					facts: [
						["材质", "高温瓷"],
						["容量", "约180ml"],
						["包装", "独立防震礼盒"],
					],
				};
			if (/旅行|茶具/.test(name))
				return {
					subtitle: "便携收纳 · 一套齐备 · 适合旅行办公",
					facts: [
						["品类", "便携茶具套装"],
						["适用", "旅行 / 办公"],
						["包装", "便携收纳包"],
					],
				};
			if (/帆布|袋/.test(name))
				return {
					subtitle: "耐用帆布 · 日常通勤 · 茶山主题设计",
					facts: [
						["材质", "加厚帆布"],
						["用途", "日常收纳"],
						["包装", "环保简装"],
					],
				};
			if (/茶盘/.test(name))
				return {
					subtitle: "木质茶盘 · 简约实用 · 日常茶席适用",
					facts: [
						["材质", "木质"],
						["用途", "茶席承托"],
						["养护", "避免长时间浸水"],
					],
				};
			return {
				subtitle: "精选茶礼 · 积分专享 · 仓库妥善包装",
				facts: [
					["品类", "茶叶 / 茶礼"],
					["储存", "密封、避光、干燥"],
					["包装", "防潮包装"],
				],
			};
		},
		selectedCartQty() {
			return this.cartItems
				.filter((item) => item.checked)
				.reduce((sum, item) => sum + Number(item.qty || 0), 0);
		},
		exchangeRemaining() {
			const used = this.exchanges
				.filter(
					(item) =>
						Number(item.rewardId) ===
							Number(this.selectedExchange?.id) &&
						item.status !== "已取消",
				)
				.reduce((sum, item) => sum + Number(item.qty || 0), 0);
			return Math.max(
				0,
				Number(this.selectedExchange?.limitQty || 1) - used,
			);
		},
		selectedAddress() {
			if (!this.addresses.length) return null;
			return (
				this.addresses.find(
					(item) =>
						Number(item.id) === Number(this.selectedAddressId),
				) ||
				this.addresses.find((item) => Boolean(item.isDefault)) ||
				this.addresses[0]
			);
		},
		hasCompleteAddress() {
			const address = this.selectedAddress;
			return Boolean(
				address?.id &&
				String(address.name || "").trim() &&
				/^1\d{10}$/.test(String(address.phone || "").trim()) &&
				String(address.line1 || "").trim() &&
				String(address.line2 || "").trim(),
			);
		},
		canExchange() {
			const cost =
				Number(this.selectedExchange?.points || 0) *
				Number(this.exchangeQty || 0);
			return (
				this.authenticated &&
				this.exchangeQty >= 1 &&
				this.exchangeQty <= this.exchangeRemaining &&
				Number(this.selectedExchange?.stockCount || 0) >=
					this.exchangeQty &&
				Number(this.customer?.points || 0) >= cost &&
				this.hasCompleteAddress
			);
		},
		availablePointsDiscount() {
			const byBalance = Number(this.customer?.points || 0) / 100;
			const orderCap = Number(this.cartTotal || 0) * 0.2;
			return (
				Math.floor(
					Math.max(
						0,
						Math.min(
							byBalance,
							orderCap,
							Number(this.cartTotal || 0),
						),
					) * 100,
				) / 100
			);
		},
		pointsToUse() {
			return Math.round(this.availablePointsDiscount * 100);
		},
		checkoutPayable() {
			const coupon = this.checkoutCoupons.find(
				(item) => Number(item.id) === Number(this.selectedCouponId),
			);
			const couponDiscount = coupon
				? Math.min(
						Number(coupon.discountAmount || 0),
						Number(this.cartTotal || 0),
					)
				: 0;
			return Math.max(
				0,
				Number(this.cartTotal || 0) -
					couponDiscount -
					(this.usePoints ? this.availablePointsDiscount : 0),
			);
		},
		canWithdraw() {
			return Number(this.distribution?.balance || 0) >= 10;
		},
		historyProducts() {
			return this.browseHistoryIds
				.map((id) =>
					this.products.find(
						(item) => Number(item.id) === Number(id),
					),
				)
				.filter(Boolean);
		},
		recommendedProducts() {
			if (!this.settingsPrefs.personalized)
				return this.products.slice(0, 4);
			const preferredIds = [
				...this.browseHistoryIds,
				...this.favoriteProducts.map((item) => item.id),
			];
			const preferred = preferredIds
				.map((id) =>
					this.products.find(
						(item) => Number(item.id) === Number(id),
					),
				)
				.filter(Boolean);
			return [
				...new Map(
					[...preferred, ...this.products].map((item) => [
						Number(item.id),
						item,
					]),
				).values(),
			].slice(0, 4);
		},
		notificationItems() {
			const categories = ["全部", "订单", "活动", "系统"];
			const selected = categories[this.messageTab] || "全部";
			return this.notifications
				.filter(
					(item) => selected === "全部" || item.category === selected,
				)
				.map((item) => {
					const params = {};
					String(item.targetQuery || "")
						.split("&")
						.filter(Boolean)
						.forEach((pair) => {
							const [key, value = ""] = pair.split("=");
							params[decodeURIComponent(key)] =
								decodeURIComponent(value);
						});
					if (params.orderNo && !params.no)
						params.no = params.orderNo;
					return {
						...item,
						key: `notification-${item.id}`,
						icon:
							item.category === "订单"
								? "package"
								: item.category === "活动"
									? "gift"
									: "message",
						desc: item.content,
						time: String(item.createTime || "").slice(0, 16),
						screen: item.targetRoute,
						params,
						unread: Number(item.readStatus) === 0,
					};
				});
		},
	},
	methods: {
		aftersalesForOrder(order) {
			const orderNo = String(order?.no || order?.orderNo || "");
			const detailRows = Array.isArray(order?.aftersales)
				? order.aftersales
				: [];
			const bootstrapRows = this.afterSaleRecords.filter(
				(item) => String(item.orderNo || "") === orderNo,
			);
			const rows = [...detailRows, ...bootstrapRows];
			return rows.filter(
				(item, index) =>
					rows.findIndex(
						(other) =>
							String(other.aftersaleNo || "") ===
							String(item.aftersaleNo || ""),
					) === index,
			);
		},
		aftersalesForOrderItem(order, item) {
			const rows = this.aftersalesForOrder(order);
			const orderItemId = Number(item?.orderItemId || 0);
			if (!orderItemId) return rows;
			return rows.filter(
				(record) => Number(record.orderItemId || 0) === orderItemId,
			);
		},
		resetAuthenticatedView() {
			this.authenticated = false;
			this.customer = {
				id: null,
				nickname: "游客",
				phone: "",
				points: 0,
			};
			this.orders = [];
			this.cartItems = [];
			this.addresses = [];
			this.favoriteProducts = [];
			this.favoriteStores = [];
			this.favoriteTopics = [];
			this.pointLogs = [];
			this.afterSaleRecords = [];
			this.serviceTickets = [];
			this.exchanges = [];
			this.notifications = [];
			this.distribution = null;
			this.accountDashboard = null;
			this.accountCoupons = [];
			this.availableCoupons = [];
			this.checkoutCoupons = [];
			this.selectedCouponId = null;
			this.cartCount = 0;
		},
		onHomeBannerChange(event) {
			this.homeBannerIndex = Number(event?.detail?.current || 0);
		},
		onDetailGalleryChange(event) {
			this.detailGalleryIndex = Number(event?.detail?.current || 0);
		},
		openHomeBanner(banner) {
			if (banner.target) return this.go(banner.target);
			if (banner.slug) return this.go("homeTopic", { slug: banner.slug });
			if (banner.productId) {
				const product = this.products.find(
					(item) => Number(item.id) === Number(banner.productId),
				);
				if (product) return this.openProduct(product);
			}
			this.go(banner.target || "productList");
		},
		openCategory(category) {
			if (
				!category ||
				category.status === "2" ||
				Number(category.productCount || 0) <= 0
			) {
				this.toast(`${category?.name || "该分类"}即将上线`);
				return;
			}
			this.go(category.screen || "productList", {
				category: category.name,
			});
		},
		imageFor(key, fallback) {
			const normalizeUrl = (value) => {
				const text = String(value || "");
				if (text.startsWith(`${MALL_ORIGIN}/static/images/`))
					return staticImageUrl(text);
				if (/^https?:\/\//i.test(text)) return text;
				if (text.startsWith("/profile/"))
					return `${MALL_ORIGIN}/api${text}`;
				if (text.startsWith("/static/images/"))
					return staticImageUrl(text);
				return text;
			};
			const normalizedKey = normalizeUrl(key);
			if (
				/^https?:\/\//i.test(normalizedKey) ||
				normalizedKey.startsWith("/")
			)
				return normalizedKey;
			const normalizedFallback = normalizeUrl(fallback);
			return (
				imageMap[normalizedKey] ||
				imageMap[normalizedFallback] ||
				staticImageUrl(normalizedFallback) ||
				""
			);
		},
		onImageLoad(label, rawSrc, resolvedSrc, event) {
			return imageDiagnostic("LOAD", label, rawSrc, resolvedSrc, event);
		},
		onImageError(label, rawSrc, resolvedSrc, event) {
			return imageDiagnostic("ERROR", label, rawSrc, resolvedSrc, event);
		},
		decoration(moduleKey) {
			return this.pageDecorations[moduleKey] || null;
		},
		decorationValue(moduleKey, field, fallback = "") {
			const module = this.decoration(moduleKey);
			const value = module?.config?.[field] ?? module?.[field];
			return value === null || value === undefined || value === ""
				? fallback
				: value;
		},
		decorationImage(moduleKey, fallback = "longjing-dark-v2.webp") {
			return this.imageFor(
				this.decoration(moduleKey)?.imageUrl,
				fallback,
			);
		},
		normalizeProduct(product) {
			const galleryKeys = Array.isArray(product.galleryImages)
				? product.galleryImages
				: String(product.galleryImages || "")
						.split(/[\n,]/)
						.map((item) => item.trim())
						.filter(Boolean);
			const detailKeys = Array.isArray(product.detailImages)
				? product.detailImages
				: String(product.detailImages || "")
						.split(/[\n,]/)
						.map((item) => item.trim())
						.filter(Boolean);
			const skus = (Array.isArray(product.skus) ? product.skus : []).map(
				(sku) => ({
					...sku,
					skuId: Number(sku.skuId),
					price: Number(sku.price || 0),
					stock: Number(sku.stock || 0),
					isDefault: Number(sku.isDefault || 0),
				}),
			);
			return {
				...product,
				id: Number(product.id),
				short: product.shortName || product.short || product.name,
				price: Number(product.price || 0),
				reward: Number(product.reward || 0),
				stock: Number(product.stock || 0),
				image:
					this.imageFor(product.imageKey, product.image) ||
					staticImageUrl("longjing-dark-v2.webp"),
				gallery: galleryKeys
					.map((key) => this.imageFor(key))
					.filter(Boolean),
				detailImages: detailKeys
					.map((key) => this.imageFor(key))
					.filter(Boolean),
				rating:
					Number(product.reviewCount || 0) > 0
						? Number(product.rating || 0)
						: null,
				reviewCount: Number(product.reviewCount || 0),
				skus,
				defaultSkuId:
					Number(
						product.defaultSkuId ||
							skus.find((sku) => sku.isDefault === 1)?.skuId ||
							skus[0]?.skuId ||
							0,
					) || null,
			};
		},
		normalizeTopic(topic) {
			if (!topic) return null;
			return {
				...topic,
				heroImage:
					this.imageFor(topic.heroImageUrl) ||
					staticImageUrl("longjing-hero-v2.webp"),
				storyImage:
					this.imageFor(topic.storyImageUrl) ||
					staticImageUrl("longjing-dark-v2.webp"),
				products: (topic.products || []).map((item) =>
					this.normalizeProduct(item),
				),
			};
		},
		normalizeStore(store) {
			if (!store) return null;
			return {
				...store,
				id: Number(store.id || 1),
				logo: this.imageFor(store.logoUrl),
				heroImage:
					this.imageFor(store.heroImageUrl) ||
					staticImageUrl("longjing-dark-v2.webp"),
				followed: Boolean(store.followed),
				products: (store.products || []).map((item) =>
					this.normalizeProduct(item),
				),
			};
		},
		normalizeOrder(order) {
			if (!order) return null;
			const items = (order.items || []).map((item) => ({
				...item,
				price: Number(item.price || 0),
				qty: Number(item.qty || 1),
				image:
					this.imageFor(item.imageKey, item.image || item.imageUrl) ||
					staticImageUrl("longjing-dark-v2.webp"),
			}));
			return {
				...order,
				no: String(order.no || order.orderNo || ""),
				items,
				price: Number(order.price || items[0]?.price || 0),
				paidAmount: Number(order.paidAmount ?? order.totalAmount ?? 0),
				image: this.imageFor(
					order.imageKey || items[0]?.imageKey,
					order.image || items[0]?.image,
				),
				isTestOrder:
					order.isTestOrder === true ||
					Number(order.isTestOrder) === 1,
			};
		},
		mergeOrder(order) {
			const normalized = this.normalizeOrder(order);
			if (!normalized?.no) return null;
			const index = this.orders.findIndex(
				(item) => String(item.no) === normalized.no,
			);
			if (index >= 0)
				this.orders.splice(index, 1, {
					...this.orders[index],
					...normalized,
				});
			else this.orders.unshift(normalized);
			this.selectedOrderNo = normalized.no;
			return this.orders.find((item) => item.no === normalized.no);
		},
		async loadSelectedOrder() {
			if (!this.selectedOrderNo || !this.authenticated) return null;
			const detail = await mallApi.orderDetail(this.selectedOrderNo);
			return this.mergeOrder(detail);
		},
		applyPageQuery(query = {}) {
			// H5在直接刷新hash路由时，部分运行时不会把查询串重新传给onLoad；
			// 从可见路由补取id，保证兑换详情深链和刷新都能恢复真实商品。
			let routeId = query.id;
			if (!routeId && typeof location !== "undefined") {
				const matched = String(location.hash || "").match(
					/[?&]id=([^&]+)/,
				);
				if (matched) routeId = decodeURIComponent(matched[1]);
			}
			const id = Number(routeId);
			const buyNowId = Number(query.buyNow);
			const buyNowQty = Math.max(1, Math.min(99, Number(query.qty) || 1));
			this.addressSelectMode = String(query.select || "") === "1";
			this.addressPurpose = query.purpose
				? decodeURIComponent(String(query.purpose))
				: "checkout";
			if (query.selected)
				this.selectedAddressId = Number(query.selected) || null;
			if (query.category) {
				this.listingCategory = decodeURIComponent(
					String(query.category),
				);
				const categoryIndex = this.categoryNames.indexOf(
					this.listingCategory,
				);
				if (categoryIndex >= 0) this.categoryIndex = categoryIndex;
			}
			if (query.keyword)
				this.searchQuery = decodeURIComponent(String(query.keyword));
			if (query.skuId) this.selectedSkuId = Number(query.skuId) || null;
			if (query.tab !== undefined && query.tab !== "") {
				this.orderTabIndex = Math.max(
					0,
					Math.min(4, Number(query.tab) || 0),
				);
			}
			if (query.panel)
				this.servicePanel = decodeURIComponent(String(query.panel));
			if (query.no) {
				this.selectedOrderNo = String(query.no);
			}
			if (
				id &&
				this.products.some((product) => Number(product.id) === id)
			) {
				this.selectedProduct = this.products.find(
					(product) => Number(product.id) === id,
				);
				this.selectedSkuId =
					this.selectedSkuId || this.selectedProduct.defaultSkuId;
				this.selectedSpec =
					this.selectedSku?.spec || this.selectedProduct.spec;
			}
			if (
				id &&
				this.pointsProducts.some((product) => Number(product.id) === id)
			) {
				this.selectedExchange = this.pointsProducts.find(
					(product) => Number(product.id) === id,
				);
			}
			if (buyNowId) {
				const pendingProduct =
					this.cartItems.find(
						(product) =>
							Number(product.id) === buyNowId &&
							(!query.skuId ||
								Number(product.skuId) === Number(query.skuId)),
					) ||
					this.products.find(
						(product) => Number(product.id) === buyNowId,
					);
				if (pendingProduct) {
					const sku = (pendingProduct.skus || []).find(
						(item) => Number(item.skuId) === Number(query.skuId),
					);
					this.directCheckoutItems = [
						{
							...pendingProduct,
							skuId: Number(query.skuId || sku?.skuId),
							spec: sku?.spec || pendingProduct.spec,
							price: Number(sku?.price ?? pendingProduct.price),
							stock: Number(sku?.stock ?? pendingProduct.stock),
							qty: buyNowQty,
							checked: true,
						},
					];
				}
			}
		},
		async loadMallData() {
			if (this.mallLoading) return;
			const activePages =
				typeof getCurrentPages === "function" ? getCurrentPages() : [];
			const hashRoute =
				typeof location !== "undefined"
					? String(location.hash || "").match(
							/^#\/(pages\/[^?]+)/,
						)?.[1] || ""
					: "";
			const currentRoute = activePages.slice(-1)[0]?.route || hashRoute;
			const loginRoute = "pages/login/login";
			const localSession = uni.getStorageSync("teaSession");
			if (
				currentRoute &&
				currentRoute !== loginRoute &&
				!Boolean(localSession?.authenticated)
			) {
				this.authReady = true;
				this.resetAuthenticatedView();
				uni.reLaunch({ url: "/pages/login/login" });
				return;
			}
			this.mallLoading = true;
			try {
				const data = await mallApi.bootstrap();
				this.catalogError = "";
				this.pageDecorations = Object.fromEntries(
					(data.pageDecorations || []).map((item) => [
						item.moduleKey,
						item,
					]),
				);
				this.testMode = Boolean(data.testMode);
				this.testPaymentEnabled = Boolean(data.testPaymentEnabled);
				this.authenticated =
					Boolean(data.authenticated) &&
					!Boolean(data.sessionExpired);
				if (
					!this.authenticated &&
					currentRoute &&
					currentRoute !== loginRoute
				) {
					this.authReady = true;
					this.resetAuthenticatedView();
					uni.reLaunch({ url: "/pages/login/login" });
					return;
				}
				// Active login/register flows own their final navigation. The bootstrap
				// redirect is only for opening the login page with an existing session.
				if (this.authenticated && currentRoute === loginRoute && !this.authSubmitting) {
					this.authReady = true;
					uni.reLaunch({ url: "/pages/index/index" });
					return;
				}
				if (data.sessionExpired) {
					mallApi.clearAuthentication();
					this.resetAuthenticatedView();
				}
				this.customer = (this.authenticated && data.customer) || {
					id: null,
					nickname: "游客",
					phone: "",
					points: 0,
				};
				this.localNickname = this.customer.nickname || "茶友";
				this.localPhone = this.customer.phone || "";
				const savedPrefs = uni.getStorageSync("teaSettingsPrefs");
				if (savedPrefs && typeof savedPrefs === "object")
					this.settingsPrefs = {
						...this.settingsPrefs,
						...savedPrefs,
					};
				this.products = Array.isArray(data.products)
					? data.products.map((item) => this.normalizeProduct(item))
					: [];
				this.topics = (data.topics || []).map((topic) =>
					this.normalizeTopic(topic),
				);
				const exchangeEntry =
					this.pageDecorations["home.exchange-center"];
				const exchangeTitle = this.decorationValue(
					"home.exchange-center",
					"title",
					"春日好茶 · 限时甄选",
				);
				this.homeBanners = [
					{
						id: exchangeEntry?.id || "exchange-center",
						image: this.decorationImage(
							"home.exchange-center",
							"longjing-hero-v2.webp",
						),
						kicker: this.decorationValue(
							"home.exchange-center",
							"englishTitle",
							"新品臻享",
						),
						title: String(exchangeTitle)
							.split(/\s*·\s*/)
							.filter(Boolean),
						subtitle: this.decorationValue(
							"home.exchange-center",
							"subtitle",
							"西湖产区当季鲜采，茶香清雅，回甘悠长。",
						),
						target: exchangeEntry?.jumpTarget || "exchangeCenter",
					},
				];
				this.store = this.normalizeStore(data.store);
				this.categories = (data.categories || []).map((category) => {
					const product = this.products.find(
						(item) =>
							String(item.category) === String(category.name),
					);
					return {
						...category,
						productCount: Number(category.productCount || 0),
						image: this.imageFor(category.iconUrl, product?.image),
					};
				});
				this.categoryNames = [
					"全部",
					...this.categories
						.filter(
							(item) =>
								item.status === "0" && item.productCount > 0,
						)
						.map((item) => item.name),
				];
				this.cartItems = (data.cart || []).map((item) => ({
					...this.normalizeProduct(item),
					skuId: Number(item.skuId),
					skuCode: item.skuCode,
					spec: item.skuSpec || item.spec,
					price: Number(item.skuPrice ?? item.price ?? 0),
					stock: Number(item.skuStock ?? item.stock ?? 0),
					qty: Number(item.qty || 1),
					checked:
						item.checked === true || Number(item.checked) === 1,
				}));
				this.cartCount = this.cartItems.reduce(
					(sum, item) => sum + item.qty,
					0,
				);
				this.orders = (data.orders || []).map((order) =>
					this.normalizeOrder(order),
				);
				this.addresses = [...(data.addresses || [])].sort(
					(a, b) =>
						Number(Boolean(b.isDefault)) -
						Number(Boolean(a.isDefault)),
				);
				this.restoreSelectedAddress();
				this.favoriteProducts = (data.favorites || []).map((item) =>
					this.normalizeProduct(item),
				);
				this.favoriteStores = (data.storeFavorites || []).map((item) =>
					this.normalizeStore(item),
				);
				this.favoriteTopics = (data.topicFavorites || []).map((item) =>
					this.normalizeTopic(item),
				);
				this.notifications = data.notifications || [];
				this.pointsProducts = (data.rewards || []).map((reward) => ({
					...reward,
					id: Number(reward.id),
					stockCount: Number(reward.stock || 0),
					stock: `${reward.stock} ${reward.stockUnit || "件"}`,
					points: Number(reward.points || 0),
					image: this.imageFor(reward.imageKey),
				}));
				// 兑换详情可能通过深链直接进入；商品数据到达后再次应用查询参数。
				this.applyPageQuery(this.pageQuery);
				this.pointLogs = (data.pointLogs || []).map((log) => ({
					...log,
					icon: String(log.title || "").includes("兑换")
						? "gift"
						: String(log.title || "").includes("邀请")
							? "users"
							: String(log.title || "").includes("评价")
								? "service"
								: String(log.title || "").includes("签到")
									? "check"
									: "cart",
					balance: Number(log.balance || 0).toLocaleString(),
				}));
				this.afterSaleRecords = data.aftersales || [];
				this.serviceTickets = data.serviceTickets || [];
				this.exchanges = (data.exchanges || []).map((item) => ({
					...item,
					image: this.imageFor(item.imageKey),
				}));
				this.reviews = data.reviews || [];
				this.distribution = data.distribution || null;
				try {
					this.managedDocuments =
						(await mallApi.supportDocuments()) || [];
				} catch (error) {
					console.warn("商城协议与帮助内容加载失败", error);
				}
				if (this.authenticated) {
					try {
						// Preferences is deliberately first: an expired session stops
						// subsequent private calls and prevents repeated startup 401s.
						const prefs = await mallApi.accountPreferences();
						this.settingsPrefs = {
							...this.settingsPrefs,
							...prefs,
						};
						this.checkoutCoupons =
							(await mallApi.accountCoupons("未使用")) || [];
						const localHistory =
							uni.getStorageSync("teaBrowseHistory") || [];
						if (localHistory.length) {
							await mallApi.mergeBrowseHistory(localHistory);
							uni.removeStorageSync("teaBrowseHistory");
						}
					} catch (error) {
						if (error?.authenticationRequired) {
							mallApi.clearAuthentication();
							this.resetAuthenticatedView();
						} else {
							console.warn(
								"账户私有数据加载失败，公共商城继续可用",
								error,
							);
						}
					}
				}
				this.exchangeMonthUsed = Number(data.exchangeMonthUsed || 0);
				this.inviteRecords = (this.distribution?.downlines || []).map(
					(item) => ({
						...item,
						phone: item.phone || "",
						status:
							Number(item.orderCount || 0) > 0
								? "已完成首单"
								: "待下单",
						points: 0,
						date: item.bindTime,
					}),
				);
				this.backendReady = true;
				this.authReady = true;
				if (data.sessionExpired) {
					this.toast("登录状态已过期，请重新登录");
					const pages =
						typeof getCurrentPages === "function"
							? getCurrentPages()
							: [];
					const route = pages.slice(-1)[0]?.route || "";
					if (route !== "pages/login/login")
						setTimeout(() => navPage("login"), 350);
				}
				uni.setStorageSync("teaCartCount", this.cartCount);
				this.applyPageQuery(this.pageQuery);
				await this.loadPageSpecificData();
				const activeRoute =
					(typeof getCurrentPages === "function"
						? getCurrentPages().slice(-1)[0]?.route
						: "") || "";
				const pointsRoutes = [
					"points-center",
					"points-detail",
					"points-mall",
					"exchange-detail",
					"tier-rewards",
					"tier-reward-detail",
					"my-exchanges",
					"points-reward-details",
				];
				if (
					this.authenticated &&
					pointsRoutes.some((name) => activeRoute.includes(name))
				)
					await this.loadPointsDomain();
				if (typeof this.generateQrCode === "function")
					this.$nextTick(() => this.generateQrCode());
				if (this.selectedOrderNo) {
					this.loadLogistics(this.selectedOrderNo);
				}
			} catch (error) {
				this.backendReady = false;
				this.authReady = true;
				this.catalogError = error.message || "商城数据加载失败";
				if (!this.homeBanners.length)
					this.homeBanners = defaultHomeBanners();
				console.warn("商城公共数据加载失败", error);
			} finally {
				this.mallLoading = false;
			}
		},
		async loadPageSpecificData() {
			const pages =
				typeof getCurrentPages === "function" ? getCurrentPages() : [];
			const route = pages.slice(-1)[0]?.route || "";
			try {
				if (
					route === "pages/confirm/confirm" &&
					Number(this.pageQuery.buyNow)
				)
					await this.refreshCheckoutQuote();
				if (
					[
						"pages/pay-success/pay-success",
						"pages/pay-failure/pay-failure",
						"pages/order-detail/order-detail",
						"pages/logistics/logistics",
					].includes(route) &&
					this.selectedOrderNo &&
					this.authenticated
				)
					await this.loadSelectedOrder();
				if (
					route === "pages/product-detail/product-detail" &&
					Number(this.pageQuery.id)
				) {
					const detail = await mallApi.product(
						Number(this.pageQuery.id),
					);
					this.selectedProduct = this.normalizeProduct(detail);
					this.selectedSkuId =
						this.selectedSkuId || this.selectedProduct.defaultSkuId;
					this.selectedSpec =
						this.selectedSku?.spec || this.selectedProduct.spec;
					if (Array.isArray(detail.reviews))
						this.reviews = detail.reviews.map((item) => ({
							...item,
							productId: this.selectedProduct.id,
						}));
					if (detail.store)
						this.store = this.normalizeStore(detail.store);
				}
				if (route === "pages/home-topic/home-topic") {
					const slug = decodeURIComponent(
						String(
							this.pageQuery.slug || this.topics[0]?.slug || "",
						),
					);
					if (slug)
						this.selectedTopic = this.normalizeTopic(
							await mallApi.topic(slug),
						);
				}
				if (route === "pages/store/store") {
					this.store = this.normalizeStore(
						await mallApi.store(Number(this.pageQuery.id || 1)),
					);
				}
				if (
					route === "pages/search/search" ||
					route === "pages/product-list/product-list"
				)
					await this.refreshCatalogProducts();
			} catch (error) {
				this.catalogError = error.message || "页面数据加载失败";
			}
		},
		async refreshCatalogProducts() {
			const requestSequence =
				Number(this._catalogRequestSequence || 0) + 1;
			this._catalogRequestSequence = requestSequence;
			this.catalogLoading = true;
			this.catalogError = "";
			const sortMap = {
				综合: "default",
				销量: "sales",
				价格: this.priceAscending ? "priceAsc" : "priceDesc",
				新品: "newest",
			};
			const ranges = {
				low: [0, 199.99],
				mid: [200, 399.99],
				high: [400, undefined],
			};
			const range = ranges[this.priceFilter] || [];
			const pages =
				typeof getCurrentPages === "function" ? getCurrentPages() : [];
			const route = pages.slice(-1)[0]?.route || "";
			const pageSize = route === "pages/search/search" ? 6 : 50;
			try {
				const result = await mallApi.products({
					keyword: this.searchQuery.trim(),
					category: this.listingCategory || "",
					sort: sortMap[this.searchSort] || "default",
					minPrice: range[0],
					maxPrice: range[1],
					page: 1,
					pageSize,
				});
				if (requestSequence !== this._catalogRequestSequence) return;
				this.catalogProducts = (result.items || []).map((item) =>
					this.normalizeProduct(item),
				);
				this.searchTotal = Number(result.total || 0);
				this.catalogPage = 1;
				this.catalogPageSize = pageSize;
				this.catalogLoaded = true;
			} catch (error) {
				if (requestSequence !== this._catalogRequestSequence) return;
				this.catalogError = error.message || "商品加载失败";
				this.catalogProducts = [];
				this.catalogLoaded = true;
			} finally {
				if (requestSequence === this._catalogRequestSequence)
					this.catalogLoading = false;
			}
		},
		async loadMoreCatalogProducts() {
			if (
				this.catalogLoading ||
				this.catalogLoadingMore ||
				this.catalogProducts.length >= this.searchTotal
			)
				return;
			this.catalogLoadingMore = true;
			const sortMap = {
				综合: "default",
				销量: "sales",
				价格: this.priceAscending ? "priceAsc" : "priceDesc",
				新品: "newest",
			};
			const ranges = {
				low: [0, 199.99],
				mid: [200, 399.99],
				high: [400, undefined],
			};
			const range = ranges[this.priceFilter] || [];
			const nextPage = this.catalogPage + 1;
			try {
				const result = await mallApi.products({
					keyword: this.searchQuery.trim(),
					category: this.listingCategory || "",
					sort: sortMap[this.searchSort] || "default",
					minPrice: range[0],
					maxPrice: range[1],
					page: nextPage,
					pageSize: this.catalogPageSize,
				});
				const rows = (result.items || []).map((item) =>
					this.normalizeProduct(item),
				);
				this.catalogProducts = [...this.catalogProducts, ...rows];
				this.catalogPage = nextPage;
				this.searchTotal = Number(result.total || this.searchTotal);
			} catch (error) {
				this.showToast(error.message || "加载更多失败");
			} finally {
				this.catalogLoadingMore = false;
			}
		},
		scheduleCatalogSearch() {
			clearTimeout(this._catalogTimer);
			this._catalogTimer = setTimeout(
				() => this.refreshCatalogProducts(),
				260,
			);
		},
		async loadLogistics(orderNo) {
			try {
				const rows = await mallApi.logistics(orderNo);
				this.logistics = Array.isArray(rows) ? rows : [];
			} catch (error) {
				console.warn("物流加载失败", error);
			}
		},
		async loadPointsDomain() {
			if (!this.authenticated || this.pointsDomainLoading) return;
			this.pointsDomainLoading = true;
			this.pointsDomainError = "";
			try {
				const [overview, logs, rewardDetails] = await Promise.all([
					mallApi.pointsOverview(),
					mallApi.pointsLogs(),
					mallApi.pointsRewardDetails(),
				]);
				this.checkedIn = Boolean(overview?.checkedIn);
				this.customer.points = Number(overview?.balance || 0);
				if (Array.isArray(overview?.rewards)) this.pointsProducts = overview.rewards.map(reward => ({ ...reward, id: Number(reward.id), points: Number(reward.points || 0), stockCount: Number(reward.stock || 0), image: this.imageFor(reward.imageKey) }));
				this.pointsLedger = overview?.ledger || null;
				this.pendingPoints = Number(overview.pendingPoints || 0);
				this.debtPoints = Number(overview.debtPoints || 0);
				this.consumptionRule = overview?.consumptionRule || null;
				this.pointsTiers = overview?.tiers || [];
				this.tasks = (overview?.tasks || []).map((task) => ({
					...task,
					title: task.taskName,
					desc: task.description,
					points: `+${Number(task.rewardPoints || 0)} 积分`,
					icon:
						task.businessType === "CHECKIN"
							? "check"
							: task.businessType === "REVIEW"
								? "service"
								: task.businessType === "INVITE"
									? "users"
									: "cart",
					action: task.claimed
						? "已完成"
						: task.claimable
							? "领取"
							: "去完成",
				}));
				this.pointLogs = (logs || []).map((log) => ({
					...log,
					desc: log.desc || log.description || log.remark,
					date: String(log.createTime || "")
						.replace("T", " ")
						.slice(0, 16),
					balance: Number(log.balanceAfter || 0).toLocaleString(),
					icon: String(log.businessType || "").includes("EXCHANGE")
						? "gift"
						: String(log.businessType || "").includes("INVITE")
							? "users"
							: String(log.businessType || "").includes("CHECKIN")
								? "check"
								: "cart",
				}));
				this.pointsRewardDetails = rewardDetails || [];
			} catch (error) {
				this.pointsDomainError = error.message || "积分数据加载失败";
			} finally {
				this.pointsDomainLoading = false;
			}
		},
		async claimPointsTask(task) {
			if (!task?.claimable || this.pointsActionId) return;
			this.pointsActionId = `task-${task.id}`;
			try {
				await mallApi.claimPointsTask(
					task.id,
					mallApi.createRequestId(),
				);
				this.toast("任务奖励已到账");
				await this.loadPointsDomain();
			} catch (error) {
				this.toast(error.message || "领取失败");
			} finally {
				this.pointsActionId = "";
			}
		},
		async claimTier(tier) {
			if (tier?.state !== "可领取" || this.pointsActionId) return;
			this.pointsActionId = `tier-${tier.id}`;
			try {
				await mallApi.claimTierReward(
					tier.id,
					mallApi.createRequestId(),
				);
				this.toast("阶梯奖励已到账");
				await this.loadPointsDomain();
			} catch (error) {
				this.toast(error.message || "领取失败");
			} finally {
				this.pointsActionId = "";
			}
		},
		async loadTierDetail(ruleId) {
            if (!Number.isSafeInteger(Number(ruleId)) || Number(ruleId) <= 0) {
                this.selectedTier = null;
                this.pointsDomainLoading = false;
                this.pointsDomainError = "奖励信息无效，请返回奖励列表重新选择";
                return;
            }
			this.pointsDomainLoading = true;
			this.pointsDomainError = "";
			try {
				this.selectedTier = await mallApi.tierRewardDetail(ruleId);
			} catch (error) {
				this.pointsDomainError = error.message || "奖励详情加载失败";
			} finally {
				this.pointsDomainLoading = false;
			}
		},
		async loadExchangeOrder(exchangeNo) {
			this.pointsDomainLoading = true;
			this.pointsDomainError = "";
			try {
				this.selectedExchangeOrder =
					await mallApi.exchangeDetail(exchangeNo);
			} catch (error) {
				this.pointsDomainError = error.message || "兑换单加载失败";
			} finally {
				this.pointsDomainLoading = false;
			}
		},
		async cancelExchangeOrder(exchangeNo) {
			if (this.exchangeSubmitting) return;
			this.exchangeSubmitting = true;
			try {
				await mallApi.cancelExchange(exchangeNo);
				this.toast("兑换已取消，积分和库存已退回");
				await Promise.all([
					this.loadMallData(),
					this.loadPointsDomain(),
					this.loadExchangeOrder(exchangeNo),
				]);
			} catch (error) {
				this.toast(error.message || "取消失败");
			} finally {
				this.exchangeSubmitting = false;
			}
		},
		async confirmExchangeReceipt(exchangeNo) {
			if (this.exchangeSubmitting) return;
			this.exchangeSubmitting = true;
			try {
				await mallApi.confirmExchangeReceipt(exchangeNo);
				this.toast("收货成功");
				await Promise.all([
					this.loadMallData(),
					this.loadPointsDomain(),
					this.loadExchangeOrder(exchangeNo),
				]);
			} catch (error) {
				this.toast(error.message || "确认收货失败");
				throw error;
			} finally {
				this.exchangeSubmitting = false;
			}
		},
		go(name, params) {
			if (!this.requireLoginFor(name)) return;
			goPage(name, params);
		},
		goAddressPicker(purpose = "checkout") {
			if (!this.requireLoginFor("addresses")) return;
			goPage("addresses", {
				select: 1,
				purpose,
				selected: this.selectedAddress?.id || "",
			});
		},
		restoreSelectedAddress() {
			if (!this.addresses.length) {
				this.selectedAddressId = null;
				return;
			}
			const currentExists = this.addresses.some(
				(item) => Number(item.id) === Number(this.selectedAddressId),
			);
			const saved = uni.getStorageSync("teaSelectedAddress");
			const savedMatchesCustomer =
				saved &&
				typeof saved === "object" &&
				Number(saved.customerId) === Number(this.customer?.id) &&
				this.addresses.some(
					(item) => Number(item.id) === Number(saved.addressId),
				);
			if (savedMatchesCustomer) {
				// 地址选择页会先写入当前会员的选择；返回确认页时它必须覆盖旧页面状态。
				this.selectedAddressId = Number(saved.addressId);
			} else if (!currentExists) {
				this.selectedAddressId = Number(
					this.addresses.find((item) => Boolean(item.isDefault))
						?.id || this.addresses[0].id,
				);
			}
			this.persistSelectedAddress();
		},
		persistSelectedAddress() {
			if (!this.customer?.id || !this.selectedAddressId) return;
			uni.setStorageSync("teaSelectedAddress", {
				customerId: Number(this.customer.id),
				addressId: Number(this.selectedAddressId),
			});
		},
		chooseAddress(address) {
			if (!address?.id) return this.toast("该地址尚未保存，请先保存地址");
			if (
				!String(address.name || "").trim() ||
				!/^1\d{10}$/.test(String(address.phone || "").trim()) ||
				!String(address.line1 || "").trim() ||
				!String(address.line2 || "").trim()
			) {
				return this.toast("该地址信息不完整，请先编辑补全");
			}
			this.selectedAddressId = Number(address.id);
			this.persistSelectedAddress();
			this.toast("已选择收货地址");
			setTimeout(() => backPage(), 250);
		},
		back() {
			backPage();
		},
		nav(name) {
			if (!this.requireLoginFor(name)) return;
			navPage(name);
		},
		requireLoginFor(name) {
			const protectedPages = [
				"mine",
				"points",
				"pointsCenter",
				"exchangeCenter",
				"pointsMall",
				"exchangeDetail",
				"tierRewards",
				"tierRewardDetail",
				"myExchanges",
				"pointsRewardDetails",
				"orders",
				"orderDetail",
				"logistics",
				"confirm",
				"paySuccess",
				"payFailure",
				"addresses",
				"favorites",
				"coupons",
				"invite",
				"inviteRewards",
				"inviteRecords",
				"rewardDetail",
				"share",
			];
			if (!protectedPages.includes(name) || this.authenticated)
				return true;
			this.toast("请先登录后使用该功能");
			setTimeout(() => navPage("login"), 350);
			return false;
		},
		async login() {
			if (this.authSubmitting) return;
			if (!this.agreed) {
				this.toast("请先阅读并同意用户协议");
				return;
			}
			if (!/^1\d{10}$/.test(this.phone)) {
				this.toast("请输入正确的11位手机号");
				return;
			}
			if (this.loginPassword.length < 8 || this.loginPassword.length > 32)
				return this.toast("密码须为8-32位");
			this.authSubmitting = true;
			try {
				await mallApi.login({
					phone: this.phone,
					password: this.loginPassword,
					refCode:
						this.refCode ||
						uni.getStorageSync("teaReferralCode") ||
						"",
				});
				uni.setStorageSync("teaSession", {
					authenticated: true,
					loginAt: Date.now(),
				});
				await this.loadMallData();
				navPage("home");
			} catch (error) {
				this.toast(error.message || "登录失败");
			} finally {
				this.authSubmitting = false;
			}
		},
		async register() {
			if (this.authSubmitting) return;
			if (!this.agreed) return this.toast("请先阅读并同意用户协议");
			if (!/^1\d{10}$/.test(this.phone))
				return this.toast("请输入正确的11位手机号");
			if (!/^(?=.*[A-Za-z])(?=.*\d).{8,32}$/.test(this.loginPassword))
				return this.toast("注册密码需为8-32位，并同时包含字母和数字");
			if (!/^\d{6}$/.test(this.smsCode))
				return this.toast("请输入6位注册验证码");
			this.authSubmitting = true;
			try {
				await mallApi.register({
					phone: this.phone,
					code: this.smsCode,
					password: this.loginPassword,
					refCode:
						this.refCode ||
						uni.getStorageSync("teaReferralCode") ||
						"",
				});
				uni.setStorageSync("teaSession", {
					authenticated: true,
					loginAt: Date.now(),
				});
				await this.loadMallData();
				navPage("home");
			} catch (error) {
				this.toast(error.message || "注册失败");
			} finally {
				this.authSubmitting = false;
			}
		},
		submitPhoneAuth() {
			return this.authMode === "register"
				? this.register()
				: this.login();
		},
		async logout() {
			try {
				await mallApi.logout();
			} catch (error) {
				console.warn("退出登录同步失败", error);
			}
			mallApi.clearAuthentication();
			this.resetAuthenticatedView();
			await this.loadMallData();
			navPage("login");
		},
		async wechatLogin() {
			if (this.authSubmitting) return;
			if (!this.agreed) return this.toast("请先阅读并同意用户协议");
			// #ifdef MP-WEIXIN
			this.authSubmitting = true;
			try {
				const loginResult = await new Promise((resolve, reject) => {
					uni.login({
						provider: "weixin",
						success: resolve,
						fail: reject,
					});
				});
				if (!loginResult?.code) throw new Error("未取得微信授权码");
				const result = await mallApi.wechatLogin({
					code: loginResult.code,
					platform: "mp-weixin",
					refCode:
						this.refCode ||
						uni.getStorageSync("teaReferralCode") ||
						"",
				});
				if (result?.wechatBindingRequired) {
					this.wechatTicket = String(result.wechatTicket || "");
					this.wechatBindingMode = "bind";
					this.wechatBindingOpen = true;
					return;
				}
				await this.finishWechatAuthentication();
			} catch (error) {
				this.toast(error.message || error.errMsg || "微信登录失败");
			} finally {
				this.authSubmitting = false;
			}
			return;
			// #endif
			// #ifndef MP-WEIXIN
			uni.showModal({title:'微信小程序登录',content:'微信授权登录请在茶叶商城微信小程序内完成。已有手机号账号请使用同一手机号登录，再到“我的 → 微信绑定”绑定微信，避免创建重复账号。',showCancel:false});
			// #endif
		},
		async finishWechatAuthentication() {
				uni.setStorageSync("teaSession", {
					authenticated: true,
					loginAt: Date.now(),
					provider: "weixin",
				});
				await this.loadMallData();
				navPage("home");
		},
		async completeWechatRegistration() {
			if (!this.wechatTicket || this.authSubmitting) return;
			this.authSubmitting = true;
			try {
				await mallApi.wechatRegister({
					wechatTicket: this.wechatTicket,
					nickname: this.wechatNickname,
				});
				this.wechatBindingOpen = false;
				this.wechatTicket = "";
				await this.finishWechatAuthentication();
			} catch (error) {
				this.toast(error.message || "微信注册失败");
			} finally {
				this.authSubmitting = false;
			}
		},
		async completeWechatPhoneBinding() {
			if (!this.wechatTicket || this.authSubmitting) return;
			if (!/^1\d{10}$/.test(this.phone)) return this.toast("请输入已有账号手机号");
			if (!/^\d{6}$/.test(this.smsCode)) return this.toast("请输入6位绑定验证码");
			this.authSubmitting = true;
			try {
				await mallApi.wechatBindPhone({
					wechatTicket: this.wechatTicket,
					phone: this.phone,
					code: this.smsCode,
				});
				this.wechatBindingOpen = false;
				this.wechatTicket = "";
				await this.finishWechatAuthentication();
			} catch (error) {
				this.toast(error.message || "微信绑定失败");
			} finally {
				this.authSubmitting = false;
			}
		},
		openProduct(p) {
			if (!p?.id) return this.toast("商品数据正在加载，请稍后重试");
			this.selectedProduct = p;
			this.selectedSkuId =
				p.defaultSkuId || p.skuId || p.skus?.[0]?.skuId || null;
			this.selectedSpec =
				p.skus?.find(
					(item) => Number(item.skuId) === Number(this.selectedSkuId),
				)?.spec || p.spec;
			if (this.settingsPrefs.historyEnabled) {
				const history = uni.getStorageSync("teaBrowseHistory") || [];
				uni.setStorageSync(
					"teaBrowseHistory",
					[
						p.id,
						...history.filter((id) => Number(id) !== Number(p.id)),
					].slice(0, 20),
				);
				this.browseHistoryIds =
					uni.getStorageSync("teaBrowseHistory") || [];
				if (this.authenticated)
					mallApi.recordBrowse(p.id).catch(() => {});
			}
			goPage("productDetail", { id: p.id });
		},
		selectSku(sku) {
			if (!sku || String(sku.status) !== "0" || Number(sku.stock) <= 0)
				return;
			this.selectedSkuId = Number(sku.skuId);
			this.selectedSpec = sku.spec;
		},
		changeProductQty(step) {
			const stock = Number(this.selectedSku?.stock || 0);
			this.productQty = Math.max(
				1,
				Math.min(stock || 1, this.productQty + Number(step || 0)),
			);
		},
		async refreshCheckoutQuote() {
			const productId = Number(this.pageQuery.buyNow);
			const skuId = Number(this.pageQuery.skuId);
			const qty = Math.max(
				1,
				Math.min(99, Number(this.pageQuery.qty) || 1),
			);
			if (!productId || !skuId) throw new Error("立即下单参数不完整");
			this.checkoutQuoteLoading = true;
			try {
				const quote = await mallApi.checkoutQuote({
					items: [{ productId, skuId, qty }],
				});
				this.directCheckoutItems = (quote.items || []).map((item) => ({
					...item,
					id: Number(item.productId),
					image: this.imageFor(item.imageKey),
					price: Number(item.price || 0),
					qty: Number(item.qty || 1),
					checked: true,
				}));
			} finally {
				this.checkoutQuoteLoading = false;
			}
		},
		async openNotification(item) {
			if (!item) return;
			if (item.unread) {
				try {
					await mallApi.readNotification(item.id);
					const source = this.notifications.find(
						(row) => Number(row.id) === Number(item.id),
					);
					if (source) source.readStatus = 1;
				} catch (error) {
					this.toast(error.message || "消息状态更新失败");
					return;
				}
			}
			if (item.screen) this.go(item.screen, item.params || {});
		},
		async markAllNotificationsRead() {
			try {
				await mallApi.readAllNotifications();
				this.notifications.forEach((item) => {
					item.readStatus = 1;
				});
				this.toast("消息已全部标记为已读");
			} catch (error) {
				this.toast(error.message || "消息状态更新失败");
			}
		},
		clearHistory() {
			uni.showModal({
				title: "清空浏览记录",
				content: "确定清空当前设备上的全部浏览记录吗？",
				success: (result) => {
					if (result.confirm) {
						this.browseHistoryIds = [];
						uni.removeStorageSync("teaBrowseHistory");
						this.toast("浏览记录已清空");
					}
				},
			});
		},
		async toggleFavorite() {
			if (!this.authenticated)
				return this.requireLoginFor("productDetail");
			try {
				if (this.isFavorite) {
					await mallApi.removeFavorite(this.selectedProduct.id);
					this.favoriteProducts = this.favoriteProducts.filter(
						(item) =>
							Number(item.id) !== Number(this.selectedProduct.id),
					);
					this.toast("已取消收藏");
				} else {
					await mallApi.addFavorite(this.selectedProduct.id);
					this.favoriteProducts.unshift({ ...this.selectedProduct });
					this.toast("已加入收藏");
				}
			} catch (error) {
				this.toast(error.message || "收藏操作失败");
			}
		},
		async toggleStoreFollow() {
			if (!this.authenticated) return this.requireLoginFor("store");
			if (!this.store?.id) return;
			try {
				if (this.store.followed)
					await mallApi.unfollowStore(this.store.id);
				else await mallApi.followStore(this.store.id);
				this.store.followed = !this.store.followed;
				this.store.actualFollowerCount = Math.max(
					0,
					Number(this.store.actualFollowerCount || 0) +
						(this.store.followed ? 1 : -1),
				);
				this.toast(this.store.followed ? "已关注店铺" : "已取消关注");
			} catch (error) {
				this.toast(error.message || "店铺关注操作失败");
			}
		},
		async toggleTopicFavorite() {
			if (!this.authenticated) return this.requireLoginFor("homeTopic");
			if (!this.selectedTopic?.id) return;
			try {
				if (this.isTopicFavorite) {
					await mallApi.removeTopicFavorite(this.selectedTopic.id);
					this.favoriteTopics = this.favoriteTopics.filter(
						(item) =>
							Number(item.id) !== Number(this.selectedTopic.id),
					);
					this.toast("已取消收藏专题");
				} else {
					await mallApi.addTopicFavorite(this.selectedTopic.id);
					this.favoriteTopics.unshift({ ...this.selectedTopic });
					this.toast("专题已收藏");
				}
			} catch (error) {
				this.toast(error.message || "专题收藏操作失败");
			}
		},
		openExchange(p) {
			this.selectedExchange = p;
			this.exchangeQty = 1;
			this.exchangeRequestId = "";
			goPage("exchangeDetail", { id: p.id });
		},
		async addToCart(product = this.selectedProduct, requestedQty = null) {
			const sku = product.skuId
				? {
						skuId: product.skuId,
						skuCode: product.skuCode,
						spec: product.spec,
						price: product.price,
						stock: product.stock,
					}
				: Number(product.id) === Number(this.selectedProduct?.id)
					? this.selectedSku
					: product.skus?.find(
							(item) => Number(item.isDefault) === 1,
						) || product.skus?.[0];
			if (!sku?.skuId) return this.toast("请选择可购买的规格");
			const existing = this.cartItems.find(
				(item) =>
					Number(item.id) === Number(product.id) &&
					Number(item.skuId) === Number(sku.skuId),
			);
			const nextQty =
				requestedQty === null || requestedQty === undefined
					? Number(existing?.qty || 0) + 1
					: Math.max(1, Math.trunc(Number(requestedQty) || 1));
			if (nextQty > Number(sku.stock || 0))
				return (this.toast("所选规格库存不足"), false);
			try {
				await mallApi.updateCart(product.id, {
					skuId: sku.skuId,
					qty: nextQty,
					checked: true,
				});
				if (existing) {
					existing.qty = nextQty;
					existing.checked = true;
				} else
					this.cartItems.push({
						...product,
						skuId: Number(sku.skuId),
						skuCode: sku.skuCode,
						spec: sku.spec,
						price: Number(sku.price),
						stock: Number(sku.stock),
						qty: nextQty,
						checked: true,
					});
				this.cartCount = this.cartItems.reduce(
					(sum, item) => sum + item.qty,
					0,
				);
				uni.setStorageSync("teaCartCount", this.cartCount);
				this.backendReady = true;
				this.toast(
					requestedQty === null || requestedQty === undefined
						? "已加入购物车并同步"
						: "购物车数量已同步",
				);
				return true;
			} catch (error) {
				this.toast(error.message || "加入购物车失败");
				return false;
			}
		},
		async changeQty(i, d) {
			const item = this.cartItems[i];
			if (!item || this.cartUpdatingSkuId) return;
			const nextQty = Math.max(
				1,
				Math.min(Number(item.stock || 99), item.qty + d),
			);
			if (nextQty === item.qty) return;
			this.cartUpdatingSkuId = item.skuId;
			try {
				await mallApi.updateCart(item.id, {
					skuId: item.skuId,
					qty: nextQty,
					checked: item.checked,
				});
				item.qty = nextQty;
				this.cartCount = this.cartItems.reduce(
					(sum, row) => sum + row.qty,
					0,
				);
			} catch (error) {
				this.toast(error.message || "数量同步失败");
			} finally {
				this.cartUpdatingSkuId = null;
			}
		},
		async toggleCartItem(item) {
			const previous = item.checked;
			item.checked = !previous;
			try {
				await mallApi.updateCart(item.id, {
					skuId: item.skuId,
					qty: item.qty,
					checked: item.checked,
				});
			} catch (error) {
				item.checked = previous;
				this.toast(error.message || "选择状态同步失败");
			}
		},
		selectSearchSort(sort) {
			if (sort === "价格" && this.searchSort === "价格") {
				this.priceAscending = !this.priceAscending;
			} else {
				this.searchSort = sort;
			}
			this.refreshCatalogProducts();
		},
		async toggleAllCart() {
			const checked = !this.allCartChecked;
			const previous = this.cartItems.map((item) => item.checked);
			this.cartItems.forEach((item) => {
				item.checked = checked;
			});
			try {
				await Promise.all(
					this.cartItems.map((item) =>
						mallApi.updateCart(item.id, {
							skuId: item.skuId,
							qty: item.qty,
							checked,
						}),
					),
				);
			} catch (error) {
				this.cartItems.forEach((item, index) => {
					item.checked = previous[index];
				});
				this.toast(error.message || "全选状态同步失败");
			}
		},
		async removeSelectedCartItems() {
			const selected = this.cartItems.filter((item) => item.checked);
			const skuIds = selected.map((item) => item.skuId).filter(Boolean);
			const removed = selected.length;
			if (!removed) {
				this.toast("请选择要删除的商品");
				return;
			}
			try {
				await mallApi.removeCart(skuIds);
				this.cartItems = this.cartItems.filter((item) => !item.checked);
				this.cartCount = this.cartItems.reduce(
					(sum, item) => sum + item.qty,
					0,
				);
				uni.setStorageSync("teaCartCount", this.cartCount);
				this.editCart = false;
				this.toast(`已删除 ${removed} 件商品`);
			} catch (error) {
				this.toast(error.message || "删除失败");
			}
		},
		openOrder(order) {
			this.selectedOrderNo = order.no;
			goPage("orderDetail", { no: order.no });
		},
		openPayment(order) {
			if (!order?.no) return this.toast("订单编号缺失，请刷新后重试");
			if (order.status !== "待付款")
				return this.toast("当前订单无需支付");
			this.selectedOrderNo = String(order.no);
			goPage("paySuccess", { no: order.no });
		},
		openSelectedOrderDetail() {
			if (!this.selectedOrder?.no)
				return this.toast("订单编号缺失，请返回订单列表");
			this.openOrder(this.selectedOrder);
		},
		cancelPayment(order) {
			if (!order?.no) return this.go("orders");
			this.toast("已取消本次支付，订单仍保留在待付款");
			setTimeout(() => this.openOrder(order), 250);
		},
		viewOrderLogistics(order) {
			this.selectedOrderNo = order.no;
			goPage("logistics", { no: order.no });
		},
		async confirmOrder(order) {
			if (order.status !== "待收货") {
				this.toast(
					order.status === "待发货"
						? "商品待发货，可进入详情查看进度"
						: "当前订单无需确认收货",
				);
				return;
			}
			if (this.orderActionSubmittingNo) return;
			this.orderActionSubmittingNo = order.no;
			try {
				await mallApi.updateOrderStatus(order.no, "已完成");
				this.toast("收货成功，订单和积分已同步");
				await this.loadMallData();
			} catch (error) {
				this.toast(error.message || "确认收货失败");
			} finally {
				this.orderActionSubmittingNo = "";
			}
		},
		async cancelOrder(order) {
			if (order?.status !== "待付款" || this.orderActionSubmittingNo)
				return;
			goPage("cancelOrder", { no: order.no });
		},
		async testPayOrder(order) {
			if (order?.status !== "待付款")
				return this.toast("当前订单无需支付");
			if (this.paymentSubmitting) return;
			const outcome = await new Promise((resolve) => {
				uni.showActionSheet({
					itemList: ["模拟支付成功", "模拟支付失败"],
					success: (result) =>
						resolve(result.tapIndex === 0 ? "success" : "failure"),
					fail: () => resolve("cancel"),
				});
			});
			if (outcome === "cancel") return;
			if (outcome === "failure") {
				const requestNo = mallApi.createPaymentRequestId();
				try {
					await mallApi.testPay(order.no, requestNo, "failure");
					goPage("payFailure", { no: order.no });
				} catch (error) {
					this.toast(error.message || "模拟支付失败记录失败");
				}
				return;
			}
			this.paymentSubmitting = true;
			const storageKey = `teaTestPaymentRequest:${order.no}`;
			const requestNo =
				uni.getStorageSync(storageKey) ||
				mallApi.createPaymentRequestId();
			uni.setStorageSync(storageKey, requestNo);
			try {
				const paidOrder = await mallApi.testPay(order.no, requestNo);
				uni.removeStorageSync(storageKey);
				this.mergeOrder(paidOrder);
				await this.loadSelectedOrder();
				this.toast(
					paidOrder.idempotent
						? "该订单已支付，请勿重复操作"
						: "支付成功，订单已进入待发货",
				);
			} catch (error) {
				this.toast(error.message || "支付失败，订单仍为待付款");
			} finally {
				this.paymentSubmitting = false;
			}
		},
		async buyAgain(order) {
			const items = (order?.items || []).filter(
				(item) => Number(item.productId) > 0 && Number(item.skuId) > 0,
			);
			if (!items.length) return this.toast("原订单商品信息不完整，无法再次购买");
			if (this.orderActionSubmittingNo) return;
			this.orderActionSubmittingNo = order.no;
			try {
				for (const item of items) {
					const existing = this.cartItems.find(
						(row) => Number(row.skuId) === Number(item.skuId),
					);
					await mallApi.updateCart(Number(item.productId), {
						skuId: Number(item.skuId),
						qty: Number(existing?.qty || 0) + Number(item.qty || 1),
						checked: true,
					});
				}
				await this.loadMallData();
				this.go("cart");
			} catch (error) {
				this.toast(error.message || "再次购买失败，请检查商品规格和库存");
			} finally {
				this.orderActionSubmittingNo = "";
			}
		},
		async deleteOrder(order) {
			try {
				await mallApi.deleteOrder(order.no);
			} catch (error) {
				this.toast(error.message || "订单删除失败");
				return;
			}
			this.orders = this.orders.filter((item) => item.no !== order.no);
			this.toast("订单已删除");
		},
		confirmDeleteOrder(order) {
			uni.showModal({
				title: "删除订单",
				content: "删除后将无法在订单列表中查看，是否继续？",
				confirmColor: "#b74a32",
				success: (result) => {
					if (result.confirm) this.deleteOrder(order);
				},
			});
		},
		copyTracking() {
			uni.setClipboardData({
				data: this.selectedOrder?.trackingNo || "暂无快递单号",
				success: () => this.toast("快递单号已复制"),
			});
		},
		copyOrderNo() {
			uni.setClipboardData({
				data: String(this.selectedOrder?.no || ""),
				success: () => this.toast("订单编号已复制"),
			});
		},
		orderActionLabel(order) {
			if (order.status === "已取消") return "重新下单";
			if (order.status === "待发货") return "催发货";
			if (order.status === "已完成")
				return (order.items || []).some((item) => !item.reviewId)
					? "评价"
					: "再次购买";
			if (order.status === "待收货") return "确认收货";
			if (order.status === "售后中") return "售后进度";
			if (order.status === "待付款") return "立即支付";
			if (order.trackingNo) return "查看物流";
			return "联系客服";
		},
		orderStatusDescription(order) {
			if (order.status === "待付款")
				return "订单尚未支付，可继续付款或取消订单";
			if (order.status === "已取消")
				return "订单已取消，可重新进入商品详情下单";
			if (order.status === "待发货")
				return "商家正在备货，发货后可查看物流轨迹";
			if (order.trackingNo) return "包裹已交由快递承运，点击查看完整轨迹";
			if (order.status === "已完成") return "订单已完成，感谢您的选购";
			return "订单状态已更新";
		},
		reorderProduct(order) {
			const firstItem = (order.items || [])[0] || {};
			const productId = Number(firstItem.productId || 0);
			const product = this.products.find(
				(item) => Number(item.id) === productId,
			);
			if (product) return this.openProduct(product);
			if (productId) return goPage("productDetail", { id: productId });
			return this.toast("该商品已下架，暂时无法重新下单");
		},
		canApplyAfterSale(order) {
			if (!["待发货", "待收货", "已完成"].includes(order?.status))
				return false;
			return (order.items || []).some(
				(item) =>
					Number(item.qty || 0) -
						Number(item.refundedQty || 0) -
						Number(item.aftersaleLockedQty || 0) >
					0,
			);
		},
		startOrderAfterSale(order) {
			if (!this.canApplyAfterSale(order)) {
				this.toast(
					order?.status === "售后中"
						? "该订单已有售后申请"
						: "当前订单状态不支持申请售后",
				);
				return;
			}
			this.selectedOrderNo = String(order.no);
			goPage("aftersaleApply", { no: order.no });
		},
		async orderPrimaryAction(order) {
			if (order.status === "已取消") return this.reorderProduct(order);
			if (order.status === "待发货") {
				if (this.orderActionSubmittingNo) return;
				this.orderActionSubmittingNo = order.no;
				try {
					await mallApi.expediteOrder(order.no, {
						requestNo: mallApi.createActionRequestId(),
					});
					this.toast("催发货已提交，后台可查看处理");
				} catch (error) {
					this.toast(error.message || "催发货提交失败");
				} finally {
					this.orderActionSubmittingNo = "";
				}
				return;
			}
			if (order.status === "已完成")
				return (order.items || []).some((item) => !item.reviewId)
					? this.openReview(order)
					: this.buyAgain(order);
			if (order.status === "待收货") return this.confirmOrder(order);
			if (order.status === "售后中")
				return this.viewOrderLogistics(order);
			if (order.status === "待付款") return this.openPayment(order);
			if (order.trackingNo) return this.viewOrderLogistics(order);
			return this.go("settings", { panel: "在线客服" });
		},
		openReview(order) {
			const item = (order.items || []).find((row) => !row.reviewId);
			if (!item) return this.toast("该订单商品已评价");
			this.reviewTarget = { order, item };
			this.reviewRating = 5;
			this.reviewContent = "";
			this.reviewError = "";
			this.reviewSubmitting = false;
		},
		closeReview() {
			if (this.reviewSubmitting) return;
			this.reviewTarget = null;
			this.reviewError = "";
		},
		async submitReview() {
			if (!this.reviewTarget || this.reviewSubmitting) return;
			const content = this.reviewContent.trim();
			if (
				!this.reviewTarget.order?.no ||
				!this.reviewTarget.item?.productId
			) {
				this.reviewError = "订单商品信息不完整，请刷新订单后重试";
				return;
			}
			if (content.length < 5) {
				this.reviewError = `评价内容还需输入${5 - content.length}个字`;
				return;
			}
			if (content.length > 500) {
				this.reviewError = "评价内容不能超过500个字";
				return;
			}
			if (
				!Number.isInteger(this.reviewRating) ||
				this.reviewRating < 1 ||
				this.reviewRating > 5
			) {
				this.reviewError = "请选择1至5星评分";
				return;
			}
			this.reviewError = "";
			this.reviewSubmitting = true;
			try {
				await mallApi.submitReview({
					orderNo: this.reviewTarget.order.no,
					productId: this.reviewTarget.item.productId,
					rating: this.reviewRating,
					content,
				});
				this.reviewTarget = null;
				this.toast("评价已发布，10积分已到账");
				await this.loadMallData();
			} catch (error) {
				this.reviewError = error.message || "评价提交失败，请稍后重试";
			} finally {
				this.reviewSubmitting = false;
			}
		},
		openAfterSale(item) {
			if (!this.selectedOrder?.no && !this.selectedOrderNo) {
				this.toast("请先从订单列表选择需要售后的订单");
				return;
			}
			const typeMap = { 退款: "仅退款", 退货: "退货退款", 换货: "换货" };
			goPage("aftersaleApply", {
				no: this.selectedOrderNo || this.selectedOrder?.no,
				type: typeMap[item?.title] || item?.title || "仅退款",
			});
		},
		openService(type) {
			this.servicePanel = type;
		},
		async finishExchange() {
			if (this.exchangeSubmitting) return;
			if (!this.authenticated)
				return this.requireLoginFor("exchangeDetail");
			if (!this.canExchange) {
				if (!this.hasCompleteAddress)
					return this.toast("请先填写完整的收货人、手机号和收货地址");
				if (this.exchangeRemaining <= 0)
					return this.toast("本月兑换数量已达到2件上限");
				if (
					Number(this.customer.points || 0) <
					Number(this.selectedExchange.points || 0) * this.exchangeQty
				)
					return this.toast("积分不足，暂不能兑换");
				return this.toast("兑换数量或库存不符合要求");
			}
			try {
				this.exchangeSubmitting = true;
				if (!this.exchangeRequestId)
					this.exchangeRequestId = mallApi.createRequestId();
				await mallApi.exchange({
					requestId: this.exchangeRequestId,
					rewardId: this.selectedExchange.id,
					qty: this.exchangeQty,
					addressId: this.selectedAddress?.id,
				});
				this.exchangeSuccess = true;
				this.exchangeRequestId = "";
				await this.loadMallData();
			} catch (error) {
				this.toast(error.message || "兑换失败");
			} finally {
				this.exchangeSubmitting = false;
			}
		},
		async submitWithdrawal() {
			const amount = Number(this.withdrawAmount || 0);
			if (amount < 10) return this.toast("单次提现金额不能低于10元");
			if (amount > Number(this.distribution?.balance || 0))
				return this.toast("可提现佣金不足");
			if (!this.withdrawAccount.trim())
				return this.toast("请填写收款账号");
			try {
				await mallApi.requestWithdrawal({
					amount,
					accountType: this.withdrawAccountType,
					accountNo: this.withdrawAccount.trim(),
				});
				this.withdrawalOpen = false;
				this.withdrawAmount = "";
				this.withdrawAccount = "";
				this.toast("提现申请已提交后台审核");
				await this.loadMallData();
			} catch (error) {
				this.toast(error.message || "提现申请失败");
			}
		},
		openWithdrawalPanel() {
			if (!this.canWithdraw) {
				this.toast("可提现佣金满10元后才能申请提现");
				return;
			}
			this.withdrawalOpen = true;
		},
		async removeFavorite(p) {
			try {
				await mallApi.removeFavorite(p.id);
			} catch (error) {
				this.toast(error.message || "取消收藏失败");
				return;
			}
			this.favoriteProducts = this.favoriteProducts.filter(
				(x) => x.id !== p.id,
			);
			this.toast("已取消收藏");
		},
		async removeStoreFavorite(store) {
			try {
				await mallApi.unfollowStore(store.id);
				this.favoriteStores = this.favoriteStores.filter(
					(item) => Number(item.id) !== Number(store.id),
				);
				if (Number(this.store?.id) === Number(store.id))
					this.store.followed = false;
				this.toast("已取消关注店铺");
			} catch (error) {
				this.toast(error.message || "取消关注失败");
			}
		},
		async removeTopicFavorite(topic) {
			try {
				await mallApi.removeTopicFavorite(topic.id);
				this.favoriteTopics = this.favoriteTopics.filter(
					(item) => Number(item.id) !== Number(topic.id),
				);
				this.toast("已取消收藏专题");
			} catch (error) {
				this.toast(error.message || "取消专题收藏失败");
			}
		},
		async removeAddress(i) {
			const address = this.addresses[i];
			try {
				if (address.id) await mallApi.deleteAddress(address.id);
				this.addresses.splice(i, 1);
				if (Number(this.selectedAddressId) === Number(address.id)) {
					this.selectedAddressId =
						Number(
							this.addresses.find((item) =>
								Boolean(item.isDefault),
							)?.id || this.addresses[0]?.id,
						) || null;
					if (this.selectedAddressId) this.persistSelectedAddress();
					else uni.removeStorageSync("teaSelectedAddress");
				}
				this.toast("地址已删除并同步");
			} catch (error) {
				this.toast(error.message || "地址删除失败");
			}
		},
		confirmRemoveAddress(i) {
			uni.showModal({
				title: "删除地址",
				content: "确定删除这个收货地址吗？删除后无法恢复。",
				confirmColor: "#b74a32",
				success: (result) => {
					if (result.confirm) this.removeAddress(i);
				},
			});
		},
		editAddress(index) {
			const address = this.addresses[index];
			this.editingAddressIndex = index;
			this.addressForm = {
				name: address.name,
				phone: address.phone,
				region: address.line1,
				detail: address.line2,
				isDefault: Boolean(address.isDefault || index === 0),
			};
			this.showAddressForm = true;
		},
		startNewAddress() {
			this.editingAddressIndex = -1;
			this.addressForm = {
				name: "",
				phone: "",
				region: "",
				detail: "",
				isDefault: this.addresses.length === 0,
			};
			this.showAddressForm = true;
		},
		async saveAddress() {
			if (!String(this.addressForm.name || "").trim()) {
				this.toast("请填写收货人姓名");
				return;
			}
			if (
				!/^1\d{10}$/.test(String(this.addressForm.phone || "").trim())
			) {
				this.toast("请填写正确的11位手机号");
				return;
			}
			if (
				!String(this.addressForm.region || "").trim() ||
				!String(this.addressForm.detail || "").trim()
			) {
				this.toast("请填写所在地区和完整详细地址");
				return;
			}
			const value = {
				id:
					this.editingAddressIndex >= 0
						? this.addresses[this.editingAddressIndex]?.id
						: undefined,
				name: this.addressForm.name,
				phone: this.addressForm.phone,
				line1: this.addressForm.region.trim(),
				line2: this.addressForm.detail.trim(),
				isDefault: Boolean(this.addressForm.isDefault),
			};
			try {
				value.id = await mallApi.saveAddress(value);
			} catch (error) {
				this.toast(error.message || "地址保存失败");
				return;
			}
			if (this.editingAddressIndex >= 0) {
				this.addresses.splice(this.editingAddressIndex, 1, value);
			} else {
				this.addresses.push(value);
			}
			if (value.isDefault) {
				this.addresses.forEach((item) => {
					item.isDefault = Number(item.id) === Number(value.id);
				});
				this.addresses = [
					value,
					...this.addresses.filter(
						(item) => Number(item.id) !== Number(value.id),
					),
				];
			}
			this.showAddressForm = false;
			if (
				this.addressSelectMode ||
				value.isDefault ||
				!this.selectedAddressId
			) {
				this.selectedAddressId = Number(value.id);
				this.persistSelectedAddress();
			}
			if (this.addressSelectMode) {
				this.chooseAddress(value);
				return;
			}
			this.toast("地址已保存并同步");
		},
		async submitOrder() {
			if (!this.authenticated && !this.testMode)
				return this.requireLoginFor("confirm");
			if (this.orderSubmitting) return;
			const items = this.checkoutItems.map((item) => ({
				productId: item.id,
				skuId: item.skuId,
				qty: item.qty,
			}));
			if (!items.length) {
				this.toast("请选择要结算的商品");
				return;
			}
			if (this.cartTotal <= 0) {
				this.toast("订单金额异常，请返回重新选择商品");
				return;
			}
			if (!this.hasCompleteAddress || !this.selectedAddress?.id) {
				this.toast("请先添加有效收货地址");
				return;
			}
			this.orderSubmitting = true;
			try {
				const noteParts = [
					this.orderRemark,
					`配送：${this.deliveryMethod}`,
				].filter(Boolean);
				const fingerprint = JSON.stringify({
					items,
					addressId: this.selectedAddress.id,
					usePoints: this.usePoints,
					couponId: this.selectedCouponId,
					remark: noteParts.join("；"),
				});
				const savedRequest =
					uni.getStorageSync("teaOrderCreateRequest") || {};
				const requestNo =
					savedRequest.fingerprint === fingerprint &&
					savedRequest.requestNo
						? savedRequest.requestNo
						: mallApi.createOrderRequestId();
				uni.setStorageSync("teaOrderCreateRequest", {
					fingerprint,
					requestNo,
				});
				const order = await mallApi.createOrder({
					items,
					addressId: this.selectedAddress.id,
					usePoints: this.usePoints,
					couponId: this.selectedCouponId,
					remark: noteParts.join("；"),
					requestNo,
				});
				uni.removeStorageSync("teaOrderCreateRequest");
				const created = this.mergeOrder(order);
				goPage("paySuccess", { no: created.no });
			} catch (error) {
				this.toast(error.message || "订单提交失败");
			} finally {
				this.orderSubmitting = false;
			}
		},
		async buyNow() {
			if (!this.requireLoginFor("confirm")) return;
			const productId = Number(this.selectedProduct.id);
			const sku = this.selectedSku;
			if (!sku?.skuId || Number(sku.stock) <= 0)
				return this.toast("请选择有库存的规格");
			const qty = Math.max(
				1,
				Math.min(Number(sku.stock), Number(this.productQty || 1)),
			);
			goPage("confirm", { buyNow: productId, skuId: sku.skuId, qty });
		},
		goCheckout() {
			if (!this.hasCheckoutItems)
				return this.toast("请先选择要结算的商品");
			this.go("confirm");
		},
		chooseInvoice(type) {
			this.invoiceType = type;
			if (type === "暂不开票") this.checkoutPanel = "";
		},
		saveInvoice() {
			if (
				this.invoiceType === "企业电子发票" &&
				(!this.invoiceTitle.trim() || !this.taxId.trim())
			) {
				this.toast("请填写企业抬头和税号");
				return;
			}
			if (
				this.invoiceType === "个人电子发票" &&
				!this.invoiceTitle.trim()
			)
				this.invoiceTitle = this.customer.nickname || "个人";
			this.checkoutPanel = "";
			this.toast("发票信息已保存");
		},
		saveRemark() {
			this.orderRemark = this.orderRemark.slice(0, 100);
			this.checkoutPanel = "";
			this.toast("订单备注已保存");
		},
		async saveSettingsPrefs() {
			uni.setStorageSync("teaSettingsPrefs", this.settingsPrefs);
			try {
				if (this.authenticated)
					await mallApi.saveAccountPreferences(this.settingsPrefs);
				this.toast(
					this.authenticated
						? "设置已同步到账号"
						: "设置已保存到当前设备",
				);
			} catch (error) {
				this.toast(error.message || "设置保存失败");
			}
		},
		toggleSettingPref(key, value) {
			if (!Object.prototype.hasOwnProperty.call(this.settingsPrefs, key))
				return;
			this.settingsPrefs[key] = Boolean(value);
			if (key === "historyEnabled" && !value) {
				this.browseHistoryIds = [];
				uni.removeStorageSync("teaBrowseHistory");
				if (this.authenticated) mallApi.clearBrowse().catch(() => {});
			}
			this.saveSettingsPrefs();
		},
		async saveProfile() {
			const name = this.localNickname.trim();
			if (!name) return this.toast("昵称不能为空");
			try {
				const customer = await mallApi.updateProfile({
					nickname: name,
					avatarUrl: this.customer.avatarUrl || "",
				});
				this.customer = { ...this.customer, ...customer };
				this.localNickname = this.customer.nickname;
				uni.removeStorageSync("teaNickname");
				this.toast("个人资料已同步到后台");
				this.servicePanel = "";
			} catch (error) {
				this.toast(error.message || "个人资料保存失败");
			}
		},
		async requestPhoneChangeCode() {
			if (!/^1\d{10}$/.test(this.newPhone))
				return this.toast("请输入正确的11位新手机号");
			if (this.newPhone === this.customer.phone)
				return this.toast("新手机号不能与当前手机号相同");
			this.phoneChangeSubmitting = true;
			try {
				const result = await mallApi.requestSmsCode({
					phone: this.newPhone,
					purpose: "CHANGE_PHONE",
				});
				this.phoneChangeCountdown = Number(result.retryAfterSeconds || 60);
				const tick = () => {
					if (this.phoneChangeCountdown <= 0) return;
					setTimeout(() => {
						this.phoneChangeCountdown -= 1;
						tick();
					}, 1000);
				};
				tick();
				this.toast(
					result.testCode
						? `隔离测试验证码：${result.testCode}`
						: "验证码已发送",
				);
			} catch (error) {
				this.toast(error.message || "验证码发送失败");
			} finally {
				this.phoneChangeSubmitting = false;
			}
		},
		async savePhoneChange() {
			if (!/^1\d{10}$/.test(this.newPhone))
				return this.toast("请输入正确的11位新手机号");
			if (!/^\d{6}$/.test(this.phoneChangeCode))
				return this.toast("请输入6位验证码");
			this.phoneChangeSubmitting = true;
			try {
				const customer = await mallApi.changePhone({
					phone: this.newPhone,
					code: this.phoneChangeCode,
				});
				this.customer = { ...this.customer, ...customer };
				this.localPhone = customer.phone || this.newPhone;
				this.newPhone = "";
				this.phoneChangeCode = "";
				this.servicePanel = "";
				this.toast("手机号已安全更换");
			} catch (error) {
				this.toast(error.message || "手机号更换失败");
			} finally {
				this.phoneChangeSubmitting = false;
			}
		},
		chooseAvatar() {
			uni.chooseImage({
				count: 1,
				sizeType: ["compressed"],
				sourceType: ["album", "camera"],
				success: async (result) => {
					try {
						const customer = await mallApi.uploadAvatar(
							result.tempFilePaths[0],
						);
						this.customer = { ...this.customer, ...customer };
						this.toast("头像已上传并同步");
					} catch (error) {
						this.toast(error.message || "头像上传失败");
					}
				},
			});
		},
		async savePassword() {
			if (this.newPassword !== this.confirmPassword)
				return this.toast("两次输入的新密码不一致");
			if (!/^(?=.*[A-Za-z])(?=.*\d).{8,32}$/.test(this.newPassword))
				return this.toast("密码需为8-32位且包含字母和数字");
			try {
				await mallApi.updatePassword({
					currentPassword: this.currentPassword,
					newPassword: this.newPassword,
				});
				this.customer.hasPassword = 1;
				this.currentPassword =
					this.newPassword =
					this.confirmPassword =
						"";
				this.servicePanel = "";
				this.toast("登录密码已更新");
			} catch (error) {
				this.toast(error.message || "密码修改失败");
			}
		},
		contactService(type = "merchant") {
			if (type === "courier") {
				this.toast("请以物流轨迹中的派送电话为准");
				return;
			}
			// “联系商家”弹层属于物流页，物流页本身没有在线工单表单。
			// 直接切换 servicePanel 只会再次渲染同一个联系弹层，造成按钮看似失效。
			// 关闭当前弹层并进入真正承载客服工单的设置页。
			this.servicePanel = "";
			this.go("settings", {
				panel: "在线客服",
				no: this.selectedOrderNo || this.selectedOrder?.no || "",
			});
		},
		openHelpPanel(panel) {
			this.servicePanel = panel;
		},
		async submitServiceTicket() {
			const content = String(this.serviceMessage || "").trim();
			if (content.length < 2) {
				this.toast("请至少填写2个字的问题描述");
				return;
			}
			if (this.serviceSubmitting) return;
			this.serviceSubmitting = true;
			try {
				const ticket = await mallApi.submitServiceTicket({
					category: this.serviceCategory,
					content,
					contact: String(this.serviceContact || "").trim(),
					requestNo: mallApi.createActionRequestId(),
				});
				this.serviceTickets.unshift(ticket);
				this.serviceMessage = "";
				this.serviceContact = "";
				this.toast(`已提交工单 ${ticket.ticketNo}`);
			} catch (error) {
				this.toast(error.message || "工单提交失败");
			} finally {
				this.serviceSubmitting = false;
			}
		},
		shareAction(type) {
			if (!this.authenticated || !this.distribution?.inviteCode)
				return this.requireLoginFor("share");
			const link = `${typeof location !== "undefined" ? location.origin : "https://chaye.okam.top"}/#/pages/login/login?ref=${encodeURIComponent(this.distribution.inviteCode)}`;
			if (type === "save" && typeof document !== "undefined") {
				const anchor = document.createElement("a");
				anchor.href = remoteImage("invite-poster-v2.webp");
				anchor.download = "茶山邀请海报.png";
				anchor.click();
				this.toast("邀请海报已开始下载");
				return;
			}
			if (
				type === "wechat" &&
				typeof navigator !== "undefined" &&
				navigator.share
			) {
				navigator
					.share({
						title: "好茶相伴，共享清欢",
						text: "邀你一起品好茶",
						url: link,
					})
					.catch(() => {});
				return;
			}
			uni.setClipboardData({
				data: link,
				success: () =>
					this.toast(
						type === "copy"
							? "邀请链接已复制"
							: "邀请链接已复制，请粘贴分享",
					),
			});
		},
		async checkIn() {
			if (this.pointsActionId) return;
			try {
				this.pointsActionId = "checkin";
				const result = await mallApi.checkin();
				this.checkedIn = true;
				this.customer.points = result.points;
				this.toast(
					result.added
						? `签到成功，+${result.added} 积分`
						: "今天已经签到",
				);
				await this.loadPointsDomain();
			} catch (error) {
				this.toast(error.message || "签到失败");
			} finally {
				this.pointsActionId = "";
			}
		},
		toast(text) {
			this.toastText = text;
			setTimeout(() => {
				this.toastText = "";
			}, 1500);
		},
		showToast(text) {
			this.toast(text);
		},
	},
};
