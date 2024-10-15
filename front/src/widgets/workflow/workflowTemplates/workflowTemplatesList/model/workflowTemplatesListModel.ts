import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import type { IWorkflowTemplate } from '@/entities';
import { useWorkflowTemplatesStore } from '@/entities';
import { WorkflowTableType } from '@/entities/workflowManagement';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';

export function useWorkflowTemplatesListModel() {
  const tableModel =
    useToolboxTableModel<Partial<Record<WorkflowTableType, any>>>();
  const workflowTemplatesStore = useWorkflowTemplatesStore();
  const { workflowTemplates } = storeToRefs(workflowTemplatesStore);

  function initToolBoxTableModel() {
    tableModel.tableState.fields = [
      { name: 'name', label: 'Name' },
      { name: 'id', label: 'ID' },
      { name: 'description', label: 'Description' },
      { name: 'data', label: 'Data' },
      { name: 'createdDatetime', label: 'Created Date Time' },
      { name: 'updatedDatetime', label: 'Updated Date Time' },
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

  function organizeWorkflowTemplatesTableItem(
    workflowTemplate: IWorkflowTemplate,
  ) {
    const organizedDatum: Partial<
      Record<WorkflowTableType | 'originalData', any>
    > = {
      name: workflowTemplate.name,
      id: workflowTemplate.id,
      description: workflowTemplate.description,
      data: workflowTemplate.data,
      createdDatetime: workflowTemplate.createdDatetime,
      updatedDatetime: workflowTemplate.updatedDatetime,
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
    workflowTemplatesStore,
  };
}
