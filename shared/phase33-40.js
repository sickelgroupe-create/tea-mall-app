import mallApi from "./mall-api.js";
export default {
	data() {
		return {
			phaseLoading: false,
			phaseError: "",
			phaseSubmitting: false,
			partnerAgreement: null,
			partnerState: null,
			partnerMetrics: {
				salesAmount: 0,
				customerCount: 0,
				activeCustomerCount: 0,
				orderCount: 0,
				newCustomerCount: 0,
				pendingIncome: 0,
				settledIncome: 0,
				today: { orderCount: 0, salesAmount: 0 },
			},
			partnerClients: [],
			partnerOrders: [],
			articleData: null,
			communityFeed: [],
		};
	},
	methods: {
		async phaseRun(loader) {
			this.phaseLoading = true;
			this.phaseError = "";
			try {
				return await loader();
			} catch (error) {
				this.phaseError = error?.message || "请求失败，请稍后重试";
				throw error;
			} finally {
				this.phaseLoading = false;
			}
		},
		async loadPartnerState() {
			try {
				this.partnerState = await this.phaseRun(() =>
					mallApi.partnerStatus(),
				);
			} catch (_) {}
		},
		async loadAgreement() {
			try {
				this.partnerAgreement = await this.phaseRun(() =>
					mallApi.partnerAgreement(),
				);
			} catch (_) {}
		},
		phaseToast(title) {
			uni.showToast({ title, icon: "none" });
		},
	},
};
