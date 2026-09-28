<template>
	<view
		class="app-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell account-shell"
			><StatusBar /><TopBar title="浏览记录" @back="back" /><view
				class="account-tabs"
				><text
					v-for="t in ['今天', '昨天', '更早']"
					:key="t"
					:class="{ active: historyTab === t }"
					@tap="historyTab = t"
					>{{ t }}</text
				></view
			><scroll-view scroll-y class="shell-scroll-viewport account-scroll history-account-scroll"
				><view v-if="accountLoading" class="account-state"
					>正在加载浏览记录…</view
				><view v-else-if="accountError" class="account-state"
					><text>{{ accountError }}</text
					><button @tap="loadHistory">重新加载</button></view
				><template v-else
					><view class="account-section-head"
						><text>{{ historyTab }}</text
						><text v-if="filteredHistory.length" @tap="confirmClear"
							>清空</text
						></view
					><view
						v-if="historyTab === '今天'"
						class="history-card-grid"
						><view
							v-for="item in filteredHistory"
							:key="item.id"
							@tap="openHistory(item)"
							><image
								:src="imageFor(item.imageKey)"
								mode="aspectFill"
							/><text>{{ item.shortName || item.name }}</text
							><MallPrice
								:value="item.price"
								:precision="0"
								size="card"
							/><view class="history-actions"
								><button @tap.stop="addHistoryCart(item)">
									加购</button
								><button @tap.stop="removeHistory(item)">
									删除
								</button></view
							></view
						></view
					><view v-else class="account-list history-list"
						><view
							v-for="item in filteredHistory"
							:key="item.id"
							@tap="openHistory(item)"
							><image
								:src="imageFor(item.imageKey)"
								mode="aspectFill" /><view
								><text>{{ item.name }}</text
								><text
									>{{
										item.status === "0"
											? "可购买"
											: "商品已下架"
									}}
									· 浏览{{ item.viewCount }}次</text
								></view
							><MallPrice
								:value="item.price"
								:precision="0"
								size="card" /></view></view
					><view
						v-if="!filteredHistory.length"
						class="account-empty-card"
						><TeaIcon name="clock" :size="30" /><text
							>暂无{{ historyTab }}浏览记录</text
						><button @tap="go('home')">去首页逛逛</button></view
					><view class="account-dark-card"
						><text>臻享会员礼序</text
						><text
							>登录后本地记录会合并到服务端，不覆盖已有记录。</text
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
import TeaIcon from "@/components/TeaIcon.vue";
import mallPage from "@/shared/mall-page.js";
import phase from "@/shared/phase41-48.js";
import mallApi from "@/shared/mall-api.js";
export default {
	components: { StatusBar, TopBar, TeaIcon },
	mixins: [mallPage, phase],
	computed: {
		filteredHistory() {
			return this.serverHistory.filter(
				(i) => i.dateGroup === this.historyTab,
			);
		},
	},
	onShow() {
		this.loadHistory();
	},
	methods: {
		async loadHistory() {
			try {
				const r = await this.accountRun(() => mallApi.browseHistory());
				this.serverHistory = r.items || [];
			} catch (_) {}
		},
		openHistory(item) {
			if (item.status !== "0")
				return this.accountToast("商品已下架，暂不能进入");
			this.go("productDetail", { id: item.productId });
		},
		async addHistoryCart(item) {
			const product = this.products.find(
				(p) => Number(p.id) === Number(item.productId),
			);
			if (!product || item.status !== "0")
				return this.accountToast("商品已下架或规格不可用");
			await this.addToCart(product);
		},
		async removeHistory(item) {
			try {
				await mallApi.deleteBrowse(item.productId);
				this.serverHistory = this.serverHistory.filter(
					(i) => Number(i.productId) !== Number(item.productId),
				);
				this.accountToast("已删除");
			} catch (e) {
				this.accountToast(e.message || "删除失败");
			}
		},
		confirmClear() {
			uni.showModal({
				title: "清空浏览记录",
				content: "确认清空全部浏览记录？此操作不会影响收藏。",
				confirmColor: "#07543b",
				success: async (r) => {
					if (!r.confirm) return;
					try {
						await mallApi.clearBrowse();
						this.serverHistory = [];
						this.accountToast("浏览记录已清空");
					} catch (e) {
						this.accountToast(e.message || "清空失败");
					}
				},
			});
		},
	},
};
</script>
