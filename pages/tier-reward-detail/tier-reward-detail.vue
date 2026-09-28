<template>
	<view class="app-stage"
		><view class="phone-shell phase-points-shell"
			><StatusBar /><TopBar
				title="阶梯兑换详情"
				@back="back"
			/><scroll-view
				scroll-y
				class="shell-scroll-viewport screen phase-points-scroll phase-action-pad"
				><view v-if="pointsDomainError" class="phase-state"
					><text>{{ pointsDomainError }}</text
					><button @tap="load">重新加载</button></view
				><view v-else-if="selectedTier" class="phase-tier-detail"
					><image
						:src="imageFor(selectedTier.rewardImageKey)"
						mode="aspectFill"
					/><text>{{ selectedTier.rewardName }}</text
					><text>{{ selectedTier.ruleName }}</text
					><view
						><text>达成要求</text
						><text
							>{{ selectedTier.progress }} /
							{{ selectedTier.thresholdValue }} 位有效茶友</text
						></view
					><view
						><text>奖励内容</text
						><text
							>{{ selectedTier.rewardContents }} ·
							{{ selectedTier.rewardPoints }}积分</text
						></view
					><view
						><text>当前状态</text
						><text>{{ selectedTier.state }}</text></view
					><button
						class="phase-primary"
						:disabled="
							selectedTier.state !== '可领取' ||
							Boolean(pointsActionId)
						"
						@tap="claim"
					>
						{{ selectedTier.state }}
					</button></view
				><PointsCollection
					:decoration="decoration('points.promo')"
					tone="light" /></scroll-view
			><view v-if="toastText" class="toast">{{ toastText }}</view></view
		></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import PointsCollection from "@/components/PointsCollection.vue";
import mallPage from "@/shared/mall-page.js";
export default {
	components: { StatusBar, TopBar, PointsCollection },
	mixins: [mallPage],
	onShow() {
		this.load();
	},
	methods: {
		async load() {
			await this.loadTierDetail(Number(this.pageQuery.id));
		},
		async claim() {
			await this.claimTier(this.selectedTier);
			await this.load();
		},
	},
};
</script>
