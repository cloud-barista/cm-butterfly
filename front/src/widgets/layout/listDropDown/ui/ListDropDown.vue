<script setup lang="ts">
import { PSelectDropdown } from '@cloudforet-test/mirinae';
import { ref } from 'vue';

interface Props {
  menu: {
    name: string;
    value?: string;
  }[];
  list: string[];
  isDisabled?: boolean;
  title: string;
}

defineProps<Props>();
const emit = defineEmits(['update:selectedItem']);

const selectedItem = ref('');

const handleClickItem = (item: string) => {
  emit('update:selectedItem', item);
  selectedItem.value = item;
};
</script>

<template>
  <p-select-dropdown :menu="menu" index-mode :disabled="isDisabled">
    <template #menu-menu>
      <div>
        <div
          v-for="(item, idx) in list"
          :key="idx"
          class="list-container"
          :class="item === selectedItem ? 'selected' : ''"
          @click="handleClickItem(item)"
        >
          <span class="select-list">{{ item }}</span>
        </div>
      </div>
    </template>
    <template #dropdown-button>
      <div>
        <span v-if="selectedItem">{{ selectedItem }}</span>
        <span v-else class="title">{{ title }}</span>
      </div>
    </template>
  </p-select-dropdown>
</template>

<style scoped lang="postcss">
.list-container {
  padding: 0.5rem;
  cursor: pointer;
  &:hover {
    @apply bg-blue-100;
  }
  &.selected {
    @apply bg-blue-200;
  }
  .select-list {
    font-size: 0.875rem;
    font-weight: 400;
  }
}
.title {
  @apply text-gray-600;
}
</style>
