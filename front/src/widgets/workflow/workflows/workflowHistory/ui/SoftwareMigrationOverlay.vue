<script setup lang="ts">
import {
  PIconButton,
  PSpinner,
  PDataTable,
  PBadge,
  PDefinitionTable,
} from '@cloudforet-test/mirinae';
import { IWorkflowRun } from '@/entities/workflow/model/types';
import { useGetSoftwareMigrationStatus } from '@/entities/workflow/api/index';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { ref, watch, computed } from 'vue';

interface Props {
  isVisible: boolean;
  selectedRun: IWorkflowRun | null;
  executionIds: string[];
}

interface IRunInfo {
  runId: string;
  state: string;
  executionDate: string;
  executionId: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

// SW 마이그레이션 상태 데이터 관리 (여러 execution ID의 결과를 저장)
const swMigrationDataList = ref<any[]>([]);
const swLoading = ref(false);

// Run Information definition table 모델
const { tableState: runInfoTableState } = useDefinitionTableModel<IRunInfo>();

const handleClose = () => {
  emit('close');
};

// 상태 뱃지 스타일
const getStatusBadgeType = (status: string) => {
  switch (status) {
    case 'finished':
      return 'green';
    case 'failed':
      return 'red';
    case 'installing':
      return 'blue';
    case 'ready':
      return 'gray';
    case 'finished with error':
      return 'yellow';
    default:
      return 'gray';
  }
};

// 테이블 데이터 구성 - 모든 execution ID의 결과를 통합
const tableData = computed(() => {
  if (!swMigrationDataList.value || swMigrationDataList.value.length === 0)
    return [];

  const allRows: any[] = [];

  swMigrationDataList.value.forEach(swMigrationData => {
    if (!swMigrationData?.target_mappings) return;

    swMigrationData.target_mappings.forEach((mapping: any) => {
      mapping.software_migration_status_list.forEach((sw: any) => {
        allRows.push({
          ...sw,
          target_vm_id: mapping.target.vm_id,
          target_mci_id: mapping.target.mci_id,
          target_namespace_id: mapping.target.namespace_id,
          overall_status: mapping.status,
          execution_id: swMigrationData.execution_id,
        });
      });
    });
  });

  return allRows.sort((a, b) => a.order - b.order);
});

// 테이블 필드 정의
const tableFields = [
  { label: '#', name: 'order', width: '60px' },
  { label: 'Software Name', name: 'software_name' },
  { label: 'Version', name: 'software_version' },
  { label: 'Install Type', name: 'software_install_type', width: '120px' },
  { label: 'Status', name: 'status', width: '150px' },
  { label: 'Target VM', name: 'target_vm_id' },
  { label: 'Error', name: 'error_message' },
];

// SW 마이그레이션 상태 로드 - 모든 execution ID에 대해 병렬로 조회
const loadSwMigrationStatus = async () => {
  if (!props.executionIds || props.executionIds.length === 0) return;

  swLoading.value = true;
  try {
    // 모든 execution ID에 대해 병렬로 API 호출
    const results = await Promise.all(
      props.executionIds.map(async executionId => {
        const { data: statusData, execute: fetchStatus } =
          useGetSoftwareMigrationStatus(executionId);
        await fetchStatus();
        return statusData.value?.responseData || null;
      }),
    );

    // null이 아닌 결과만 필터링
    swMigrationDataList.value = results.filter(result => result !== null);

    if (swMigrationDataList.value.length > 0) {
      updateRunInfoData(props.executionIds.join(', '));
    }
  } catch (error) {
    swMigrationDataList.value = [];
  } finally {
    swLoading.value = false;
  }
};

// Run Information 데이터 업데이트
const updateRunInfoData = (executionId: string) => {
  if (!props.selectedRun) return;

  runInfoTableState.fields = [
    { name: 'runId', label: 'Run ID' },
    { name: 'state', label: 'State' },
    { name: 'executionDate', label: 'Execution Date' },
    { name: 'executionId', label: 'Execution ID' },
  ];

  runInfoTableState.data = {
    runId: props.selectedRun.workflow_run_id,
    state: props.selectedRun.state,
    executionDate: props.selectedRun.execution_date,
    executionId: executionId,
  };
};

// executionIds가 변경될 때마다 SW 상태 로드
watch(
  () => props.executionIds,
  () => {
    if (props.executionIds && props.executionIds.length > 0) {
      loadSwMigrationStatus();
    }
  },
  { immediate: true },
);
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
        <p class="page-title">Software Migration Status</p>
      </div>

      <div class="overlay-content">
        <!-- Run Information -->
        <div v-if="swMigrationDataList.length > 0" class="run-info">
          <h3>Run Information</h3>
          <p-definition-table
            :fields="runInfoTableState.fields"
            :data="runInfoTableState.data"
          />
        </div>

        <!-- Loading -->
        <div v-if="swLoading" class="loading-section">
          <p-spinner size="xl" />
          <p>Loading software migration status...</p>
        </div>

        <!-- SW Migration Status -->
        <div
          v-else-if="swMigrationDataList.length > 0 && tableData.length > 0"
          class="sw-migration-status"
        >
          <div class="summary-section">
            <h3>Summary</h3>
            <div class="summary-cards">
              <div class="summary-card">
                <span class="label">Total Executions</span>
                <span class="value">{{ swMigrationDataList.length }}</span>
              </div>
              <div class="summary-card">
                <span class="label">Total Software</span>
                <span class="value">{{ tableData.length }}</span>
              </div>
            </div>
          </div>

          <div class="table-section">
            <h3>Software Migration Details</h3>
            <p-data-table :fields="tableFields" :items="tableData" :loading="false">
              <template #col-status-format="{ value }">
                <p-badge :badge-type="getStatusBadgeType(value)" style-type="subtle">
                  {{ value }}
                </p-badge>
              </template>
              <template #col-error_message-format="{ value }">
                <span v-if="value" class="error-text">{{ value }}</span>
                <span v-else class="no-error">-</span>
              </template>
            </p-data-table>
          </div>
        </div>

        <!-- No Data -->
        <div v-else class="no-data">
          <p>No software migration data available</p>
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
  overflow-y: auto;
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
  @apply p-[1.5rem];
  background: #f8f9fa;
  border-radius: 8px;

  .run-info {
    margin-bottom: 2rem;

    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #374151;
    }
  }

  .loading-section {
    padding: 4rem;
    text-align: center;
    color: #6b7280;
    background: white;
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

  .sw-migration-status {
    .summary-section {
      margin-bottom: 2rem;

      h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #374151;
      }

      .summary-cards {
        display: flex;
        gap: 1rem;

        .summary-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

          .label {
            font-size: 0.875rem;
            color: #6b7280;
            font-weight: 500;
          }

          .value {
            font-size: 2rem;
            color: #1e40af;
            font-weight: 700;
          }
        }
      }
    }

    .table-section {
      h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #374151;
      }

      .error-text {
        color: #dc2626;
        font-size: 0.875rem;
      }

      .no-error {
        color: #9ca3af;
      }
    }
  }

  .no-data {
    padding: 4rem;
    text-align: center;
    color: #6b7280;
    background: white;
    border-radius: 8px;
    font-style: italic;

    p {
      margin: 0;
      font-size: 1rem;
    }
  }
}
</style>
