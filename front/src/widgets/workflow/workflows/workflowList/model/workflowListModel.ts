import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import type { IWorkflow } from '@/entities';
import { WorkflowTableType } from '@/entities/workflowManagement';
import { useWorkflowStore } from '@/entities';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';

export function useWorkflowListModel() {
  const tableModel =
    useToolboxTableModel<Partial<Record<WorkflowTableType, any>>>();
  const workflowStore = useWorkflowStore();
  const { workflows } = storeToRefs(workflowStore);

  function initToolBoxTableModel() {
    tableModel.tableState.fields = [
      { name: 'name', label: 'Name' },
      { name: 'id', label: 'ID' },
      { name: 'description', label: 'Description' },
      // { name: 'data', label: 'Data' },
      { name: 'created_at', label: 'Created Date Time' },
      { name: 'updated_at', label: 'Updated Date Time' },
      { name: 'run', label: '' },
    ];

    tableModel.querySearchState.keyItemSet = [
      {
        title: 'columns',
        items: [
          { name: 'name', label: 'Name' },
          { name: 'id', label: 'ID' },
          { name: 'description', label: 'Description' },
          // { name: 'data', label: 'Data' },
          { name: 'createdDatetime', label: 'Created Date Time' },
          { name: 'updatedDatetime', label: 'Updated Date Time' },
        ],
      },
    ];
  }

  function organizeWorkflowsTableItem(workflow: IWorkflow) {
    const organizedDatum: Partial<
      Record<WorkflowTableType | 'originalData', any>
    > = {
      name: workflow.name,
      id: workflow.id,
      description: workflow.description,
      data: workflow.data,
      created_at: workflow.created_at,
      updated_at: workflow.updated_at,
      originalData: workflow,
    };
    return organizedDatum;
  }

  watch(
    () => Object.values(workflows.value),
    workflowArr => {
      tableModel.tableState.items = workflowArr.map(value => {
        return organizeWorkflowsTableItem(value);
      });
    },
    { immediate: true },
  );

  return {
    tableModel,
    workflows,
    initToolBoxTableModel,
    workflowStore,
  };
}
