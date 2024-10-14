import { useWorkflowsStore, WorkflowTableType } from '@/entities';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { ref, watch } from 'vue';

export function useWorkflowDetailModel() {
  const workflowsStore = useWorkflowsStore();
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
      { label: 'Description', name: 'description' },
      { label: 'Created Date Time', name: 'createdDatetime' },
      { label: 'Updated Date Time', name: 'updatedDatetime' },
      { label: 'Workflow Tool', name: 'workflowTool', disableCopy: true },
      { label: 'Workflow JSON', name: 'workflowJSON', disableCopy: true },
    ];
  }

  function setDefineTableData(workflowId: string) {
    const workflow = workflowsStore.getWorkflowById(workflowId);
    let data: Partial<Record<WorkflowTableType, any>> = {};

    if (workflow) {
      data = {
        name: workflow.name,
        id: workflow.id,
        description: workflow.description,
        createdDatetime: workflow.createdDatetime,
        updatedDatetime: workflow.updatedDatetime,
        workflowTool: workflow.workflowTool,
        workflowJSON: workflow.workflowJSON,
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
    workflowsStore,
    initTable,
    tableModel,
  };
}
