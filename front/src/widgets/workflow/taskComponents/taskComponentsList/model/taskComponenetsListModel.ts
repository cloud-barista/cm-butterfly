import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import type { ITaskComponent } from '@/entities';
import { useTaskComponentsStore, TaskComponentTableType } from '@/entities';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';

export function useTaskComponentsListModel() {
  const tableModel =
    useToolboxTableModel<Partial<Record<TaskComponentTableType, any>>>();
  const taskComponentsStore = useTaskComponentsStore();
  const { taskComponents } = storeToRefs(taskComponentsStore);

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

  function organizeTaskComponentsTableItem(taskComponent: ITaskComponent) {
    const organizedDatum: Partial<
      Record<TaskComponentTableType | 'originalData', any>
    > = {
      name: taskComponent.name,
      id: taskComponent.id,
      description: taskComponent.description,
      data: taskComponent.data,
      createdDatetime: taskComponent.createdDatetime,
      updatedDatetime: taskComponent.updatedDatetime,
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
    taskComponentsStore,
  };
}
