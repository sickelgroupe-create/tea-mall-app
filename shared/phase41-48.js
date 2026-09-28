import mallApi from "./mall-api.js";
export default {
	data() {
		return {
			accountLoading: false,
			accountError: "",
			accountSubmitting: false,
			commissionData: null,
			commissionDetail: null,
			withdrawConfig: null,
			withdrawals: [],
			accountCoupons: [],
			accountDashboard: null,
			managedDocuments: [],
			serverHistory: [],
			historyTab: "今天",
		};
	},
	methods: {
		async accountRun(fn) {
			this.accountLoading = true;
			this.accountError = "";
			try {
				return await fn();
			} catch (e) {
				this.accountError = e?.message || "请求失败，请稍后重试";
				throw e;
			} finally {
				this.accountLoading = false;
			}
		},
		accountMoney(v) {
			return Number(v || 0).toFixed(2);
		},
		requestNo(prefix = "req") {
			return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`.slice(
				0,
				64,
			);
		},
		async loadCommission() {
			try {
				this.commissionData = await this.accountRun(() =>
					mallApi.commissionCenter(),
				);
			} catch (_) {}
		},
		async loadCommissionDetails() {
			try {
				this.commissionDetail = await this.accountRun(() =>
					mallApi.commissionDetails(),
				);
				this.withdrawals = this.commissionDetail.withdrawals || [];
			} catch (_) {}
		},
		accountToast(title) {
			uni.showToast({ title, icon: "none" });
		},
	},
};
