<script setup lang="ts">
import { PPaneLayout } from '@cloudforet-test/mirinae';
import { EnhancedJsonEditor } from '@/shared/ui/EnhancedJsonEditor';
import { computed } from 'vue';

interface iProps {
  formData: any;
  title: string;
  readOnly: boolean;
  schema?: {
    json: boolean;
    properties: object;
  };
}

const props = defineProps<iProps>();
const emit = defineEmits<{
  (e: 'update:formData', value: string): void;
}>();

// Convert formData into the appropriate format
const processedFormData = computed(() => {
  if (!props.formData) return '{}';
  if (typeof props.formData === 'string') return props.formData;
  if (typeof props.formData === 'object') {
    try {
      return JSON.stringify(props.formData, null, 2);
    } catch (e) {
      console.error('Failed to stringify formData:', e);
      return String(props.formData);
    }
  }
  return String(props.formData);
});

function handleUpdate(value: string) {
  emit('update:formData', value);
}
</script>

<template>
  <p-pane-layout class="json-editor-layout">
    <p>{{ title }}</p>
    <div class="editor">
      <EnhancedJsonEditor
        :model-value="processedFormData"
        :read-only="readOnly"
        :mode="'tree'"
        :main-menu-bar="!readOnly"
        :navigation-bar="true"
        :status-bar="false"
        height="100%"
        file-name="collected-source"
        @update:modelValue="handleUpdate"
      />
    </div>
  </p-pane-layout>
</template>

<style scoped lang="postcss">
.json-editor-layout {
  overflow-y: auto;
  overflow-x: auto;
  min-width: 300px;
  max-width: 100%;
  width: 100%;
  border-bottom: 1px solid #dddddf;

  p {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 700;
    background-color: #F7F7F7;
    padding: 0.25rem 0.75rem;
    border-radius: 6px 0;
  }

  .editor {
    background-color: white;
    padding: 0.5rem;
    width: 100%;
    min-width: 280px;
    min-height: 400px;
  }
}
</style>
