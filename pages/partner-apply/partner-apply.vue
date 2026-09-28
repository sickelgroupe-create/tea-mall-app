<template>
	<view
		class="app-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell partner-shell"
			><StatusBar /><TopBar :title="partnerAgreement?.formConfig?.title || '申请合伙人'" @back="back" /><scroll-view
				scroll-y
				class="shell-scroll-viewport partner-scroll"
				><view v-if="phaseError" class="phase-message"
					>{{ phaseError
					}}<button @tap="loadAgreement">重新加载</button></view
				><view v-else class="partner-card partner-form"
					><text>{{ partnerAgreement?.formConfig?.intro }}</text
					><button v-if="hasOptionalFields" class="partner-secondary" @tap="showOptional = !showOptional">{{ showOptional ? '收起选填资料' : '补充选填资料（可跳过）' }}</button><view
						v-for="field in visibleFields"
						:key="field.key"
						class="field"
						><text>{{ field.label }}{{ field.required ? ' *' : '（选填）' }}</text
						><textarea
							v-if="field.textarea"
							v-model.trim="form[field.key]"
							:maxlength="field.max"
							:placeholder="field.placeholder" /><input
							v-else
							v-model.trim="form[field.key]"
							:maxlength="field.max"
							:type="field.type || 'text'"
							:placeholder="field.placeholder" /></view
					><view
						class="partner-agree"
						@tap="form.agreed = !form.agreed"
						><text>{{ form.agreed ? "☑" : "☐" }}</text
						><text
							>我已阅读并同意
							<text
								style="color: #2b5b48"
								@tap.stop="showAgreement = true"
								>《{{
									partnerAgreement?.title || "合伙人服务协议"
								}}》</text
							></text
						></view
					><button
						class="partner-primary"
						:disabled="phaseSubmitting || !partnerAgreement"
						@tap="submit"
					>
						{{ phaseSubmitting ? "提交中…" : partnerAgreement?.formConfig?.submitText }}</button
					><button
						class="partner-secondary"
						@tap="go('partnerStatus')"
					>
						我的申请
					</button></view
				><view class="partner-collection"
					><image
						:src="decorationImage('partner.intro')"
						mode="aspectFill"
					/><text>{{ partnerAgreement?.formConfig?.footerText }}</text></view
				></scroll-view
			><view
				v-if="showAgreement"
				class="modal-mask"
				@tap="showAgreement = false"
				><view class="partner-card" @tap.stop
					><text class="partner-section-title">{{
						partnerAgreement?.title
					}}</text
					><scroll-view
						scroll-y
						style="
							height: 520rpx;
							white-space: pre-wrap;
							line-height: 1.9;
						"
						>{{ partnerAgreement?.content }}</scroll-view
					><button class="partner-primary" @tap="accept">
						同意并继续
					</button></view
				></view
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
import { partnerValidationError } from "@/shared/partner-validation.js";
export default {
	components: { StatusBar, TopBar },
	mixins: [mallPage, phase],
	computed: {
		hasOptionalFields() { return (this.partnerAgreement?.formConfig?.fields || []).some(field => !field.required); },
		visibleFields() { return (this.partnerAgreement?.formConfig?.fields || []).filter(field => field.required || this.showOptional || this.form[field.key]); },
	},
	data() {
		return {
			showOptional: false,
			showAgreement: false,
			form: {
				realName: "",
				idNo: "",
				region: "",
				address: "",
				phone: "",
				reason: "",
				agreed: false,
			},
		};
	},
	onShow() {
		this.loadAgreement();
	},
	methods: {
		accept() {
			this.form.agreed = true;
			this.showAgreement = false;
		},
		async submit() {
			if (this.phaseSubmitting) return;
			if (!this.partnerAgreement?.formConfig) { this.phaseToast('申请配置尚未加载，请重试'); return; }
			const error = partnerValidationError(this.form, this.partnerAgreement.formConfig.fields);
			if (error) { this.phaseToast(error); return; }
			this.phaseSubmitting = true;
			try {
				await mallApi.submitPartnerApplication({
					...this.form,
					agreementVersion: this.partnerAgreement?.version,
				});
				this.phaseToast("申请已提交");
				setTimeout(() => this.go("partnerStatus"), 350);
			} catch (e) {
				this.phaseToast(e.message);
			} finally {
				this.phaseSubmitting = false;
			}
		},
	},
};
</script>
