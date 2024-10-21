import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import { IWorkflow, useWorkflowStore } from '@/entities';
import { WorkflowTemplateTableType } from '@/entities';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';

export function useWorkflowTemplatesListModel() {
  const tableModel =
    useToolboxTableModel<Partial<Record<WorkflowTemplateTableType, any>>>();
  const workflowStore = useWorkflowStore();
  const { workflowTemplates } = storeToRefs(workflowStore);

  function initToolBoxTableModel() {
    tableModel.tableState.fields = [
      { name: 'name', label: 'Name' },
      { name: 'id', label: 'ID' },
      { name: 'description', label: 'Description' },
    ];

    tableModel.querySearchState.keyItemSet = [
      {
        title: 'columns',
        items: [
          { name: 'name', label: 'Name' },
          { name: 'id', label: 'ID' },
          { name: 'description', label: 'Description' },
        ],
      },
    ];
  }

  function organizeWorkflowTemplatesTableItem(workflowTemplate: IWorkflow) {
    const organizedDatum: Partial<
      Record<WorkflowTemplateTableType | 'originalData', any>
    > = {
      name: workflowTemplate.name,
      id: workflowTemplate.id,
      description: '-',
      originalData: workflowTemplate,
    };
    return organizedDatum;
  }

  watch(workflowTemplates, nv => {
    tableModel.tableState.items = nv.map(value =>
      organizeWorkflowTemplatesTableItem(value),
    );
  });

  return {
    tableModel,
    workflowTemplates,
    initToolBoxTableModel,
    workflowStore,
  };
}
