import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import type { IWorkflow } from '@/entities';
import { useWorkflowsStore, WorkflowTableType } from '@/entities';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';

export function useWorkflowListModel() {
  const tableModel =
    useToolboxTableModel<Partial<Record<WorkflowTableType, any>>>();
  const workflowsStore = useWorkflowsStore();
  const { workflows } = storeToRefs(workflowsStore);

  function initToolBoxTableModel() {
    tableModel.tableState.fields = [
      { name: 'name', label: 'Name' },
      { name: 'id', label: 'ID' },
      { name: 'description', label: 'Description' },
      { name: 'data', label: 'Data' },
      { name: 'createdDatetime', label: 'Created Date Time' },
      { name: 'updatedDatetime', label: 'Updated Date Time' },
      { name: 'run', label: '' },
    ];

    tableModel.querySearchState.keyItemSet = [
      {
        title: 'columns',
        items: [
          { name: 'name', label: 'Name' },
          { name: 'id', label: 'ID' },
          { name: 'description', label: 'Description' },
          { name: 'data', label: 'Data' },
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
      createdDatetime: workflow.createdDatetime,
      updatedDatetime: workflow.updatedDatetime,
      originalData: workflow,
    };
    return organizedDatum;
  }

  watch(workflows, nv => {
    tableModel.tableState.items = nv.map(value =>
      organizeWorkflowsTableItem(value),
    );
  });

  return {
    tableModel,
    workflows,
    initToolBoxTableModel,
    workflowsStore,
  };
}
