<template>
	<view class="app-stage">
		<view class="phone-shell">
			<StatusBar />
			<TopBar title="设置与客服" @back="back" /><scroll-view
				scroll-y
				class="shell-scroll-viewport screen settings-screen action-pad shell-scroll--with-action"
				><view class="settings-preference-card"
					><view class="settings-card-title"
						><TeaIcon name="bell" :size="21" /><view
							><text>通知偏好</text
							><text>开关会立即影响消息中心的展示</text></view
						></view
					><view class="setting-live-row"
						><view
							><text>订单与售后通知</text
							><text>发货、物流、退款和售后进度</text></view
						><switch
							:checked="settingsPrefs.orderNotice"
							color="#285a32"
							@change="
								toggleSettingPref(
									'orderNotice',
									$event.detail.value,
								)
							" /></view
					><view class="setting-live-row"
						><view
							><text>活动通知</text
							><text>新品、积分和会员活动</text></view
						><switch
							:checked="settingsPrefs.activityNotice"
							color="#285a32"
							@change="
								toggleSettingPref(
									'activityNotice',
									$event.detail.value,
								)
							" /></view
				></view>
				<view class="settings-preference-card"
					><view class="settings-card-title"
						><TeaIcon name="lock" :size="21" /><view
							><text>隐私与推荐</text
							><text>偏好保存到当前账号，可随时关闭</text></view
						></view
					><view class="setting-live-row"
						><view
							><text>个性化推荐</text
							><text>结合收藏和浏览记录调整推荐顺序</text></view
						><switch
							:checked="settingsPrefs.personalized"
							color="#285a32"
							@change="
								toggleSettingPref(
									'personalized',
									$event.detail.value,
								)
							" /></view
					><view class="setting-live-row"
						><view
							><text>保存浏览记录</text
							><text>关闭后停止保存新的浏览记录</text></view
						><switch
							:checked="settingsPrefs.historyEnabled"
							color="#285a32"
							@change="
								toggleSettingPref(
									'historyEnabled',
									$event.detail.value,
								)
							" /></view
				></view>
				<view class="settings-group"
					><text>设置</text
					><view
						v-for="item in settings.filter(
							(row) =>
								!['消息通知', '隐私设置'].includes(row.title),
						)"
						:key="item.title"
						@tap="openSettingsPanel(item.title)"
						><view class="span-node"
							><TeaIcon :name="item.icon" :size="21" /></view
						><text>{{ item.title }}</text
						><text class="strong">›</text></view
					></view
				><view class="settings-group"
					><text>客服与帮助</text
					><view
						v-for="item in helps"
						:key="item.title"
						@tap="openSettingsPanel(item.title)"
						><view class="span-node"
							><TeaIcon :name="item.icon" :size="21" /></view
						><text>{{ item.title }}</text
						><text class="strong">›</text></view
					></view
				></scroll-view
			><view class="logout"><button @tap="logout">退出登录</button></view>
			<view
				v-if="servicePanel"
				class="sheet-mask"
				@tap="servicePanel = ''"
				><view class="action-sheet settings-sheet" @tap.stop
					><view class="sheet-head"
						><view
							><text>{{ servicePanel }}</text
							><text>茶山商城服务中心</text></view
						><text @tap="servicePanel = ''">×</text></view
					><view
						v-if="servicePanel === '个人资料'"
						class="profile-detail"
						><view class="avatar-editor" @tap="chooseAvatar"
							><image
								:src="
									customer.avatarUrl
										? imageFor(customer.avatarUrl)
										: imageFor('/static/images/biluochun.jpg')
								"
								mode="aspectFill"
							/><text>点击修改头像</text></view
						><view>
							<text>姓名 / 昵称</text>
							<input v-model="localNickname" maxlength="12" placeholder="请输入姓名或昵称" />
						</view>
						<view>
							<text>手机号</text>
							<view class="phone-security-row">
								<text>{{ customer.phone || "未绑定手机号" }}</text>
								<button @tap="servicePanel = '更换手机号'">安全更换</button>
							</view>
						</view>
						<view><text>账号类型</text><text>商城会员</text></view>
						<text class="settings-hint">头像和昵称保存后会同步到商城后台；手机号必须通过验证码独立更换。</text>
					</view>
					<view
						v-else-if="servicePanel === '更换手机号'"
						class="password-form"
					>
						<text>验证新手机号</text>
						<input v-model="newPhone" type="number" maxlength="11" placeholder="请输入新手机号" />
						<view class="change-phone-code">
							<input v-model="phoneChangeCode" type="number" maxlength="6" placeholder="请输入6位验证码" />
							<button :disabled="phoneChangeCountdown > 0 || phoneChangeSubmitting" @tap="requestPhoneChangeCode">{{ phoneChangeCountdown > 0 ? phoneChangeCountdown + "s" : "获取验证码" }}</button>
						</view>
						<text>验证码只用于安全换号，本次验证成功后立即失效。</text>
					</view>
					<view
						v-else-if="servicePanel === '账号与安全'"
						class="password-form"
						><text>{{
							customer.hasPassword
								? "修改登录密码"
								: "设置登录密码"
						}}</text
						><input
							v-if="customer.hasPassword"
							v-model="currentPassword"
							password
							placeholder="请输入原密码"
						/><input
							v-model="newPassword"
							password
							placeholder="新密码（8-32位，含字母和数字）"
						/><input
							v-model="confirmPassword"
							password
							placeholder="再次输入新密码"
						/><text>设置后可在登录页选择“密码登录”。</text></view
					>
					<view
						v-else-if="servicePanel === '消息通知'"
						class="setting-switches"
						><view
							><view
								><text>订单通知</text
								><text>发货、物流和售后状态提醒</text></view
							><switch
								:checked="settingsPrefs.orderNotice"
								color="#285a32"
								@change="
									settingsPrefs.orderNotice =
										$event.detail.value;
									saveSettingsPrefs();
								" /></view
						><view
							><view
								><text>活动通知</text
								><text>新品与积分活动提醒</text></view
							><switch
								:checked="settingsPrefs.activityNotice"
								color="#285a32"
								@change="
									settingsPrefs.activityNotice =
										$event.detail.value;
									saveSettingsPrefs();
								" /></view
					></view>
					<view
						v-else-if="servicePanel === '隐私设置'"
						class="setting-switches"
						><view
							><view
								><text>个性化推荐</text
								><text>根据浏览与收藏改善推荐</text></view
							><switch
								:checked="settingsPrefs.personalized"
								color="#285a32"
								@change="
									settingsPrefs.personalized =
										$event.detail.value;
									saveSettingsPrefs();
								" /></view
						><view
							><view
								><text>保存浏览记录</text
								><text>用于“我的－浏览记录”</text></view
							><switch
								:checked="settingsPrefs.historyEnabled"
								color="#285a32"
								@change="
									settingsPrefs.historyEnabled =
										$event.detail.value;
									saveSettingsPrefs();
								" /></view
					></view>
					<view
						v-else-if="servicePanel === '关于我们'"
						class="service-detail"
						><text>茶叶商城 H5</text
						><text
							>版本 1.0.0 ·
							提供选茶、下单、积分兑换和售后服务。商品与服务信息以页面实时展示为准。</text
						></view
					><view
						v-else-if="
							['隐私政策', '用户协议'].includes(servicePanel)
						"
						class="service-detail"
						><text>{{ servicePanel }}</text
						><text>{{ documentText(servicePanel) }}</text></view
					>
					<view
						v-else-if="servicePanel === '常见问题'"
						class="faq-list"
						><view
							v-for="(faq, i) in supportFaqs"
							:key="faq.q"
							@tap="expandedFaq = expandedFaq === i ? -1 : i"
							><text
								>{{ faq.q }}　{{
									expandedFaq === i ? "⌃" : "⌄"
								}}</text
							><text
								v-if="expandedFaq === i"
								class="faq-answer"
								>{{ faq.a }}</text
							></view
						></view
					><view
						v-else-if="
							servicePanel === '在线客服' ||
							servicePanel === '意见反馈'
						"
						class="online-service"
						><view class="service-status-card"
							><view class="service-status-icon"
								><TeaIcon name="headset" :size="24" /></view
							><view
								><text>在线服务通道正常</text
								><text
									>服务时间 09:00－21:00 ·
									工单会同步到后台客服</text
								></view
							><text class="service-online-dot">在线</text></view
						>
						<SupportPhone ref="supportPhone" />
						<view class="service-shortcuts"
							><view @tap="openHelpPanel('常见问题')"
								><TeaIcon name="help" :size="20" /><text
									>常见问题</text
								></view
							><view @tap="go('orders')"
								><TeaIcon name="clipboard" :size="20" /><text
									>查询订单</text
								></view
							><view @tap="go('orders', { tab: 4 })"
								><TeaIcon name="service" :size="20" /><text
									>售后进度</text
								></view
							></view
						>
						<view class="service-ticket-form"
							><text class="form-title">提交在线工单</text
							><view class="service-categories"
								><text
									v-for="type in [
										'订单咨询',
										'商品咨询',
										'配送问题',
										'其他问题',
									]"
									:key="type"
									:class="{
										active: serviceCategory === type,
									}"
									@tap="serviceCategory = type"
									>{{ type }}</text
								></view
							><textarea
								v-model="serviceMessage"
								maxlength="500"
								placeholder="请描述你遇到的问题（至少2个字）"
							/><view class="service-message-count"
								>{{ serviceMessage.length }}/500</view
							><input
								v-model="serviceContact"
								maxlength="64"
								placeholder="联系方式（选填，手机号或微信）"
							/><button
								:disabled="serviceSubmitting"
								@tap="submitServiceTicket"
							>
								{{
									serviceSubmitting
										? "正在提交…"
										: "提交在线工单"
								}}
							</button></view
						>
						<view v-if="serviceTickets.length" class="service-ticket-latest"
							><view
								><text>我的工单</text><text>点击查看处理时间轴</text></view
							><view v-for="ticket in serviceTickets" :key="ticket.ticketNo"
								class="service-ticket-row" @tap="go('serviceTicketDetail', { ticketNo: ticket.ticketNo })"
								><text>{{ ticket.category }} · {{ ticket.ticketNo }}</text
								><text
									:class="{
										done: ticket.status === '已完成',
									}"
									>{{ ticket.status }} ›</text
								></view
							></view>
					</view>
					<view v-else class="service-detail"
						><text>订单售后服务</text
						><text
							>可在订单列表的“售后”分类查看处理进度。</text
						></view
					><button
						v-if="!['在线客服', '意见反馈'].includes(servicePanel)"
						@tap="
							servicePanel === '订单售后'
								? go('orders', { tab: 4 })
								: servicePanel === '个人资料'
									? saveProfile()
									: servicePanel === '更换手机号'
										? savePhoneChange()
									: servicePanel === '账号与安全'
										? savePassword()
										: (servicePanel = '')
						"
					>
						{{
							servicePanel === "订单售后"
								? "查看售后订单"
								: servicePanel === "个人资料"
									? "保存资料"
									: servicePanel === "更换手机号"
										? "验证并更换手机号"
									: servicePanel === "账号与安全"
										? customer.hasPassword
											? "修改密码"
											: "设置密码"
										: "完成"
						}}
					</button></view
				></view
			>
			<view v-if="toastText" class="toast">{{ toastText }}</view>
		</view>
	</view>
</template>

<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import BottomNav from "@/components/BottomNav.vue";
import ProductTile from "@/components/ProductTile.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import mallPage from "@/shared/mall-page.js";
import SupportPhone from "@/components/SupportPhone.vue";

export default {
	components: { StatusBar, TopBar, BottomNav, ProductTile, TeaIcon, SupportPhone },
	mixins: [mallPage],
	onShow() { this.$refs.supportPhone?.load(); },
	computed: {
		supportFaqs() {
			const rows = (this.managedDocuments || [])
				.filter((x) => String(x.documentKey || "").startsWith("FAQ_"))
				.map((x) => ({ q: x.title, a: x.content }));
			return rows.length
				? rows
				: [{ q: "常见问题内容加载中", a: "请稍后重试。" }];
		},
	},
	methods: {
		openSettingsPanel(title) {
			this.servicePanel = title;
			if (title === "意见反馈") this.serviceCategory = "其他问题";
		},
		documentText(title) {
			const key =
				title === "用户协议" ? "USER_AGREEMENT" : "PRIVACY_POLICY";
			return (
				(this.managedDocuments || []).find((x) => x.documentKey === key)
					?.content || "内容加载中，请稍后重试。"
			);
		},
	},
};
</script>
