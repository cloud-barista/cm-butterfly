import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import type { ITaskComponent } from '@/entities';
import { useWorkflowStore, TaskComponentTableType } from '@/entities';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';

export function useTaskComponentsListModel() {
  const tableModel =
    useToolboxTableModel<Partial<Record<TaskComponentTableType, any>>>();
  const workflowStore = useWorkflowStore();
  const { taskComponents } = storeToRefs(workflowStore);

  function initToolBoxTableModel() {
    tableModel.tableState.fields = [
      { name: 'name', label: 'Name' },
      { name: 'id', label: 'ID' },
      { name: 'description', label: 'Description' },
      { name: 'created_at', label: 'Created Date Time' },
      { name: 'updated_at', label: 'Updated Date Time' },
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

  function organizeTaskComponentsTableItem(taskComponent: ITaskComponent) {
    const organizedDatum: Partial<
      Record<TaskComponentTableType | 'originalData', any>
    > = {
      name: taskComponent.name,
      id: taskComponent.id,
      description: '-',
      created_at: taskComponent.created_at,
      updated_at: taskComponent.updated_at,
      originalData: taskComponent,
    };
    return organizedDatum;
  }

  watch(taskComponents, nv => {
    tableModel.tableState.items = nv.map(value =>
      organizeTaskComponentsTableItem(value),
    );
  });

  return {
    tableModel,
    taskComponents,
    initToolBoxTableModel,
    workflowStore,
  };
}
