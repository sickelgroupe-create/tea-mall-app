<template>
	<view
		class="app-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell partner-shell"
			><StatusBar /><TopBar title="审核状态" @back="back" /><scroll-view
				scroll-y
				class="shell-scroll-viewport partner-scroll"
				><view v-if="phaseLoading" class="phase-message"
					>正在查询审核状态…</view
				><view v-else-if="phaseError" class="phase-message"
					>{{ phaseError
					}}<button @tap="loadPartnerState">重新加载</button></view
				><template v-else
					><view class="partner-card partner-state"
						><view class="partner-state-mark">{{ icon }}</view>
						<text class="partner-state-title">{{ status }}</text>
						<text class="partner-state-copy">{{ message }}</text>
						<text
							v-if="partnerState?.application?.rejectReason"
							class="partner-state-copy"
						>
							驳回原因：{{
								partnerState.application.rejectReason
							}}
						</text>
						<button
							v-if="status === '待审核'"
							class="partner-secondary"
							:disabled="phaseSubmitting"
							@tap="cancel"
						>
							取消申请</button
						><button
							v-if="
								status === '审核驳回' ||
								status === '已取消' ||
								status === '未申请'
							"
							class="partner-primary"
							@tap="go('partnerApply')"
						>
							{{ status === '未申请' ? '立即申请' : '修改并重新申请' }}</button
						><button
							v-if="status === '审核通过'"
							class="partner-primary"
							@tap="go('partnerWorkbench')"
						>
							进入工作台
						</button></view
					><view class="partner-card"
						><text class="partner-section-title">审核进度</text
						><view class="partner-timeline"
							><view
								v-for="row in partnerState?.audits || []"
								:key="row.createTime"
								class="partner-timeline-row"
								><text
									>{{ row.toStatus }} · {{ row.reason }}</text
								><text>{{ row.createTime }}</text></view
							><view
								v-if="!partnerState?.audits?.length"
								class="phase-message"
								>尚无审核记录</view
							></view
						></view
					><view class="partner-collection"
						><image
							:src="decorationImage('partner.intro')"
							mode="aspectFill"
						/><text>静候佳音 · 茶香可期</text></view
					></template
				></scroll-view
			></view
		></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import mallPage from "@/shared/mall-page.js";
import phase from "@/shared/phase33-40.js";
import mallApi from "@/shared/mall-api.js";
export default {
	components: { StatusBar, TopBar },
	mixins: [mallPage, phase],
	computed: {
		status() {
			return (
				this.partnerState?.application?.status ||
				this.partnerState?.partnerStatus ||
				"未申请"
			);
		},
		icon() {
			return this.status === "审核通过"
				? "✓"
				: this.status === "审核驳回"
					? "!"
					: "⌛";
		},
		message() {
			return (
				{
					待审核: "资料已安全提交，请耐心等待后台审核。",
					审核通过: "恭喜，合伙人权限已经开通。",
					审核驳回: "申请暂未通过，您可以查看原因后重新提交。",
					已取消: "本次申请已取消，资料和审核记录仍会保留。",
					未申请: "您尚未提交合伙人申请。",
				}[this.status] || "审核状态已更新。"
			);
		},
	},
	onShow() {
		this.loadPartnerState();
	},
	methods: {
		cancel() {
			uni.showModal({
				title: "取消申请",
				content: "取消后可重新提交，历史审核记录会保留。",
				success: async (r) => {
					if (!r.confirm) return;
					this.phaseSubmitting = true;
					try {
						this.partnerState =
							await mallApi.cancelPartnerApplication(
								this.partnerState.application.applicationNo,
							);
						this.phaseToast("已取消");
					} catch (e) {
						this.phaseToast(e.message);
					} finally {
						this.phaseSubmitting = false;
					}
				},
			});
		},
	},
};
</script>
