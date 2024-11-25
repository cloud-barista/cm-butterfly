import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import type { IWorkflow } from '@/entities';
import { WorkflowTableType } from '@/entities';
import { useWorkflowStore } from '@/entities';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
import { formatDate } from '@/shared/utils';

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
          { name: 'created_at', label: 'Created Date Time' },
          { name: 'updated_at', label: 'Updated Date Time' },
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
      description: '-',
      created_at: formatDate(workflow.created_at),
      updated_at: formatDate(workflow.updated_at),
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
    workflowStore,
  };
}
