<script setup lang="ts">
import { PTextEditor, PPaneLayout } from '@cloudforet-test/mirinae';
import { reactive } from 'vue';

interface iProps {
  schema: any;
  formData: any;
}

const props = defineProps<iProps>();

const state = reactive({
  schema: null as any,
  formData: {} as any,
});
</script>

<template>
  <p-pane-layout class="json-editor-layout">
    <p>Meta (data)</p>
    <div class="editor">
      <p-text-editor :code="JSON.stringify(formData, null, 2)" mode="" />
    </div>
  </p-pane-layout>
</template>

<style scoped lang="postcss">
.json-editor-layout {
  min-width: 726px;
  border-bottom: 1px solid #dddddf;
  p {
    @apply text-[0.75rem] text-gray-500 font-[700] bg-[#F7F7F7] px-[0.75rem] py-[0.25rem];
    border-radius: 6px 0;
  }
  .data-wrapper {
    @apply bg-white;
  }
}

:deep(.p-text-editor) {
  min-height: 36.25rem;
}
:deep(.CodeMirror) {
  /* @apply bg-white !important;
  color: #f8f8f2 !important; */
}
</style>
