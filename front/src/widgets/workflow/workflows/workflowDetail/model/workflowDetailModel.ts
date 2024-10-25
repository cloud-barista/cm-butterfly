import { useWorkflowStore } from '@/entities';
import { WorkflowTableType } from '@/entities';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { ref, watch } from 'vue';

export function useWorkflowDetailModel() {
  // const workflowsStore = useWorkflowsStore();
  const workflowStore = useWorkflowStore();
  const workflowId = ref<string | null>();
  const tableModel = useDefinitionTableModel<Record<WorkflowTableType, any>>();

  function setWorkflowId(_workflowId: string | null) {
    workflowId.value = _workflowId;
  }

  function initTable() {
    tableModel.initState();

    tableModel.tableState.fields = [
      { label: 'Workflow Name', name: 'name' },
      { label: 'ID', name: 'id' },
      { label: 'Description', name: 'description', disableCopy: true },
      { label: 'Created Date Time', name: 'created_at' },
      { label: 'Updated Date Time', name: 'updated_at' },
      { label: 'Workflow Tool', name: 'workflowTool', disableCopy: true },
      { label: 'Workflow JSON', name: 'workflowJSON', disableCopy: true },
    ];
  }

  function setDefineTableData(workflowId: string) {
    const workflow = workflowStore.getWorkflowById(workflowId);
    let data: Partial<Record<WorkflowTableType, any>> = {};

    if (workflow) {
      data = {
        name: workflow.name,
        id: workflow.id,
        description: '-',
        created_at: workflow.created_at,
        updated_at: workflow.updated_at,
        workflowTool: {},
        workflowJSON: {},
      };
    }
    return data;
  }

  function loadWorkflowData(workflowId: string | null | undefined) {
    tableModel.tableState.loading = true;
    if (workflowId) {
      tableModel.tableState.data = setDefineTableData(workflowId);
    }
    tableModel.tableState.loading = false;
  }

  watch(workflowId, nv => {
    loadWorkflowData(nv);
  });

  return {
    setWorkflowId,
    workflowStore,
    initTable,
    tableModel,
    workflowId,
  };
}
