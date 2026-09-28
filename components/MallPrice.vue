<template>
	<text
		class="mall-price"
		:class="[
			`mall-price--${size}`,
			`mall-price--${tone}`,
			{ 'mall-price--negative': displayNegative },
		]"
	>
		<text v-if="displayNegative" class="mall-price__sign">-</text>
		<text v-if="currency" class="mall-price__symbol">¥</text>
		<text class="mall-price__integer">{{ parts.integer }}</text>
		<text v-if="parts.decimal" class="mall-price__decimal"
			>.{{ parts.decimal }}</text
		>
		<text v-if="unit" class="mall-price__unit">{{ unit }}</text>
	</text>
</template>

<script>
import { formatMoney } from "@/shared/money.js";

export default {
	name: "MallPrice",
	props: {
		value: { type: [Number, String], default: 0 },
		precision: { type: Number, default: 2 },
		currency: { type: Boolean, default: true },
		negative: { type: Boolean, default: false },
		unit: { type: String, default: "" },
		size: { type: String, default: "body" },
		tone: { type: String, default: "price" },
		grouping: { type: Boolean, default: true },
	},
	computed: {
		parts() {
			return formatMoney(this.value, {
				precision: this.precision,
				grouping: this.grouping,
			});
		},
		displayNegative() {
			return this.negative || this.parts.negative;
		},
	},
};
</script>

<style scoped>
.mall-price {
	display: inline-flex;
	min-width: 0;
	align-items: baseline;
	color: var(--money-color);
	font-family: var(--money-font-family);
	font-size: var(--money-body-size);
	font-style: normal;
	font-weight: var(--money-font-weight);
	font-variant-numeric: tabular-nums lining-nums;
	letter-spacing: 0;
	line-height: 1.15;
	white-space: nowrap;
}
.mall-price--card {
	font-size: var(--money-card-size);
}
.mall-price--emphasis {
	font-size: var(--money-emphasis-size);
}
.mall-price--inherit {
	font-size: 1em;
}
.mall-price--neutral {
	color: inherit;
}
.mall-price--inverse {
	color: #fff;
}
.mall-price--gold {
	color: #f0d884;
}
.mall-price__sign,
.mall-price__symbol {
	font-size: var(--money-symbol-ratio);
	line-height: 1;
}
.mall-price__decimal {
	font-size: var(--money-decimal-ratio);
	line-height: 1;
}
.mall-price__unit {
	margin-left: 6rpx;
	font-family: var(--font-family-base);
	font-size: 0.58em;
	font-weight: 400;
	line-height: 1.2;
}
</style>
