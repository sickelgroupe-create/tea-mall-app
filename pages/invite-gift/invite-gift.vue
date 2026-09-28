<template>
	<view class="invite-legacy"
		><text>{{ error || "正在进入茶友专属兑换…" }}</text
		><button v-if="error" @tap="open">进入茶友兑换</button></view
	>
</template>
<script>
export default {
	data() {
		return { error: "" };
	},
	onLoad() {
		this.open();
	},
	methods: {
		open() {
			this.error = "";
			uni.redirectTo({
				url: "/pages/invite-rewards/invite-rewards",
				fail: () => {
					this.error = "页面跳转失败，请重试";
				},
			});
		},
	},
};
</script>
<style scoped>
.invite-legacy {
	padding: 80rpx 24rpx;
	text-align: center;
	color: #285a40;
	line-height: 1.8;
}
.invite-legacy button {
	margin-top: 24rpx;
}
</style>
