<template>
	<view class="app-stage catalog-stage order-phase"
		><view class="phone-shell"
			><StatusBar /><TopBar title="售后详情" @back="back" />
			<scroll-view scroll-y class="shell-scroll-viewport screen lifecycle-screen shell-scroll--with-action"
					><view v-if="loadError" class="lifecycle-card"><text>{{ loadError }}</text><button @tap="load">重新加载</button></view><view v-else-if="!detail" class="lifecycle-card"><text>正在加载售后详情…</text></view><view v-if="detail" class="status-hero"
					><text>{{ detail.status }}</text
					><text>{{ statusCopy }}</text></view
				>
				<view v-if="detail" class="lifecycle-card"
					><text class="lifecycle-title">售后信息</text
					><view
						><text>售后单号</text
						><text>{{ detail.aftersaleNo }}</text></view
					><view
						><text>原订单号</text
						><text>{{ detail.orderNo }}</text></view
					><view
						><text>售后类型</text
						><text>{{ detail.typeName }}</text></view
					><view
						><text>商品</text
						><text
							>{{ productLabel(detail.productName, detail.spec) }} ×{{
								detail.qty
							}}</text
						></view
					><view
						><text>申请原因</text
						><text>{{ detail.reason }}</text></view
					><view
						><text>问题说明</text
						><text>{{ detail.description || "—" }}</text></view
					><view
						><text>可退金额</text
						><text
							>¥{{
								Number(detail.requestedAmount || 0).toFixed(2)
							}}</text
						></view
					><view
						><text>实际模拟退款</text
						><text
							>¥{{
								Number(detail.refundAmount || 0).toFixed(2)
							}}</text
						></view
					><view v-if="detail.adminRemark"
						><text>商家说明</text
						><text>{{ detail.adminRemark }}</text></view
					><view v-if="detail.returnAddress"
						><text>退货地址</text
						><text>{{ detail.returnAddress }}</text></view
					><view v-if="detail.returnTrackingNo"
						><text>退货物流</text
						><text
							>{{ detail.returnCarrier }}
							{{ detail.returnTrackingNo }}</text
						></view
					><view v-if="detail.exchangeTrackingNo"
						><text>换货物流</text
						><text
							>{{ detail.exchangeCarrier }}
							{{ detail.exchangeTrackingNo }}</text
						></view
					><view class="evidence-grid"
						><image
							v-for="url in evidence"
							:key="url"
							:src="url"
							mode="aspectFill" /></view
				></view>
				<view v-if="detail" class="lifecycle-card"
					><text class="lifecycle-title">处理时间轴</text
					><view
						v-for="(step, i) in detail.timeline"
						:key="i"
						class="timeline-row"
						><text>{{ step.newStatus }}</text
						><text>{{ step.remark || step.sourceName }}</text
						><text>{{ step.createTime }}</text></view
					></view
				> </scroll-view
			><view
				v-if="detail && actions.length"
				class="lifecycle-submit multi"
				><button
					v-for="action in actions"
					:key="action"
					:disabled="acting || loading || !!loadError"
					@tap="run(action)"
				>
					{{ action }}
				</button></view
			><view v-if="toastText" class="toast">{{ toastText }}</view>
		</view></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import mallPage from "@/shared/mall-page.js";
import mallApi from "@/shared/mall-api.js";
import { goPage } from "@/shared/router.js";
import { productLabel } from "@/shared/product-label.js";
export default {
	components: { StatusBar, TopBar },
	mixins: [mallPage],
	data() {
		return { detail: null, aftersaleNo: "", acting: false, loading: false, loadError: "", actionRequests: {} };
	},
	computed: {
		evidence() {
			return String(this.detail?.evidenceUrls || "")
				.split(/\r?\n/)
				.filter(Boolean)
				.map((url) => this.imageFor(url));
		},
		actions() {
			if (["申请中", "等待用户退货"].includes(this.detail?.status))
				return this.detail.status === "等待用户退货"
					? ["填写退货物流", "撤销售后"]
					: ["撤销售后"];
			if (this.detail?.status === "换货已发出")
				return ["确认收到换货商品"];
			return [];
		},
		statusCopy() {
			const m = {
				申请中: "申请已提交，等待商家审核",
				等待用户退货: "审核已通过，请填写退货物流",
				退货运输中: "退货运输中，等待商家确认收货",
				退款处理中: "商家正在执行隔离测试退款",
				退款成功: "模拟退款已完成",
				换货已发出: "商家已寄出换货商品",
				售后完成: "本次售后已完成",
				审核拒绝: "商家已拒绝本次申请",
			};
			return (
				m[this.detail?.status] ||
				this.detail?.adminRemark ||
				"售后状态已更新"
			);
		},
	},
	onLoad(q) {
		this.aftersaleNo = String(q.no || "");
		this.load();
	},
	onShow() {
		if (this.aftersaleNo) this.load();
	},
	methods: {
		productLabel,
		async load() {
			const request = this._detailRequest = (this._detailRequest || 0) + 1;
			if (!this.aftersaleNo) { this.loadError = "缺少售后单号，请从订单或售后记录重新进入"; return; }
			this.loading = true;
			this.loadError = "";
			try {
				const detail = await mallApi.afterSaleDetail(this.aftersaleNo);
				if (request === this._detailRequest) this.detail = detail;
			} catch (e) {
				if (request === this._detailRequest) this.loadError = e.message || "售后详情加载失败";
			} finally {
				if (request === this._detailRequest) this.loading = false;
			}
		},
		async run(action) {
			if (this.acting || this.loading || this.loadError || !this.actions.includes(action)) return;
			if (action === "填写退货物流")
				return goPage("returnLogistics", { no: this.aftersaleNo });
			this.acting = true;
			try {
				const confirmed = await new Promise(resolve => uni.showModal({title: action, content: action === "撤销售后" ? "确认撤销本次售后申请？" : "请确认已实际收到换货商品后再继续。", success: result => resolve(result.confirm), fail: () => resolve(false)}));
				if (!confirmed) return;
				const requestNo = this.actionRequests[action] || (this.actionRequests[action] = mallApi.createActionRequestId());
				if (action === "撤销售后")
					await mallApi.cancelAftersale(this.aftersaleNo, {
						reason: "用户主动撤销",
						requestNo,
					});
				else
					await mallApi.confirmAftersaleExchangeReceipt(this.aftersaleNo, {
						requestNo,
					});
				await this.load();
			} catch (e) {
				this.toast(e.message || "操作失败");
			} finally {
				this.acting = false;
			}
		},
	},
};
</script>
<style scoped src="../../styles/lifecycle-pages.css"></style>
