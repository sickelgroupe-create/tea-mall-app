const routes = {
	home: "/pages/index/index",
	homeTopic: "/pages/home-topic/home-topic",
	login: "/pages/login/login",
	category: "/pages/category/category",
	search: "/pages/search/search",
	productList: "/pages/product-list/product-list",
	productDetail: "/pages/product-detail/product-detail",
	store: "/pages/store/store",
	notifications: "/pages/notifications/notifications",
	cart: "/pages/cart/cart",
	confirm: "/pages/confirm/confirm",
	paySuccess: "/pages/pay-success/pay-success",
	payFailure: "/pages/pay-failure/pay-failure",
	orders: "/pages/orders/orders",
	orderDetail: "/pages/order-detail/order-detail",
	logistics: "/pages/logistics/logistics",
	cancelOrder: "/pages/cancel-order/cancel-order",
	aftersaleApply: "/pages/aftersale-apply/aftersale-apply",
	aftersaleDetail: "/pages/aftersale-detail/aftersale-detail",
	returnLogistics: "/pages/return-logistics/return-logistics",
	pointsCenter: "/pages/points-center/points-center",
	exchangeCenter: "/pages/exchange-center/exchange-center",
	pointsDetail: "/pages/points-detail/points-detail",
	pointsMall: "/pages/points-mall/points-mall",
	exchangeDetail: "/pages/exchange-detail/exchange-detail",
	tierRewards: "/pages/tier-rewards/tier-rewards",
	tierRewardDetail: "/pages/tier-reward-detail/tier-reward-detail",
	myExchanges: "/pages/my-exchanges/my-exchanges",
	pointsRewardDetails: "/pages/points-reward-details/points-reward-details",
	mine: "/pages/mine/mine",
	addresses: "/pages/addresses/addresses",
	favorites: "/pages/favorites/favorites",
	settings: "/pages/settings/settings",
	serviceTicketDetail: "/pages/service-ticket-detail/service-ticket-detail",
	invite: "/pages/invite/invite",
	inviteRewards: "/pages/invite-rewards/invite-rewards",
	teaFriends: "/pages/tea-friends/tea-friends",
	teaFriendDetail: "/pages/tea-friend-detail/tea-friend-detail",
	teaFriendOrders: "/pages/tea-friend-orders/tea-friend-orders",
	inviteGift: "/pages/invite-gift/invite-gift",
	oneClickInvite: "/pages/share/share",
	share: "/pages/share/share",
	inviteRecords: "/pages/invite-records/invite-records",
	rewardDetail: "/pages/reward-detail/reward-detail",
	commissionCenter: "/pages/commission-center/commission-center",
	commissionDetails: "/pages/commission-details/commission-details",
	withdraw: "/pages/withdraw/withdraw",
	history: "/pages/history/history",
	coupons: "/pages/coupons/coupons",
	partnerIntro: "/pages/partner-intro/partner-intro",
	partnerApply: "/pages/partner-apply/partner-apply",
	partnerStatus: "/pages/partner-status/partner-status",
	partnerWorkbench: "/pages/partner-workbench/partner-workbench",
	partnerCustomers: "/pages/partner-customers/partner-customers",
	partnerCustomerOrders:
		"/pages/partner-customer-orders/partner-customer-orders",
	teaSales: "/pages/tea-sales/tea-sales",
	teaScience: "/pages/tea-science/tea-science",
	community: "/pages/community/community",
};

export function pagePath(name) {
	return routes[name] || routes.home;
}

function withQuery(url, params = {}) {
	const query = Object.entries(params)
		.filter(
			([, value]) =>
				value !== undefined && value !== null && value !== "",
		)
		.map(
			([key, value]) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
		)
		.join("&");
	return query ? `${url}?${query}` : url;
}

export function goPage(name, params) {
	const url = withQuery(pagePath(name), params);
	if (name === "home") {
		uni.reLaunch({ url });
		return;
	}
	uni.navigateTo({
		url,
		fail: () =>
			uni.redirectTo({
				url,
				fail: () => uni.reLaunch({ url }),
			}),
	});
}

export function replacePage(name, params) {
	const url = withQuery(pagePath(name), params);
	uni.redirectTo({
		url,
		fail: () => uni.reLaunch({ url }),
	});
}

export function backPage() {
	uni.navigateBack({
		fail: () => uni.reLaunch({ url: routes.home }),
	});
}

export function navPage(name) {
	const target = name === "points" ? "pointsCenter" : name;
	uni.reLaunch({ url: pagePath(target) });
}

export { routes };
