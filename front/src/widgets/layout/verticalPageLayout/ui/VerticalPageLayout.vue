<script setup lang="ts">
import { ref, watch } from 'vue';
import { PVerticalLayout } from '@cloudforet-test/mirinae';
// import { styleVariables } from '@cloudforet-test/mirinae';
import type { Breadcrumb } from '@/shared/types';
// import { storeToRefs } from 'pinia';
// import { useWindowSize, useElementSize } from '@vueuse/core';

interface Props {
  breadcrumbs?: Breadcrumb[];
}

const props = withDefaults(defineProps<Props>(), {
  breadcrumbs: undefined,
});

const containerRef = ref<HTMLElement | null>(null);

// const sidebar = useSidebar();

// const { isMinimized, isCollapsed } = storeToRefs(sidebar);

const contentRef = ref<null | HTMLElement>(null);
// const { width } = useWindowSize();
// const { width: contentsWidth } = useElementSize(contentRef);

// const storeState = reactive({
//   isMinimizeNavRail: computed(() => isMinimized),
// });

// const state = reactive({
//   padding: computed(() => {
//     if (contentsWidth.value <= 1920) return '0';
//     if (storeState.isMinimizeNavRail) return width.value - 1980;
//     return width.value - 2180;
//   }),
// });

watch(
  () => props.breadcrumbs,
  () => {
    const container = containerRef.value;
    if (container) {
      container.scrollTo(0, 0);
    }
  },
);
</script>

<template>
  <p-vertical-layout
    v-bind="$props"
    ref="contentRef"
    class="vertical-page-layout"
    v-on="$listeners"
  >
    <template #sidebar="prop">
      <slot name="sidebar" :width="prop.width" />
    </template>
    <template #default>
      <!-- TODO: 동적 style height 추가하기. -->
      <div
        ref="containerRef"
        class="right-container"
        :style="{
          height: '1400px',
        }"
      >
        <!-- paddingRight: '40px', -->
        <div class="header">
          <slot name="handbook" />
        </div>
        <div class="page-contents">
          <slot name="default" />
        </div>
        <div class="fnb">
          <!-- <f-n-b /> -->
        </div>
      </div>
    </template>
  </p-vertical-layout>
</template>

<style scoped lang="postcss">
.vertical-page-layout {
  .right-container {
    display: flex;
    flex-direction: column;
    justify-content: stretch;

    .header {
      @apply flex justify-between;
      padding: 1.5rem 1.5rem 0.25rem 1.5rem;
      &.without-breadcrumbs {
        padding: 0;
      }
    }

    .page-contents {
      flex-grow: 1;
      padding: 0 1.5rem 2rem 1.5rem;
      &.without-breadcrumbs {
        padding: 1.5rem 1.5rem 2rem 1.5rem;
      }
    }

    .fnb {
      width: 100%;
    }
  }
}
</style>
