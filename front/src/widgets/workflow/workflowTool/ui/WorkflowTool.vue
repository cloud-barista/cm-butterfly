<script setup lang="ts">
import { CreateForm } from '@/widgets/layout';
import { PButton } from '@cloudforet-test/mirinae';
import WorkflowEditor from '@/features/workflow/workflowEditor/ui/WorkflowEditor.vue';

const emit = defineEmits(['update:close-modal']);

function handleModal() {
  emit('update:close-modal', false);
}

function handleSave() {
  emit('update:close-modal', false);
  // TODO: update data with api
}
</script>

<template>
  <div>
    <create-form
      class="page-modal-layout"
      title="Workflow Tool"
      :need-widget-layout="false"
      @update:modal-state="handleModal"
    >
      <template #add-content>
        <WorkflowEditor></WorkflowEditor>
      </template>
      <template #buttons>
        <p-button
          style-type="tertiary"
          @click="emit('update:close-modal', false)"
        >
          Cancel
        </p-button>
        <p-button @click="handleSave">Save</p-button>
      </template>
    </create-form>
  </div>
</template>
