let API_BASE = import.meta.env.VITE_MALL_API_BASE || "/api/mall";
let authRedirectScheduled = false;
// 微信小程序没有浏览器同源上下文，接口必须使用已备案的 HTTPS 绝对地址。
// #ifdef MP-WEIXIN
API_BASE =
	import.meta.env.VITE_MALL_API_BASE ||
	(import.meta.env.DEV
		? "http://127.0.0.1:18083/mall"
		: "https://chaye.okam.top/api/mall");
// #endif

const AUTH_STORAGE_KEYS = [
	"teaSession",
	"teaMallSessionToken",
	"teaCartCount",
	"teaSelectedAddress",
	"teaNickname",
];

export function clearAuthenticationState() {
	AUTH_STORAGE_KEYS.forEach((key) => uni.removeStorageSync(key));
}

function sessionToken() {
	let token = uni.getStorageSync("teaMallSessionToken");
	if (token) return String(token);
	token = randomId("guest");
	uni.setStorageSync("teaMallSessionToken", token);
	return token;
}

function randomId(prefix = "req") {
	const bytes = new Uint8Array(24);
	if (globalThis.crypto?.getRandomValues) {
		globalThis.crypto.getRandomValues(bytes);
	} else {
		for (let index = 0; index < bytes.length; index += 1)
			bytes[index] = Math.floor(Math.random() * 256);
	}
	const value = Array.from(bytes, (item) =>
		item.toString(16).padStart(2, "0"),
	).join("");
	return `${prefix}_${Date.now().toString(36)}_${value}`.slice(0, 64);
}

function acceptServerSession(payload) {
	const token = payload?.sessionToken;
	if (token) uni.setStorageSync("teaMallSessionToken", String(token));
}

function authenticationError(message, redirectToLogin = true) {
	clearAuthenticationState();
	if (redirectToLogin && !authRedirectScheduled) {
		authRedirectScheduled = true;
		setTimeout(() => {
			authRedirectScheduled = false;
			const pages =
				typeof getCurrentPages === "function" ? getCurrentPages() : [];
			const route = pages.slice(-1)[0]?.route || "";
			if (route !== "pages/login/login") {
				uni.showToast({
					title: message || "登录状态已失效",
					icon: "none",
				});
				uni.reLaunch({ url: "/pages/login/login" });
			}
		}, 50);
	}
	const error = new Error(message || "登录状态已失效，请重新登录");
	error.code = 401;
	error.authenticationRequired = true;
	return error;
}

function request(path, method = "GET", data, options = {}) {
	const normalizedData = normalizeRequestData(data);
	return new Promise((resolve, reject) => {
		uni.request({
			url: `${API_BASE}${path}`,
			method,
			data: normalizedData,
			header: {
				"Content-Type": "application/json",
				"X-Mall-Session": sessionToken(),
			},
			success(response) {
				const payload = response.data || {};
				if (
					response.statusCode >= 200 &&
					response.statusCode < 300 &&
					payload.code === 200
				) {
					acceptServerSession(payload.data);
					resolve(payload.data);
					return;
				}
				if (response.statusCode === 401 || payload.code === 401) {
					reject(
						authenticationError(
							payload.msg,
							options.redirectOnAuth !== false,
						),
					);
					return;
				}
				reject(
					new Error(
						payload.msg || `请求失败（${response.statusCode}）`,
					),
				);
			},
			fail(error) {
				const message = String(error?.errMsg || "");
				if (
					/url not in domain list|合法域名|domain list/i.test(message)
				) {
					reject(new Error("接口域名尚未生效，请稍后重试"));
					return;
				}
				if (/ssl|certificate|证书/i.test(message)) {
					reject(new Error("商城 HTTPS 证书校验失败，请稍后重试"));
					return;
				}
				reject(new Error(message || "商城服务暂时不可用"));
			},
		});
	});
}

function download(path) {
	return new Promise((resolve, reject) => {
		uni.downloadFile({
			url: `${API_BASE}${path}`,
			header: { "X-Mall-Session": sessionToken() },
			success(response) {
				if (
					response.statusCode >= 200 &&
					response.statusCode < 300 &&
					response.tempFilePath
				) {
					resolve(response.tempFilePath);
					return;
				}
				reject(new Error("微信小程序码下载失败"));
			},
			fail(error) {
				reject(new Error(error?.errMsg || "微信小程序码下载失败"));
			},
		});
	});
}

function normalizeRequestData(value) {
	if (Array.isArray(value))
		return value
			.filter((item) => item !== undefined)
			.map((item) => normalizeRequestData(item));
	if (value && Object.prototype.toString.call(value) === "[object Object]")
		return Object.fromEntries(
			Object.entries(value)
				.filter(([, item]) => item !== undefined)
				.map(([key, item]) => [key, normalizeRequestData(item)]),
		);
	return value;
}

async function bootstrap() {
	try {
		return await request("/bootstrap", "GET", undefined, {
			redirectOnAuth: false,
		});
	} catch (error) {
		if (!error?.authenticationRequired) throw error;
		// 旧会话已在 authenticationError 中清除。重新建立游客会话后，
		// 公共商品、分类与协议数据仍应继续加载。
		return request("/bootstrap", "GET", undefined, {
			redirectOnAuth: false,
		});
	}
}

function upload(path, filePath, name = "file") {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: `${API_BASE}${path}`,
			filePath,
			name,
			header: { "X-Mall-Session": sessionToken() },
			success(response) {
				let payload = {};
				try {
					payload = JSON.parse(response.data || "{}");
				} catch (error) {
					return reject(new Error("上传响应格式错误"));
				}
				if (
					response.statusCode >= 200 &&
					response.statusCode < 300 &&
					payload.code === 200
				) {
					acceptServerSession(payload.data);
					const data = payload.data;
					if (data !== undefined && data !== null)
						return resolve(data);
					const legacyUpload = {
						url: payload.url || payload.fileUrl || "",
						fileName: payload.fileName || payload.newFileName || "",
					};
					if (legacyUpload.url || legacyUpload.fileName)
						return resolve(legacyUpload);
					return reject(new Error("上传成功但服务端未返回图片地址"));
				}
				reject(
					new Error(
						payload.msg || `上传失败（${response.statusCode}）`,
					),
				);
			},
			fail(error) {
				reject(new Error(error.errMsg || "图片上传失败"));
			},
		});
	});
}

export default {
	createRequestId: () => randomId("exchange"),
	createOrderRequestId: () => randomId("order"),
	createPaymentRequestId: () => randomId("pay"),
	createAftersaleRequestId: () => randomId("aftersale"),
	createActionRequestId: () => randomId("action"),
	bootstrap,
	categories: () => request("/categories"),
	products: (params = {}) => request("/products", "GET", params),
	product: (productId) => request(`/products/${productId}`),
	topics: () => request("/topics"),
	topic: (slug) => request(`/topics/${encodeURIComponent(slug)}`),
	store: (storeId = 1) => request(`/stores/${storeId}`),
	followStore: (storeId) => request(`/stores/${storeId}/follow`, "POST"),
	unfollowStore: (storeId) => request(`/stores/${storeId}/follow`, "DELETE"),
	login: (data) => request("/session/login", "POST", data),
	register: (data) => request("/session/register", "POST", data),
	requestSmsCode: (data) => request("/session/sms/request", "POST", data),
	loginWithSmsCode: (data) => request("/session/code-login", "POST", data),
	resetPassword: (data) => request("/session/password/reset", "POST", data),
	wechatLogin: (data) => request("/session/wechat", "POST", data),
	wechatRegister: (data) => request("/session/wechat/register", "POST", data),
	wechatBindPhone: (data) => request("/session/wechat/bind-phone", "POST", data),
	wechatBinding: () => request("/customers/wechat"),
	bindCurrentWechat: (code) => request("/customers/wechat/bind", "POST", { code }),
	logout: async () => {
		try {
			return await request("/session/logout", "POST");
		} finally {
			clearAuthenticationState();
		}
	},
	clearAuthentication: clearAuthenticationState,
	updateProfile: (data) => request("/customers/profile", "PUT", data),
	changePhone: (data) => request("/customers/phone/change", "POST", data),
	updatePassword: (data) => request("/customers/password", "PUT", data),
	uploadAvatar: (filePath) => upload("/customers/avatar", filePath),
	updateCart: (productId, data) => request(`/cart/${productId}`, "PUT", data),
	removeCart: (skuIds, productIds = []) =>
		request("/cart/remove", "POST", { skuIds, productIds }),
	createOrder: (data) => request("/orders", "POST", data),
	checkoutQuote: (data) => request("/orders/quote", "POST", data),
	orderDetail: (orderNo) => request(`/orders/${encodeURIComponent(orderNo)}`),
	testPay: (orderNo, requestNo, outcome = "success") =>
		request(`/orders/${orderNo}/test-pay`, "POST", { requestNo, outcome }),
	updateOrderStatus: (orderNo, status) =>
		request(`/orders/${orderNo}/status`, "PUT", { status }),
	deleteOrder: (orderNo) => request(`/orders/${orderNo}`, "DELETE"),
	cancelOrder: (orderNo, data) =>
		request(`/orders/${orderNo}/cancel`, "POST", data),
	expediteOrder: (orderNo, data) =>
		request(`/orders/${orderNo}/expedite`, "POST", data),
	logistics: (orderNo) => request(`/orders/${orderNo}/logistics`),
	submitAftersale: (data) => request("/aftersales", "POST", data),
	afterSaleQuote: (data) => request("/aftersales/quote", "POST", data),
	afterSaleDetail: (aftersaleNo) =>
		request(`/aftersales/${encodeURIComponent(aftersaleNo)}`),
	cancelAftersale: (aftersaleNo, data) =>
		request(
			`/aftersales/${encodeURIComponent(aftersaleNo)}/cancel`,
			"POST",
			data,
		),
	submitReturnLogistics: (aftersaleNo, data) =>
		request(
			`/aftersales/${encodeURIComponent(aftersaleNo)}/return-logistics`,
			"POST",
			data,
		),
	confirmAftersaleExchangeReceipt: (aftersaleNo, data) =>
		request(
			`/aftersales/${encodeURIComponent(aftersaleNo)}/confirm-exchange`,
			"POST",
			data,
		),
	saveAddress: (data) => request("/addresses", "POST", data),
	deleteAddress: (addressId) => request(`/addresses/${addressId}`, "DELETE"),
	exchange: (data) => request("/exchanges", "POST", data),
	exchangeDetail: (exchangeNo) =>
		request(`/exchanges/${encodeURIComponent(exchangeNo)}`),
	cancelExchange: (exchangeNo) =>
		request(`/exchanges/${encodeURIComponent(exchangeNo)}/cancel`, "POST"),
	confirmExchangeReceipt: (exchangeNo) =>
		request(
			`/exchanges/${encodeURIComponent(exchangeNo)}/confirm-receipt`,
			"POST",
		),
	checkin: () => request("/checkin", "POST"),
	pointsOverview: () => request("/points/overview"),
	exchangeCenter: () => request("/exchange-center"),
	pointsLogs: () => request("/points/logs"),
	pointsTasks: () => request("/points/tasks"),
	claimPointsTask: (ruleId, requestNo) =>
		request(`/points/tasks/${ruleId}/claim`, "POST", { requestNo }),
	tierRewards: () => request("/points/tiers"),
	tierRewardDetail: (ruleId) => request(`/points/tiers/${ruleId}`),
	claimTierReward: (ruleId, requestNo) =>
		request(`/points/tiers/${ruleId}/claim`, "POST", { requestNo }),
	pointsRewardDetails: () => request("/points/reward-details"),
	addFavorite: (productId) => request(`/favorites/${productId}`, "POST"),
	removeFavorite: (productId) => request(`/favorites/${productId}`, "DELETE"),
	addTopicFavorite: (topicId) =>
		request(`/topics/${topicId}/favorite`, "POST"),
	removeTopicFavorite: (topicId) =>
		request(`/topics/${topicId}/favorite`, "DELETE"),
	notifications: () => request("/notifications"),
	readNotification: (id) => request(`/notifications/${id}/read`, "PUT"),
	readAllNotifications: () => request("/notifications/read-all", "PUT"),
	requestWithdrawal: (data) =>
		request("/distribution/withdrawals", "POST", data),
	commissionCenter: () => request("/account/commission"),
	commissionDetails: () => request("/account/commission/details"),
	withdrawalConfig: () => request("/account/withdrawals/config"),
	createWithdrawal: (data) => request("/account/withdrawals", "POST", data),
	cancelWithdrawal: (no) =>
		request(
			`/account/withdrawals/${encodeURIComponent(no)}/cancel`,
			"POST",
		),
	accountCoupons: (status = "全部") =>
		request("/account/coupons", "GET", { status }),
	availableCoupons: () => request("/account/coupons/available"),
	claimCoupon: (id) => request(`/account/coupons/${id}/claim`, "POST"),
	accountDashboard: () => request("/account/dashboard"),
	accountPreferences: () => request("/account/preferences"),
	saveAccountPreferences: (data) =>
		request("/account/preferences", "PUT", data),
	supportContact: () => request("/support/contact"),
	supportDocuments: () => request("/support/documents"),
	browseHistory: () => request("/account/browse-history"),
	recordBrowse: (productId) =>
		request(`/account/browse-history/${productId}`, "PUT"),
	mergeBrowseHistory: (productIds) =>
		request("/account/browse-history/merge", "POST", { productIds }),
	deleteBrowse: (productId) =>
		request(`/account/browse-history/${productId}`, "DELETE"),
	clearBrowse: () => request("/account/browse-history", "DELETE"),
	bindReferral: (sceneCode) =>
		request("/distribution/bind", "POST", { sceneCode }),
	teaFriends: (level) =>
		request("/distribution/friends", "GET", level ? { level } : undefined),
	teaFriend: (friendId) => request(`/distribution/friends/${friendId}`),
	teaFriendOrders: (friendId) =>
		request(`/distribution/friends/${friendId}/orders`),
	inviteRecords: () => request("/distribution/invite-records"),
	teaFriendOverview: () => request("/tea-friends/overview"),
	monthlyPeriods: (page = 1) => request(`/tea-friends/monthly/periods?page=${page}`),
	monthlyBoard: (id) => request(`/tea-friends/monthly/periods/${id}`),
	monthlyAwards: (page = 1) => request(`/tea-friends/monthly/awards?page=${page}`),
	monthlyAcknowledge: (id, data) => request(`/tea-friends/monthly/awards/${id}/acknowledge`, "POST", data),
	teaFriendHistory: (type, page) => request(`/tea-friends/history?type=${encodeURIComponent(type)}&page=${page}`),
	teaFriendConfig: () => request("/tea-friends/config"),
	exchangeTeaFriendReward: (data) => request("/tea-friends/exchanges", "POST", data),
	inviteScene: () => request("/distribution/invite-scene"),
	downloadInviteMiniCode: () =>
		download("/distribution/invite-scene/mini-code"),
	inviteGift: () => request("/distribution/invite-gift"),
	inviteRewards: () => request("/distribution/invite-rewards"),
	claimInviteGift: (requestNo) =>
		request("/distribution/invite-gift/claim", "POST", { requestNo }),
	claimInviteReward: (ruleId, requestNo) =>
		request("/distribution/invite-gift/claim", "POST", {
			ruleId,
			requestNo,
		}),
	partnerAgreement: () => request("/partner/agreement"),
	partnerStatus: () => request("/partner/status"),
	submitPartnerApplication: (data) =>
		request("/partner/applications", "POST", data),
	cancelPartnerApplication: (applicationNo) =>
		request(
			`/partner/applications/${encodeURIComponent(applicationNo)}/cancel`,
			"POST",
		),
	partnerWorkbench: () => request("/partner/workbench"),
	partnerCustomers: (params = {}) =>
		request("/partner/customers", "GET", params),
	partnerCustomerOrders: (customerId, params = {}) =>
		request(`/partner/customers/${customerId}/orders`, "GET", params),
	article: (slug) => request(`/content/articles/${encodeURIComponent(slug)}`),
	contentCategories: () => request("/content/categories"),
	contentArticles: (categoryCode = "TEA_SCIENCE") =>
		request("/content/articles", "GET", { categoryCode }),
	favoriteArticle: (articleId, favorite) =>
		request(`/content/articles/${articleId}/favorite`, "PUT", { favorite }),
	communityPosts: (params = {}) => request("/community/posts", "GET", params),
	createCommunityPost: (data) => request("/community/posts", "POST", data),
	deleteCommunityPost: (id) => request(`/community/posts/${id}`, "DELETE"),
	likeCommunityPost: (id, liked) =>
		request(`/community/posts/${id}/like`, "PUT", { liked }),
	communityComments: (id) => request(`/community/posts/${id}/comments`),
	createCommunityComment: (id, data) =>
		request(`/community/posts/${id}/comments`, "POST", data),
	deleteCommunityComment: (id) =>
		request(`/community/comments/${id}`, "DELETE"),
	uploadCommunityImage: (filePath) => upload("/community/images", filePath),
	uploadAftersaleEvidence: (filePath) =>
		upload("/community/images", filePath),
	submitServiceTicket: (data) => request("/service-tickets", "POST", data),
	serviceTickets: () => request("/service-tickets"),
	serviceTicket: (ticketNo) => request(`/service-tickets/${ticketNo}`),
	replyServiceTicket: (ticketNo, data) =>
		request(`/service-tickets/${ticketNo}/messages`, "POST", data),
	submitReview: (data) => request("/reviews", "POST", data),
};
