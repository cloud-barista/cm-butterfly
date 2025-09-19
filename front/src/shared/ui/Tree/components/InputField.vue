<template>
  <div class="field-group flex w-full h-full">
    <div class="field-title-box">
      {{ title }}
    </div>
    <div class="field-content-box">
      <p-text-input
        v-model="modelValue"
        :size="'md'"
        block
        :invalid="!isValid"
        @blur="handleBlur"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { PTextInput } from '@cloudforet-test/mirinae';

export default defineComponent({
  name: 'InputField',
  components: {
    PTextInput
  },
  props: {
    title: {
      type: String,
      required: true
    },
    modelValue: {
      type: [String, Number, Boolean],
      default: ''
    },
    isValid: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'blur'],
  setup(props, { emit }) {
    const modelValue = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });

    const handleBlur = (event: Event) => {
      emit('blur', event);
    };

    return {
      modelValue,
      handleBlur
    };
  }
});
</script>

<style scoped lang="postcss">
.field-group {
  .field-title-box {
    display: flex;
    align-items: center;
    width: 200px;
    height: 44px;
    font-size: 14px;
    font-weight: 700;
    padding: 6px 16px 6px 16px;
  }

  .field-content-box {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 310px;
    height: 44px;
    padding: 6px 16px 6px 16px;
  }
}
</style>
