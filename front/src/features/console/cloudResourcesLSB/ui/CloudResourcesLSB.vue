<script setup lang="ts">
import LSB from '@/widgets/layout/LSB/ui/LSB.vue';
import { PTextInput } from '@cloudforet-test/mirinae';

interface Props {
  menus: any[];
}

const props = withDefaults(defineProps<Props>(), {
  menus: () => [],
});
</script>

<template>
  <l-s-b class="cloud-resources-l-s-b" :menu-set="menus">
    <p-text-input
      class="cloud-resources-search"
      placeholder="Search Cloud Resources"
    />
    <template #collapsible-contents-project>
      <p-text-input
        class="cloud-resources-search"
        placeholder="Search Cloud Resources"
      />
    </template>
  </l-s-b>
</template>

<style scoped lang="postcss">
.cloud-resources-l-s-b {
  .cloud-resources-search {
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
