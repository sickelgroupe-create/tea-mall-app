<template>
 <view class="legacy-invite"><text>{{error || '正在进入分享方式…'}}</text><button v-if="error" @tap="open">进入分享方式</button></view>
</template>
<script>
export default {
 data(){return{error:''}},
 onLoad(){this.open()},
 methods:{open(){this.error='';uni.redirectTo({url:'/pages/share/share',fail:()=>{this.error='页面跳转失败，请重试'}})}}
};
</script>
<style scoped>
.legacy-invite{padding:80rpx 24rpx;text-align:center;color:#285a40;line-height:1.8}.legacy-invite button{margin-top:24rpx}
</style>
