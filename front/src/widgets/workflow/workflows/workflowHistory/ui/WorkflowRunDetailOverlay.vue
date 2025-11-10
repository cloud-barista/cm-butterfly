<script setup lang="ts">
import {
  PIconButton,
  PDataTable,
  PDefinitionTable,
  PButton,
} from '@cloudforet-test/mirinae';
import { IWorkflowRun, ITaskInstance } from '@/entities/workflow/model/types';
import { useGetTaskInstances } from '@/entities/workflow/api/index';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { ref, watch } from 'vue';
import TaskLogModal from './TaskLogModal.vue';
import SoftwareMigrationOverlay from './SoftwareMigrationOverlay.vue';

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

// 로그 모달 상태 관리
const showLogModal = ref(false);
const currentLogTask = ref<ITaskInstance>();

// SW 마이그레이션 모달 상태 관리
const showSWModal = ref(false);
const currentSWTask = ref<ITaskInstance>();

// 테이블 필드 정의
const tableFields = ref([
  { label: 'Task ID', name: 'task_id' },
  { label: 'Task Name', name: 'task_name' },
  { label: 'State', name: 'state' },
  { label: 'Start Date', name: 'start_date' },
  { label: 'End Date', name: 'end_date' },
  { label: 'Duration (s)', name: 'duration_date' },
  { label: 'Try Number', name: 'try_number' },
  { label: 'Type', name: 'type' },
  { label: 'Log', name: 'log', sortable: false },
]);

// Run Information definition table 모델
const { tableState: runInfoTableState } = useDefinitionTableModel<IRunInfo>();

const handleClose = () => {
  emit('close');
};

// View Log 버튼 클릭 핸들러
const handleViewLog = (taskInstance: ITaskInstance) => {
  currentLogTask.value = taskInstance;
  showLogModal.value = true;
};

// 로그 모달 닫기
const closeLogModal = () => {
  showLogModal.value = false;
  currentLogTask.value = undefined;
};

// View SW 버튼 클릭 핸들러
const handleViewSW = (taskInstance: ITaskInstance) => {
  currentSWTask.value = taskInstance;
  showSWModal.value = true;
};

// SW 모달 닫기
const closeSWModal = () => {
  showSWModal.value = false;
  currentSWTask.value = undefined;
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

    if (data.value?.responseData) {
      taskInstances.value = data.value.responseData;
    } else {
      taskInstances.value = [];
    }
  } catch (error) {
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
          <h3>Workflow Run Information</h3>
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
          >
            <template #col-type-format="{ item }">
              <p-button
                v-if="item.is_software_migration_task"
                style-type="tertiary"
                size="sm"
                @click="handleViewSW(item)"
              >
                View SW
              </p-button>
              <span v-else>-</span>
            </template>
            <template #col-log-format="{ item }">
              <p-button
                style-type="tertiary"
                size="sm"
                @click="handleViewLog(item)"
              >
                View Log
              </p-button>
            </template>
          </p-data-table>
        </div>

        <!-- 로그 모달 -->
        <TaskLogModal
          :is-visible="showLogModal"
          :task-instance="currentLogTask"
          :workflow-id="props.selectedRun?.workflow_id"
          :workflow-run-id="props.selectedRun?.workflow_run_id"
          @close="closeLogModal"
        />

        <!-- SW 마이그레이션 모달 -->
        <SoftwareMigrationOverlay
          :is-visible="showSWModal"
          :selected-run="props.selectedRun"
          :execution-ids="
            currentSWTask?.software_migration_execution_id
              ? [currentSWTask.software_migration_execution_id]
              : ['0132478a-345a-458a-acce-3be7aa16f481']
          "
          @close="closeSWModal"
        />
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
    margin-bottom: 2rem;

    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #374151;
    }
  }
}

.task-details {
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #374151;
  }

  .task-logs {
    margin-top: 1.5rem;

    h4 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #374151;
    }

    .loading {
      padding: 1rem;
      text-align: center;
      color: #6b7280;
      background: #f9fafb;
      border-radius: 8px;
    }

    .logs-content {
      background: #1f2937;
      color: #f9fafb;
      border-radius: 8px;
      padding: 1rem;
      overflow-x: auto;

      pre {
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.875rem;
        line-height: 1.5;
      }
    }

    .no-logs {
      padding: 1rem;
      text-align: center;
      color: #6b7280;
      background: #f9fafb;
      border-radius: 8px;
      font-style: italic;
    }
  }
}
</style>
