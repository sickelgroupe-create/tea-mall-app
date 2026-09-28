import mallApi from "./mall-api.js";
export default {
	data() {
		return {
			friendData: null,
			friendLoading: false,
			friendError: "",
			historyPages: { ledger: 1, exchanges: 1 },
			historyBusy: false,
		};
	},
	onShow() {
		if (this.authReady && this.authenticated) this.loadFriendCenter();
	},
	watch: {
		authReady(value) {
			if (value && this.authenticated) this.loadFriendCenter();
		},
	},
	computed: {
		inviteScoreLabel() { return this.friendData?.rule?.scoreUnitLabel || '邀请分'; },
	},
	methods: {
		score(value) {
			return Number(value || 0)
				.toFixed(2)
				.replace(/\.?0+$/, "");
		},
		async loadFriendCenter() {
			if (this.friendLoading) return;
			this.friendLoading = true;
			this.friendError = "";
			try {
				this.friendData = await mallApi.teaFriendOverview();
				this.historyPages = { ledger: 1, exchanges: 1 };
			} catch (error) {
				this.friendError = error.message || "茶友数据加载失败";
			} finally {
				this.friendLoading = false;
			}
		},
		async moreHistory(type) {
			if (this.historyBusy || this.friendLoading) return;
			this.historyBusy = true;
			try {
				const page = this.historyPages[type] + 1,
					result = await mallApi.teaFriendHistory(type, page);
				const known = new Set(
					this.friendData[type].map((row) => row.id),
				);
				this.friendData[type].push(
					...result.rows.filter((row) => !known.has(row.id)),
				);
				this.friendData[type + "Total"] = result.total;
				this.historyPages[type] = page;
			} catch (error) {
				uni.showToast({
					title: error.message || "记录加载失败，请重试",
					icon: "none",
				});
			} finally {
				this.historyBusy = false;
			}
		},
	},
};
