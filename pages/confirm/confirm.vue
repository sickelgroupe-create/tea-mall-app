<template>
	<view
		class="app-stage catalog-stage order-phase"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
	>
		<view class="phone-shell">
			<StatusBar />
			<TopBar title="确认订单" @back="back" /><scroll-view
				scroll-y
				class="shell-scroll-viewport screen confirm-screen shell-scroll--with-action"
				><view v-if="hasCheckoutItems" class="checkout-section-title"
					>收货信息</view
				><view
					v-if="hasCheckoutItems"
					class="address-card"
					:class="{ empty: !selectedAddress }"
					@tap="goAddressPicker('checkout')"
					><TeaIcon class="address-pin" name="location" :size="20" />
					<view
						><text
							><text class="strong">{{
								selectedAddress?.name || "请选择收货地址"
							}}</text
							>　{{ selectedAddress?.phone || "" }}</text
						><text>{{
							selectedAddress?.line1 ||
							"点击选择已保存地址，或新增收货地址"
						}}</text
						><text>{{ selectedAddress?.line2 || "" }}</text></view
					><view class="confirm-address-action"
						><text>{{ selectedAddress ? "更换" : "选择" }}</text
						><text>›</text></view
					></view
				><view v-if="hasCheckoutItems" class="airmail"></view
				><view v-if="hasCheckoutItems" class="confirm-products"
					><view
						v-for="item in checkoutItems"
						:key="item.id"
						class="checkout-item"
						><image :src="item.image" mode="aspectFill" /><view
							><text>{{ item.name }}</text
							><text class="muted">{{ item.spec }}</text
							><MallPrice
								:value="item.price"
								:precision="2" /></view
						><text>×{{ item.qty }}</text></view
					></view
				><view v-else class="checkout-empty commercial-empty"
					><view class="empty-state-icon"
						><TeaIcon name="cart" :size="29" /></view
					><text>没有可结算的商品</text
					><text>商品可能未成功加入结算，请返回商品页重新选择</text
					><button @tap="go('productList')">去选择商品</button></view
				>
				<view v-if="hasCheckoutItems" class="order-options"
					><view @tap="checkoutPanel = 'delivery'"
						><text>配送方式</text
						><text class="checkout-option-value"
							>{{ deliveryMethod }} ›</text
						></view
					><view @tap="checkoutPanel = 'coupon'"
						><text>优惠券</text
						><text
							class="checkout-option-value"
							:class="{ muted: !selectedCouponId }"
							>{{
								selectedCouponId
									? checkoutCoupons.find(
											(c) =>
												Number(c.id) ===
												Number(selectedCouponId),
										)?.name || "已选择"
									: checkoutCoupons.length
										? `${checkoutCoupons.length}张可用`
										: "暂无可用"
							}}
							›</text
						></view
					><view class="points-checkout-option"
						><view
							><text>积分抵扣</text
							><view class="option-help option-help--money"
								><text>100积分抵</text
								><MallPrice
									:value="1"
									:precision="0"
									size="inherit"
									tone="neutral"
								/><text>，最高抵商品金额20%</text></view
							></view
						><view class="points-switch">
							<view
								v-if="pointsToUse > 0"
								class="option-help--money"
							>
								<text>可用{{ pointsToUse }}积分，抵</text>
								<MallPrice
									:value="availablePointsDiscount"
									:precision="2"
									size="inherit"
								/>
							</view>
							<text v-else class="muted">暂无可用积分</text>
							<switch
								color="#205b3a"
								:checked="usePoints"
								:disabled="pointsToUse <= 0"
								@change="usePoints = $event.detail.value"
							/> </view></view
					><view @tap="checkoutPanel = 'remark'"
						><text>订单备注</text
						><text class="checkout-option-value muted"
							>{{ orderRemark || "选填，最多100字" }} ›</text
						></view
					></view
				><view v-if="hasCheckoutItems" class="amount-card">
					<view
						><text>商品金额</text
						><MallPrice
							:value="cartTotal"
							:precision="2"
							tone="neutral"
					/></view>
					<view
						><text>运费</text
						><MallPrice :value="0" :precision="2" tone="neutral"
					/></view>
					<view v-if="selectedCouponId"
						><text>优惠券</text
						><MallPrice
							:value="
								checkoutCoupons.find(
									(c) =>
										Number(c.id) ===
										Number(selectedCouponId),
								)?.discountAmount || 0
							"
							:precision="2"
							negative
						/>
					</view>
					<view v-if="usePoints && pointsToUse > 0"
						><text>积分抵扣（{{ pointsToUse }}积分）</text
						><MallPrice
							:value="availablePointsDiscount"
							:precision="2"
							negative
						/>
					</view>
					<view class="amount-total"
						><text>应付合计</text
						><MallPrice
							:value="checkoutPayable"
							:precision="2"
							size="emphasis"
						/>
					</view>
				</view>
				<view
					class="submit-bar"
					:class="{ disabled: !hasCheckoutItems }"
				>
					<text v-if="hasCheckoutItems"
						>实付金额：<MallPrice
							:value="checkoutPayable"
							:precision="2"
							size="emphasis"
					/></text>
					<text v-else class="empty-submit-copy">暂无结算商品</text>
					<button
						:disabled="!hasCheckoutItems || orderSubmitting"
						@tap="submitOrder"
					>
						{{
							!hasCheckoutItems
								? "请先选择商品"
								: orderSubmitting
									? "正在创建订单…"
									: "立即支付"
						}}
					</button>
				</view>
				<OrderCollection
					:decoration="decoration('account.member')"
					v-if="hasCheckoutItems"
					@open="go('homeTopic')"
				/>
			</scroll-view>
			<view
				v-if="checkoutPanel"
				class="sheet-mask"
				@tap="checkoutPanel = ''"
				><view class="action-sheet checkout-sheet" @tap.stop>
					<view class="sheet-head"
						><view
							><text>{{
								checkoutPanel === "delivery"
									? "配送方式"
									: checkoutPanel === "coupon"
										? "优惠券"
										: "订单备注"
							}}</text
							><text>提交订单前可随时修改</text></view
						><text @tap="checkoutPanel = ''">×</text></view
					>
					<view
						v-if="checkoutPanel === 'delivery'"
						class="choice-list"
						><view
							class="selected"
							@tap="
								deliveryMethod = '顺丰快递（免运费）';
								checkoutPanel = '';
							"
							><view
								><text>顺丰快递</text
								><text>预计48小时内发出 · 免运费</text></view
							><text>✓</text></view
						></view
					>
					<view
						v-else-if="checkoutPanel === 'coupon'"
						class="choice-list"
						><view
							:class="{ selected: !selectedCouponId }"
							@tap="
								selectedCouponId = null;
								checkoutPanel = '';
							"
							><view
								><text>不使用优惠券</text
								><text>按服务端实时金额结算</text></view
							><text v-if="!selectedCouponId">✓</text></view
						><view
							v-for="c in checkoutCoupons"
							:key="c.id"
							:class="{
								selected:
									Number(selectedCouponId) === Number(c.id),
							}"
							@tap="
								selectedCouponId = c.id;
								checkoutPanel = '';
							"
							><view
								><text>{{ c.name }}</text
								><text
									>满{{ c.minOrderAmount }}减{{
										c.discountAmount
									}}
									· {{ c.scopeType }}</text
								></view
							><text
								v-if="Number(selectedCouponId) === Number(c.id)"
								>✓</text
							></view
						><view
							v-if="!checkoutCoupons.length"
							class="coupon-empty"
							><text>当前订单暂无可用优惠券</text></view
						></view
					>
					<view v-else class="remark-form">
						<textarea
							v-model="orderRemark"
							maxlength="100"
							placeholder="请填写商品、配送等补充说明，建议先与商家确认"
						/><text>{{ orderRemark.length }}/100</text
						><button @tap="saveRemark">保存备注</button></view
					>
				</view></view
			>
			<view v-if="toastText" class="toast">{{ toastText }}</view>
		</view>
	</view>
</template>

<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import BottomNav from "@/components/BottomNav.vue";
import ProductTile from "@/components/ProductTile.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import OrderCollection from "@/components/OrderCollection.vue";
import mallPage from "@/shared/mall-page.js";

export default {
	components: {
		StatusBar,
		TopBar,
		BottomNav,
		ProductTile,
		TeaIcon,
		OrderCollection,
	},
	mixins: [mallPage],
};
</script>

<style scoped>
.confirm-screen {
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}
.confirm-screen .submit-bar {
	min-height: 104rpx;
	padding-bottom: 14rpx;
}
.confirm-screen .address-card {
	grid-template-columns: 40rpx minmax(0, 1fr) 104rpx;
	align-items: center;
}
.confirm-screen .confirm-address-action {
	display: flex;
	width: 92rpx;
	height: 56rpx;
	min-width: 92rpx;
	padding: 0;
	align-self: center;
	align-items: center;
	justify-content: center;
	flex-direction: row;
	gap: 2rpx;
	border: 1px solid #d9e1da;
	border-radius: 28rpx;
	background: #fbfcfa;
	box-shadow: none;
	white-space: nowrap;
}
.confirm-screen .confirm-address-action text {
	font-size: 22rpx;
	line-height: 1;
}
.checkout-sheet .coupon-empty {
	display: flex;
	width: 100%;
	min-height: 120rpx;
	padding: 20rpx 24rpx;
	align-items: center;
	justify-content: center;
	flex-direction: row;
	border: 1px solid #d8e1d8;
	border-radius: 22rpx;
	background: #f6f9f5;
}
.checkout-sheet .coupon-empty > text:first-child {
	display: block;
	width: auto;
	height: auto;
	min-width: 0;
	border-radius: 0;
	background: transparent;
	color: #667168;
	font-size: 24rpx;
	line-height: 1.5;
	white-space: nowrap;
}
</style>
