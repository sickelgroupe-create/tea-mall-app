<template>
	<view class="app-stage login-stage">
		<view class="phone-shell login-shell" :style="loginSafeAreaStyle">
			<StatusBar />
			<scroll-view
				scroll-y
				class="shell-scroll-viewport screen login-screen"
				enhanced
				:show-scrollbar="false"
			>
				<view class="login-hero">
					<image
						class="login-hero-photo"
						:src="loginHeroSource"
						mode="aspectFill"
						:lazy-load="false"
						@load="
							onImageLoad(
								'login-hero',
								decoration('auth.hero')?.imageUrl,
								loginHeroSource,
								$event,
							)
						"
						@error="useLoginHeroFallback($event)"
					/>
					<view class="login-hero-wash"></view>
					<view class="login-hero-copy">
						<text>登录注册</text>
						<text>欢迎来到茶叶商城</text>
					</view>
				</view>

				<view class="login-content">
					<view class="login-card">
						<view class="auth-tabs" role="tablist">
							<view
								:class="{ active: authMode === 'login' }"
								@tap="selectAuthMode('login')"
								>密码登录</view
							>
							<view
								:class="{ active: authMode === 'register' }"
								@tap="selectAuthMode('register')"
								>手机号注册</view
							>
						</view>

						<view class="login-fields">
							<view class="input-row">
								<TeaIcon
									class="input-icon"
									name="phone"
									:size="19"
								/>
								<input
									v-model="phone"
									type="number"
									maxlength="11"
									placeholder="请输入手机号"
								/>
							</view>
							<view v-if="authMode === 'register'" class="input-row">
								<TeaIcon class="input-icon" name="shield" :size="19" />
								<input v-model="smsCode" type="number" maxlength="6" placeholder="请输入注册验证码" />
								<button class="sms-code-button" :disabled="smsCountdown > 0 || authSubmitting" @tap="requestSmsCode('REGISTER')">
									{{ smsCountdown > 0 ? smsCountdown + "s" : "获取验证码" }}
								</button>
							</view>
							<view class="input-row">
								<TeaIcon
									class="input-icon"
									:name="
										credentialMode === 'code'
											? 'shield'
											: 'lock'
									"
									:size="19"
								/>
								<input
									v-if="credentialMode === 'password'"
									v-model="loginPassword"
									:password="!passwordVisible"
									maxlength="32"
									:placeholder="
										authMode === 'register'
											? '设置8-32位密码'
											: '请输入密码'
									"
								/>
								<input
									v-else
									v-model="smsCode"
									type="number"
									maxlength="6"
									placeholder="请输入验证码"
								/>
								<text
									v-if="credentialMode === 'password'"
									class="password-eye"
									@tap="passwordVisible = !passwordVisible"
									>{{
										passwordVisible ? "隐藏" : "查看"
									}}</text
								>
								<button
									v-else
									class="sms-code-button"
									:disabled="
										smsCountdown > 0 || authSubmitting
									"
									@tap="requestSmsCode('LOGIN')"
								>
									{{
										smsCountdown > 0
											? smsCountdown + "s"
											: "获取验证码"
									}}
								</button>
							</view>
						</view>

						<text v-if="smsChannelMessage" class="sms-channel-message">{{ smsChannelMessage }}</text>
						<view class="login-helpers">
							<text @tap="openPasswordRecovery">忘记密码?</text>
							<text
								v-if="authMode === 'login'"
								@tap="toggleCredentialMode"
								>{{
									credentialMode === "password"
										? "验证码登录"
										: "密码登录"
								}}</text
							>
							<text v-else>验证码验证手机号，密码须包含字母和数字</text>
						</view>

						<button
							class="primary-button login-submit"
							:disabled="authSubmitting"
							@tap="submitPhoneAuth"
						>
							{{
								authSubmitting
									? "处理中…"
									: authMode === "register"
										? "注册并登录"
										: "登录"
							}}
						</button>
						<button
							class="wechat-button login-wechat"
							:disabled="authSubmitting"
							@tap="wechatLogin"
						>
							<TeaIcon name="wechat" :size="18" />
							<!-- #ifdef MP-WEIXIN --><text>微信登录 / 注册</text><!-- #endif -->
							<!-- #ifndef MP-WEIXIN --><text>微信小程序登录说明</text><!-- #endif -->
						</button>
						<view class="agreement" @tap="agreed = !agreed">
							<view
								class="agreement-check"
								:class="{ checked: agreed }"
								><TeaIcon
									v-if="agreed"
									name="check"
									:size="14"
									tone="white"
							/></view>
							<text>我已阅读并同意</text>
							<text
								class="protocol-link"
								@tap.stop="protocolPanel = '用户协议'"
								>《用户协议》</text
							>
							<text>和</text>
							<text
								class="protocol-link"
								@tap.stop="protocolPanel = '隐私政策'"
								>《隐私政策》</text
							>
						</view>
					</view>

					<view class="member-ritual">
						<image
							class="member-photo"
							:src="loginMemberSource"
							mode="aspectFill"
							:lazy-load="false"
							@load="
								onImageLoad(
									'login-member',
									decoration('auth.member')?.imageUrl,
									loginMemberSource,
									$event,
								)
							"
							@error="useLoginMemberFallback($event)"
						/>
						<view class="member-overlay"></view>
						<view class="member-copy">
							<text class="member-eyebrow">INVITATION ONLY</text>
							<text class="member-title">臻享会员礼序</text>
							<text class="member-description"
								>为真正懂茶的人保留。以克制的仪式感，呈现真正稀缺的茶与器。</text
							>
							<view class="member-benefits">
								<view>
									<view class="member-icon"
										><TeaIcon
											name="user"
											:size="25"
											tone="white"
									/></view>
									<text>专属茶师</text><text>一对一服务</text>
								</view>
								<view>
									<view class="member-icon"
										><TeaIcon
											name="gift"
											:size="25"
											tone="white"
									/></view>
									<text>稀缺配额</text><text>优先礼遇</text>
								</view>
								<view>
									<view class="member-icon"
										><TeaIcon
											name="shield"
											:size="25"
											tone="white"
									/></view>
									<text>私享雅集</text><text>全程保障</text>
								</view>
							</view>
						</view>
						<view class="member-ring"></view>
					</view>
				</view>
			</scroll-view>
			<view
				v-if="recoveryOpen"
				class="sheet-mask"
				@tap="closePasswordRecovery"
			>
				<view class="action-sheet recovery-sheet" @tap.stop>
					<view class="sheet-head">
						<view
							><text>重置登录密码</text
							><text
								>请先获取验证码。当前通道以服务器提示为准；模拟短信仅用于测试。</text
							></view
						>
						<text @tap="closePasswordRecovery">×</text>
					</view>
					<view class="recovery-field"
						><TeaIcon name="phone" :size="19" /><input
							v-model="phone"
							type="number"
							maxlength="11"
							placeholder="请输入注册手机号"
					/></view>
					<view class="recovery-field"
						><TeaIcon name="shield" :size="19" /><input
							v-model="recoveryCode"
							type="number"
							maxlength="6"
							placeholder="请输入验证码"
						/><button
							:disabled="smsCountdown > 0 || authSubmitting"
							@tap="requestSmsCode('RESET')"
						>
							{{
								smsCountdown > 0
									? smsCountdown + "s"
									: "获取验证码"
							}}
						</button></view
					>
					<view class="recovery-field"
						><TeaIcon name="lock" :size="19" /><input
							v-model="recoveryPassword"
							password
							maxlength="32"
							placeholder="设置新的8-32位密码"
					/></view>
					<button
						class="recovery-submit"
						:disabled="authSubmitting"
						@tap="resetPassword"
					>
						{{ authSubmitting ? "处理中…" : "确认重置" }}
					</button>
				</view>
			</view>

			<view
				v-if="wechatBindingOpen"
				class="sheet-mask"
				@tap="wechatBindingOpen = false"
			>
				<view class="action-sheet wechat-binding-sheet" @tap.stop>
					<view class="sheet-head">
						<view><text>首次微信登录</text><text>请选择创建新账号或绑定已有手机号账号</text></view>
						<text @tap="wechatBindingOpen = false">×</text>
					</view>
					<view class="wechat-binding-tabs">
						<view :class="{ active: wechatBindingMode === 'register' }" @tap="wechatBindingMode = 'register'">微信注册</view>
						<view :class="{ active: wechatBindingMode === 'bind' }" @tap="wechatBindingMode = 'bind'">绑定已有账号</view>
					</view>
					<template v-if="wechatBindingMode === 'register'">
						<view class="recovery-field"><TeaIcon name="user" :size="19" /><input v-model="wechatNickname" maxlength="64" placeholder="请输入昵称" /></view>
						<button class="recovery-submit" :disabled="authSubmitting" @tap="completeWechatRegistration">
							{{ authSubmitting ? "处理中…" : "创建微信账号并登录" }}
						</button>
					</template>
					<template v-else>
						<view class="recovery-field"><TeaIcon name="phone" :size="19" /><input v-model="phone" type="number" maxlength="11" placeholder="已有账号手机号" /></view>
						<view class="recovery-field">
							<TeaIcon name="shield" :size="19" /><input v-model="smsCode" type="number" maxlength="6" placeholder="绑定验证码" />
							<button :disabled="smsCountdown > 0 || authSubmitting" @tap="requestSmsCode('BIND_WECHAT')">{{ smsCountdown > 0 ? smsCountdown + "s" : "获取验证码" }}</button>
						</view>
						<button class="recovery-submit" :disabled="authSubmitting" @tap="completeWechatPhoneBinding">
							{{ authSubmitting ? "处理中…" : "验证并绑定账号" }}
						</button>
					</template>
				</view>
			</view>

			<view
				v-if="protocolPanel"
				class="sheet-mask"
				@tap="protocolPanel = ''"
			>
				<view class="action-sheet protocol-sheet" @tap.stop>
					<view class="sheet-head"
						><view
							><text>{{ protocolPanel }}</text
							><text>茶叶商城用户服务说明</text></view
						><text @tap="protocolPanel = ''">×</text></view
					>
					<scroll-view scroll-y class="protocol-copy"
						><text>{{ protocolContent }}</text></scroll-view
					>
					<button
						@tap="
							agreed = true;
							protocolPanel = '';
						"
					>
						同意并继续
					</button>
				</view>
			</view>
			<view v-if="toastText" class="toast">{{ toastText }}</view>
		</view>
	</view>
</template>

<script>
import StatusBar from "@/components/StatusBar.vue";
import TeaIcon from "@/components/TeaIcon.vue";
import mallPage from "@/shared/mall-page.js";
import mallApi from "@/shared/mall-api.js";
import { navPage } from "@/shared/router.js";

export default {
	components: { StatusBar, TeaIcon },
	mixins: [mallPage],
	data() {
		return {
			credentialMode: "password",
			passwordVisible: false,
			smsCode: "",
			smsCountdown: 0,
			smsTimer: null,
			smsChannelMessage: '',
			recoveryOpen: false,
			recoveryCode: "",
			recoveryPassword: "",
			statusBarHeight: 25,
			capsuleRightInset: 16,
			loginHeroFallbackActive: false,
			loginMemberFallbackActive: false,
		};
	},
	computed: {
		loginHeroSource() {
			const fallback = this.imageFor("login-art-v2");
			return this.loginHeroFallbackActive
				? this.imageFor("longjing-pale")
				: this.decorationImage("auth.hero", fallback) || fallback;
		},
		loginMemberSource() {
			const fallback = this.imageFor("longjing-dark-v2");
			return this.loginMemberFallbackActive
				? this.imageFor("longjing-dark")
				: this.decorationImage("auth.member", fallback) || fallback;
		},
		protocolContent() {
			const key =
				this.protocolPanel === "用户协议"
					? "USER_AGREEMENT"
					: "PRIVACY_POLICY";
			return (
				this.managedDocuments.find((item) => item.documentKey === key)
					?.content || "协议内容暂未加载，请稍后重试。"
			);
		},
		loginSafeAreaStyle() {
			return (
				"--status-bar-height:" +
				this.statusBarHeight +
				"px;--login-capsule-right:" +
				this.capsuleRightInset +
				"px"
			);
		},
	},
	created() {
		this.syncMiniProgramSafeArea();
	},
	beforeUnmount() {
		this.stopSmsCountdown();
	},
	methods: {
		useLoginHeroFallback(event) {
			this.onImageError(
				"login-hero",
				this.decoration("auth.hero")?.imageUrl,
				this.loginHeroSource,
				event,
			);
			this.loginHeroFallbackActive = true;
		},
		useLoginMemberFallback(event) {
			this.onImageError(
				"login-member",
				this.decoration("auth.member")?.imageUrl,
				this.loginMemberSource,
				event,
			);
			this.loginMemberFallbackActive = true;
		},
		syncMiniProgramSafeArea() {
			try {
				const info =
					typeof uni.getWindowInfo === "function"
						? uni.getWindowInfo()
						: uni.getSystemInfoSync
							? uni.getSystemInfoSync()
							: {};
				this.statusBarHeight = Number(info.statusBarHeight || 25);
				// #ifdef MP-WEIXIN
				const capsule =
					typeof uni.getMenuButtonBoundingClientRect === "function"
						? uni.getMenuButtonBoundingClientRect()
						: null;
				if (capsule?.left && info.windowWidth)
					this.capsuleRightInset = Math.max(
						16,
						Number(info.windowWidth) - Number(capsule.left) + 8,
					);
				// #endif
			} catch (error) {
				this.statusBarHeight = 25;
				this.capsuleRightInset = 16;
			}
		},
		selectAuthMode(mode) {
			if (this.authSubmitting) return;
			this.authMode = mode;
			this.credentialMode = "password";
			this.smsCode = "";
			this.smsChannelMessage = '';
		},
		toggleCredentialMode() {
			if (this.authSubmitting || this.authMode !== "login") return;
			this.credentialMode =
				this.credentialMode === "password" ? "code" : "password";
			this.smsCode = "";
		},
		async submitPhoneAuth() {
			if (this.authMode === "register") return this.register();
			if (this.credentialMode === "code") return this.loginWithSmsCode();
			return this.login();
		},
		async loginWithSmsCode() {
			if (this.authSubmitting) return;
			if (!this.agreed) return this.toast("请先阅读并同意用户协议");
			if (!/^1\d{10}$/.test(this.phone))
				return this.toast("请输入正确的11位手机号");
			if (!/^\d{6}$/.test(this.smsCode))
				return this.toast("请输入6位验证码");
			this.authSubmitting = true;
			try {
				await mallApi.loginWithSmsCode({
					phone: this.phone,
					code: this.smsCode,
				});
				uni.setStorageSync("teaSession", {
					authenticated: true,
					loginAt: Date.now(),
					provider: "sms",
				});
				await this.loadMallData();
				navPage("home");
			} catch (error) {
				this.toast(error.message || "验证码登录失败");
			} finally {
				this.authSubmitting = false;
			}
		},
		async requestSmsCode(purpose) {
			if (this.authSubmitting || this.smsCountdown > 0) return;
			if (!/^1\d{10}$/.test(this.phone))
				return this.toast("请输入正确的11位手机号");
			this.authSubmitting = true;
			try {
				const result = await mallApi.requestSmsCode({
					phone: this.phone,
					purpose,
				});
				this.startSmsCountdown(Number(result?.retryAfterSeconds || 60));
				this.smsChannelMessage = result?.channel === 'ISOLATED_TEST'
					? `模拟短信测试，未发送真实短信。验证码：${result.testCode}（5分钟内有效，一次使用）`
					: '验证码已发送，请查收短信。';
				this.toast(
					result?.channel === 'ISOLATED_TEST'
						? this.smsChannelMessage
						: "验证码已发送",
				);
			} catch (error) {
				this.toast(error.message || "验证码发送失败");
			} finally {
				this.authSubmitting = false;
			}
		},
		startSmsCountdown(seconds) {
			this.stopSmsCountdown();
			this.smsCountdown = Math.max(
				1,
				Math.min(120, Number(seconds) || 60),
			);
			this.smsTimer = setInterval(() => {
				this.smsCountdown -= 1;
				if (this.smsCountdown <= 0) this.stopSmsCountdown();
			}, 1000);
		},
		stopSmsCountdown() {
			if (this.smsTimer) clearInterval(this.smsTimer);
			this.smsTimer = null;
			if (this.smsCountdown < 0) this.smsCountdown = 0;
		},
		openPasswordRecovery() {
			if (this.authSubmitting) return;
			this.recoveryOpen = true;
			this.recoveryCode = "";
			this.recoveryPassword = "";
		},
		closePasswordRecovery() {
			if (this.authSubmitting) return;
			this.recoveryOpen = false;
		},
		async resetPassword() {
			if (this.authSubmitting) return;
			if (!/^1\d{10}$/.test(this.phone))
				return this.toast("请输入正确的11位手机号");
			if (!/^\d{6}$/.test(this.recoveryCode))
				return this.toast("请输入6位验证码");
			if (!/^(?=.*[A-Za-z])(?=.*\d).{8,32}$/.test(this.recoveryPassword))
				return this.toast("新密码需为8-32位，并同时包含字母和数字");
			this.authSubmitting = true;
			try {
				await mallApi.resetPassword({
					phone: this.phone,
					code: this.recoveryCode,
					newPassword: this.recoveryPassword,
				});
				this.recoveryOpen = false;
				this.authMode = "login";
				this.credentialMode = "password";
				this.loginPassword = "";
				this.toast("密码已重置，请使用新密码登录");
			} catch (error) {
				this.toast(error.message || "密码重置失败");
			} finally {
				this.authSubmitting = false;
			}
		},
	},
};
</script>

<style scoped>
.sms-channel-message{display:block;margin:12rpx 0;color:#986526;font-size:22rpx;line-height:1.6;overflow-wrap:anywhere;text-align:center}
.wechat-binding-tabs {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12rpx;
	margin: 24rpx 0;
}

.wechat-binding-tabs > view {
	padding: 20rpx 12rpx;
	border: 1px solid #d9dfd8;
	border-radius: 14rpx;
	text-align: center;
	color: #66736b;
}

.wechat-binding-tabs > view.active {
	border-color: #205b3a;
	background: #f1f6f2;
	color: #205b3a;
	font-weight: 600;
}
</style>

<style scoped>
.login-stage {
	background: #faf7ef;
}
.login-shell {
	background: #faf7ef;
	overflow: hidden;
}
.login-screen {
	min-height: 0;
	padding: 0 0 calc(30rpx + env(safe-area-inset-bottom));
	background: #faf7ef;
}
.login-hero {
	position: relative;
	height: 446rpx;
	overflow: hidden;
	background: #f0eee5;
}
.login-hero-photo {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-position: 50% 82%;
	filter: none;
}
.login-hero-wash {
	position: absolute;
	inset: 0;
	background:
		linear-gradient(
			90deg,
			rgba(248, 246, 237, 0.42) 0%,
			rgba(248, 246, 237, 0.18) 38%,
			rgba(248, 246, 237, 0) 68%
		),
		linear-gradient(
			180deg,
			rgba(250, 247, 239, 0),
			rgba(250, 247, 239, 0.06)
		);
}
.login-hero-copy {
	position: absolute;
	z-index: 2;
	top: 58rpx;
	left: 52rpx;
	right: var(--login-capsule-right);
	display: flex;
	flex-direction: column;
	color: #07543b;
}
.login-hero-copy > text:first-child {
	font-family: SimSun, STSong, "Songti SC", serif;
	font-size: 48rpx;
	font-weight: 600;
	line-height: 1.18;
	letter-spacing: 3rpx;
}
.login-hero-copy > text:last-child {
	margin-top: 17rpx;
	font-size: 23rpx;
	line-height: 1.4;
}
.login-content {
	position: relative;
	z-index: 3;
	margin-top: -48rpx;
	padding: 0 30rpx;
}
.login-card {
	min-height: 666rpx;
	padding: 33rpx 34rpx 28rpx;
	border: 1rpx solid #e6dcca;
	border-radius: 24rpx;
	background: #fff;
	box-shadow: 0 12rpx 32rpx rgba(64, 52, 31, 0.06);
}
.auth-tabs {
	display: grid;
	height: 56rpx;
	grid-template-columns: repeat(2, 1fr);
	padding: 0;
	border: 0;
	border-radius: 0;
	background: transparent;
	color: #111c16;
	font-size: 25rpx;
	font-weight: 600;
}
.auth-tabs > view {
	position: relative;
	display: flex;
	align-items: flex-start;
	justify-content: center;
	border-radius: 0;
}
.auth-tabs > view.active {
	color: #07150e;
	background: transparent;
	box-shadow: none;
}
.auth-tabs > view.active::after {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 3rpx;
	border-radius: 3rpx;
	background: #07543b;
	content: "";
}
.login-fields {
	display: flex;
	margin-top: 28rpx;
	flex-direction: column;
	gap: 18rpx;
}
.input-row {
	display: flex;
	height: 89rpx;
	min-height: 89rpx;
	padding: 0 25rpx;
	align-items: center;
	gap: 17rpx;
	border: 1rpx solid #d9cdbb;
	border-radius: 14rpx;
	background: #fff;
	color: #174e37;
}
.input-row input {
	flex: 1;
	min-width: 0;
	height: 100%;
	color: #17231d;
	font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
	font-size: 23rpx;
	line-height: 89rpx;
}
.input-row .input-icon {
	color: #174e37;
}
.password-eye {
	flex: 0 0 auto;
	padding: 18rpx 0 18rpx 14rpx;
	color: #446356;
	font-size: 19rpx;
}
.sms-code-button {
	display: flex;
	width: auto;
	min-width: 130rpx;
	height: 58rpx;
	min-height: 58rpx;
	margin: 0;
	padding: 0 10rpx 0 18rpx;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	border: 0;
	border-left: 1rpx solid #e5ded2;
	border-radius: 0;
	background: transparent;
	color: #07543b;
	font-size: 20rpx;
	font-weight: 500;
	line-height: 1.2;
	white-space: nowrap;
}
.login-helpers {
	display: flex;
	height: 69rpx;
	padding: 18rpx 2rpx 11rpx;
	align-items: flex-start;
	justify-content: space-between;
	color: #777d78;
	font-size: 19rpx;
	line-height: 1.4;
}
.login-helpers > text:nth-child(2) {
	color: #66756d;
	text-align: right;
}
.login-submit,
.login-wechat {
	display: flex;
	box-sizing: border-box;
	width: 100%;
	height: var(--control-height-large);
	min-height: var(--control-height-large);
	margin: 0;
	padding: 0 var(--control-padding-default);
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	border-radius: var(--control-radius-default);
	font-size: var(--control-font-emphasis);
	font-weight: var(--control-font-weight-emphasis);
	line-height: 1.2;
	white-space: nowrap;
}
.login-submit {
	border: 1rpx solid #07543b;
	background: #07543b;
	color: #fff;
}
.login-wechat {
	margin-top: 17rpx;
	gap: 12rpx;
	border: 1rpx solid #568173;
	background: #fff;
	color: #07543b;
}
.login-submit[disabled],
.login-wechat[disabled] {
	opacity: 0.55;
}
.agreement {
	display: flex;
	margin-top: 23rpx;
	padding: 0 2rpx;
	align-items: center;
	justify-content: flex-start;
	flex-wrap: nowrap;
	gap: 5rpx;
	color: #777d78;
	font-size: 18rpx;
	line-height: 1.45;
	white-space: nowrap;
}
.agreement-check {
	display: flex;
	width: 26rpx;
	height: 26rpx;
	flex: 0 0 26rpx;
	margin-right: 3rpx;
	align-items: center;
	justify-content: center;
	border: 2rpx solid #07543b;
	border-radius: 50%;
	background: #fff;
}
.agreement-check.checked {
	background: #07543b;
}
.protocol-link {
	color: #667a70;
}
.member-ritual {
	position: relative;
	height: 560rpx;
	margin-top: 34rpx;
	overflow: hidden;
	border: 1rpx solid rgba(211, 187, 122, 0.6);
	border-radius: 24rpx;
	background: #034834;
	color: #fff;
}
.member-photo {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	opacity: 0.78;
}
.member-overlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(
		180deg,
		rgba(0, 55, 39, 0.76) 0%,
		rgba(0, 58, 41, 0.6) 46%,
		rgba(0, 51, 37, 0.72) 100%
	);
}
.member-copy {
	position: relative;
	z-index: 2;
	padding: 44rpx 37rpx;
}
.member-eyebrow {
	display: block;
	color: #efd175;
	font-family: Georgia, "Times New Roman", serif;
	font-size: 18rpx;
	line-height: 1.2;
	letter-spacing: 4rpx;
}
.member-title {
	display: block;
	margin-top: 20rpx;
	font-family: SimSun, STSong, "Songti SC", serif;
	font-size: 39rpx;
	line-height: 1.2;
	letter-spacing: 4rpx;
}
.member-description {
	display: block;
	margin-top: 19rpx;
	max-width: 620rpx;
	color: rgba(255, 255, 255, 0.78);
	font-size: 18rpx;
	line-height: 1.65;
}
.member-benefits {
	display: grid;
	margin-top: 31rpx;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 14rpx;
}
.member-benefits > view {
	display: flex;
	height: 169rpx;
	padding: 18rpx 8rpx 14rpx;
	align-items: center;
	justify-content: flex-start;
	flex-direction: column;
	border: 1rpx solid rgba(224, 193, 108, 0.48);
	border-radius: 12rpx;
	background: rgba(255, 255, 255, 0.035);
}
.member-icon {
	display: flex;
	height: 46rpx;
	align-items: center;
	justify-content: center;
	color: #f1cf6f;
}
.member-icon :deep(.tea-icon__image) {
	opacity: 0.92;
	filter: brightness(0) saturate(100%) invert(82%) sepia(38%) saturate(772%)
		hue-rotate(358deg) brightness(99%) contrast(88%);
}
.member-benefits > view > text:nth-child(2) {
	margin-top: 10rpx;
	font-family: SimSun, STSong, "Songti SC", serif;
	font-size: 24rpx;
	line-height: 1.2;
}
.member-benefits > view > text:last-child {
	margin-top: 13rpx;
	color: rgba(255, 255, 255, 0.78);
	font-size: 17rpx;
	line-height: 1.2;
}
.member-ring {
	position: absolute;
	right: -68rpx;
	bottom: -65rpx;
	z-index: 2;
	width: 300rpx;
	height: 300rpx;
	border: 1rpx solid rgba(222, 189, 95, 0.55);
	border-radius: 50%;
	box-shadow: 0 0 0 56rpx rgba(222, 189, 95, 0.045);
}
.recovery-sheet {
	display: flex;
	gap: 18rpx;
	flex-direction: column;
}
.recovery-field {
	display: flex;
	height: 82rpx;
	padding: 0 20rpx;
	align-items: center;
	gap: 14rpx;
	border: 1rpx solid #ded3c2;
	border-radius: 13rpx;
	background: #fff;
	color: #07543b;
}
.recovery-field input {
	flex: 1;
	min-width: 0;
	height: 100%;
	font-size: 24rpx;
}
.recovery-field button {
	display: flex;
	width: auto;
	height: 58rpx;
	min-height: 58rpx;
	margin: 0;
	padding: 0 10rpx 0 18rpx;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	border-left: 1rpx solid #e5ded2;
	border-radius: 0;
	background: transparent;
	color: #07543b;
	font-size: 20rpx;
	font-weight: 500;
	line-height: 1.2;
	white-space: nowrap;
}
.recovery-submit {
	display: flex;
	width: 100%;
	height: var(--control-height-large);
	min-height: var(--control-height-large);
	margin: 4rpx 0 0;
	padding: 0 var(--control-padding-default);
	align-items: center;
	justify-content: center;
	border-radius: var(--control-radius-default);
	background: #07543b;
	color: #fff;
	font-size: var(--control-font-emphasis);
	font-weight: var(--control-font-weight-emphasis);
	line-height: 1.2;
	white-space: nowrap;
}
@media (max-width: 360px) {
	.login-content {
		padding-right: 22rpx;
		padding-left: 22rpx;
	}
	.login-card {
		padding-right: 25rpx;
		padding-left: 25rpx;
	}
	.agreement {
		font-size: 16rpx;
		gap: 3rpx;
	}
	.member-copy {
		padding-right: 27rpx;
		padding-left: 27rpx;
	}
	.member-benefits {
		gap: 9rpx;
	}
}
</style>
