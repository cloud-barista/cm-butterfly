<script setup lang="ts">
import {
  PIconButton,
  PDataTable,
  PDefinitionTable,
} from '@cloudforet-test/mirinae';
import { IWorkflowRun, ITaskInstance } from '@/entities/workflow/model/types';
import { useGetTaskInstances } from '@/entities/workflow/api/index';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { ref, watch } from 'vue';

interface Props {
  isVisible: boolean;
  selectedRun: IWorkflowRun | null;
}

interface IRunInfo {
  runId: string;
  state: string;
  runType: string;
  startDate: string;
  endDate: string;
  duration: number;
  executionDate: string;
}

const props = defineProps<Props>();

const emit = defineEmits(['close']);

// Task instances 상태 관리
const taskInstances = ref<ITaskInstance[]>([]);
const loading = ref(false);

// 테이블 필드 정의
const tableFields = ref([
  { label: 'Task Instance ID', name: 'task_instance_id' },
  { label: 'Task Name', name: 'task_name' },
  { label: 'State', name: 'state' },
  { label: 'Start Date', name: 'start_date' },
  { label: 'End Date', name: 'end_date' },
  { label: 'Duration (s)', name: 'duration_date' },
  { label: 'Retry Count', name: 'retry_count' },
]);

// Run Information definition table 모델
const { tableState: runInfoTableState } = useDefinitionTableModel<IRunInfo>();

const handleClose = () => {
  emit('close');
};

// Task instances 로드
const loadTaskInstances = async () => {
  if (!props.selectedRun) return;

  loading.value = true;
  try {
    const { data, execute } = useGetTaskInstances(
      props.selectedRun.workflow_id,
      props.selectedRun.workflow_run_id,
    );
    await execute();

    console.log('data', data.value);
    if (data.value?.responseData) {
      taskInstances.value = data.value.responseData;
    } else {
      taskInstances.value = [];
    }
  } catch (error) {
    console.error('Failed to load task instances:', error);
    taskInstances.value = [];
  } finally {
    loading.value = false;
  }
};

// selectedRun이 변경될 때마다 task instances 로드
watch(
  () => props.selectedRun,
  () => {
    if (props.selectedRun) {
      loadTaskInstances();
      updateRunInfoData();
    }
  },
  { immediate: true },
);

// Run Information 데이터 업데이트
const updateRunInfoData = () => {
  if (!props.selectedRun) return;

  // 필드 정의
  runInfoTableState.fields = [
    { name: 'runId', label: 'Run ID' },
    { name: 'state', label: 'State' },
    { name: 'runType', label: 'Run Type' },
    { name: 'startDate', label: 'Start Date' },
    { name: 'endDate', label: 'End Date' },
    { name: 'duration', label: 'Duration' },
    { name: 'executionDate', label: 'Execution Date' },
  ];

  // 데이터 설정
  runInfoTableState.data = {
    runId: props.selectedRun.workflow_run_id,
    state: props.selectedRun.state,
    runType: props.selectedRun.run_type,
    startDate: props.selectedRun.start_date,
    endDate: props.selectedRun.end_date,
    duration: props.selectedRun.duration_date,
    executionDate: props.selectedRun.execution_date,
  };
};
</script>

<template>
  <transition name="slide-down-up" @after-leave="handleClose">
    <div v-show="props.isVisible" class="page-layer">
      <div class="page-top">
        <p-icon-button
          style-type="transparent"
          name="ic_arrow-left"
          width="2rem"
          height="2rem"
          @click="handleClose"
        />
        <p class="page-title">Workflow Run Tasks</p>
      </div>

      <div class="overlay-content">
        <!-- 워크플로우 실행 정보 -->
        <div class="run-info">
          <h3>Run Information</h3>
          <p-definition-table
            :fields="runInfoTableState.fields"
            :data="runInfoTableState.data"
          />
        </div>

        <!-- Task Instances 테이블 -->
        <div class="task-instances">
          <h3>Task Instances</h3>
          <p-data-table
            :fields="tableFields"
            :items="taskInstances"
            :loading="loading"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="postcss">
.slide-down-up-enter-active {
  transition: transform 0.8s ease;
  transform: translateY(0);
}

.slide-down-up-leave-active {
  transition: all 0.5s ease;
  transform: translateY(100%);
  opacity: 0;
}

.slide-down-up-enter {
  transform: translateY(100%);
}

.page-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 1000;
  @apply p-[1.5rem];

  .page-top {
    @apply flex gap-[0.75rem] items-center;
    margin-bottom: 1.375rem;

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
    }
  }
}

.overlay-content {
  @apply p-[1rem];
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;

  .run-info {
    margin-bottom: 2rem;

    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #374151;
    }
  }

  .task-instances {
    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #374151;
    }
  }
}
</style>
