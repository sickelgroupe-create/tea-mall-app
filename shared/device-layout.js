export function getDeviceLayout() {
	let system = {};
	try {
		system = uni.getWindowInfo?.() || uni.getSystemInfoSync?.() || {};
	} catch (_) {}
	let capsule = null;
	try {
		capsule = uni.getMenuButtonBoundingClientRect?.() || null;
	} catch (_) {}
	const statusBarHeight = Number(system.statusBarHeight || 0);
	const windowWidth = Number(system.windowWidth || system.screenWidth || 375);
	const capsuleRightInset = capsule
		? Math.max(0, windowWidth - Number(capsule.left || windowWidth))
		: 12;
	return {
		statusBarHeight,
		capsuleWidth: Number(capsule?.width || 0),
		capsuleRightInset,
		topBarHeight: capsule
			? Math.max(
					44,
					Number(capsule.height || 32) +
						Math.max(
							8,
							Number(capsule.top || statusBarHeight) -
								statusBarHeight,
						) *
							2,
				)
			: 48,
	};
}
