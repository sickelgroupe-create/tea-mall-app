<template>
	<view class="app-stage"
		><view class="phone-shell"
			><StatusBar /><TopBar title="分享方式" @back="back" /><scroll-view
				scroll-y
				class="shell-scroll-viewport screen share-choice-screen"
				><view class="share-head"
					><text>好茶相伴 · 共享清欢</text
					><text>选择分享方式</text></view
				><WechatBinding ref="wechatBinding" @change="bindingChanged" /><text class="section-title">分享给好友</text
				><view v-if="scene" class="share-grid">
					<!-- #ifdef MP-WEIXIN --><button open-type="share" :disabled="!scene">
						<view class="share-icon"
							><TeaIcon name="wechat" :size="23" /></view
						><text>微信好友</text></button
					><!-- #endif -->
					<!-- #ifndef MP-WEIXIN --><view @tap="shareH5"
						><view class="share-icon"
							><TeaIcon name="wechat" :size="23" /></view
						><text>系统分享</text></view
					><!-- #endif -->
					<view @tap="shareTimeline"
						><view class="share-icon"
							><TeaIcon name="share" :size="23" /></view
						><text>朋友圈</text></view
					><view @tap="savePoster"
						><view class="share-icon gold"
							><TeaIcon name="download" :size="23" /></view
						><text>{{
							saving ? "生成中…" : "保存海报"
						}}</text></view
					><view @tap="copyLink"
						><view class="share-icon"
							><TeaIcon name="link" :size="23" /></view
						><text>复制链接</text></view
					></view
				>
				<text class="section-title">分享说明</text
				><text class="share-description"
					>{{ shareRuleError || shareRuleDescription }}</text
				><InvitationClub
					:decoration="decoration('invite.club')"
					variant="light"
				/>
			</scroll-view>
			<!-- #ifdef MP-WEIXIN -->
			<canvas
				canvas-id="invitePosterCanvas"
				id="invitePosterCanvas"
				class="poster-canvas"
				:style="posterCanvasStyle"
			></canvas>
			<!-- #endif -->
			<view v-if="toastText" class="toast">{{ toastText }}</view></view
		></view
	>
</template>
<script>
import { createInviteQr } from "@/shared/qr-code.js";
import {
	POSTER_WIDTH,
	POSTER_HEIGHT,
	POSTER_CANVAS_STYLE,
	POSTER_EXPORT,
	assertPosterCanvasSize,
	drawPosterQr,
} from "@/shared/poster-layout.js";
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import InvitationClub from "@/components/InvitationClub.vue";
import WechatBinding from "@/components/WechatBinding.vue";
import mallPage from "@/shared/mall-page.js";
import mallApi from "@/shared/mall-api.js";
export default {
	components: { StatusBar, TopBar, TeaIcon, InvitationClub, WechatBinding },
	mixins: [mallPage],
	data() {
		return { scene: null, qrCells: [], qrSize: 0, saving: false, shareRuleDescription: '', shareRuleError: '' };
	},
	computed: {
		posterCanvasStyle() {
			return POSTER_CANVAS_STYLE;
		},
		inviteLink() {
			const origin =
				typeof location !== "undefined"
					? location.origin
					: "https://chaye.okam.top";
			return this.scene ? `${origin}${this.scene.inviteUrl}` : "";
		},
	},
	async onShow() {
		this.loadShareRule();
		this.scene = null;
		// #ifdef MP-WEIXIN
		uni.hideShareMenu({});
		// #endif
		await this.$nextTick();
		this.$refs.wechatBinding?.refresh();
	},
	onShareAppMessage() {
		return {
			title: "好茶相伴，共享清欢",
			path: `/pages/login/login?scene=${encodeURIComponent(this.scene?.sceneCode || "")}`,
		};
	},
	onShareTimeline() {
		return {
			title: "好茶相伴，共享清欢",
			query: `scene=${encodeURIComponent(this.scene?.sceneCode || "")}`,
		};
	},
	methods: {
		async loadShareRule() {
			this.shareRuleError = '';
			try { const rule = await mallApi.teaFriendConfig(); this.shareRuleDescription = rule.effectiveDescription || ''; }
			catch (error) { this.shareRuleError = '分享说明加载失败，请重新进入页面重试'; }
		},
		async bindingChanged(state) {
			this.scene = null; this.qrCells = [];
			if (!state?.bound) return;
			try {
				this.scene = await mallApi.inviteScene();
				if (!this.scene?.sceneCode || !this.scene.inviteUrl) throw new Error('邀请场景生成失败，请重新查询绑定状态后重试');
				const qr = createInviteQr(this.inviteLink);
				this.qrSize = qr.modules.size;
				this.qrCells = Array.from(qr.modules.data, item => item === 1);
				// #ifdef MP-WEIXIN
				uni.showShareMenu({menus:['shareAppMessage','shareTimeline']});
				// #endif
			} catch(e) { this.scene = null; this.showToast(e.message || '邀请加载失败'); }
		},
		copyLink() {
			if (!this.inviteLink) return this.showToast("邀请场景尚未生成");
			uni.setClipboardData({
				data: this.inviteLink,
				success: () => this.showToast("邀请链接已复制"),
				fail: () => this.showToast("复制失败，请稍后重试"),
			});
		},
		async shareH5() {
			if (!this.inviteLink) return this.showToast("邀请场景尚未生成");
			if (typeof navigator !== "undefined" && navigator.share) {
				try {
					await navigator.share({
						title: "好茶相伴，共享清欢",
						text: "邀你一起品好茶",
						url: this.inviteLink,
					});
				} catch (e) {
					if (e?.name !== "AbortError")
						this.showToast("系统分享失败，可改用复制链接");
				}
				return;
			}
			this.copyLink();
		},
		shareTimeline() {
			if (!this.scene) return this.showToast('请先绑定微信并生成邀请场景');
			/* #ifdef MP-WEIXIN */ this.showToast(
				"请点击右上角菜单选择分享到朋友圈",
			);
			/* #endif */ /* #ifndef MP-WEIXIN */ this.copyLink(); /* #endif */
		},
		async savePoster() {
			if (this.saving) return;
			if (!this.qrCells.length)
				return this.showToast("邀请信息尚未加载，请重新进入后重试");
			this.saving = true;
			try {
				/* #ifdef H5 */ await this.saveH5Poster();
				/* #endif */ /* #ifdef MP-WEIXIN */ await this.saveMiniPoster(); /* #endif */
			} catch (e) {
				console.error(
					"[TEA_POSTER_ERROR]",
					e?.message || e?.errMsg || String(e),
				);
				this.showToast(e.message || "海报保存失败");
			} finally {
				this.saving = false;
			}
		},
		saveH5Poster() {
			return new Promise((resolve, reject) => {
				const canvas = document.createElement("canvas");
				canvas.width = POSTER_WIDTH;
				canvas.height = POSTER_HEIGHT;
				const ctx = canvas.getContext("2d");
				const image = new Image();
				image.crossOrigin = "anonymous";
				image.onload = () => {
					try {
						ctx.drawImage(image, 0, 0, POSTER_WIDTH, POSTER_HEIGHT);
						ctx.fillStyle = "rgba(2,51,35,.55)";
						ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
						ctx.fillStyle = "#fff";
						ctx.font = "64px SimSun";
						ctx.fillText("好茶相伴 共享清欢", 64, 120);
						ctx.font = "28px Microsoft YaHei";
						ctx.fillText("扫码加入茶友圈", 64, 175);
						drawPosterQr(ctx, this.qrSize, this.qrCells);
						const a = document.createElement("a");
						a.href = canvas.toDataURL("image/png");
						a.download = "茶友邀请海报.png";
						a.click();
						this.showToast("海报已生成并开始下载");
						resolve();
					} catch (error) {
						reject(error);
					}
				};
				image.onerror = () => reject(new Error("海报底图加载失败"));
				image.src = this.decorationImage(
					"invite.poster",
					"/static/images/invite-poster-v2.webp",
				);
			});
		},
		async saveMiniPoster() {
			await this.$nextTick();
			await new Promise((resolve, reject) => {
				uni.createSelectorQuery()
					.in(this)
					.select("#invitePosterCanvas")
					.boundingClientRect((rect) => {
						try {
							assertPosterCanvasSize(rect?.width, rect?.height);
							resolve();
						} catch (error) {
							reject(error);
						}
					})
					.exec();
			});
			const posterPath = await this.resolveMiniPosterImage();
			const miniCodePath = await mallApi.downloadInviteMiniCode();
			return new Promise((resolve, reject) => {
				const ctx = uni.createCanvasContext("invitePosterCanvas", this);
				ctx.drawImage(posterPath, 0, 0, POSTER_WIDTH, POSTER_HEIGHT);
				ctx.setFillStyle("rgba(2,51,35,.55)");
				ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
				ctx.setFillStyle("#fff");
				ctx.setFontSize(60);
				ctx.fillText("好茶相伴 共享清欢", 64, 124);
				ctx.setFillStyle('#fff');
				ctx.fillRect(POSTER_WIDTH - 288, POSTER_HEIGHT - 304, 232, 232);
				ctx.drawImage(miniCodePath, POSTER_WIDTH - 276, POSTER_HEIGHT - 292, 208, 208);
				ctx.draw(false, () =>
					uni.canvasToTempFilePath(
						{
							canvasId: "invitePosterCanvas",
							...POSTER_EXPORT,
							success: (r) =>
								uni.saveImageToPhotosAlbum({
									filePath: r.tempFilePath,
									success: () => {
										this.showToast("海报已保存到相册");
										resolve();
									},
									fail: (e) => {
										if (
											String(e.errMsg).includes(
												"auth deny",
											)
										)
											uni.showModal({
												title: "需要相册权限",
												content:
													"请在设置中允许保存图片到相册",
												confirmText: "去设置",
												success: (m) => {
													if (m.confirm)
														uni.openSetting({});
												},
											});
										reject(
											new Error(
												"未能保存海报，请检查相册权限",
											),
										);
									},
								}),
							fail: () => reject(new Error("海报生成失败")),
						},
						this,
					),
				);
			});
		},
		resolveMiniPosterImage() {
			const source = this.decorationImage(
				"invite.poster",
				"/static/images/invite-poster-v2.webp",
			);
			if (!/^https?:\/\//i.test(source)) return Promise.resolve(source);
			return new Promise((resolve, reject) => {
				uni.downloadFile({
					url: source,
					success: (result) => {
						if (result.statusCode === 200 && result.tempFilePath)
							resolve(result.tempFilePath);
						else reject(new Error("海报底图下载失败"));
					},
					fail: () => reject(new Error("海报底图下载失败")),
				});
			});
		},
	},
};
</script>
<style scoped>
.share-choice-screen {
	padding: 23.4rpx;
	padding-bottom: calc(23.4rpx + env(safe-area-inset-bottom, 0px));
	box-sizing: border-box;
}
.share-head {
	height: 251.1rpx;
	padding: 33.5rpx;
	border-radius: 21.8rpx;
	background: #07593f;
	color: #fff;
	box-sizing: border-box;
}
.share-head text {
	display: block;
}
.share-head text:first-child {
	font-size: 20.1rpx;
}
.share-head text:last-child {
	margin-top: 18.4rpx;
	font:
		45.2rpx SimSun,
		serif;
}
.section-title {
	display: block;
	margin: 25.1rpx 3.3rpx 13.4rpx;
	font:
		33.5rpx SimSun,
		serif;
}
.share-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 18.4rpx;
}
.share-grid > view,
.share-grid > button {
	height: 212.6rpx;
	margin: 0;
	padding: 0;
	border: 1px solid #e3d7c3;
	border-radius: 20.1rpx;
	background: #fff;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 21.8rpx;
	font-size: 21.8rpx;
	color: #1e2923;
	line-height: 1;
}
.share-grid button:after {
	display: none;
}
.share-icon {
	width: 82rpx;
	height: 82rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #edf6f0;
	color: #07593f;
}
.share-icon.gold {
	background: #f8efdf;
	color: #aa6b20;
}
.share-description {
	display: block;
	margin: 0 3.3rpx 45.2rpx;
	color: #8e8a82;
	font-size: 18.4rpx;
	line-height: 1.8;
}
.poster-canvas {
	position: fixed;
	pointer-events: none;
}
</style>
