<template>
	<view
		class="app-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell partner-shell"
			><StatusBar /><TopBar title="合伙人介绍" @back="back" /><scroll-view
				scroll-y
				class="shell-scroll-viewport partner-scroll"
				><view class="partner-hero"
					><image
						:src="decorationImage('partner.intro')"
						mode="aspectFill"
					/><view class="partner-hero-copy"
						><text class="partner-kicker">TEA PARTNER</text
						><text class="partner-hero-title"
							>以茶会友，共享茶香</text
						><text class="partner-hero-sub"
							>成为茶席合伙人，让每一次分享都沉淀为长久价值</text
						></view
					></view
				><text class="partner-section-title">合伙人专属权益</text
				><view class="partner-benefits"
					><view
						v-for="item in benefits"
						:key="item.title"
						class="partner-benefit"
						><text>{{ item.title }}</text
						><text>{{ item.desc }}</text></view
					></view
				><view class="partner-card dark"
					><text class="partner-section-title">加入茶席计划</text
					><text
						>申请资料由平台真实审核，客户、业绩与收益均以后端订单数据为准。</text
					><button class="partner-primary" @tap="next">
						{{ cta }}
					</button></view
				><view class="partner-collection"
					><image
						:src="decorationImage('partner.intro')"
						mode="aspectFill"
					/><text>一席好茶 · 一生知己</text></view
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
export default {
	components: { StatusBar, TopBar },
	mixins: [mallPage, phase],
	data() {
		return {
			benefits: [
				{
					title: "专属身份",
					desc: "审核通过后开通合伙人工作台和客户服务能力",
				},
				{
					title: "客户沉淀",
					desc: "客户归属由服务端记录，数据清晰且可追踪",
				},
				{
					title: "业绩看板",
					desc: "有效订单、销售额和收益使用统一统计口径",
				},
				{
					title: "专业内容",
					desc: "分享真实商品与茶文化内容，建立长期信任",
				},
			],
		};
	},
	computed: {
		cta() {
			const s = this.partnerState?.partnerStatus;
			return s === "审核通过"
				? "进入工作台"
				: s === "待审核"
					? "查看审核进度"
					: "立即申请";
		},
	},
	onShow() {
		this.loadPartnerState();
	},
	methods: {
		next() {
			const s = this.partnerState?.partnerStatus;
			if (s === "审核通过") return this.go("partnerWorkbench");
			if (s === "待审核") return this.go("partnerStatus");
			this.go("partnerApply");
		},
	},
};
</script>
