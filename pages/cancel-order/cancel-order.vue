<template>
	<view class="app-stage catalog-stage order-phase"
		><view class="phone-shell"
			><StatusBar /><TopBar title="取消订单" @back="back" />
			<scroll-view scroll-y class="shell-scroll-viewport screen lifecycle-screen shell-scroll--with-action">
				<view v-if="order" class="lifecycle-card">
					<text class="lifecycle-title">订单信息</text>
					<view
						><text>订单号</text><text>{{ order.no }}</text></view
					>
					<view
						><text>当前状态</text
						><text>{{ order.status }}</text></view
					>
					<view
						><text>实付金额</text
						><MallPrice :value="order.paidAmount" :precision="2"
					/></view>
					<view
						v-for="item in order.items"
						:key="item.orderItemId"
						class="lifecycle-product"
						><image
							:src="imageFor(item.imageKey)"
							mode="aspectFill"
						/><view
							><text>{{ item.name }}</text
							><text>{{ item.spec }} ×{{ item.qty }}</text></view
						></view
					>
				</view>
				<view class="lifecycle-card"
					><text class="lifecycle-title">选择取消原因</text>
					<label
						v-for="item in reasons"
						:key="item"
						class="radio-row"
						@tap="reason = item"
						><text>{{ item }}</text
						><radio color="#205b3a" :checked="reason === item"
					/></label>
					<textarea
						v-model="note"
						maxlength="500"
						placeholder="补充说明（选填，最多500字）"
					/>
				</view>
				<view class="lifecycle-note"
					>未支付订单取消后不会扣减库存，并释放已锁定优惠券、撤销尚未生效的积分变化；已支付订单请从订单详情申请仅退款。</view
				>
			</scroll-view>
			<view class="lifecycle-submit"
				><button :disabled="submitting || !order" @tap="submitCancel">
					{{ submitting ? "提交中…" : "确认取消订单" }}
				</button></view
			>
			<view v-if="toastText" class="toast">{{ toastText }}</view>
		</view></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import MallPrice from "@/components/MallPrice.vue";
import mallPage from "@/shared/mall-page.js";
import mallApi from "@/shared/mall-api.js";
import { replacePage } from "@/shared/router.js";
export default {
	components: { StatusBar, TopBar, MallPrice },
	mixins: [mallPage],
	data() {
		return {
			order: null,
			reason: "不想购买了",
			note: "",
			submitting: false,
			reasons: [
				"不想购买了",
				"商品信息填写错误",
				"收货地址填写错误",
				"重复下单",
				"其他原因",
			],
		};
	},
	onLoad(q) {
		this.selectedOrderNo = String(q.no || "");
		this.loadCancelOrder();
	},
	methods: {
		async loadCancelOrder() {
			try {
				this.order = this.normalizeOrder(
					await mallApi.orderDetail(this.selectedOrderNo),
				);
			} catch (e) {
				this.toast(e.message || "订单加载失败");
			}
		},
		async submitCancel() {
			if (this.submitting) return;
			this.submitting = true;
			try {
				await mallApi.cancelOrder(this.order.no, {
					reason: this.reason,
					note: this.note,
					requestNo: mallApi.createActionRequestId(),
				});
				this.toast("订单已取消");
				setTimeout(
					() => replacePage("orderDetail", { no: this.order.no }),
					300,
				);
			} catch (e) {
				this.toast(e.message || "取消失败");
			} finally {
				this.submitting = false;
			}
		},
	},
};
</script>
<style scoped src="../../styles/lifecycle-pages.css"></style>
