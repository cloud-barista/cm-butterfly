import { useWorkflowsStore, WorkflowTemplateTableType } from '@/entities';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { ref, watch } from 'vue';

export function useWorkflowTemplatesDetailModel() {
  const workflowsStore = useWorkflowsStore();
  const workflowTemplateId = ref<string | null>();
  const tableModel =
    useDefinitionTableModel<Record<WorkflowTemplateTableType, any>>();

  function setWorkflowTemplateId(_workflowTemplateId: string | null) {
    workflowTemplateId.value = _workflowTemplateId;
  }

  function initTable() {
    tableModel.initState();

    tableModel.tableState.fields = [
      { label: 'Workflow Template Name', name: 'name' },
      { label: 'ID', name: 'id' },
      { label: 'Description', name: 'description' },
      { label: 'Created Date Time', name: 'createdDatetime' },
      { label: 'Updated Date Time', name: 'updatedDatetime' },
      {
        label: 'Workflow Template JSON',
        name: 'workflowTemplateJSON',
        disableCopy: true,
      },
    ];
  }

  function setDefineTableData(workflowTemplateId: string) {
    const workflowTemplate =
      workflowsStore.getWorkflowTemplateById(workflowTemplateId);
    let data: Partial<Record<WorkflowTemplateTableType, any>> = {};

    if (workflowTemplate) {
      data = {
        name: workflowTemplate.name,
        id: workflowTemplate.id,
        description: workflowTemplate.description,
        createdDatetime: workflowTemplate.createdDatetime,
        updatedDatetime: workflowTemplate.updatedDatetime,
        workflowTemplateJSON: workflowTemplate.workflowTemplateJSON,
      };
    }
    return data;
  }

  function loadWorkflowTemplateData(
    workflowTemplateId: string | null | undefined,
  ) {
    tableModel.tableState.loading = true;
    if (workflowTemplateId) {
      tableModel.tableState.data = setDefineTableData(workflowTemplateId);
    }
    tableModel.tableState.loading = false;
  }

  watch(workflowTemplateId, nv => {
    loadWorkflowTemplateData(nv);
  });

  return {
    setWorkflowTemplateId,
    workflowsStore,
    initTable,
    tableModel,
  };
}
