<template>
	<view class="app-stage"
		><view class="phone-shell phase-points-shell"
			><StatusBar /><TopBar title="奖励明细" @back="back" /><view
				class="phase-tabs"
				><text
					v-for="(tab, i) in ['全部', '邀请奖励', '活动奖励']"
					:key="tab"
					:class="{ active: rewardTab === i }"
					@tap="rewardTab = i"
					>{{ tab }}</text
				></view
			><scroll-view scroll-y class="shell-scroll-viewport screen phase-points-scroll"
				><view v-if="pointsDomainError" class="phase-state"
					><text>{{ pointsDomainError }}</text
					><button @tap="loadPointsDomain">重新加载</button></view
				><view v-else class="phase-list-card"
					><view
						v-for="item in filteredRewards"
						:key="`${item.source}-${item.id}`"
						class="phase-log-row"
						><view class="phase-round-icon"
							><TeaIcon
								:name="
									item.source === '阶梯奖励'
										? 'users'
										: 'gift'
								"
								:size="19" /></view
						><view class="phase-grow"
							><text>{{ item.title }}</text
							><text>{{
								String(item.createTime || "").slice(0, 16)
							}}</text></view
						><view class="phase-log-value"
							><text>+{{ item.rewardPoints }}</text
							><text>{{ item.status }}</text></view
						></view
					><view
						v-if="!filteredRewards.length"
						class="phase-empty-line"
						>暂无奖励明细</view
					></view
				><PointsCollection
					:decoration="decoration('points.promo')"
					tone="split" /></scroll-view
			><view v-if="toastText" class="toast">{{ toastText }}</view></view
		></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import PointsCollection from "@/components/PointsCollection.vue";
import mallPage from "@/shared/mall-page.js";
export default {
	components: { StatusBar, TopBar, TeaIcon, PointsCollection },
	mixins: [mallPage],
	data() {
		return { rewardTab: 0 };
	},
	onShow() {
		this.loadPointsDomain();
	},
	computed: {
		filteredRewards() {
			if (this.rewardTab === 1)
				return this.pointsRewardDetails.filter(
					(x) => x.source === "阶梯奖励",
				);
			if (this.rewardTab === 2)
				return this.pointsRewardDetails.filter(
					(x) => x.source !== "阶梯奖励",
				);
			return this.pointsRewardDetails;
		},
	},
};
</script>
