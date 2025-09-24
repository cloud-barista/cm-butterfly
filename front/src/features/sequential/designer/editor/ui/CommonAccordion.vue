<script lang="ts">
import { ref, defineComponent } from 'vue';

interface AccordionItem {
  header: {
    icon?: string;
    title: string;
  };
  content: any;
}

export default defineComponent({
  name: 'CommonAccordion',
  props: {
    items: {
      type: Array as () => AccordionItem[],
      required: true
    },
    initialOpenIndex: {
      type: Number,
      default: null
    }
  },
  setup(props) {
    const openIndex = ref<number | null>(props.initialOpenIndex);

    const toggleAccordion = (index: number) => {
      openIndex.value = openIndex.value === index ? null : index;
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
      end
    };
  }
});
</script>

<template>
  <div class="common-accordion-box">
    <div v-if="items.length === 0" class="empty-accordion-message">
      <p>No items available. Click "Add Item" to create new items.</p>
    </div>
    <div v-for="(item, index) in items" :key="index" class="common-accordion-item">
      <div class="common-accordion-header" @click="toggleAccordion(index)">
        <div class="header-content">
          <div class="header-icon">
            <i :class="item.header.icon || 'ic_chevron-down'" 
               :style="{ transform: isOpen(index) ? 'rotate(180deg)' : 'rotate(0deg)' }"></i>
          </div>
          <div class="header-title">
            {{ item.header.title }}
          </div>
        </div>
      </div>

      <transition
        name="accordion"
        @enter="start"
        @after-enter="end"
        @before-leave="start"
        @after-leave="end"
      >
        <div v-show="isOpen(index)" class="common-accordion-content">
          <slot
            name="content"
            :content="item.content"
            :item="item"
            :index="index"
          >
            {{ item.content }}
          </slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.common-accordion-box {
  width: 100%;
}

.empty-accordion-message {
  padding: 16px;
  text-align: center;
  color: #6b7280;
  background-color: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 4px;
  margin: 8px 0;
}

.empty-accordion-message p {
  margin: 0;
  font-size: 14px;
}

.common-accordion-item {
  @apply border border-solid border-gray-200;
  margin-bottom: 8px;
  border-radius: 4px;
}

.common-accordion-header {
  @apply border-b border-solid border-gray-200;
  cursor: pointer;
  padding: 12px 16px;
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
}

.common-accordion-header:hover {
  background-color: #e9ecef;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  transition: transform 0.3s ease;
}

.header-icon i {
  font-size: 14px;
  color: #6b7280;
}

.header-title {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.common-accordion-content {
  padding: 16px;
  overflow: hidden;
  background-color: #ffffff;
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
