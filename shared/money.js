const finiteMoney = (value) => {
	const amount = Number(value);
	return Number.isFinite(amount) ? amount : 0;
};

export function formatMoney(value, options = {}) {
	const precision = Math.max(0, Math.min(4, Number(options.precision ?? 2)));
	const absolute = Math.abs(finiteMoney(value));
	const fixed = absolute.toFixed(precision);
	const [integer, decimal = ""] = fixed.split(".");
	const grouped =
		options.grouping === false
			? integer
			: integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return {
		negative: finiteMoney(value) < 0,
		integer: grouped,
		decimal,
		text: `${finiteMoney(value) < 0 ? "-" : ""}¥${grouped}${decimal ? `.${decimal}` : ""}`,
	};
}

export function moneyText(value, precision = 2) {
	return formatMoney(value, { precision }).text;
}
