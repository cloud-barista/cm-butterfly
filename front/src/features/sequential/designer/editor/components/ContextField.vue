<template>
  <div class="field-group flex border-bottom">
    <div class="field-title-box">
      {{ title }}{{ isRequired ? '*' : '' }}
    </div>
    <div class="field-content-box">
      <p-text-input
        :value="formattedValue"
        @input="handleInput"
        :size="'md'"
        block
        :readonly="readonly"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { PTextInput } from '@cloudforet-test/mirinae';

export default defineComponent({
  name: 'ContextField',
  components: {
    PTextInput
  },
  props: {
    title: {
      type: String,
      required: true
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    value: {
      type: [String, Number, Array, Object],
      default: null
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['input'],
  setup(props, { emit }) {
    const formattedValue = computed(() => {
      if (Array.isArray(props.value)) return `[${props.value.length} items]`;
      if (typeof props.value === 'object' && props.value !== null) return '[Object]';
      return props.value;
    });

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      emit('input', target.value);
    };

    return {
      formattedValue,
      handleInput
    };
  }
});
</script>

<style scoped>
.field-group {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.field-title-box {
  flex: 0 0 200px;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-right: 1px solid #e5e7eb;
  font-weight: 500;
  color: #374151;
}

.field-content-box {
  flex: 1;
  padding: 12px 16px;
}
</style>
