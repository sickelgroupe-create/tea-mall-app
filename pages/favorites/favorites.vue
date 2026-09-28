<template>
	<view
		class="app-stage catalog-stage order-phase"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
	>
		<view class="phone-shell">
			<StatusBar />
			<TopBar title="我的收藏" @back="back" />
			<view class="favorite-tabs">
				<text
					v-for="(tab, index) in ['商品', '店铺', '专题']"
					:key="tab"
					:class="{ active: favoriteTab === index }"
					@tap="favoriteTab = index"
					>{{ tab }}</text
				>
			</view>
			<scroll-view scroll-y class="shell-scroll-viewport screen favorite-scroll shell-scroll--with-bottom-nav">
				<view
					v-if="favoriteTab === 0 && favoriteProducts.length"
					class="favorite-list"
				>
					<view
						v-for="p in favoriteProducts"
						:key="p.id"
						class="favorite-row"
						@tap="openProduct(p)"
					>
						<image :src="p.image" mode="aspectFill" />
						<view class="favorite-row__copy"
							><text>{{ p.short || p.name }}</text
							><text class="muted">{{ p.spec }}</text
							><MallPrice :value="p.price" :precision="2"
						/></view>
						<button @tap.stop="removeFavorite(p)">取消</button>
					</view>
				</view>
				<view
					v-if="favoriteTab === 1 && favoriteStores.length"
					class="favorite-list"
				>
					<view
						v-for="item in favoriteStores"
						:key="item.id"
						class="favorite-row"
						@tap="go('store', { id: item.id })"
					>
						<image
							:src="item.heroImage || item.logo"
							mode="aspectFill"
						/>
						<view class="favorite-row__copy"
							><text>{{ item.name }}</text
							><text class="muted">{{
								item.shippingPromise
							}}</text
							><text class="muted">品牌店铺</text></view
						>
						<button @tap.stop="removeStoreFavorite(item)">
							取消
						</button>
					</view>
				</view>
				<view
					v-if="favoriteTab === 2 && favoriteTopics.length"
					class="favorite-list"
				>
					<view
						v-for="item in favoriteTopics"
						:key="item.id"
						class="favorite-row"
						@tap="go('homeTopic', { slug: item.slug })"
					>
						<image :src="item.heroImage" mode="aspectFill" />
						<view class="favorite-row__copy"
							><text>{{ item.title }}</text
							><text class="muted">{{ item.subtitle }}</text
							><text class="muted">当季专题</text></view
						>
						<button @tap.stop="removeTopicFavorite(item)">
							取消
						</button>
					</view>
				</view>
				<view
					v-if="
						(favoriteTab === 0 && !favoriteProducts.length) ||
						(favoriteTab === 1 && !favoriteStores.length) ||
						(favoriteTab === 2 && !favoriteTopics.length)
					"
					class="commercial-empty"
				>
					<view class="empty-state-icon"
						><TeaIcon
							:name="favoriteTab === 1 ? 'store' : 'heart'"
							:size="28"
					/></view>
					<text
						>暂无{{
							["收藏商品", "关注店铺", "收藏专题"][favoriteTab]
						}}</text
					>
					<text>在商品、品牌或专题页面收藏后会同步显示在这里</text>
					<button @tap="go('home')">去逛逛</button>
				</view>
				<OrderCollection
					:decoration="decoration('account.member')"
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
import BottomNav from "@/components/BottomNav.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import OrderCollection from "@/components/OrderCollection.vue";
import mallPage from "@/shared/mall-page.js";

export default {
	components: { StatusBar, TopBar, BottomNav, TeaIcon, OrderCollection },
	mixins: [mallPage],
};
</script>
