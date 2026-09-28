<template>
	<view class="app-stage catalog-stage order-phase"
		><view class="phone-shell"
			><StatusBar /><TopBar
				title="填写退货物流"
				@back="back"
			/><scroll-view scroll-y class="shell-scroll-viewport screen lifecycle-screen shell-scroll--with-action"
				><view class="lifecycle-card"
					><text class="lifecycle-title">退货物流信息</text
					><input
						v-model="carrier"
						maxlength="64"
						placeholder="物流公司"
					/><input
						v-model="trackingNo"
						maxlength="64"
						placeholder="物流单号"
					/><text class="lifecycle-note"
						>请核对物流单号。商家确认收到退货后，退货退款才会进入模拟退款流程。</text
					></view
				></scroll-view
			><view class="lifecycle-submit"
				><button :disabled="submitting" @tap="submit">
					{{ submitting ? "提交中…" : "提交退货物流" }}
				</button></view
			><view v-if="toastText" class="toast">{{ toastText }}</view></view
		></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import mallPage from "@/shared/mall-page.js";
import mallApi from "@/shared/mall-api.js";
import { goPage } from "@/shared/router.js";
export default {
	components: { StatusBar, TopBar },
	mixins: [mallPage],
	data() {
		return {
			aftersaleNo: "",
			carrier: "",
			trackingNo: "",
			submitting: false,
			pendingRequest: null,
		};
	},
	onLoad(q) {
		this.aftersaleNo = String(q.no || "");
	},
	methods: {
		async submit() {
			if (this.submitting) return;
			if (!this.aftersaleNo) return this.toast("缺少售后单号，请从售后详情重新进入");
			if (!this.carrier.trim() || !this.trackingNo.trim())
				return this.toast("请完整填写物流公司和单号");
			this.submitting = true;
			try {
				const carrier = this.carrier.trim(), trackingNo = this.trackingNo.trim();
				if (!this.pendingRequest || this.pendingRequest.carrier !== carrier || this.pendingRequest.trackingNo !== trackingNo)
					this.pendingRequest = {carrier, trackingNo, requestNo: mallApi.createActionRequestId()};
				await mallApi.submitReturnLogistics(this.aftersaleNo, this.pendingRequest);
				goPage("aftersaleDetail", { no: this.aftersaleNo });
			} catch (e) {
				this.toast(e.message || "提交失败");
			} finally {
				this.submitting = false;
			}
		},
	},
};
</script>
<style scoped src="../../styles/lifecycle-pages.css"></style>
