<template>
  <div class="data-row-container">
    <!-- Subject Row: 라벨 + 값 -->
    <div v-if="rowType === 'subject'" class="field-group flex border-bottom">
      <div class="field-title-box">
        {{ label }}
      </div>
      <div class="field-content-box">
        <input
          :value="value"
          class="field-input"
          @input="handleInput"
        />
      </div>
    </div>

    <!-- Values Row: 라벨 + Add Object 버튼 (Array만) -->
    <div v-else-if="rowType === 'values'" class="field-group flex border-bottom">
      <div class="section-title" @click="$emit('toggle')">
        <PIconButton
          :class="expanded && 'accordion-isOpen'"
          :name="expanded ? 'ic_chevron_down' : 'ic_chevron_right'"
          :size="'sm'"
        />
        <span class="section-label">{{ label }}</span>
        <span class="section-count">({{ itemCount }})</span>
      </div>
      <div class="field-content-box">
        <p-button
          v-if="showAddButton"
          :style-type="'secondary'"
          icon-left="ic_plus"
          :size="'sm'"
          @click="$emit('add-item')"
        >
          Add Object
        </p-button>
      </div>
    </div>

    <!-- Properties Row: 라벨 + 값 (삭제 가능) -->
    <div v-else-if="rowType === 'properties'" class="field-group flex border-bottom">
      <div class="field-title-box">
        {{ label }}
      </div>
      <div class="field-content-box">
        <input
          :value="value"
          class="field-input"
          @input="handleInput"
        />
        <button v-if="deletable" class="delete-btn" @click="$emit('delete')">
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { PButton, PIconButton } from '@cloudforet-test/mirinae';

export default defineComponent({
  name: 'DataRow',
  components: {
    PButton,
    PIconButton
  },
  props: {
    rowType: {
      type: String as () => 'subject' | 'values' | 'properties',
      required: true
    },
    label: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number, Boolean],
      default: ''
    },
    itemCount: {
      type: Number,
      default: 0
    },
    expanded: {
      type: Boolean,
      default: false
    },
    deletable: {
      type: Boolean,
      default: false
    },
    showAddButton: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update', 'delete', 'toggle', 'add-item'],
  methods: {
    handleInput(event: Event) {
      this.$emit('update', event);
    }
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

.section-title {
  @apply flex items-center space-x-2 cursor-pointer;
  display: flex;
  align-items: center;
  width: 200px;
  height: 44px;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 16px 6px 16px;
  flex-shrink: 0;
}

.section-label {
  @apply font-medium text-gray-700;
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
