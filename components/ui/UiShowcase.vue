<template>
	<view class="ui-showcase-shell">
		<UiPage>
			<template #header
				><TopBar title="公共组件规范" :back="false"
			/></template>

			<UiSectionHeader
				title="按钮"
				description="一个页面最多突出一个主操作"
			/>
			<UiCard>
				<view class="ui-showcase-row">
					<UiButton size="sm" label="小按钮" />
					<UiButton variant="secondary" label="次要操作" />
					<UiIconButton icon="search" label="搜索" />
				</view>
				<view class="ui-showcase-stack">
					<UiButton block label="主要操作" />
					<UiButton block disabled label="禁用状态" />
				</view>
			</UiCard>

			<UiSectionHeader title="功能入口" action="查看全部" />
			<view class="ui-showcase-stack">
				<UiEntry
					icon="gift"
					title="积分商城"
					description="好礼随心兑"
				/>
				<UiEntry
					icon="package"
					title="即将上线"
					description="当前分类暂无在售商品"
					disabled
				/>
			</view>

			<UiSectionHeader
				title="列表与状态"
				description="同类信息保持一致布局"
			/>
			<UiCard>
				<UiListItem
					icon="location"
					title="收货地址"
					description="浙江省杭州市西湖区"
					value="默认"
					chevron
				/>
				<UiListItem
					icon="truck"
					title="物流状态"
					description="商家正在准备您的茶品"
					value="待发货"
					chevron
				/>
				<UiListItem
					icon="service"
					title="售后服务"
					description="退款、退货退款或换货"
					:divided="false"
					chevron
				/>
			</UiCard>
			<view class="ui-showcase-tags">
				<UiTag label="默认" />
				<UiTag tone="primary" label="主要" />
				<UiTag tone="success" label="已完成" />
				<UiTag tone="warning" label="待发货" />
				<UiTag tone="error" label="异常" />
			</view>

			<UiSectionHeader
				title="表单"
				description="错误提示参与正常文档流"
			/>
			<UiCard>
				<view class="ui-showcase-stack">
					<UiField
						v-model="name"
						label="收货人"
						placeholder="请输入收货人姓名"
						clearable
					/>
					<UiField
						v-model="phone"
						label="手机号"
						placeholder="请输入手机号"
						type="number"
						helper="用于接收订单和配送通知"
					/>
					<UiField
						label="示例错误"
						model-value="138"
						error="请输入完整的11位手机号"
					/>
				</view>
			</UiCard>

			<UiSectionHeader title="空状态与加载" />
			<UiCard
				><UiEmptyState
					title="暂无订单"
					description="完成下单后可在这里查看订单进度"
					action="去逛逛"
			/></UiCard>
			<UiLoadingState inline text="正在同步商品信息" />

			<UiSectionHeader title="底部操作栏" />
			<UiActionBar :safe-area="false">
				<template #summary
					><view class="ui-showcase-summary"
						><text>合计：</text
						><MallPrice :value="268" :precision="2" /></view
				></template>
				<UiButton variant="secondary" label="加入购物车" />
				<UiButton label="立即购买" @select="sheetVisible = true" />
			</UiActionBar>
		</UiPage>

		<UiSheet
			:visible="sheetVisible"
			title="确认操作"
			description="弹窗内部不使用绝对定位对齐内容"
			@close="sheetVisible = false"
		>
			<UiListItem
				title="商品"
				value="明前西湖龙井 100g"
				:divided="false"
			/>
			<template #footer
				><UiButton block label="确定" @select="sheetVisible = false"
			/></template>
		</UiSheet>
	</view>
</template>

<script>
import TopBar from "@/components/TopBar.vue";
import UiActionBar from "@/components/ui/UiActionBar.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiCard from "@/components/ui/UiCard.vue";
import UiEmptyState from "@/components/ui/UiEmptyState.vue";
import UiEntry from "@/components/ui/UiEntry.vue";
import UiField from "@/components/ui/UiField.vue";
import UiIconButton from "@/components/ui/UiIconButton.vue";
import UiListItem from "@/components/ui/UiListItem.vue";
import UiLoadingState from "@/components/ui/UiLoadingState.vue";
import UiPage from "@/components/ui/UiPage.vue";
import UiSectionHeader from "@/components/ui/UiSectionHeader.vue";
import UiSheet from "@/components/ui/UiSheet.vue";
import UiTag from "@/components/ui/UiTag.vue";

export default {
	name: "UiShowcase",
	components: {
		TopBar,
		UiActionBar,
		UiButton,
		UiCard,
		UiEmptyState,
		UiEntry,
		UiField,
		UiIconButton,
		UiListItem,
		UiLoadingState,
		UiPage,
		UiSectionHeader,
		UiSheet,
		UiTag,
	},
	data() {
		return {
			name: "茶友小李",
			phone: "13888888888",
			sheetVisible: false,
		};
	},
};
</script>

<style scoped>
.ui-showcase-shell {
	width: 100%;
	height: 100vh;
	min-height: 100vh;
}
.ui-showcase-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: var(--spacing-xs);
}
.ui-showcase-stack {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
}
.ui-showcase-row + .ui-showcase-stack {
	margin-top: var(--spacing-sm);
}
.ui-showcase-tags {
	margin-top: var(--spacing-sm);
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: var(--spacing-xs);
}
.ui-showcase-summary {
	color: var(--color-text-secondary);
	font-size: var(--font-size-body);
	line-height: var(--line-height-body);
}
.ui-showcase-summary text {
	color: var(--color-price);
	font-size: var(--font-size-body-lg);
	font-weight: var(--font-weight-semibold);
}
</style>
