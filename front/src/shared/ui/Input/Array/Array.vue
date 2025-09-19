<script setup lang="ts">
import { PButton, PIconButton } from '@cloudforet-test/mirinae';
import { ArrayContext, KeyValueContext } from '@/features/sequential/designer/editor/model/contextTypes';
import KeyValue from '@/shared/ui/Input/KeyValue/KeyValue.vue';
import { ref } from 'vue';

interface IProps {
  context: ArrayContext;
  readonly?: boolean;
}

const props = defineProps<IProps>();
const emit = defineEmits(['update:context']);

const isExpanded = ref(true);

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}

function updateItem(itemIndex: number, item: KeyValueContext) {
  props.context.items[itemIndex] = item;
  emit('update:context', props.context);
}

function addItem() {
  const newItem: KeyValueContext = {
    type: 'keyValue',
    key: `item_${props.context.items.length}`,
    value: {
      value: ref(''),
      errorMessage: ref(null),
      isValid: ref(true),
      validating: ref(false),
      touched: ref(false),
      onBlur: async () => {},
      exeValidation: async () => {},
      debouncedValidate: null,
    },
  };
  props.context.items.push(newItem);
  emit('update:context', props.context);
}

function removeItem(itemIndex: number) {
  props.context.items.splice(itemIndex, 1);
  emit('update:context', props.context);
}
</script>

<template>
  <div class="array-field">
    <div class="array-container">
      <div class="subject-title border-bottom">
        <div class="flex items-center">
          <p-icon-button
            :name="isExpanded ? 'ic_chevron-down' : 'ic_chevron-right'"
            :size="'sm'"
            @click="toggleExpanded"
          />
          <span class="ml-2">{{ context.subject }}</span>
        </div>
        <p-button
          v-if="!readonly"
          :style-type="'secondary'"
          icon-left="ic_plus"
          :size="'sm'"
          @click="addItem"
        >
          Add Item
        </p-button>
      </div>
      <div v-if="isExpanded" class="array-content">
        <div
          v-for="(item, itemIndex) of context.items"
          :key="itemIndex"
          class="array-item border-bottom"
        >
      <div class="item-header">
        <span class="item-index">{{ itemIndex }}</span>
        <p-button
          v-if="!readonly"
          :style-type="'tertiary'"
          icon-left="ic_trash"
          :size="'sm'"
          @click="removeItem(itemIndex)"
        >
          Remove
        </p-button>
      </div>
      <KeyValue
        :context="item"
        :readonly="readonly"
        @update:context="updateItem(itemIndex, $event)"
      />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.array-field {
  .array-container {
    @apply border border-gray-300 rounded-lg;
    margin: 8px 0;
    
    .subject-title {
      @apply pr-[16px] pl-[16px] mt-[16px] h-[44px] flex justify-between items-center text-gray-500 rounded-t-lg;
      background-color: #f9fafb;
    }

    .array-content {
      .array-item {
        border-bottom: 1px solid;
        @apply border-gray-200;
        margin: 0 16px;

        .item-header {
          @apply pr-[16px] pl-[16px] h-[32px] flex justify-between items-center text-gray-400 text-sm;
        }
        
        &:last-child {
          border-bottom: none;
        }
      }
    }
  }
}

.border-bottom {
  border-bottom: 1px solid;
  @apply border-gray-200;
}
</style>
