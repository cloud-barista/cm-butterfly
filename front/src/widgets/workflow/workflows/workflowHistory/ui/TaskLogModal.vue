<script setup lang="ts">
import { PIconButton, PTextEditor, PSpinner, PButton } from '@cloudforet-test/mirinae';
import { ITaskInstance } from '@/entities/workflow/model/types';
import { useGetTaskLogs } from '@/entities/workflow/api/index';
import { ref, watch, computed } from 'vue';

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

// 로그를 문자열로 변환
const processedLogs = computed(() => {
  if (!taskLogs.value) return '';

  let logContent = '';

  // content 필드가 있는 객체인 경우
  if (typeof taskLogs.value === 'object' && taskLogs.value.content) {
    logContent = taskLogs.value.content;
  }
  // 이미 문자열인 경우
  else if (typeof taskLogs.value === 'string') {
    logContent = taskLogs.value;
  }
  // 그 외 객체인 경우 JSON으로 변환
  else if (typeof taskLogs.value === 'object') {
    try {
      logContent = JSON.stringify(taskLogs.value, null, 2);
    } catch (e) {
      logContent = String(taskLogs.value);
    }
  } else {
    logContent = String(taskLogs.value);
  }

  // 개행문자(\n)를 실제 줄바꿈으로 변환
  return logContent.replace(/\\n/g, '\n');
});

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

// taskInstance 또는 모달이 열릴 때 로그 로드
watch(
  () => [props.taskInstance, props.isVisible] as const,
  ([taskInstance, isVisible]) => {
    if (taskInstance && isVisible) {
      loadTaskLogs();
    }
  },
  { immediate: true },
);

// 로그 다운로드
const handleDownloadLog = () => {
  if (!props.taskInstance || !processedLogs.value) return;

  const fileName = `${props.taskInstance.task_id}-try${Math.floor(props.taskInstance.try_number)}.log`;
  const blob = new Blob([processedLogs.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
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
        <div v-if="logsLoading" class="loading">
          <p-spinner size="xl" />
          <p>Loading logs...</p>
        </div>
        <div v-else-if="taskLogs" class="logs-content">
          <p-text-editor
            :code="processedLogs"
            :read-only="true"
            folded
            class="log-text-editor"
          />
        </div>
        <div v-else class="no-logs">No logs available</div>
      </div>
      <div class="log-modal-footer">
        <p-button
          :disabled="!taskLogs"
          icon-left="ic_download"
          @click="handleDownloadLog"
        >
          Download Log
        </p-button>
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
        padding: 3rem;
        text-align: center;
        color: #6b7280;
        background: #f9fafb;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;

        p {
          margin: 0;
          font-size: 0.875rem;
        }
      }

      .logs-content {
        background: #f8f9fa;
        border-radius: 8px;
        overflow: hidden;

        .log-text-editor {
          min-height: 400px;
          max-height: 600px;
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

    .log-modal-footer {
      display: flex;
      justify-content: flex-end;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }
  }
}
</style>
