<script setup lang="ts">
import { PIconButton } from '@cloudforet-test/mirinae';
import { ITaskInstance } from '@/entities/workflow/model/types';
import { useGetTaskLogs } from '@/entities/workflow/api/index';
import { ref, watch } from 'vue';

interface Props {
  isVisible: boolean;
  taskInstance?: ITaskInstance;
  workflowId?: string;
  workflowRunId?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

// 로그 데이터 관리
const taskLogs = ref<any>(null);
const logsLoading = ref(false);

// 모달 닫기
const handleClose = () => {
  emit('close');
};

// 로그 데이터 로드
const loadTaskLogs = async () => {
  if (!props.taskInstance || !props.workflowId || !props.workflowRunId) return;

  logsLoading.value = true;
  try {
    const { data, execute } = useGetTaskLogs(
      props.workflowId,
      props.workflowRunId,
      props.taskInstance.task_id,
      Math.floor(props.taskInstance.try_number).toString(),
    );
    await execute();

    if (data.value?.responseData) {
      taskLogs.value = data.value.responseData;
    } else {
      taskLogs.value = null;
    }
  } catch (error) {
    taskLogs.value = null;
  } finally {
    logsLoading.value = false;
  }
};

// taskInstance가 변경될 때마다 로그 로드
watch(
  () => props.taskInstance,
  () => {
    if (props.taskInstance && props.isVisible) {
      loadTaskLogs();
    }
  },
  { immediate: true },
);

// 모달이 열릴 때 로그 로드
watch(
  () => props.isVisible,
  () => {
    if (props.isVisible && props.taskInstance) {
      loadTaskLogs();
    }
  },
);
</script>

<template>
  <div v-if="isVisible" class="log-modal-overlay" @click="handleClose">
    <div class="log-modal" @click.stop>
      <div class="log-modal-header">
        <h3>Task Logs</h3>
        <p-icon-button
          style-type="transparent"
          name="ic_close"
          @click="handleClose"
        />
      </div>
      <div class="log-modal-content">
        <div v-if="taskInstance" class="task-info">
          <p><strong>Task:</strong> {{ taskInstance.task_name }}</p>
          <p><strong>Task ID:</strong> {{ taskInstance.task_id }}</p>
          <p><strong>Try Number:</strong> {{ taskInstance.try_number }}</p>
        </div>
        <div v-if="logsLoading" class="loading">Loading logs...</div>
        <div v-else-if="taskLogs" class="logs-content">
          <pre>{{ taskLogs }}</pre>
        </div>
        <div v-else class="no-logs">No logs available</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.log-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  .log-modal {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 800px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);

    .log-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;

      h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #374151;
        margin: 0;
      }
    }

    .log-modal-content {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;

      .task-info {
        background: #f9fafb;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1.5rem;

        p {
          margin: 0.25rem 0;
          color: #374151;

          strong {
            color: #111827;
          }
        }
      }

      .loading {
        padding: 2rem;
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
        padding: 2rem;
        text-align: center;
        color: #6b7280;
        background: #f9fafb;
        border-radius: 8px;
        font-style: italic;
      }
    }
  }
}
</style>
