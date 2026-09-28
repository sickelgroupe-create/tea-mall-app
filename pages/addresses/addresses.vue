<template>
	<view
		class="app-stage catalog-stage order-phase"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
	>
		<view class="phone-shell">
			<StatusBar />
			<TopBar title="收货地址" @back="back" /><scroll-view
				scroll-y
				class="shell-scroll-viewport screen addresses-screen action-pad shell-scroll--with-action"
				><view v-if="addressSelectMode" class="address-picker-hint"
					><TeaIcon name="location" :size="19" /><view
						><text>选择收货地址</text
						><text
							>选择后将返回{{
								addressPurpose === "exchange"
									? "兑换确认页"
									: "订单确认页"
							}}</text
						></view
					></view
				><view
					v-for="(addr, i) in addresses"
					:key="addr.id || `${addr.name}-${i}`"
					class="address-manage"
					:class="{
						selected:
							Number(selectedAddress?.id) === Number(addr.id),
					}"
					@tap="addressSelectMode && chooseAddress(addr)"
					><view
						><text v-if="addr.isDefault" class="default-tag"
							>默认</text
						><text
							v-if="
								addressSelectMode &&
								Number(selectedAddress?.id) === Number(addr.id)
							"
							class="selected-tag"
							>当前选择</text
						><text class="strong">{{ addr.name }}</text
						><text>{{ addr.phone }}</text></view
					>
					<view class="paragraph">{{ addr.line1 }}</view>
					<view class="paragraph">{{ addr.line2 }}</view>
					<view
						><button
							v-if="addressSelectMode"
							class="select-address"
							@tap.stop="chooseAddress(addr)"
						>
							选择此地址</button
						><button @tap.stop="editAddress(i)">编辑</button
						><button
							class="danger"
							@tap.stop="confirmRemoveAddress(i)"
						>
							删除
						</button></view
					></view
				><view v-if="showAddressForm" class="address-form"
					><view class="form-title"
						>{{
							editingAddressIndex >= 0
								? "编辑收货地址"
								: "新增收货地址"
						}}
						<text @tap="showAddressForm = false">×</text></view
					><view class="form-label"
						><text>收货人</text
						><input
							v-model="addressForm.name"
							placeholder="请填写收货人姓名" /></view
					><view class="form-label"
						><text>手机号</text
						><input
							v-model="addressForm.phone"
							placeholder="请填写手机号" /></view
					><view class="form-label"
						><text>所在地区</text
						><input
							v-model="addressForm.region"
							placeholder="请选择省 / 市 / 区" /></view
					><view class="form-label"
						><text>详细地址</text
						><input
							v-model="addressForm.detail"
							placeholder="请填写详细地址" /></view
					><view class="default-switch"
						><text>设为默认地址</text
						><switch
							:checked="addressForm.isDefault"
							color="#285a32"
							@change="
								addressForm.isDefault = $event.detail.value
							" /></view></view
				><OrderCollection
					:decoration="decoration('account.member')"
					@open="go('homeTopic')" /></scroll-view
			><view class="single-action"
				><button
					@tap="showAddressForm ? saveAddress() : startNewAddress()"
				>
					{{ showAddressForm ? "保存地址" : "新增收货地址" }}
				</button></view
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
import OrderCollection from "@/components/OrderCollection.vue";
import mallPage from "@/shared/mall-page.js";

export default {
	components: {
		StatusBar,
		TopBar,
		BottomNav,
		ProductTile,
		TeaIcon,
		OrderCollection,
	},
	mixins: [mallPage],
};
</script>
