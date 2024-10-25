<script setup lang="ts">
import { PPaneLayout, PDivider, PButton } from '@cloudforet-test/mirinae';
import { useRouter } from 'vue-router/composables';

interface iProps {
  modelName: string;
}

const props = defineProps<iProps>();

const router = useRouter();
</script>

<template>
  <p-pane-layout class="layout">
    <p class="title text-left">Target Model Name</p>
    <p class="model-name">{{ modelName }}</p>
    <div class="layout-wrapper">
      <p-divider class="divider" />
      <p-button
        style-type="secondary"
        icon-left="ic_arrow-right"
        @click="() => router.push({ name: 'targetmodels' })"
      >
        Go to Target Model List
      </p-button>
    </div>
  </p-pane-layout>
</template>

<style scoped lang="postcss">
.model-name {
  @apply text-[14px] font-[700] text-left pt-[24px] pl-[16px];
}
.layout-wrapper {
  @apply flex flex-col justify-between items-end;
}
.divider {
  margin: 7.5px 0 16px 0;
}
</style>
