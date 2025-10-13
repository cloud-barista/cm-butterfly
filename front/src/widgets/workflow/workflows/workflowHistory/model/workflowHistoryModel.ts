import { ref, watch } from 'vue';
import { useGetWorkflowRuns } from '@/entities/workflow/api/index';
import { IWorkflowRun } from '@/entities/workflow/model/types';

export function useWorkflowHistoryModel() {
  const workflowId = ref<string | null>();
  const tableModel = ref({
    tableState: {
      fields: [] as any[],
      items: [] as IWorkflowRun[],
      loading: false,
    },
  });

  function setWorkflowId(_workflowId: string | null) {
    workflowId.value = _workflowId;
  }

  function initTable() {
    tableModel.value.tableState.fields = [
      { label: 'Run ID', name: 'workflow_run_id' },
      { label: 'State', name: 'state' },
      { label: 'Run Type', name: 'run_type' },
      { label: 'Start Date', name: 'start_date' },
      { label: 'End Date', name: 'end_date' },
      { label: 'Duration (s)', name: 'duration_date' },
      { label: 'Execution Date', name: 'execution_date' },
    ];
  }

  async function loadWorkflowRuns(workflowId: string | null | undefined) {
    tableModel.value.tableState.loading = true;
    if (workflowId) {
      try {
        const { data: runsData, execute: fetchRuns } =
          useGetWorkflowRuns(workflowId);
        await fetchRuns();

        if (runsData.value?.responseData) {
          tableModel.value.tableState.items = runsData.value.responseData;
        } else {
          tableModel.value.tableState.items = [];
        }
      } catch (error) {
        tableModel.value.tableState.items = [];
      }
    } else {
      tableModel.value.tableState.items = [];
    }
    tableModel.value.tableState.loading = false;
  }

  watch(workflowId, nv => {
    loadWorkflowRuns(nv);
  });

  return {
    setWorkflowId,
    initTable,
    tableModel,
    workflowId,
    loadWorkflowRuns,
  };
}
