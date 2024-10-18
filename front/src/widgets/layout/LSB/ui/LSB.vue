<script setup lang="ts">
import { computed, reactive, watchEffect } from 'vue';
import { useRoute } from 'vue-router/composables';
import { LSBMenuItem } from '@/features/LSB';

interface Props {
  backLink?: any;
  topTitle?: any;
  menuSet: any[];
  hideHeader?: boolean;
  lsbTitle: string;
}

const props = withDefaults(defineProps<Props>(), {
  backLink: () => ({}) as any,
  topTitle: () => ({}) as any,
  menuSet: () => [],
  // hideHeader: false,
});
const emit = defineEmits<{
  (e: 'select', id: string, selected: string | number): void;
}>();
const route = useRoute();
const state = reactive({
  currentPath: computed(() => route.fullPath),
});
const handleSelect = (id: string, selected: string) => {
  emit('select', id, selected);
};
</script>

<template>
  <aside class="l-s-b">
    <div class="menu-wrapper">
      <slot />
      <l-s-b-menu-item
        :menu-data="menuSet"
        :current-path="state.currentPath"
        :lsb-title="lsbTitle"
      >
        <template v-for="(_, slot) of $scopedSlots" #[slot]="scope">
          <slot :name="slot" v-bind="scope" />
        </template>
      </l-s-b-menu-item>
    </div>
  </aside>
</template>

<style scoped lang="postcss">
.l-s-b {
  .menu-wrapper {
    padding: 1rem 1.5rem 2rem 0.5rem;
  }
  .back-link {
    @apply flex text-gray-500;
    font-size: 0.75rem;
    line-height: 125%;
    margin-top: 1.25rem;
    height: 1.75rem;
    &:hover {
      @apply text-gray-800 cursor-pointer;
      text-decoration: underline;
    }
  }
  .slot-menu-wrapper {
    @apply flex items-center;
    margin-bottom: 0.5rem;
  }
  .top-title {
    @apply text-gray-800 font-bold flex justify-between items-center;
    font-size: 0.75rem;
    padding-bottom: 0.5rem;
    padding-left: 0.5rem;
    .icon-label-wrapper {
      @apply flex items-center;
      height: 1.5rem;
      .icon {
        /* @apply rounded flex-shrink-0; */
        margin-right: 0.375rem;
      }
      .label {
        &.icon-label {
          font-size: 0.875rem;
        }
      }
    }
    .add-button {
      @apply cursor-pointer;
      height: 2rem;
    }
  }
}
</style>
