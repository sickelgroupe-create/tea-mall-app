<template>
	<view class="app-stage"
		><view class="phone-shell phase-points-shell"
			><StatusBar /><TopBar title="积分兑换详情" @back="back" />
			<scroll-view scroll-y class="shell-scroll-viewport screen phase-points-scroll shell-scroll--with-action"
				><view v-if="!selectedExchange.id" class="phase-state"
					><text>兑换商品不存在或已下架</text
					><button @tap="go('pointsMall')">返回积分商城</button></view
				><template v-else
					><view class="phase-exchange-card"
						><image
							:src="selectedExchange.image"
							mode="aspectFill"
						/><text class="phase-exchange-name">{{
							selectedExchange.name
						}}</text
						><text class="phase-exchange-points phase-number"
							>{{ selectedExchange.points }} 积分</text
						><text class="phase-exchange-sub">{{
							selectedExchange.exchangeNotes ||
							"精选积分好礼，兑换后由仓库安排发货。"
						}}</text
						><view class="phase-info-row"
							><TeaIcon name="package" :size="19" /><text
								>库存</text
							><text
								>{{ selectedExchange.stockCount }}
								{{ selectedExchange.stockUnit || "件" }} ›</text
							></view
						><view
							class="phase-info-row"
							@tap="goAddressPicker('exchange')"
							><TeaIcon name="location" :size="19" /><text
								>收货地址</text
							><text
								>{{
									selectedAddress
										? `${selectedAddress.name} ${selectedAddress.phoneMasked || selectedAddress.phone}`
										: "请选择"
								}}
								›</text
							></view
						><view class="phase-info-row"
							><TeaIcon name="help" :size="19" /><text
								>兑换须知</text
							><text
								>{{
									selectedExchange.deliveryMethod ||
									"快递配送"
								}}
								›</text
							></view
						><view class="phase-qty"
							><text>兑换数量</text
							><button
								@tap="
									exchangeQty = Math.max(1, exchangeQty - 1)
								"
							>
								−</button
							><text>{{ exchangeQty }}</text
							><button
								:disabled="exchangeQty >= exchangeRemaining"
								@tap="
									exchangeQty = Math.min(
										exchangeRemaining,
										exchangeQty + 1,
									)
								"
							>
								＋
							</button></view
						></view
					><PointsCollection
						:decoration="decoration('points.promo')"
						tone="dark" /></template></scroll-view
			><view v-if="selectedExchange.id" class="exchange-submit"
				><button
					:disabled="!canExchange || exchangeSubmitting"
					@tap="confirmOpen = true"
				>
					{{
						exchangeSubmitting
							? "提交中"
							: Number(selectedExchange.stockCount) <= 0
								? "已售罄"
								: Number(customer.points) <
									  Number(selectedExchange.points) *
											exchangeQty
									? "积分不足"
									: "立即兑换"
					}}
				</button></view
			>
			<view v-if="confirmOpen" class="sheet-mask exchange-dialog-mask"
				><view class="phase-confirm"
					><text>确认兑换</text
					><text>{{ selectedExchange.name }} × {{ exchangeQty }}</text
					><text
						>将扣除
						{{ selectedExchange.points * exchangeQty }} 积分</text
					><view
						><button @tap="confirmOpen = false">再想想</button
						><button
							:disabled="exchangeSubmitting"
							@tap="submitExchange"
						>
							确认兑换
						</button></view
					></view
				></view
			>
			<view v-if="exchangeSuccess" class="sheet-mask exchange-dialog-mask"
				><view class="phase-confirm success"
					><text>兑换成功</text
					><text>兑换单已写入后台，请在“我的兑换”查看履约状态。</text
					><button
						@tap="
							exchangeSuccess = false;
							go('myExchanges');
						"
					>
						查看我的兑换
					</button></view
				></view
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
		return { confirmOpen: false };
	},
	methods: {
		async submitExchange() {
			this.confirmOpen = false;
			await this.finishExchange();
		},
	},
};
</script>
<style scoped>
.exchange-dialog-mask {
	justify-content: center;
	padding: 0 24rpx env(safe-area-inset-bottom, 0px);
	box-sizing: border-box;
}
.exchange-dialog-mask .phase-confirm {
	width: 100%;
	min-width: 0;
	max-height: 85%;
	overflow-y: auto;
	box-sizing: border-box;
}
</style>
