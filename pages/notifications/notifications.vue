<template>
	<view
		class="app-stage catalog-stage order-phase"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
	>
		<view class="phone-shell">
			<StatusBar />
			<TopBar title="消息中心" @back="back"
				><template #right
					><text
						class="message-settings"
						@tap="markAllNotificationsRead"
						>全部已读</text
					></template
				></TopBar
			>
			<view class="message-tabs"
				><text
					v-for="(tab, index) in ['全部', '订单', '活动', '系统']"
					:key="tab"
					:class="{ active: messageTab === index }"
					@tap="messageTab = index"
					>{{ tab }}</text
				></view
			>
			<scroll-view scroll-y class="shell-scroll-viewport screen notifications-screen shell-scroll--with-bottom-nav">
				<view class="message-summary"
					><view><TeaIcon name="bell" :size="24" /></view
					><view
						><text>服务消息</text
						><text>订单、物流、售后和客服进度集中展示</text></view
					></view
				>
				<view v-if="notificationItems.length" class="notification-list">
					<view
						v-for="item in notificationItems"
						:key="item.key"
						:class="{ 'is-unread': item.unread }"
						@tap="openNotification(item)"
					>
						<view class="notification-icon"
							><TeaIcon :name="item.icon" :size="21"
						/></view>
						<view
							><view
								><text>{{ item.title }}</text
								><text>{{ item.time }}</text></view
							><text>{{ item.desc }}</text></view
						><TeaIcon name="chevronRight" :size="17" />
					</view>
				</view>
				<view v-else class="commercial-empty message-empty"
					><view class="empty-state-icon"
						><TeaIcon name="bell" :size="28" /></view
					><text>暂无消息</text
					><text>订单、物流和售后状态变化后会显示在这里</text
					><button @tap="go('home')">返回首页</button></view
				>
				<OrderCollection
					:decoration="decoration('account.member')"
					variant="pale"
					@open="go('homeTopic')"
				/>
			</scroll-view>
			<BottomNav active="mine" :cart-count="cartCount" @select="go" />
			<view v-if="toastText" class="toast">{{ toastText }}</view>
		</view>
	</view>
</template>

<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import BottomNav from "@/components/BottomNav.vue";
import OrderCollection from "@/components/OrderCollection.vue";
import mallPage from "@/shared/mall-page.js";

export default {
	components: { StatusBar, TopBar, TeaIcon, BottomNav, OrderCollection },
	mixins: [mallPage],
};
</script>
