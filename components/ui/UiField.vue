<template>
	<view
		class="ui-field"
		:class="{ 'has-error': error, 'is-disabled': disabled }"
	>
		<text v-if="label" class="ui-field__label">{{ label }}</text>
		<view class="ui-field__control">
			<slot name="prefix" />
			<input
				class="ui-field__input"
				:type="type"
				:password="password"
				:value="modelValue"
				:placeholder="placeholder"
				:disabled="disabled"
				:maxlength="maxlength"
				:confirm-type="confirmType"
				placeholder-class="ui-field__placeholder"
				@input="handleInput"
				@focus="$emit('focus', $event)"
				@blur="$emit('blur', $event)"
			/>
			<text
				v-if="clearable && modelValue && !disabled"
				class="ui-field__clear"
				@tap="clear"
				>×</text
			>
			<slot name="suffix" />
		</view>
		<text v-if="error" class="ui-field__message ui-field__message--error">{{
			error
		}}</text>
		<text v-else-if="helper" class="ui-field__message">{{ helper }}</text>
	</view>
</template>

<script>
export default {
	name: "UiField",
	props: {
		modelValue: { type: [String, Number], default: "" },
		label: { type: String, default: "" },
		placeholder: { type: String, default: "" },
		type: { type: String, default: "text" },
		password: { type: Boolean, default: false },
		disabled: { type: Boolean, default: false },
		clearable: { type: Boolean, default: false },
		maxlength: { type: Number, default: 140 },
		confirmType: { type: String, default: "done" },
		helper: { type: String, default: "" },
		error: { type: String, default: "" },
	},
	emits: ["update:modelValue", "focus", "blur", "clear"],
	methods: {
		handleInput(event) {
			this.$emit("update:modelValue", event.detail.value);
		},
		clear() {
			this.$emit("update:modelValue", "");
			this.$emit("clear");
		},
	},
};
</script>

<style scoped>
.ui-field {
	width: 100%;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
}
.ui-field__label {
	color: var(--color-text-primary);
	font-size: var(--font-size-body);
	font-weight: var(--font-weight-medium);
	line-height: var(--line-height-body);
}
.ui-field__control {
	width: 100%;
	min-height: var(--field-height);
	padding: 0 var(--spacing-sm);
	border: var(--border-width) solid var(--color-border);
	border-radius: var(--radius-md);
	background: var(--color-surface);
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
}
.ui-field__control:focus-within {
	border-color: var(--color-primary);
}
.ui-field__input {
	flex: 1 1 auto;
	min-width: 0;
	height: calc(var(--field-height) - 3.3rpx);
	color: var(--color-text-primary);
	font-size: var(--font-size-body);
	font-weight: var(--font-weight-regular);
	line-height: var(--line-height-body);
}
.ui-field__placeholder {
	color: var(--color-text-tertiary);
}
.ui-field__clear {
	width: 46.9rpx;
	height: 46.9rpx;
	border-radius: var(--radius-round);
	background: var(--color-surface-muted);
	color: var(--color-text-secondary);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30.1rpx;
	line-height: 46.9rpx;
}
.ui-field__message {
	color: var(--color-text-secondary);
	font-size: var(--font-size-caption);
	line-height: var(--line-height-caption);
}
.ui-field__message--error {
	color: var(--color-error);
}
.ui-field.has-error .ui-field__control {
	border-color: var(--color-error);
}
.ui-field.is-disabled .ui-field__control {
	background: var(--color-surface-muted);
}
</style>
