<template>
	<view class="app-stage catalog-stage order-phase"
		><view class="phone-shell"
			><StatusBar /><TopBar title="申请售后" @back="back" />
			<scroll-view scroll-y class="shell-scroll-viewport screen lifecycle-screen shell-scroll--with-action">
				<view class="lifecycle-card"
					><text class="lifecycle-title">选择售后类型</text
					><view class="type-grid"
						><button
							v-for="item in availableTypes"
							:key="item"
							:class="{ active: typeName === item }"
							@tap="typeName = item"
						>
							{{ item }}
						</button></view
					></view
				>
				<view class="lifecycle-card"
					><text class="lifecycle-title">选择申请商品</text
					><view
						v-for="item in order?.items || []"
						:key="item.orderItemId"
						class="lifecycle-product selectable"
						:class="{
							active:
								selectedItem?.orderItemId === item.orderItemId,
						}"
						@tap="
							selectedItem = item;
							qty = 1;
						"
						><image
							:src="imageFor(item.imageKey)"
							mode="aspectFill"
						/><view
							><text>{{ item.name }}</text
							><text
								>{{ additionalProductSpec(item.name, item.spec) ? additionalProductSpec(item.name, item.spec) + ' · ' : '' }}可申请
								{{ availableQty(item) }} 件</text
							></view
						></view
					>
					<view v-if="selectedItem" class="qty-row"
						><text>申请数量</text
						><view
							><button @tap="qty = Math.max(1, qty - 1)">−</button
							><text>{{ qty }}</text
							><button
								@tap="
									qty = Math.min(
										availableQty(selectedItem),
										qty + 1,
									)
								"
							>
								＋
							</button></view
						></view
					></view
				>
				<view class="lifecycle-card"
					><text class="lifecycle-title">问题说明</text
					><picker
						mode="selector"
						:range="reasons"
						:value="reasonIndex"
						@change="reasonIndex = Number($event.detail.value)"
						><view class="picker-row"
							><text>申请原因</text
							><text>{{ reasons[reasonIndex] }} ›</text></view
						></picker
					><textarea
						v-model="description"
						maxlength="500"
						placeholder="请描述商品问题和诉求（最多500字）"
					/>
					<view class="evidence-grid"
						><image
							v-for="(url, i) in evidenceUrls"
							:key="url"
							:src="url"
							mode="aspectFill"
							@tap="evidenceUrls.splice(i, 1)"
						/><button
							v-if="evidenceUrls.length < 6"
							@tap="chooseEvidence"
						>
							＋<text>上传凭证</text>
						</button></view
					>
				</view>
				<view class="lifecycle-card"
					><view
						><text>后端计算可退金额</text
						><text class="refund-quote">{{
							quoteLoading
								? "计算中…"
								: quoteError ||
									"¥" + Number(quoteAmount || 0).toFixed(2)
						}}</text></view
					></view
				>
				<view class="lifecycle-note"
					>退款金额由服务端按商品实付、优惠券和积分分摊重新计算，页面提交金额不作为退款依据。</view
				> </scroll-view
			><view class="lifecycle-submit"
				><button
					:disabled="
						submitting ||
						!selectedItem ||
						availableQty(selectedItem) < 1
					"
					@tap="submit"
				>
					{{ submitting ? "提交中…" : "提交售后申请" }}
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
import { additionalProductSpec } from "@/shared/product-label.js";
export default {
	components: { StatusBar, TopBar },
	mixins: [mallPage],
	data() {
		return {
			order: null,
			typeName: "仅退款",
			selectedItem: null,
			qty: 1,
			reasonIndex: 0,
			reasons: [
				"不想要了",
				"商品破损或缺件",
				"商品质量问题",
				"商品与描述不符",
				"物流配送异常",
				"其他原因",
			],
			description: "",
			evidenceUrls: [],
			submitting: false,
			quoteLoading: false,
			quoteAmount: 0,
			quoteError: "",
		};
	},
	computed: {
		availableTypes() {
			return this.order?.status === "待发货"
				? ["仅退款"]
				: ["退货退款", "换货"];
		},
	},
	watch: {
		typeName() {
			this.refreshQuote();
		},
		qty() {
			this.refreshQuote();
		},
		selectedItem() {
			this.refreshQuote();
		},
	},
	onLoad(q) {
		this.selectedOrderNo = String(q.no || "");
		if (q.type) this.typeName = decodeURIComponent(String(q.type));
		this.loadOrder();
	},
	methods: {
		additionalProductSpec,
		availableQty(i) {
			return Math.max(
				0,
				Number(i?.qty || 0) -
					Number(i?.refundedQty || 0) -
					Number(i?.aftersaleLockedQty || 0),
			);
		},
		async refreshQuote() {
			const request = this._quoteRequest = (this._quoteRequest || 0) + 1;
			this.quoteAmount = 0;
			if (!this.order?.no || !this.selectedItem?.orderItemId) { this.quoteLoading = false; this.quoteError = "请选择可售后商品"; return false; }
			this.quoteLoading = true;
			this.quoteError = "";
			try {
				const quote = await mallApi.afterSaleQuote({
					orderNo: this.order.no,
					orderItemId: this.selectedItem.orderItemId,
					qty: this.qty,
					typeName: this.typeName,
				});
				if (request !== this._quoteRequest) return false;
				this.quoteAmount = Number(quote.requestedAmount || 0);
				return true;
			} catch (e) {
				if (request !== this._quoteRequest) return false;
				this.quoteAmount = 0;
				this.quoteError = e.message || "金额计算失败";
				return false;
			} finally {
				if (request === this._quoteRequest) this.quoteLoading = false;
			}
		},
		async loadOrder() {
			try {
				this.order = this.normalizeOrder(
					await mallApi.orderDetail(this.selectedOrderNo),
				);
				this.selectedItem =
					this.order.items.find((i) => this.availableQty(i) > 0) ||
					null;
				if (!this.availableTypes.includes(this.typeName))
					this.typeName = this.availableTypes[0];
				await this.refreshQuote();
			} catch (e) {
				this.toast(e.message || "订单加载失败");
			}
		},
		async chooseEvidence() {
			let picked;
			try {
				picked = await new Promise((resolve, reject) =>
					uni.chooseImage({
						count: 6 - this.evidenceUrls.length,
						sizeType: ["compressed"],
						sourceType: ["album", "camera"],
						success: resolve,
						fail: reject,
					}),
				);
			} catch (error) {
				if (!/cancel/i.test(String(error?.errMsg || error?.message || "")))
					this.toast("未能读取所选图片，请检查相册或相机权限");
				return;
			}
			const paths = Array.isArray(picked?.tempFilePaths)
				? picked.tempFilePaths
				: (picked?.tempFiles || [])
						.map((file) => file?.path || file?.tempFilePath)
						.filter(Boolean);
			for (const path of paths) {
				try {
					const data = await mallApi.uploadAftersaleEvidence(path);
					const uploaded =
						typeof data === "string"
							? data
							: data?.url || data?.fileUrl || data?.fileName || "";
					if (!uploaded)
						throw new Error("服务端未返回凭证图片地址");
					this.evidenceUrls.push(this.imageFor(uploaded));
				} catch (e) {
					this.toast(e.message || "凭证上传失败");
				}
			}
		},
		async submit() {
			if (this.submitting) return;
			if (!this.order?.no || !this.selectedItem || this.availableQty(this.selectedItem) < this.qty || this.qty < 1) return this.toast("请选择可售后的商品和有效数量");
			if (!this.description.trim()) return this.toast("请填写问题说明");
			this.submitting = true;
			const selection = JSON.stringify([this.order.no, this.selectedItem.orderItemId, this.qty, this.typeName]);
			const quoted = await this.refreshQuote();
			if (!quoted || selection !== JSON.stringify([this.order?.no, this.selectedItem?.orderItemId, this.qty, this.typeName]) || this.quoteError || this.quoteAmount <= 0) {
				this.submitting = false;
				return this.toast(this.quoteError || "商品或数量已变化，请确认当前报价后重新提交");
			}
			const key = `aftersaleRequest:${this.order.no}:${this.selectedItem.orderItemId}:${this.typeName}`;
			const requestNo =
				uni.getStorageSync(key) || mallApi.createAftersaleRequestId();
			uni.setStorageSync(key, requestNo);
			try {
				const result = await mallApi.submitAftersale({
					orderNo: this.order.no,
					orderItemId: this.selectedItem.orderItemId,
					qty: this.qty,
					typeName: this.typeName,
					reason: this.reasons[this.reasonIndex],
					description: this.description,
					evidenceUrls: this.evidenceUrls,
					requestNo,
				});
				uni.removeStorageSync(key);
				goPage("aftersaleDetail", { no: result.aftersaleNo });
			} catch (e) {
				this.toast(e.message || "售后申请失败");
			} finally {
				this.submitting = false;
			}
		},
	},
};
</script>
<style scoped src="../../styles/lifecycle-pages.css"></style>
