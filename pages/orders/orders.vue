<template>
	<view
		class="app-stage catalog-stage order-phase"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
	>
		<view class="phone-shell">
			<StatusBar />
			<TopBar title="我的订单" @back="back"
				><template #right
					><view
						class="top-icon-button"
						@tap="orderSearchOpen = !orderSearchOpen"
						><TeaIcon
							name="search"
							:size="20" /></view></template></TopBar
			><view v-if="orderSearchOpen" class="order-search"
				><TeaIcon name="search" :size="18" /><input
					v-model="orderSearchQuery"
					focus
					placeholder="输入订单号或商品名称"
				/><text v-if="orderSearchQuery" @tap="orderSearchQuery = ''"
					>×</text
				></view
			><view class="order-tabs"
				><text
					v-for="(tab, tabIndex) in [
						'全部',
						'待付款',
						'待发货',
						'待收货',
						'售后',
					]"
					:key="tab"
					:class="{ active: orderTabIndex === tabIndex }"
					@tap="orderTabIndex = tabIndex"
					>{{ tab }}</text
				></view
			><scroll-view scroll-y class="shell-scroll-viewport screen orders-screen"
				><view
					v-for="order in filteredOrders"
					:key="order.no"
					class="order-card"
					@tap="openOrder(order)"
					><view class="order-no"
						><text>订单号：{{ order.no }}</text
						><text :class="{ done: order.status === '已完成' }">{{
							order.status
						}}</text></view
					><view class="order-products-list"
						><view
							v-for="(item, itemIndex) in order.items?.length
								? order.items
								: [order]"
							:key="item.productId || `${order.no}-${itemIndex}`"
							class="order-product-block"
							><view class="order-product"><image
								:src="item.image || order.image"
								mode="aspectFill"
							/><view
								><text>{{ item.name || order.name }}</text
								><text class="muted">{{
									item.spec || order.spec
								}}</text
								><MallPrice
									:value="item.price ?? order.price ?? 0"
									:precision="2" /></view
							><text class="muted"
								>×{{ item.qty || 1 }}</text
							></view
							><view
								v-for="record in aftersalesForOrderItem(order, item)"
								:key="record.aftersaleNo"
								class="order-item-aftersale"
								@tap.stop="go('aftersaleDetail', { no: record.aftersaleNo })"
							>
								<view><text>{{ record.typeName }} · {{ record.status }}</text><text>售后单 {{ record.aftersaleNo }}</text></view><text>›</text>
							</view></view
						></view
					><view class="order-summary"
						><text>共{{ order.totalQty || 1 }}件商品</text
						><view class="order-summary__amount"
							><text>实付款：</text
							><MallPrice
								class="strong"
								:value="
									order.paidAmount ??
									order.totalAmount ??
									order.price ??
									0
								"
								:precision="2" /></view></view
					><view
						class="ui-order-actions"
						:class="{
							'order-payment-actions': order.status === '待付款',
						}"
					>
						<button
							v-if="order.status === '待付款'"
							class="order-payment-action order-payment-action--secondary"
							:disabled="orderActionSubmittingNo === order.no"
							@tap.stop="cancelOrder(order)"
						>
							{{
								orderActionSubmittingNo === order.no
									? "取消中…"
									: "取消订单"
							}}
						</button>
						<button
							v-if="canApplyAfterSale(order) && !aftersalesForOrder(order).length"
							class="aftersale-button"
							@tap.stop="startOrderAfterSale(order)"
						>
							申请售后
						</button>
						<button
							v-if="order.status !== '待付款'"
							@tap.stop="
								order.status === '已完成'
									? confirmDeleteOrder(order)
									: order.trackingNo
										? viewOrderLogistics(order)
										: openOrder(order)
							"
						>
							{{
								order.status === "已完成"
									? "删除订单"
									: order.trackingNo
										? "查看物流"
										: "订单详情"
							}}</button
						><button
							:class="[
								'green',
								order.status === '待付款'
									? 'order-payment-action order-payment-action--primary'
									: '',
							]"
							:disabled="
								order.status === '待付款' &&
								(paymentSubmitting ||
									orderActionSubmittingNo === order.no)
							"
							@tap.stop="orderPrimaryAction(order)"
						>
							{{ orderActionLabel(order) }}
						</button></view
					></view
				><view v-if="!filteredOrders.length" class="ui-order-empty"
					><view class="ui-order-empty__icon"
						><TeaIcon name="package" :size="26" /></view
					><text class="ui-order-empty__title"
						>暂无{{
							["全部", "待付款", "待发货", "待收货", "售后"][
								orderTabIndex
							]
						}}订单</text
					><text class="ui-order-empty__description"
						>选购商品后，订单进度会在这里展示</text
					><button class="ui-order-empty__button" @tap="go('home')">
						去首页逛逛
					</button></view
				><OrderCollection
					:decoration="decoration('account.member')"
					variant="pale"
					@open="go('homeTopic')"
				/>
				</scroll-view
			>
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
