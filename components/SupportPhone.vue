<template>
  <view class="support-phone-card">
    <text class="support-phone-label">客服电话</text>
    <text v-if="loading">正在读取客服电话…</text>
    <view v-else-if="error" class="support-phone-error">
      <text>{{ error }}</text><button size="mini" @tap="load">重新读取</button>
    </view>
    <button v-else-if="phone" class="support-phone-dial" :disabled="dialing" @tap="dial">
      {{ phone }} · 点击拨打
    </button>
    <text v-else>商家尚未配置客服电话，您可以提交下方在线工单。</text>
  </view>
</template>
<script>
import mallApi from "@/shared/mall-api.js";
export default {
  data() { return { phone: "", loading: true, error: "", dialing: false, loadId: 0 }; },
  mounted() { this.load(); },
  methods: {
    async load() {
      const id = ++this.loadId;
      this.loading = true; this.error = ""; this.phone = "";
      try {
        const data = await mallApi.supportContact();
        if (id === this.loadId) this.phone = data.phone || "";
      } catch (e) {
        if (id === this.loadId) this.error = "客服电话读取失败，请重新读取。";
      } finally { if (id === this.loadId) this.loading = false; }
    },
    dial() {
      if (!this.phone || this.dialing || this.loading) return;
      this.dialing = true;
      uni.makePhoneCall({
        phoneNumber: this.phone.replace(/[ -]/g, ""),
        fail: (e) => {
          if (!/cancel/i.test(e.errMsg || "")) uni.showToast({ title: "无法打开拨号，请检查设备电话功能", icon: "none" });
        },
        complete: () => { this.dialing = false; },
      });
    },
  },
};
</script>
<style scoped>
.support-phone-card { display: flex; flex-direction: column; gap: 16rpx; padding: 24rpx; margin: 20rpx 0; border: 1rpx solid #dce4dd; border-radius: 20rpx; background: #fff; color: #315947; font-size: 26rpx; line-height: 1.6; }
.support-phone-label { font-size: 30rpx; font-weight: 600; }
.support-phone-dial { width: 100%; margin: 0; padding: 16rpx; background: #07563f; color: #fff; font-size: 28rpx; white-space: normal; overflow-wrap: anywhere; }
.support-phone-error { display: flex; flex-wrap: wrap; align-items: center; gap: 16rpx; }
</style>
