<template>
  <view class="month-panel">
    <view class="month-heading"><text>月度前十名奖励</text><button :disabled="loading" @tap="load">刷新</button></view>
    <text v-if="error" class="month-error">{{error}}</text>
    <text v-if="!loading&&!periods.length" class="month-note">暂未发布奖励周期，金额和发放方式以后台发布规则为准。</text>
    <picker v-if="periods.length" :range="periods" range-key="title" :value="selected" @change="selectPeriod"><view class="month-picker">{{periods[selected] && periods[selected].title}}<text>切换周期 ›</text></view></picker>
    <button v-if="periods.length<periodTotal" :disabled="loading" class="month-more" @tap="morePeriods">更多历史周期</button>
    <view v-if="board" class="month-board">
      <text class="month-note">{{board.startsAt}} 至 {{board.endsAt}}（不含截止时刻，北京时间）</text>
      <text class="month-note">{{method(board.payoutMethod)}} · {{state(board.status)}}</text>
      <text class="month-note">首次注册并购买试喝礼包达标的好友计入对应周期；人数相同按客户编号升序。</text>
      <view class="month-prizes"><view v-for="(amount,i) in board.amounts" :key="i"><text>第 {{i+1}} 名</text><text>{{Number(amount)>0?'¥'+money(amount):'不发奖'}}</text></view></view>
      <text class="month-self">我的本期排名：{{board.myRank ? '第 '+board.myRank+' 名' : '未上榜'}} · {{board.myCount || 0}} 位有效茶友</text>
      <text v-if="board.eligibilityChanged" class="month-error">本期结算资格发生变化，奖励发放正在核查。</text>
      <view v-for="row in board.top" :key="row.rank" class="month-rank"><text>{{row.rank}}</text><text>{{row.nickname}}{{row.self?'（我）':''}}</text><text>{{row.qualifiedCount}} 人</text></view>
      <text v-if="!board.top.length" class="month-note">本期暂无符合门槛的茶友。</text>
    </view>
    <text class="month-subtitle">我的奖励与到账状态</text>
    <text v-if="!awards.length&&!loading" class="month-note">暂无月度奖励记录。</text>
    <view v-for="row in awards" :key="row.id" class="month-award">
      <text class="month-award-title">{{row.title}} · 第 {{row.rankNo}} 名</text>
      <view class="month-award-amount"><text>¥{{money(row.amount)}}</text><text>{{state(row.status)}}</text></view>
      <text class="month-note">{{method(row.payoutMethod)}}</text>
      <text v-if="row.payoutMethod==='TEST_CNY'" class="month-note">仅模拟发放，不代表真实到账，不产生可提现现金。</text>
      <text v-if="row.payoutReference" class="month-note">发放凭证：{{row.payoutReference}}</text>
      <text v-if="row.reason" class="month-note">处理说明：{{row.reason}}</text>
      <text v-if="row.eligibilityChanged" class="month-error">邀请资格变化，需后台核查。</text>
      <view v-if="['OFFLINE_SENT','DISPUTED'].includes(row.status)" class="month-actions"><button :disabled="!!acting" @tap="ack(row,'RECEIVED')">确认已收款</button><button v-if="row.status==='OFFLINE_SENT'" :disabled="!!acting" @tap="ack(row,'DISPUTED')">未收到／有疑问</button></view>
      <view v-for="(event,i) in row.events" :key="i" class="month-event"><text>{{event.createTime}} · {{event.actorType==='ADMIN'?'后台':'本人'}}</text><text>{{event.reason}}</text></view>
    </view>
    <button v-if="awards.length<awardTotal" class="month-more" :disabled="loading" @tap="moreAwards">加载更多奖励</button>
    <text v-if="loading" class="month-note">正在读取奖励记录…</text>
  </view>
</template>
<script>
import api from '@/shared/mall-api.js';
export default {
 props:{refreshKey:Object},
 beforeUnmount(){this._boardRequest=(this._boardRequest||0)+1;},
 data(){return {periods:[],periodTotal:0,periodPage:1,selected:0,board:null,awards:[],awardTotal:0,awardPage:1,loading:false,acting:null,error:''};},
 watch:{refreshKey(){this.load();}},mounted(){this.load();},
 methods:{
  money(v){return Number(v||0).toFixed(2);},
  method(v){return v==='TEST_CNY'?'测试发放（非真实现金）':'线下发放，需本人确认收款';},
  state(v){return {DRAFT:'未发布',OPEN:'已发布，待周期结束结算',SETTLED:'已结算',CANCELLED:'已关闭',PENDING:'待发放',TEST_PAID:'测试发放完成',OFFLINE_SENT:'已登记线下发放，待确认',RECEIVED:'已确认收款',DISPUTED:'已反馈，待核查'}[v]||v;},
  async load(){if(this.loading)return;const request=this._boardRequest=(this._boardRequest||0)+1;this.loading=true;this.error='';this.board=null;try{const old=this.periods[this.selected]?.id;const [p,a]=await Promise.all([api.monthlyPeriods(),api.monthlyAwards()]);if(request!==this._boardRequest)return;this.periods=p.rows||[];this.periodTotal=p.total||0;this.periodPage=1;this.awards=a.rows||[];this.awardTotal=a.total||0;this.awardPage=1;this.selected=Math.max(0,this.periods.findIndex(r=>r.id===old));const board=this.periods.length?await api.monthlyBoard(this.periods[this.selected].id):null;if(request===this._boardRequest)this.board=board;}catch(e){if(request===this._boardRequest)this.error=e.message||'奖励读取失败，请刷新重试';}finally{if(request===this._boardRequest)this.loading=false;}},
  async selectPeriod(e){
   const index=Number(e.detail.value),period=this.periods[index];
   if(!Number.isInteger(index)||!period)return;
   const request=this._boardRequest=(this._boardRequest||0)+1;
   this.selected=index;this.board=null;this.loading=true;this.error='';
   try{const board=await api.monthlyBoard(period.id);if(request===this._boardRequest&&this.periods[this.selected]?.id===period.id)this.board=board;}
   catch(e){if(request===this._boardRequest)this.error=e.message||'月榜读取失败';}
   finally{if(request===this._boardRequest)this.loading=false;}
  },
  async morePeriods(){this.loading=true;try{const p=await api.monthlyPeriods(this.periodPage+1);this.periods.push(...p.rows);this.periodTotal=p.total;this.periodPage++;}catch(e){this.error=e.message;}finally{this.loading=false;}},
  async moreAwards(){this.loading=true;try{const a=await api.monthlyAwards(this.awardPage+1);const seen=new Set(this.awards.map(r=>r.id));this.awards.push(...a.rows.filter(r=>!seen.has(r.id)));this.awardTotal=a.total;this.awardPage++;}catch(e){this.error=e.message;}finally{this.loading=false;}},
  ack(row,action){uni.showModal({title:action==='RECEIVED'?'确认真实收款':'反馈收款问题',content:action==='RECEIVED'?'请核对线下实际到账后确认。系统不会通过此按钮转账。':'将通知后台核查这笔奖励，反馈记录会保存。',success:async result=>{if(!result.confirm)return;this.acting=row.id;try{await api.monthlyAcknowledge(row.id,{action,reason:action==='DISPUTED'?'用户反馈未收到奖励或到账存在疑问':'用户确认已收到线下奖励'});await this.load();}catch(e){this.error=e.message||'提交失败，请重试';}finally{this.acting=null;}}});}
 }
};
</script>
<style scoped>
.month-panel{padding:28rpx;margin:24rpx 0;background:#fff;border:1rpx solid #dedfd4;border-radius:24rpx;color:#244d3c;box-sizing:border-box}.month-heading{display:flex;align-items:center;justify-content:space-between;gap:16rpx}.month-heading>text,.month-subtitle{font-size:32rpx;font-weight:600}.month-heading>button{margin:0;padding:10rpx 24rpx;font-size:24rpx;line-height:1.5;background:#eef4ef;color:#245540;border:0;border-radius:12rpx}.month-picker{display:flex;justify-content:space-between;align-items:center;gap:16rpx;margin:24rpx 0;padding:20rpx;background:#f5f6f0;border-radius:12rpx;word-break:break-all}.month-picker>text{font-size:24rpx;flex-shrink:0}.month-note,.month-error,.month-self,.month-subtitle,.month-award-title{display:block;line-height:1.7;margin:12rpx 0;word-break:break-word}.month-note{font-size:24rpx;color:#787f77}.month-error{color:#a54327;font-size:24rpx}.month-self{text-align:center;padding:16rpx 0;font-size:26rpx}.month-prizes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12rpx;margin:20rpx 0}.month-prizes>view{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16rpx;background:#f7f5ec;border-radius:12rpx;line-height:1.8}.month-prizes text{font-size:25rpx}.month-prizes text:last-child{color:#9a783a}.month-rank{display:flex;align-items:center;justify-content:space-between;gap:12rpx;padding:18rpx 0;border-bottom:1rpx solid #eee;font-size:26rpx}.month-rank text:nth-child(2){flex:1;text-align:center}.month-subtitle{margin-top:28rpx;text-align:center}.month-award{padding:20rpx 0;border-top:1rpx solid #e9e9df}.month-award-title{text-align:center;font-size:28rpx}.month-award-amount{display:flex;align-items:center;justify-content:center;gap:20rpx;flex-wrap:wrap;font-size:26rpx}.month-award-amount text:first-child{color:#9a783a;font-size:34rpx}.month-actions{display:flex;gap:12rpx;margin:20rpx 0}.month-actions>button,.month-more{flex:1;display:flex;align-items:center;justify-content:center;margin:0;padding:18rpx 12rpx;line-height:1.5;white-space:normal;font-size:26rpx;background:#07543e;color:white;border-radius:12rpx;box-sizing:border-box}.month-more{width:100%;margin:20rpx 0;background:#eef4ef;color:#245540}.month-event{display:flex;flex-direction:column;gap:6rpx;border-left:3rpx solid #d9dfd2;padding:10rpx 16rpx;margin-top:14rpx;font-size:23rpx;line-height:1.6;word-break:break-word;color:#777e76}
</style>
