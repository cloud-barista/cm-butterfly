<script setup lang="ts">
import { LSB } from '@/widgets/layout';
import { PTextInput } from '@cloudforet-test/mirinae';

interface Props {
  menus: any[];
}

const props = withDefaults(defineProps<Props>(), {
  menus: () => [],
});
</script>

<template>
  <l-s-b class="workloads-l-s-b" :menu-set="menus">
    <!-- TODO: here -->
  </l-s-b>
</template>

<style scoped lang="postcss">
.workloads-l-s-b {
  .workloads-search {
    @apply w-full;
    margin-bottom: 0.5rem;
  }
  .search-result-text {
    @apply overflow-hidden whitespace-nowrap;
    text-overflow: ellipsis;
  }
  .search-empty {
    @apply text-paragraph-md;
    white-space: pre;
    margin-top: 0.75rem;
  }
}
</style>
