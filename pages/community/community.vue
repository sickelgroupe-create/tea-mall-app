<template>
	<view
		class="app-stage"
		:class="{ 'catalog-stage--audit': visualAudit }"
		:style="visualAuditStyle"
		><view class="phone-shell partner-shell"
			><StatusBar /><TopBar
				title="留言板与我的"
				@back="back"
			/><scroll-view scroll-y class="shell-scroll-viewport partner-scroll with-tab shell-scroll--with-bottom-nav"
				><view class="partner-tabs"
					><view
						class="partner-tab"
						:class="{ active: !mine }"
						@tap="
							mine = false;
							load();
						"
						>茶友广场</view
					><view
						class="partner-tab"
						:class="{ active: mine }"
						@tap="
							mine = true;
							load();
						"
						>我的</view
					></view
				><view class="community-publish">
					<textarea
						v-model.trim="draft"
						maxlength="1000"
						placeholder="分享此刻的茶香与心情…"
					/><view v-if="uploads.length" class="community-images"
						><image
							v-for="(url, i) in uploads"
							:key="url"
							:src="url"
							mode="aspectFill"
							@tap="preview(uploads, i)" /></view
					><view style="display: flex; gap: 16rpx; margin-top: 16rpx"
						><button
							class="partner-secondary"
							:disabled="uploading || uploads.length >= 9"
							@tap="chooseImages"
						>
							{{ uploading ? "上传中…" : "添加图片" }}</button
						><button
							class="partner-primary"
							:disabled="phaseSubmitting || !draft"
							@tap="publish"
						>
							{{ phaseSubmitting ? "发布中…" : "发布动态" }}
						</button></view
					></view
				><view v-if="phaseLoading" class="phase-message"
					>动态加载中…</view
				><view v-else-if="phaseError" class="phase-message"
					>{{ phaseError }}<button @tap="load">重新加载</button></view
				><template v-else
					><view
						v-for="post in communityFeed"
						:key="post.id"
						class="community-post"
						><view class="community-author"
							><image
								:src="
									imageFor(
										post.avatarUrl ||
											imageFor('longjing-hero-v2'),
									)
								"
								mode="aspectFill"
							/><view class="partner-grow"
								><text>{{ post.nickname || "茶友" }}</text
								><text
									>{{ post.createTime }} ·
									{{ post.status }}</text
								></view
							><text v-if="post.mine" @tap="remove(post)"
								>删除</text
							></view
						><view class="community-content">{{
							post.content
						}}</view
						><view
							v-if="post.images?.length"
							class="community-images"
							><image
								v-for="(img, i) in post.images"
								:key="img.imageUrl"
								:src="img.imageUrl"
								mode="aspectFill"
								@tap="
									preview(
										post.images.map((x) => x.imageUrl),
										i,
									)
								" /></view
						><view class="community-actions"
							><text @tap="toggleLike(post)"
								>{{ post.liked ? "♥" : "♡" }}
								{{ post.likeCount }}</text
							><text @tap="openComments(post)"
								>评论 {{ post.commentCount }}</text
							></view
						></view
					><view v-if="!communityFeed.length" class="phase-message"
						>这里还没有动态，来分享第一缕茶香吧</view
					><view class="partner-collection"
						><image
							:src="decorationImage('partner.intro')"
							mode="aspectFill"
						/><text>茶友相逢 · 留言有温度</text></view
					></template
				></scroll-view
			><BottomNav
				active="home"
				:cart-count="cartCount"
				@select="nav"
			/><view
				v-if="commentPost"
				class="modal-mask"
				@tap="commentPost = null"
				><view class="partner-card" @tap.stop
					><text class="partner-section-title">评论</text
					><scroll-view scroll-y style="height: 360rpx"
						><view
							v-for="c in comments"
							:key="c.id"
							class="partner-client"
							><view class="partner-grow"
								><text>{{ c.nickname || "茶友" }}</text
								><text style="white-space: normal">{{
									c.content
								}}</text></view
							><text
								v-if="c.customerId === customer.id"
								@tap="removeComment(c)"
								>删除</text
							></view
						><view v-if="!comments.length" class="phase-message"
							>暂无评论</view
						></scroll-view
					><view class="partner-search"
						><input
							v-model.trim="commentDraft"
							maxlength="500"
							placeholder="写下评论"
						/><button @tap="sendComment">发送</button></view
					></view
				></view
			></view
		></view
	>
</template>
<script>
import StatusBar from "@/components/StatusBar.vue";
import TopBar from "@/components/TopBar.vue";
import BottomNav from "@/components/BottomNav.vue";
import mallPage from "@/shared/mall-page.js";
import phase from "@/shared/phase33-40.js";
import mallApi from "@/shared/mall-api.js";
export default {
	components: { StatusBar, TopBar, BottomNav },
	mixins: [mallPage, phase],
	data() {
		return {
			mine: false,
			draft: "",
			uploads: [],
			uploading: false,
			commentPost: null,
			comments: [],
			commentDraft: "",
		};
	},
	onShow() {
		this.load();
	},
	methods: {
		async load() {
			try {
				const d = await this.phaseRun(() =>
					mallApi.communityPosts({
						mine: this.mine,
						page: 1,
						pageSize: 30,
					}),
				);
				this.communityFeed = d.items || [];
			} catch (_) {}
		},
		chooseImages() {
			uni.chooseImage({
				count: 9 - this.uploads.length,
				success: async (r) => {
					this.uploading = true;
					try {
						for (const path of r.tempFilePaths)
							this.uploads.push(
								await mallApi.uploadCommunityImage(path),
							);
					} catch (e) {
						this.phaseToast(e.message);
					} finally {
						this.uploading = false;
					}
				},
			});
		},
		async publish() {
			if (this.phaseSubmitting) return;
			this.phaseSubmitting = true;
			try {
				await mallApi.createCommunityPost({
					content: this.draft,
					images: this.uploads,
				});
				this.draft = "";
				this.uploads = [];
				this.phaseToast("发布成功");
				await this.load();
			} catch (e) {
				this.phaseToast(e.message);
			} finally {
				this.phaseSubmitting = false;
			}
		},
		async toggleLike(p) {
			try {
				await mallApi.likeCommunityPost(p.id, !p.liked);
				p.liked = !p.liked;
				p.likeCount = Math.max(
					0,
					Number(p.likeCount) + (p.liked ? 1 : -1),
				);
			} catch (e) {
				this.phaseToast(e.message);
			}
		},
		remove(p) {
			uni.showModal({
				title: "删除动态",
				content: "删除后评论和点赞将不可见。",
				success: async (r) => {
					if (r.confirm)
						try {
							await mallApi.deleteCommunityPost(p.id);
							await this.load();
						} catch (e) {
							this.phaseToast(e.message);
						}
				},
			});
		},
		preview(urls, current) {
			uni.previewImage({ urls, current: urls[current] });
		},
		async openComments(p) {
			this.commentPost = p;
			this.comments = await mallApi.communityComments(p.id);
		},
		async sendComment() {
			if (!this.commentDraft) return;
			try {
				await mallApi.createCommunityComment(this.commentPost.id, {
					content: this.commentDraft,
				});
				this.commentDraft = "";
				await this.openComments(this.commentPost);
				await this.load();
			} catch (e) {
				this.phaseToast(e.message);
			}
		},
		async removeComment(c) {
			try {
				await mallApi.deleteCommunityComment(c.id);
				await this.openComments(this.commentPost);
				await this.load();
			} catch (e) {
				this.phaseToast(e.message);
			}
		},
	},
};
</script>
