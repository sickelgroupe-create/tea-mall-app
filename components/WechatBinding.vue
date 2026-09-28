<template>
 <view class="wechat-binding">
  <view class="binding-heading"><text>微信绑定</text><text>{{ loading ? '查询中…' : state?.bound ? '已绑定' : '未绑定' }}</text></view>
  <text class="binding-note">{{ state?.bound ? '当前微信与本账号共用订单、积分和邀请记录。' : '手机号登录后，请先绑定微信再邀请分享；不会新建商城账号。' }}</text>
  <text v-if="error" class="binding-error">{{ error }}</text>
  <button v-if="!state || error" class="binding-button" :disabled="loading || binding" @tap="refresh">重新查询</button>
  <button v-else-if="!state.bound" class="binding-button" :disabled="binding || !state.configured" @tap="bind">{{ binding ? '正在绑定…' : state.configured ? '绑定当前微信' : '微信服务暂不可用' }}</button>
 </view>
</template>
<script>
import api from '@/shared/mall-api.js';
export default {
 emits:['change'],
 data(){ return {state:null,error:'',loading:false,binding:false}; },
 methods:{
  async refresh(){
   if(this.loading)return;
   this.loading=true;this.error='';
   try{this.state=await api.wechatBinding();this.$emit('change',this.state);}
   catch(e){this.state=null;this.error=e.message || '绑定状态查询失败';this.$emit('change',null);}
   finally{this.loading=false;}
  },
  async bind(){
   if(this.binding)return;
   // #ifndef MP-WEIXIN
   uni.showModal({title:'请在微信小程序内绑定',content:'请打开茶叶商城微信测试小程序，使用同一手机号登录，在“我的 → 微信绑定”完成绑定后再分享。H5不能代替小程序授权。',showCancel:false});
   return;
   // #endif
   // #ifdef MP-WEIXIN
   this.binding=true;this.error='';
   try{
    const confirmed=await new Promise(resolve=>uni.showModal({title:'绑定当前微信',content:'将当前微信绑定到本次已登录的商城账号。不会新建账号或转移已有订单、积分。',success:r=>resolve(r.confirm),fail:()=>resolve(false)}));
    if(!confirmed)return;
    const login=await new Promise((resolve,reject)=>uni.login({provider:'weixin',success:resolve,fail:reject}));
    if(!login.code)throw new Error('未获取到微信授权码，请重试');
    this.state=await api.bindCurrentWechat(login.code);
    this.$emit('change',this.state);
   }catch(e){this.error=e.message || '微信绑定失败，请重试；不会切换或合并账号';}
   finally{this.binding=false;}
   // #endif
  }
 }
};
</script>
<style scoped>
.wechat-binding{background:#fff;border:1px solid #e1dfd4;border-radius:22rpx;padding:24rpx;margin:20rpx 0;box-sizing:border-box;min-width:0}
.binding-heading{display:flex;align-items:center;justify-content:space-between;gap:16rpx;color:#17503d;font-size:28rpx}
.binding-heading text:last-child{font-size:24rpx}
.binding-note,.binding-error{display:block;font-size:24rpx;line-height:1.7;margin-top:12rpx;overflow-wrap:anywhere;color:#76776e}
.binding-error{color:#a3472b}
.binding-button{display:flex;justify-content:center;align-items:center;min-height:76rpx;padding:14rpx 20rpx;margin-top:20rpx;background:#07593f;color:#fff;font-size:26rpx;line-height:1.5;border-radius:12rpx}
.binding-button[disabled]{opacity:.55}
</style>
