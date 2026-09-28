<template>
	<view class="app-stage"><view class="phone-shell">
		<StatusBar /><TopBar title="客服工单详情" @back="back" />
		<scroll-view scroll-y class="shell-scroll-viewport screen ticket-detail-screen">
			<view v-if="loading" class="ticket-state">正在加载工单…</view>
			<view v-else-if="errorText" class="ticket-state"><text>{{ errorText }}</text><button @tap="loadTicket">重新加载</button></view>
			<template v-else-if="ticket.ticketNo">
				<view class="ticket-summary"><text>{{ ticket.category }}</text><text>{{ ticket.status }}</text><text>工单号 {{ ticket.ticketNo }}</text></view>
				<view class="ticket-timeline">
					<view v-for="message in ticket.messages || []" :key="message.id" class="ticket-message">
						<text>{{ message.senderType }} · {{ String(message.createTime || '').slice(0, 16) }}</text>
						<text>{{ message.content }}</text>
						<image v-if="message.attachmentUrl" :src="imageFor(message.attachmentUrl)" mode="aspectFill" />
						<text v-if="message.toStatus">{{ message.fromStatus || '创建' }} → {{ message.toStatus }}</text>
					</view>
				</view>
				<view class="ticket-reply"><textarea v-model="replyText" maxlength="1000" placeholder="继续补充问题；已完成工单回复后会重新进入处理中" /><button :disabled="submitting" @tap="submitReply">{{ submitting ? '提交中…' : '提交补充' }}</button></view>
			</template>
		</scroll-view>
		<view v-if="toastText" class="toast">{{ toastText }}</view>
	</view></view>
</template>
<script>
import StatusBar from '@/components/StatusBar.vue';
import TopBar from '@/components/TopBar.vue';
import mallPage from '@/shared/mall-page.js';
import mallApi from '@/shared/mall-api.js';
export default {
	components: { StatusBar, TopBar }, mixins: [mallPage],
	data(){ return { ticketNo:'', ticket:{}, loading:true, errorText:'', replyText:'', submitting:false }; },
	onLoad(query){ this.ticketNo=String(query?.ticketNo||''); },
	onShow(){ this.loadTicket(); },
	methods:{
		async loadTicket(){ if(!this.ticketNo){this.loading=false;this.errorText='缺少工单号';return;} this.loading=true;this.errorText='';try{this.ticket=await mallApi.serviceTicket(this.ticketNo);}catch(e){this.errorText=e.message||'工单加载失败';}finally{this.loading=false;} },
		async submitReply(){const content=this.replyText.trim();if(content.length<2)return this.toast('请至少填写2个字');if(this.submitting)return;this.submitting=true;try{this.ticket=await mallApi.replyServiceTicket(this.ticketNo,{content,requestNo:mallApi.createActionRequestId()});this.replyText='';this.toast('补充内容已提交');}catch(e){this.toast(e.message||'提交失败');}finally{this.submitting=false;}}
	}
};
</script>
<style scoped>
.ticket-detail-screen{padding:24rpx 24rpx 40rpx;background:#f8f6f0}.ticket-state,.ticket-summary,.ticket-message,.ticket-reply{display:flex;flex-direction:column;gap:14rpx;margin-bottom:20rpx;padding:24rpx;border:1px solid #e2e7e3;border-radius:22rpx;background:#fff}.ticket-summary text:first-child{font-size:32rpx;font-weight:650;color:#174f31}.ticket-summary text:nth-child(2){color:#b8562f}.ticket-summary text:last-child,.ticket-message text:first-child,.ticket-message text:last-child{color:#7a847d;font-size:22rpx}.ticket-message>image{width:180rpx;height:180rpx;border-radius:14rpx}.ticket-reply textarea{width:100%;min-height:200rpx;padding:18rpx;border:1px solid #dfe5de;border-radius:16rpx}.ticket-reply button{background:#07543b;color:#fff}
</style>
