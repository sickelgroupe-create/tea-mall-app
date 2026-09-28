<template>
	<view class="product-tile" @tap="$emit('select', product)">
		<image
			class="product-photo"
			:src="product.image"
			mode="aspectFill"
			@load="onLoad"
			@error="onError"
		/>
		<view class="product-copy">
			<text class="product-name">{{ product.name }}</text>
			<text v-if="product.spec" class="product-spec">{{
				product.spec
			}}</text>
			<view class="price-row">
				<text v-if="pointsMode" class="price">{{
					product.points
				}}</text>
				<MallPrice
					v-else
					:value="product.price"
					:precision="0"
					size="card"
				/>
				<text v-if="pointsMode" class="unit">积分</text>
			</view>
			<text v-if="!pointsMode && product.reward" class="reward"
				>购得 {{ product.reward }} 积分</text
			>
			<text v-if="!pointsMode && product.sales" class="sales"
				>已售 {{ Number(product.sales).toLocaleString() }} 件</text
			>
			<text v-if="pointsMode && product.stock" class="stock"
				>剩余 {{ product.stock }}</text
			>
		</view>
	</view>
</template>

<script>
import { imageDiagnostic } from "@/shared/build-info.js";

export default {
	name: "ProductTile",
	props: {
		product: { type: Object, required: true },
		pointsMode: { type: Boolean, default: false },
	},
	emits: ["select"],
	methods: {
		onLoad(event) {
			imageDiagnostic(
				"LOAD",
				`product-tile-${this.product.id || "unknown"}`,
				this.product.imageKey,
				this.product.image,
				event,
			);
		},
		onError(event) {
			imageDiagnostic(
				"ERROR",
				`product-tile-${this.product.id || "unknown"}`,
				this.product.imageKey,
				this.product.image,
				event,
			);
		},
	},
};
</script>

<style scoped>
.product-tile {
	background: var(--color-surface);
	border: var(--border-width) solid var(--color-border);
	border-radius: var(--radius-lg);
	overflow: hidden;
	min-width: 0;
	height: 100%;
	box-shadow: var(--shadow-card);
	transition: opacity var(--motion-base) ease;
}
.product-tile:active {
	opacity: 0.84;
}
.product-photo {
	display: block;
	width: 100%;
	height: 352rpx;
	background: var(--color-surface-muted);
}
.product-copy {
	padding: var(--spacing-sm);
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
	min-height: 261.2rpx;
}
.product-name {
	font-size: var(--font-size-body-lg);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
	line-height: var(--line-height-body-lg);
	min-height: 80.4rpx;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
.product-spec,
.stock {
	font-size: var(--font-size-body);
	color: var(--color-text-secondary);
}
.price-row {
	display: flex;
	align-items: baseline;
	gap: var(--spacing-2xs);
	margin-top: auto;
}
.price {
	font-size: 36.8rpx;
	font-weight: var(--font-weight-semibold);
	color: var(--color-price);
	line-height: 1.2;
	font-variant-numeric: tabular-nums;
}
.unit {
	font-size: var(--font-size-body);
	color: var(--color-price);
}
.reward {
	font-size: var(--font-size-caption);
	color: var(--color-warning);
	background: var(--color-warning-soft);
	border-radius: var(--radius-xs);
	align-self: flex-start;
	padding: 3.3rpx 8.4rpx;
}
.sales {
	font-size: var(--font-size-caption);
	color: var(--color-text-tertiary);
	line-height: var(--line-height-caption);
}
</style>
