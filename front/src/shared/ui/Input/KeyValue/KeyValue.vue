<script setup lang="ts">
import { PTextInput } from '@cloudforet-test/mirinae';
import { KeyValueContext } from '@/features/sequential/designer/editor/model/contextTypes';

interface IProps {
  context: KeyValueContext;
  readonly?: boolean;
}

const props = defineProps<IProps>();
const emit = defineEmits(['update:context']);


function handleBlur() {
  props.context.value?.onBlur();
}
</script>

<template>
  <div class="key-value-field">
    <div class="field-group flex">
      <div class="field-title-box">
        {{ context.key }}
      </div>
      <div class="field-content-box">
        <p-text-input
          v-model="context.value.value"
          :size="'md'"
          block
          :invalid="!context.value?.isValid"
          :readonly="readonly"
          @blur="handleBlur"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.key-value-field {
  margin: 4px 0;
  
  .field-group {
    .field-title-box {
      display: flex;
      align-items: center;
      width: 200px;
      height: 44px;
      font-size: 14px;
      font-weight: 700;
      padding: 6px 16px 6px 16px;
      background-color: #f8f9fa;
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
}

.border-bottom {
  border-bottom: 1px solid;
  @apply border-gray-200;
}
</style>
