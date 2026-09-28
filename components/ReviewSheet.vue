<template>
	<view class="sheet-mask" @tap="close">
		<view class="action-sheet review-submit-sheet" @tap.stop>
			<view class="sheet-head">
				<view>
					<text>评价商品</text>
					<text>{{ target.item.name }}</text>
				</view>
				<text @tap="close">×</text>
			</view>

			<view class="review-form-stars" aria-label="商品评分">
				<text
					v-for="value in 5"
					:key="value"
					:class="{ active: value <= rating }"
					@tap="selectRating(value)"
					>★</text
				>
			</view>

			<textarea
				class="review-form-input"
				:value="content"
				:maxlength="500"
				placeholder="请写下至少5个字的真实购买体验"
				@input="updateContent"
			/>
			<view class="review-form-meta">
				<text :class="{ error: hasError, valid: canSubmit }">{{
					helperText
				}}</text>
				<text>{{ content.length }}/500</text>
			</view>

			<button
				class="review-form-submit"
				:class="{ 'is-disabled': !canSubmit }"
				:disabled="submitting"
				:loading="submitting"
				@tap="$emit('submit')"
			>
				{{ submitting ? "正在发布评价" : "发布评价并领取10积分" }}
			</button>
		</view>
	</view>
</template>

<script>
export default {
	name: "ReviewSheet",
	props: {
		target: { type: Object, required: true },
		rating: { type: Number, default: 5 },
		content: { type: String, default: "" },
		error: { type: String, default: "" },
		submitting: { type: Boolean, default: false },
	},
	emits: [
		"close",
		"submit",
		"update:rating",
		"update:content",
		"clear-error",
	],
	computed: {
		trimmedLength() {
			return this.content.trim().length;
		},
		canSubmit() {
			return (
				this.rating >= 1 &&
				this.rating <= 5 &&
				this.trimmedLength >= 5 &&
				this.trimmedLength <= 500
			);
		},
		hasError() {
			return (
				Boolean(this.error) ||
				(this.trimmedLength > 0 && this.trimmedLength < 5)
			);
		},
		helperText() {
			if (this.error) return this.error;
			if (this.trimmedLength === 0)
				return "请输入至少5个字，评价成功后奖励10积分";
			if (this.trimmedLength < 5)
				return `还需输入${5 - this.trimmedLength}个字`;
			return "内容符合发布要求";
		},
	},
	methods: {
		close() {
			if (!this.submitting) this.$emit("close");
		},
		selectRating(value) {
			if (this.submitting) return;
			this.$emit("update:rating", value);
			this.$emit("clear-error");
		},
		updateContent(event) {
			this.$emit("update:content", event.detail.value);
			this.$emit("clear-error");
		},
	},
};
</script>

<style scoped>
.review-form-stars {
	display: grid;
	grid-template-columns: repeat(5, 73.7rpx);
	justify-content: center;
	gap: 3.3rpx;
	padding: 10rpx 0 26.8rpx;
}

.review-form-stars text {
	display: flex;
	width: 73.7rpx;
	height: 73.7rpx;
	align-items: center;
	justify-content: center;
	color: #d7d7d1;
	font-size: 53.6rpx;
}

.review-form-stars text.active {
	color: #e3a51d;
}

.review-form-input {
	box-sizing: border-box;
	width: 100%;
	min-height: 221rpx;
	padding: 23.4rpx;
	border: 1px solid #dfe5de;
	border-radius: 21.8rpx;
	background: #fff;
	font-size: 25.1rpx;
	line-height: 1.6;
}

.review-form-meta {
	display: flex;
	min-height: 53.6rpx;
	align-items: center;
	justify-content: space-between;
	gap: 20.1rpx;
	padding: 10rpx 3.3rpx 13.4rpx;
	color: #7d847e;
	font-size: 20.1rpx;
	line-height: 30.1rpx;
}

.review-form-meta text:first-child {
	min-width: 0;
	flex: 1;
}

.review-form-meta .error {
	color: #c84b31;
}

.review-form-meta .valid {
	color: #21603d;
}

.review-form-submit {
	display: flex;
	box-sizing: border-box;
	width: 100%;
	height: var(--control-height-large);
	min-height: var(--control-height-large);
	margin: 0;
	padding: 0 var(--control-padding-default);
	align-items: center;
	justify-content: center;
	border-radius: var(--control-radius-default);
	background: #1f5c38;
	color: #fff;
	font-size: var(--control-font-default);
	font-weight: var(--control-font-weight-emphasis);
	line-height: 1.2;
	white-space: nowrap;
}

.review-form-submit.is-disabled {
	background: #dfe6df;
	color: #78817a;
}

@media (max-width: 360px) {
	.review-form-stars {
		grid-template-columns: repeat(5, 67rpx);
	}

	.review-form-stars text {
		width: 67rpx;
	}
}
</style>
