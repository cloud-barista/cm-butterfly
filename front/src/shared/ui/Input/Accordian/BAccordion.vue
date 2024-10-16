<script setup lang="ts">
import { ref } from 'vue';

interface AccordionItem {
  header: any;
  content: any;
  children?: AccordionItem[];
}

const props = defineProps<{
  items: AccordionItem[];
}>();

const openIndex = ref<number | null>(null);

const toggleAccordion = (index: number) => {
  openIndex.value = openIndex.value === index ? null : index;
  console.log(index);
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
</script>

<template>
  <div class="accordion-box">
    <div v-for="(item, index) in items" :key="index" class="accordion-item">
      <div class="accordion-header">
        <slot
          name="header"
          :header="item.header"
          :item="{ header: item.header, content: item.content }"
          :click="() => toggleAccordion(index)"
        >
          <div class="w-full h-full" @click="toggleAccordion(index)">
            {{ index }}
          </div>
        </slot>
      </div>

      <transition
        name="accordion"
        @enter="start"
        @after-enter="end"
        @before-leave="start"
        @after-leave="end"
      >
        <div v-show="isOpen(index)" class="accordion-content">
          <slot
            name="content"
            :content="item.content"
            :item="{ header: item.header, content: item.content }"
          >
            {{ index }}
          </slot>
          <BAccordion
            v-if="item.children && item.children.length"
            :items="item.children"
          >
            <template #header="{ item, click }">
              <slot
                name="header"
                :header="item.header"
                :item="{ header: item.header, content: item.content }"
                :click="click"
              ></slot>
            </template>
            <template #content="{ item }">
              <slot
                name="content"
                :content="item.content"
                :item="{ header: item.header, content: item.content }"
              ></slot>
            </template>
          </BAccordion>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.accordion-item {
  @apply border border-solid border-gray-200;
}

.accordion-header {
  @apply border-b border-solid border-gray-200;
  cursor: pointer;
}

.accordion-content {
  padding-left: 10px;
  overflow: hidden;
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
