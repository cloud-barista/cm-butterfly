<script setup lang="ts">
import { PDataTable } from '@cloudforet-test/mirinae';
import { useWorkflowHistoryModel } from '@/widgets/workflow/workflows/workflowHistory/model/workflowHistoryModel';
import { onBeforeMount, watch } from 'vue';

interface iProps {
  selectedWorkflowId: string;
}

const props = defineProps<iProps>();

const { initTable, tableModel, workflowId } = useWorkflowHistoryModel();

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
</script>

<template>
  <div>
    <p-data-table
      :fields="tableModel.tableState.fields"
      :items="tableModel.tableState.items"
      :loading="tableModel.tableState.loading"
    />
  </div>
</template>
