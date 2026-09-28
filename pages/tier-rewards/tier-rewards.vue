<template>
	<view class="app-stage"
		><view class="phone-shell phase-points-shell">
			<StatusBar /><TopBar title="阶梯奖励" @back="back" />
			<scroll-view
				scroll-y
				class="shell-scroll-viewport screen phase-points-scroll phase-tier-page"
			>
				<view v-if="pointsDomainError" class="phase-state"
					><text>{{ pointsDomainError }}</text
					><button @tap="loadPointsDomain">重新加载</button></view
				>
				<template v-else>
					<view class="phase-tier-summary"
						><text>邀请好友 · 解锁阶梯好礼</text
						><text>当前有效邀请 {{ maxProgress }} 人</text></view
					>
					<view class="phase-tier-list">
						<view
							v-for="tier in pointsTiers"
							:key="tier.id"
							:class="['phase-tier-card', tier.state]"
							@tap="go('tierRewardDetail', { id: tier.id })"
						>
							<text class="phase-tier-threshold"
								>{{ tier.thresholdValue
								}}<text>{{
									tier.metricType === "ORDER_AMOUNT"
										? "元"
										: "人"
								}}</text></text
							>
							<view
								><text>{{ tier.ruleName }}</text
								><text
									>{{ tier.rewardName }} ·
									{{ tier.rewardPoints }}积分</text
								></view
							>
							<button
								:disabled="
									tier.state !== '可领取' ||
									pointsActionId === `tier-${tier.id}`
								"
								@tap.stop="claimTier(tier)"
							>
								{{ tier.state }}
							</button>
						</view>
					</view>
					<PointsCollection
						:decoration="decoration('points.promo')"
						class="phase-tier-collection"
						tone="photo"
					/>
				</template>
			</scroll-view>
			<view v-if="toastText" class="toast">{{ toastText }}</view>
		</view></view
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
		this.loadPointsDomain();
	},
	computed: {
		maxProgress() {
			return Math.max(
				0,
				...this.pointsTiers.map((x) => Number(x.progress || 0)),
			);
		},
	},
};
</script>
