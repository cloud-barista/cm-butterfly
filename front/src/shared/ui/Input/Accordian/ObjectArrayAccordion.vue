<script lang="ts">
import { ref } from 'vue';

export default {
  name: 'ObjectArrayAccordion',
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  emits: ['delete-item'],
  setup() {
    const openIndex = ref<number | null>(null);

    const toggleAccordion = (index: number) => {
      openIndex.value = openIndex.value === index ? null : index;
      console.log('ObjectArrayAccordion toggle:', index);
    };

    const isOpen = (index: number) => {
      return openIndex.value === index;
    };

    const start = (el: any) => {
      el.style.height = el.scrollHeight + 'px';
    };

    const end = (el: any) => {
      el.style.height = 'auto';
    };

    return {
      openIndex,
      toggleAccordion,
      isOpen,
      start,
      end,
    };
  },
};
</script>

<template>
  <div class="accordion-box">
    <div v-for="(item, index) in items" :key="index" class="accordion-item">
      <div class="accordion-header" @click="toggleAccordion(index)">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center">
            <span class="item-title">{{ item.header.title }}</span>
            <button 
              class="remove-button"
              @click.stop="$emit('delete-item', index)"
              title="Remove item"
            >
              Remove
            </button>
          </div>
          <i 
            :class="isOpen(index) ? 'ic_chevron-up' : 'ic_chevron-down'" 
            class="transition-transform duration-200"
          ></i>
        </div>
      </div>

      <transition
        name="accordion"
        @enter="start"
        @after-enter="end"
        @before-leave="start"
        @after-leave="end"
      >
        <div v-show="isOpen(index)" class="accordion-content">
          <div class="field-group-vertical">
            <div 
              v-for="(field, fieldIndex) in item.content" 
              :key="fieldIndex"
              class="field-group flex border-bottom"
            >
              <div class="field-row w-full">
                <div class="field-title-box">
                  {{ field.context.title }}
                </div>
                <div class="field-content-box">
                  <input 
                    v-if="field.context.model && field.context.model.value !== undefined" 
                    v-model="field.context.model.value"
                    class="text-input"
                    :readonly="field.context.title === 'nsId'"
                    @blur="field.context.model.onBlur"
                  />
                  <input v-else class="text-input" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.accordion-item {
  @apply border border-solid border-gray-200 mb-2;
}

.accordion-header {
  @apply border-b border-solid border-gray-200 p-3;
  cursor: pointer;
  background-color: #f9fafb;
}

.accordion-header:hover {
  background-color: #f3f4f6;
}

.item-title {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
  margin-right: 12px;
}

.remove-button {
  padding: 4px 8px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-button:hover {
  background-color: #dc2626;
}

.accordion-content {
  padding: 10px;
  overflow: hidden;
}

.field-group-vertical {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-group {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.field-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.field-title-box {
  min-width: 120px;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  margin-right: 16px;
}

.field-content-box {
  flex: 1;
}

.text-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.text-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.border-bottom {
  border-bottom: 1px solid #e5e7eb;
}

.accordion-enter-active,
.accordion-leave-active {
  will-change: height, opacity;
  transition:
    height 0.3s ease,
    opacity 0.3s ease;
  overflow: hidden;
}

.accordion-enter,
.accordion-leave-to {
  height: 0 !important;
  opacity: 0;
}
</style>