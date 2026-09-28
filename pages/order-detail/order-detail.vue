<template>
	<view
		class="app-stage catalog-stage order-phase"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
	>
		<view class="phone-shell">
			<StatusBar />
			<TopBar title="订单详情" @back="back"
				><template #right
					><view class="head-actions"
						><view @tap="contactService('merchant')"
							><TeaIcon
								name="headset"
								:size="20" /></view></view></template></TopBar
			><scroll-view
				v-if="selectedOrder"
				scroll-y
				class="shell-scroll-viewport screen order-detail action-pad shell-scroll--with-action"
				><view
					class="ui-order-status-card"
					@tap="orderPrimaryAction(selectedOrder)"
					><view class="ui-order-status-card__content"
						><view class="ui-order-status-card__icon"
							><TeaIcon
								name="truck"
								:size="24"
								tone="white" /></view
						><view class="ui-order-status-card__copy"
							><text class="ui-order-status-card__title">{{
								selectedOrder.status
							}}</text
							><text class="ui-order-status-card__description">{{
								orderStatusDescription(selectedOrder)
							}}</text></view
						></view
					><button
						class="ui-order-status-card__button"
						v-if="
							selectedOrder.trackingNo &&
							selectedOrder.status !== '已取消'
						"
						@tap.stop="viewOrderLogistics(selectedOrder)"
					>
						查看物流</button
					><button
						class="ui-order-status-card__button"
						v-else-if="selectedOrder.status === '待付款'"
						@tap.stop="openPayment(selectedOrder)"
					>
						立即支付</button
					><button
						class="ui-order-status-card__button"
						v-else
						@tap.stop="orderPrimaryAction(selectedOrder)"
					>
						{{ orderActionLabel(selectedOrder) }}
					</button></view
				><view class="address-card"
					><TeaIcon class="address-pin" name="location" :size="20" />
					<view
						><text
							>收货人：{{
								selectedOrder.receiverName ||
								addresses[0]?.name ||
								"待补充"
							}}　{{
								selectedOrder.receiverPhone ||
								addresses[0]?.phone ||
								""
							}}</text
						><text>{{
							selectedOrder.receiverAddress ||
							(addresses[0]
								? addresses[0].line1 + " " + addresses[0].line2
								: "暂无收货地址")
						}}</text></view
					><text>›</text></view
				><view class="shop-card"
					><view class="shop-name" @tap="go('home')"
						><text>茶韵天香官方旗舰店</text><text>›</text></view
					><view
						v-for="item in selectedOrder.items?.length
							? selectedOrder.items
							: [selectedOrder]"
						:key="item.productId || item.name"
						class="order-product-block"
						><view class="order-product"
							><image
								:src="item.image || selectedOrder.image"
								mode="aspectFill"
								@tap="
									openProduct(
										products.find(
											(product) =>
												Number(product.id) ===
												Number(item.productId),
										) || products[0],
									)
								"
							/><view
								><text>{{ item.name }}</text
								><text class="muted">{{ item.spec }}</text
								><MallPrice
									:value="item.price"
									:precision="2" /></view
							><text class="muted"
								>×{{ item.qty || 1 }}</text
							></view
						><view
							v-for="record in aftersalesForOrderItem(
								selectedOrder,
								item,
							)"
							:key="record.aftersaleNo"
							class="order-item-aftersale"
							@tap="
								go('aftersaleDetail', {
									no: record.aftersaleNo,
								})
							"
						>
							<view
								><text
									>{{ record.typeName }} ·
									{{ record.status }}</text
								><text
									>售后单 {{ record.aftersaleNo }}</text
								></view
							><text>›</text>
						</view></view
					></view
				><view class="detail-data"
					><view
						><text>订单编号</text
						><text class="copy-link" @tap="copyOrderNo"
							>{{ selectedOrder.no }}　复制</text
						></view
					><view
						><text>下单时间</text
						><text>{{ selectedOrder.createTime }}</text></view
					><view
						><text>订单状态</text
						><text>{{ selectedOrder.status }}</text></view
					><view v-if="selectedOrder.cancelReason"
						><text>取消原因</text
						><text>{{ selectedOrder.cancelReason }}</text></view
					><view v-if="selectedOrder.cancelNote"
						><text>取消说明</text
						><text>{{ selectedOrder.cancelNote }}</text></view
					><view v-if="selectedOrder.cancelTime"
						><text>取消时间</text
						><text>{{ selectedOrder.cancelTime }}</text></view
					>
					<view
						v-if="
							selectedOrder.trackingNo &&
							selectedOrder.status !== '已取消'
						"
						><text>快递公司</text><text>顺丰速运</text></view
					><view v-if="selectedOrder.status !== '已取消'"
						><text>快递单号</text
						><text>{{
							selectedOrder.trackingNo || "待生成"
						}}</text></view
					>
					<view class="detail-divider"></view>
					<view
						><text>商品总额</text
						><MallPrice
							:value="selectedOrder.totalAmount"
							:precision="2"
							tone="neutral" /></view
					><view
						><text>运费</text
						><MallPrice
							:value="selectedOrder.shippingFee"
							:precision="2"
							tone="neutral" /></view
					><view v-if="Number(selectedOrder.discountAmount || 0)"
						><text>优惠金额</text
						><MallPrice
							:value="selectedOrder.discountAmount"
							:precision="2"
							negative /></view
					><view v-if="Number(selectedOrder.pointsDiscount || 0)"
						><text>积分抵扣</text
						><MallPrice
							:value="selectedOrder.pointsDiscount"
							:precision="2"
							negative /></view
					><view v-if="Number(selectedOrder.refundedAmount || 0)"
						><text>累计模拟退款</text
						><MallPrice
							:value="selectedOrder.refundedAmount"
							:precision="2"
							negative /></view
					><view
						><text>支付方式</text
						><text
							>{{ selectedOrder.paymentMethod || "—" }} ·
							{{ selectedOrder.paymentStatus || "—" }}</text
						></view
					><view class="total"
						><text>实付款</text
						><MallPrice
							:value="
								selectedOrder.paidAmount ??
								selectedOrder.totalAmount ??
								0
							"
							:precision="2"
							size="emphasis" /></view></view
				><view
					v-if="
						canApplyAfterSale(selectedOrder) &&
						!aftersalesForOrder(selectedOrder).length
					"
					class="section-card aftersale-entry"
					@tap="startOrderAfterSale(selectedOrder)"
				>
					<view
						><TeaIcon name="service" :size="21" /><view
							><text>申请订单售后</text
							><text
								>支持退款、退货退款与换货，提交后可查看处理进度</text
							></view
						></view
					>
					<text>›</text>
				</view>
				<OrderCollection
					:decoration="decoration('account.member')"
					@open="go('homeTopic')"
				/>
			</scroll-view>
			<scroll-view v-else scroll-y class="shell-scroll-viewport screen order-detail action-pad shell-scroll--with-action">
				<view class="commercial-empty order-missing-empty">
					<view class="empty-state-icon"
						><TeaIcon name="clipboard" :size="29"
					/></view>
					<text>未找到订单详情</text>
					<text
						>订单可能已删除或链接参数不完整，请返回订单列表重新选择。</text
					>
					<button @tap="go('orders')">返回我的订单</button>
				</view>
			</scroll-view>
			<view
				v-if="selectedOrder"
				class="double-action"
				:class="{
					'order-payment-actions': selectedOrder.status === '待付款',
				}"
			>
				<button
					v-if="selectedOrder.status === '待付款'"
					class="order-payment-action order-payment-action--secondary"
					:disabled="orderActionSubmittingNo === selectedOrder.no"
					@tap="cancelOrder(selectedOrder)"
				>
					{{
						orderActionSubmittingNo === selectedOrder.no
							? "取消中…"
							: "取消订单"
					}}
				</button>
				<button
					v-else
					@tap="
						selectedOrder.trackingNo
							? viewOrderLogistics(selectedOrder)
							: contactService('merchant')
					"
				>
					{{ selectedOrder.trackingNo ? "查看物流" : "联系客服" }}
				</button>
				<button
					:class="[
						'green',
						selectedOrder.status === '待付款'
							? 'order-payment-action order-payment-action--primary'
							: '',
					]"
					:disabled="
						selectedOrder.status === '待付款' &&
						(paymentSubmitting ||
							orderActionSubmittingNo === selectedOrder.no)
					"
					@tap="orderPrimaryAction(selectedOrder)"
				>
					{{ orderActionLabel(selectedOrder) }}
				</button>
			</view>
			<ReviewSheet
				v-if="reviewTarget"
				:target="reviewTarget"
				:rating="reviewRating"
				:content="reviewContent"
				:error="reviewError"
				:submitting="reviewSubmitting"
				@close="closeReview"
				@submit="submitReview"
				@update:rating="reviewRating = $event"
				@update:content="reviewContent = $event"
				@clear-error="reviewError = ''"
			/>
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
import ReviewSheet from "@/components/ReviewSheet.vue";
import OrderCollection from "@/components/OrderCollection.vue";
import mallPage from "@/shared/mall-page.js";

export default {
	components: {
		StatusBar,
		TopBar,
		BottomNav,
		ProductTile,
		TeaIcon,
		ReviewSheet,
		OrderCollection,
	},
	mixins: [mallPage],
};
</script>
