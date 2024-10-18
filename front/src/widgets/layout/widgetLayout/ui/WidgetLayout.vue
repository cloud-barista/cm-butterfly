<script setup lang="ts">
import { PPaneLayout } from '@cloudforet-test/mirinae';

interface iProps {
  firstTitle?: string;
  title?: string;
  overflow: 'visible';
}

const props = defineProps<iProps>();
</script>

<template>
  <p-pane-layout class="widget-layout">
    <slot name="first-title">
      <p class="first-title">
        {{ firstTitle }}
      </p>
    </slot>
    <slot name="title">
      <p class="title">
        {{ title }}
      </p>
    </slot>
    <div class="widget-contents" :style="{ overflow }">
      <slot />
    </div>
  </p-pane-layout>
</template>

<style scoped lang="postcss">
.widget-layout {
  @apply border-0 rounded-lg;
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  padding: 1.25rem;
  .first-title {
    font-size: 1.5rem;
    font-weight: 400;
  }
  .title {
    @apply text-gray-900 mb-[1.5rem];
    font-size: 0.875rem;
    line-height: 1.2;
    font-weight: 400;
  }
  .widget-contents {
    flex-grow: 1;
    height: 100%;
  }
}
</style>
