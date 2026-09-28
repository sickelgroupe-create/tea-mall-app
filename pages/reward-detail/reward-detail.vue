<template>
	<view class="app-stage">
		<view class="phone-shell">
			<StatusBar />
			<TopBar title="佣金与提现明细" @back="back" />
			<scroll-view scroll-y class="shell-scroll-viewport screen reward-screen">
				<view class="reward-total">
					<text>累计已结算佣金</text>
					<MallPrice
						:value="Number(distribution?.balance || 0) + Number(distribution?.frozen || 0) + Number(distribution?.withdrawn || 0)"
						:precision="2"
						size="emphasis"
						tone="gold"
					/>
					<view class="paragraph reward-money-row">
						<text>待结算</text
						><MallPrice
							:value="distribution?.pending"
							:precision="2"
							tone="gold"
						/>
						<text>已提现</text
						><MallPrice
							:value="distribution?.withdrawn"
							:precision="2"
							tone="gold"
						/>
					</view>
				</view>
				<view class="reward-flow commission-flow">
					<text>佣金明细</text>
					<view
						v-for="item in distribution?.commissions || []"
						:key="item.id"
					>
						<view class="span-node"
							><TeaIcon name="coin" :size="20"
						/></view>
						<view class="reward-line"></view>
						<view
							><text
								>{{
									Number(item.levelNo) === 1 ? "直属佣金" : "历史佣金"
								}}
								· {{ item.sourceName }}</text
							><text class="small">订单 {{ item.orderNo }}</text
							><text class="small"
								>{{ item.createTime }} · {{ item.status }}</text
							></view
						>
						<MallPrice
							class="strong"
							:value="item.amount"
							:precision="2"
						/>
					</view>
					<view
						v-if="!(distribution?.commissions || []).length"
						class="record-empty"
						>暂无佣金记录</view
					>
				</view>
				<view class="reward-flow withdrawal-flow">
					<text>提现记录</text>
					<view
						v-for="item in distribution?.withdrawals || []"
						:key="item.id"
					>
						<view class="span-node"
							><TeaIcon name="wallet" :size="20"
						/></view>
						<view class="reward-line"></view>
						<view
							><text
								>{{ item.accountType }}
								{{ item.accountNo }}</text
							><text class="small">{{ item.withdrawalNo }}</text
							><text class="small">{{
								item.createTime
							}}</text></view
						>
						<view class="withdrawal-money"
							><MallPrice
								class="strong"
								:value="item.amount"
								:precision="2"
							/><text>{{ item.status }}</text></view
						>
					</view>
					<view
						v-if="!(distribution?.withdrawals || []).length"
						class="record-empty"
						>暂无提现记录</view
					>
				</view>
				<view class="link-list"
					><view @tap="servicePanel = '结算规则'"
						><text class="link-label"
							><TeaIcon name="info" :size="20" />结算规则</text
						><text>›</text></view
					><view @tap="go('inviteRecords')"
						><text class="link-label"
							><TeaIcon
								name="users"
								:size="20"
							/>查看直属客户</text
						><text>›</text></view
					></view
				>
			</scroll-view>
			<view
				v-if="servicePanel"
				class="sheet-mask"
				@tap="servicePanel = ''"
				><view class="action-sheet" @tap.stop
					><view class="sheet-head"
						><view
							><text>佣金结算规则</text
							><text>公开透明，可追溯至关联订单</text></view
						><text @tap="servicePanel = ''">×</text></view
					><CommissionRules /><button @tap="servicePanel = ''">知道了</button></view
				></view
			>
			<view v-if="toastText" class="toast">{{ toastText }}</view>
		</view>
	</view>
</template>

<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import CommissionRules from "@/components/CommissionRules.vue";
import mallPage from "@/shared/mall-page.js";
export default {
	components: { StatusBar, TopBar, TeaIcon, CommissionRules },
	mixins: [mallPage],
};
</script>
