<script setup lang="ts">
import { PDataTable, PButton } from '@cloudforet-test/mirinae';
import { useWorkflowHistoryModel } from '@/widgets/workflow/workflows/workflowHistory/model/workflowHistoryModel';
import WorkflowRunDetailOverlay from './WorkflowRunDetailOverlay.vue';
import SoftwareMigrationOverlay from './SoftwareMigrationOverlay.vue';
import { onBeforeMount, watch, ref } from 'vue';
import { IWorkflowRun } from '@/entities/workflow/model/types';
import { useGetTaskInstances } from '@/entities/workflow/api/index';

interface iProps {
  selectedWorkflowId: string;
}

const props = defineProps<iProps>();

const { initTable, tableModel, workflowId } = useWorkflowHistoryModel();

// 오버레이 상태 관리
const isOverlayVisible = ref(false);
const selectedRun = ref<IWorkflowRun | null>(null);

// SW Overlay 상태 관리
const isSwOverlayVisible = ref(false);
const selectedSwRun = ref<IWorkflowRun | null>(null);

// 각 run의 task instances와 SW migration task 존재 여부를 저장
const runTaskInstances = ref<Map<string, any[]>>(new Map());
const runHasSwTask = ref<Record<string, boolean>>({});
const runExecutionIds = ref<Record<string, string[]>>({});

onBeforeMount(() => {
  initTable();
});

watch(
  props,
  () => {
    workflowId.value = props.selectedWorkflowId;
    // workflow가 변경되면 기존 데이터 초기화
    runTaskInstances.value.clear();
    runHasSwTask.value = {};
    runExecutionIds.value = {};
  },
  { immediate: true },
);

// 테이블 아이템이 로드되면 각 run에 대해 task instances 가져오기 (순차 처리)
watch(
  () => tableModel.value.tableState.items,
  async runs => {
    if (runs && runs.length > 0 && props.selectedWorkflowId) {
      for (const run of runs) {
        // 이미 fetch한 데이터가 있으면 스킵
        if (!runTaskInstances.value.has(run.workflow_run_id)) {
          await fetchTaskInstancesForRun(run);
          // 서버 부하를 줄이기 위해 각 요청 사이에 약간의 지연
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
  },
  { immediate: true },
);

// 각 run에 대한 task instances 가져오기
async function fetchTaskInstancesForRun(run: IWorkflowRun) {
  try {
    const { data, execute } = useGetTaskInstances(
      run.workflow_id,
      run.workflow_run_id,
    );
    await execute();

    if (data.value?.responseData) {
      const tasks = data.value.responseData;

      runTaskInstances.value.set(run.workflow_run_id, tasks);

      // is_software_migration_task가 true인 모든 task 찾기
      const swTasks = tasks.filter(
        (task: any) => task.is_software_migration_task === true,
      );

      if (swTasks.length > 0) {
        // 객체 전체를 재할당해서 reactivity 트리거
        runHasSwTask.value = {
          ...runHasSwTask.value,
          [run.workflow_run_id]: true,
        };

        // 모든 execution_id 수집
        const executionIds = swTasks.map((task: any) => {
          // TODO: execution_id가 없으면 임시 ID 사용
          return (
            task.software_migration_execution_id ||
            '0132478a-345a-458a-acce-3be7aa16f481'
          );
        });

        runExecutionIds.value = {
          ...runExecutionIds.value,
          [run.workflow_run_id]: executionIds,
        };
      } else {
        runHasSwTask.value = {
          ...runHasSwTask.value,
          [run.workflow_run_id]: false,
        };
      }
    }
  } catch (error) {
    // 에러가 나도 다음 run 처리를 위해 false로 설정
    runHasSwTask.value = {
      ...runHasSwTask.value,
      [run.workflow_run_id]: false,
    };
  }
}

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

// SW 버튼 클릭 핸들러
const handleViewSw = (run: IWorkflowRun) => {
  selectedSwRun.value = run;
  isSwOverlayVisible.value = true;
};

// SW Overlay 닫기 핸들러
const handleCloseSwOverlay = () => {
  isSwOverlayVisible.value = false;
  selectedSwRun.value = null;
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
      <template #col-sw-format="{ item }">
        <p-button
          v-if="runHasSwTask[item.workflow_run_id]"
          style-type="tertiary"
          size="sm"
          @click="handleViewSw(item)"
        >
          View SW
        </p-button>
      </template>
    </p-data-table>

    <workflow-run-detail-overlay
      :is-visible="isOverlayVisible"
      :selected-run="selectedRun"
      @close="handleCloseOverlay"
    />

    <software-migration-overlay
      :is-visible="isSwOverlayVisible"
      :selected-run="selectedSwRun"
      :execution-ids="
        selectedSwRun
          ? runExecutionIds[selectedSwRun.workflow_run_id] || []
          : []
      "
      @close="handleCloseSwOverlay"
    />
  </div>
</template>
