<script setup lang="ts">
import { PDataTable, PButton } from '@cloudforet-test/mirinae';
import { useWorkflowHistoryModel } from '@/widgets/workflow/workflows/workflowHistory/model/workflowHistoryModel';
import WorkflowRunDetailOverlay from './WorkflowRunDetailOverlay.vue';
import { onBeforeMount, watch, ref } from 'vue';
import { IWorkflowRun } from '@/entities/workflow/model/types';

interface iProps {
  selectedWorkflowId: string;
}

const props = defineProps<iProps>();

const { initTable, tableModel, workflowId } = useWorkflowHistoryModel();

// 오버레이 상태 관리
const isOverlayVisible = ref(false);
const selectedRun = ref<IWorkflowRun | null>(null);

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

// 액션 버튼 클릭 핸들러
const handleViewDetail = (run: IWorkflowRun) => {
  selectedRun.value = run;
  isOverlayVisible.value = true;
};

// 오버레이 닫기 핸들러
const handleCloseOverlay = () => {
  isOverlayVisible.value = false;
  selectedRun.value = null;
};
</script>

<template>
  <div>
    <p-data-table
      :fields="tableModel.tableState.fields"
      :items="tableModel.tableState.items"
      :loading="tableModel.tableState.loading"
    >
      <template #col-tasks-format="{ item }">
        <p-button
          style-type="tertiary"
          size="sm"
          @click="handleViewDetail(item)"
        >
          View Tasks
        </p-button>
      </template>
    </p-data-table>

    <workflow-run-detail-overlay
      :is-visible="isOverlayVisible"
      :selected-run="selectedRun"
      @close="handleCloseOverlay"
    />
  </div>
</template>
