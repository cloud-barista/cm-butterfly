<script setup lang="ts">
import { PTextEditor, PPaneLayout } from '@cloudforet-test/mirinae';

interface iProps {
  formData: any;
  title: string;
  readOnly: boolean;
  schema: {
    json: boolean;
    properties: object;
  };
}

const props = defineProps<iProps>();
</script>

<template>
  <p-pane-layout class="json-editor-layout">
    <p>{{ title }}</p>
    <div class="editor">
      <p-text-editor :code="formData" :read-only="readOnly" folded />
    </div>
  </p-pane-layout>
</template>

<style scoped lang="postcss">
.json-editor-layout {
  @apply overflow-y-scroll;
  min-width: 740px;
  max-width: 770px;
  border-bottom: 1px solid #dddddf;
  p {
    @apply text-[0.75rem] text-gray-500 font-[700] bg-[#F7F7F7] px-[0.75rem] py-[0.25rem];
    border-radius: 6px 0;
  }
  .data-wrapper {
    @apply bg-white;
  }
}
</style>
