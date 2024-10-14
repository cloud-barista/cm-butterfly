<script setup lang="ts">
import { PDefinitionTable } from '@cloudforet-test/mirinae';
import { useWorkflowTemplatesDetailModel } from '../model/workflowTemplatesDetailModel';
import { onBeforeMount, watch, watchEffect } from 'vue';

interface iProps {
  selectedWorkflowTemplateId: string;
}

const props = defineProps<iProps>();

const emit = defineEmits([
  'update:workflow-template-name',
  'update:workflow-template-json-modal',
]);

const { workflowsStore, setWorkflowTemplateId, initTable, tableModel } =
  useWorkflowTemplatesDetailModel();

onBeforeMount(() => {
  initTable();
});

watch(
  props,
  () => {
    setWorkflowTemplateId(props.selectedWorkflowTemplateId);
  },
  { immediate: true },
);

watchEffect(() => {
  emit(
    'update:workflow-template-name',
    workflowsStore.getWorkflowTemplateById(props.selectedWorkflowTemplateId)
      ?.name,
  );
});

function handleJsonModal() {
  emit('update:workflow-template-json-modal', true);
}
</script>

<template>
  <div>
    <p-definition-table
      :fields="tableModel.tableState.fields"
      :data="tableModel.tableState.data"
      :loading="tableModel.tableState.loading"
      block
    >
      <template #data-workflowTemplateJSON>
        <p class="link-button-text" @click="handleJsonModal">
          View Workflow Template JSON
        </p>
      </template>
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss"></style>
