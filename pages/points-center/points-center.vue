<template>
	<view class="app-stage"
		><view class="phone-shell phase-points-shell">
			<StatusBar /><TopBar title="积分中心" @back="back" />
			<scroll-view scroll-y class="shell-scroll-viewport screen phase-points-scroll with-tab shell-scroll--with-bottom-nav">
				<view v-if="pointsDomainError" class="phase-state"
					><text>{{ pointsDomainError }}</text
					><button @tap="loadPointsDomain">重新加载</button></view
				>
				<template v-else>
					<view class="phase-balance-card"
						><text>可用积分</text
						><text class="phase-number">{{
							Number(customer.points || 0).toLocaleString()
						}}</text
						><button @tap="go('pointsMall')">去兑换</button></view
					>
					<view class="points-status-summary">
						<view><text>待生效积分</text><text>{{ pendingPoints == null ? '加载中…' : pendingPoints.toLocaleString() }}</text></view>
						<view><text>待补扣积分</text><text>{{ debtPoints == null ? '加载中…' : debtPoints.toLocaleString() }}</text></view>
						<text>支付获得的积分待订单完成后可用；退款产生的待补扣会由后续获得的积分抵扣，不是可用余额。</text>
					</view>
					<view class="phase-section-head"
						><text>积分任务</text
						><text @tap="showPointsRule = !showPointsRule">积分规则 {{ showPointsRule ? '收起' : '›' }}</text></view
					>
					<view v-if="showPointsRule" class="points-rule-panel">
						<text v-if="consumptionRule">消费积分 = 实付金额（元）× {{ consumptionRule.percent }}% ，向下取整。支付后待生效，订单完成后可用；退款按订单规则撤回。旧订单保留原积分规则。</text>
						<text v-else>积分规则尚未加载，请重新加载后查看。</text>
						<text>积分与邀请分分开计算。</text>
					</view>
					<view class="points-task-grid">
						<view
							v-for="task in visibleTasks"
							:key="task.id"
							class="points-task-card"
						>
							<view class="phase-round-icon"
								><TeaIcon :name="task.icon" :size="19"
							/></view>
							<view class="points-task-copy"
								><text>{{ task.title }}</text
								><text>{{ task.desc }}</text></view
							>
							<button
								:disabled="
									task.claimed ||
									pointsActionId === `task-${task.id}`
								"
								@tap="handleTask(task)"
							>
								{{ task.claimed ? '已完成' : task.points + ' · ' + task.action }}
							</button>
						</view>
						<view
							v-if="!tasks.length && !pointsDomainLoading"
							class="phase-empty-line"
							>暂无启用的积分任务</view
						>
					</view>
					<button v-if="tasks.length > 4" class="more-tasks" @tap="showAllTasks = !showAllTasks">{{ showAllTasks ? '收起更多任务' : '更多任务（' + (tasks.length - 4) + '）' }}</button>
					<view class="phase-section-head"
						><text>积分好礼</text><text @tap="go('myExchanges')">兑换记录 ›</text></view>
					<view class="phase-gift-grid">
						<view v-for="p in pointsProducts" :key="p.id" :class="['phase-gift-card', { sold: Number(p.stockCount) <= 0 }]" @tap="openExchange(p)">
							<image :src="p.image" mode="aspectFill" />
							<text>{{ p.name }}</text><text class="phase-number">{{ p.points }} 积分</text>
							<text>{{ Number(p.stockCount) <= 0 ? '已售罄' : `库存${p.stockCount}${p.stockUnit || '件'}` }}</text>
						</view>
					</view>
					<view v-if="pointsDomainLoading" class="phase-empty-line">正在加载积分好礼…</view>
					<view v-else-if="!pointsProducts.length" class="phase-empty-line">暂无可兑换商品</view>
					<view class="phase-section-head"
						><text>积分服务</text></view
					>
					<view class="phase-service-card"
						><view
							v-for="item in services"
							:key="item.name"
							@tap="go(item.route)"
							><TeaIcon :name="item.icon" :size="19" /><text>{{
								item.name
							}}</text
							><text>›</text></view
						></view
					>
					<PointsCollection
						:decoration="decoration('points.promo')"
						tone="dark"
					/>
				</template>
			</scroll-view>
			<BottomNav
				active="points"
				:cart-count="cartCount"
				@select="nav"
			/><view v-if="toastText" class="toast">{{ toastText }}</view>
		</view></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import BottomNav from "@/components/BottomNav.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import PointsCollection from "@/components/PointsCollection.vue";
import mallPage from "@/shared/mall-page.js";
export default {
	components: { StatusBar, TopBar, BottomNav, TeaIcon, PointsCollection },
	mixins: [mallPage],
	computed: {
		visibleTasks() { return this.showAllTasks ? this.tasks : this.tasks.slice(0, 4); },
	},
	data() {
		return {
			showAllTasks: false,
			showPointsRule: false,
			services: [
				{ name: "积分明细", icon: "clipboard", route: "pointsDetail" },
				{ name: "积分商城", icon: "gift", route: "pointsMall" },
				{ name: "我的兑换", icon: "package", route: "myExchanges" },
				{
					name: "奖励明细",
					icon: "list",
					route: "pointsRewardDetails",
				},
			],
		};
	},
	onShow() {
		this.loadPointsDomain();
	},
	methods: {
		handleTask(task) {
			if (task.businessType === "CHECKIN") return this.checkIn();
			if (task.claimable) return this.claimPointsTask(task);
			if (task.businessType === "INVITE")
				return this.go("oneClickInvite");
			this.go(task.businessType === "REVIEW" ? "orders" : "home");
		},
	},
};
</script>
<style scoped>
.points-status-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16rpx;padding:24rpx;margin:20rpx 0;background:#fff;border-radius:20rpx;color:#24543e}
.points-status-summary>view{display:flex;flex-direction:column;align-items:center;gap:12rpx;min-width:0;text-align:center;font-size:26rpx}
.points-status-summary>view text:last-child{font-size:34rpx;overflow-wrap:anywhere}
.points-status-summary>text{grid-column:1/-1;font-size:23rpx;line-height:1.7;color:#777}
.points-rule-panel { padding:24rpx; margin-bottom:20rpx; border-radius:16rpx; background:#fff; color:#285a46; font-size:24rpx; line-height:1.7; }
.points-rule-panel text { display:block; }
.more-tasks { margin: 20rpx 0; padding: 16rpx; text-align: center; font-size: 24rpx; color: #07533b; background: #edf5f0; }
.points-task-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20rpx; }
.points-task-card { display: flex; flex-direction: column; align-items: center; gap: 14rpx; min-width: 0; padding: 24rpx 16rpx; border: 1px solid #e7dfd1; border-radius: 20rpx; background: #fff; text-align: center; }
.points-task-copy { flex: 1; min-width: 0; width: 100%; }
.points-task-copy text { display: block; white-space: normal; word-break: break-word; line-height: 1.5; }
.points-task-copy text:first-child { font-size: 25rpx; font-weight: 600; }
.points-task-copy text + text { margin-top: 7rpx; font-size: 20rpx; color: #77736c; }
.points-task-card button { width: 100%; margin: 0; padding: 12rpx; height: auto; white-space: normal; line-height: 1.4; text-align: center; color: #07533b; background: #edf5f0; font-size: 23rpx; }
.points-task-card button[disabled] { color: #7d817e; }
.points-task-grid > .phase-empty-line { grid-column: 1 / -1; }
</style>
