<template>
	<view
		class="app-stage catalog-stage order-phase"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
	>
		<view class="phone-shell">
			<StatusBar />
			<TopBar title="物流与售后" @back="back" /><scroll-view
				scroll-y
				class="shell-scroll-viewport screen logistics-screen shell-scroll--with-action"
				><view class="carrier"
					><text class="carrier-logo">SF</text
					><text
						>{{ selectedOrder?.carrier || "物流信息" }}　<text
							class="small"
							>{{ selectedOrder?.trackingNo || "待生成" }}</text
						></text
					><button @tap="copyTracking">复制</button></view
				><view v-if="progressTimeline.length" class="timeline"
					><view
						v-for="(step, i) in progressTimeline"
						:key="`${step.title}-${step.time}-${i}`"
						:class="{
							future:
								selectedOrder.status !== '已完成' &&
								!step.active,
						}"
						><view class="timeline-dot"></view
						><view
							><text>{{ step.title }}</text
							><text class="small">{{ step.time }}</text>
							<view class="paragraph">{{ step.desc }}</view>
							<button
								v-if="step.courierAction"
								@tap="openService('courier')"
							>
								联系快递员
							</button></view
						></view
					></view
				><view v-if="!logistics.length" class="logistics-empty"
					><TeaIcon name="truck" :size="30" /><text
						>物流轨迹待更新</text
					><text
						>商家发货并填写运单号后，这里会显示真实物流进度。</text
					></view
				><view v-if="selectedOrder" class="order-card logistics-order-card">
					<view class="order-no"><text>订单号：{{ selectedOrder.no }}</text><text>{{ selectedOrder.status }}</text></view>
					<view v-for="item in selectedOrder.items || []" :key="item.orderItemId || item.productId" class="order-product-block">
						<view class="order-product">
							<image :src="item.image" mode="aspectFill" />
							<view><text>{{ item.name }}</text><text class="muted">{{ item.spec || "默认规格" }}</text></view>
							<text class="muted">×{{ item.qty || 1 }}</text>
						</view>
						<view v-for="record in aftersalesForOrderItem(selectedOrder, item)" :key="record.aftersaleNo" class="order-item-aftersale" @tap="go('aftersaleDetail', { no: record.aftersaleNo })">
							<view><text>{{ record.typeName }} · {{ record.status }}</text><text>售后单 {{ record.aftersaleNo }}</text></view><text>›</text>
						</view>
					</view>
					<button v-if="canApplyAfterSale(selectedOrder) && !aftersalesForOrder(selectedOrder).length" class="order-aftersale-button" @tap="startOrderAfterSale(selectedOrder)">申请售后</button>
				</view
				><OrderCollection
					:decoration="decoration('account.member')"
					@open="go('homeTopic')"
				/> </scroll-view
			><view class="support-bar" :class="{ 'support-bar--three': selectedOrder?.status === '待收货' }"
				><view @tap="openService('merchant')"
					><TeaIcon name="headset" :size="22" /><text
						>联系商家</text
					></view
				><view
					v-if="selectedOrder?.status === '待收货'"
					@tap="confirmOrder(selectedOrder)"
					><TeaIcon name="check" :size="22" /><text
						>确认收货</text
					></view
				><view @tap="go('settings')"
					><TeaIcon name="service" :size="22" /><text
						>服务中心</text
					></view
				></view
			>
			<view
				v-if="servicePanel"
				class="sheet-mask"
				@tap="servicePanel = ''"
				><view class="action-sheet contact-sheet" @tap.stop
					><view class="sheet-head"
						><view
							><text>{{
								servicePanel === "courier"
									? "联系快递员"
									: "联系商家"
							}}</text
							><text>服务时间 09:00－21:00</text></view
						><text @tap="servicePanel = ''">×</text></view
					><view class="contact-card"
						><text>{{
							servicePanel === "courier"
								? "派送联系方式"
								: "茶韵天香客服"
						}}</text
						><text>{{
							servicePanel === "courier"
								? "请以实时物流轨迹显示为准"
								: "通过在线工单联系商家客服"
						}}</text></view
					><button @tap.stop="contactService(servicePanel)">
						{{
							servicePanel === "courier"
								? "查看联系说明"
								: "进入在线客服"
						}}
					</button></view
				></view
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
	computed: {
		progressTimeline() {
			const logistics = (this.logistics || []).map((step, index, rows) => ({
				...step,
				active: !(this.selectedOrder?.status !== "已完成" && index === rows.length - 1),
				courierAction: /派送|配送/.test(String(step.title || "")),
			}));
			const aftersales = this.aftersalesForOrder(this.selectedOrder).map((record) => ({
				title: `${record.typeName} · ${record.status}`,
				time: String(record.createTime || "").slice(5, 16),
				desc: `售后单 ${record.aftersaleNo}`,
				active: true,
				courierAction: false,
			}));
			return [...logistics, ...aftersales];
		},
	},
};
</script>
