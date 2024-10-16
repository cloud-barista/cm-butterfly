<script setup lang="ts">
import { PDefinitionTable } from '@cloudforet-test/mirinae';
import { useWorkflowDetailModel } from '@/widgets/workflow';
import { onBeforeMount, watch, watchEffect } from 'vue';

interface iProps {
  selectedWorkflowId: string;
}

const props = defineProps<iProps>();

const emit = defineEmits([
  'update:workflow-name',
  'update:workflow-json-modal',
  'update:workflow-json',
]);

const { workflowStore, initTable, tableModel, workflowId } =
  useWorkflowDetailModel();

onBeforeMount(() => {
  initTable();
});

watch(
  props,
  () => {
    workflowId.value = props.selectedWorkflowId;
  },
  { immediate: true },
);

watchEffect(() => {
  emit(
    'update:workflow-name',
    workflowStore.getWorkflowById(props.selectedWorkflowId)?.name,
  );
});

function handleWorkflowTool() {}

function handleJsonModal() {
  emit('update:workflow-json-modal', true);
}

watchEffect(() => {
  emit(
    'update:workflow-json',
    workflowStore.getWorkflowById(workflowId.value)?.data,
  );
});
</script>

<template>
  <div>
    <p-definition-table
      :fields="tableModel.tableState.fields"
      :data="tableModel.tableState.data"
      :loading="tableModel.tableState.loading"
      block
    >
      <template #data-workflowTool>
        <p class="link-button-text" @click="handleWorkflowTool">
          View Workflow Tool
        </p>
      </template>
      <template #data-workflowJSON>
        <p class="link-button-text" @click="handleJsonModal">
          View Workflow JSON
        </p>
      </template>
    </p-definition-table>
  </div>
</template>
