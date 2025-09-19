<template>
  <div class="data-row-container">
    <!-- Subject Row -->
    <div class="field-group flex border-bottom">
      <div class="field-title-box">
        {{ subject }}
      </div>
      <div class="field-content-box">        
        <p-button
          :style-type="'secondary'"
          icon-left="ic_plus"
          :size="'sm'"
          @click="addItem"
        >
          Add Object
        </p-button>
      </div>
    </div>
    
    <!-- Array Items -->
    <div
      v-for="(item, index) in items"
      :key="index"
      class="field-group flex border-bottom"
    >
      <div class="field-title-box">
        [{{ index }}]
      </div>
      <div class="field-content-box">
        <input
          :value="item.value"
          class="field-input"
          @input="updateItem(index, $event)"
        />
        <button
          @click="deleteItem(index)"
          class="delete-btn"
          title="Delete item"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';
import { PButton } from '@cloudforet-test/mirinae';

interface StringArrayItem {
  index: number;
  value: string;
}

export default defineComponent({
  name: 'StringArrayField',
  components: {
    'p-button': PButton
  },
  props: {
    subject: {
      type: String,
      required: true
    },
    items: {
      type: Array as PropType<StringArrayItem[]>,
      required: true
    }
  },
  emits: ['update-items', 'add-item', 'delete-item'],
  setup(props, { emit }) {
    const localItems = ref<StringArrayItem[]>([...props.items]);

    // props 변경 감지
    watch(() => props.items, (newItems) => {
      localItems.value = [...newItems];
    }, { deep: true });

    // 아이템 업데이트
    const updateItem = (index: number, event: Event) => {
      const target = event.target as HTMLInputElement;
      localItems.value[index].value = target.value;
      emit('update-items', localItems.value);
    };

    // 아이템 삭제
    const deleteItem = (index: number) => {
      localItems.value.splice(index, 1);
      // 인덱스 재정렬
      localItems.value.forEach((item, idx) => {
        item.index = idx;
      });
      emit('delete-item', index);
      emit('update-items', localItems.value);
    };

    // 아이템 추가
    const addItem = () => {
      const newItem: StringArrayItem = {
        index: localItems.value.length,
        value: ''
      };
      localItems.value.push(newItem);
      emit('add-item', newItem);
      emit('update-items', localItems.value);
    };

    return {
      localItems,
      updateItem,
      deleteItem,
      addItem
    };
  }
});
</script>

<style scoped>
.data-row-container {
  @apply w-full;
}

.field-group {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.border-bottom {
  border-bottom: 1px solid;
  @apply border-gray-200;
}

.field-title-box {
  display: flex;
  align-items: center;
  width: 200px;
  height: 44px;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 16px 6px 16px;
  flex-shrink: 0;
}

.field-content-box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 310px;
  height: 44px;
  padding: 6px 16px 6px 16px;
  flex-shrink: 0;
}

.section-count {
  @apply text-sm text-gray-500;
}

.field-input {
  @apply w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500;
  border-radius: 4px;
}

.delete-btn {
  @apply w-6 h-6 flex items-center justify-center text-red-600 hover:bg-red-100 ml-2;
  border-radius: 4px;
}
</style>
