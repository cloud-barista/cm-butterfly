import { useTaskComponentsStore, TaskComponentTableType } from '@/entities';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { ref, watch } from 'vue';

export function useTaskComponentsDetailModel() {
  const taskComponentsStore = useTaskComponentsStore();
  const taskComponentId = ref<string | null>();
  const tableModel =
    useDefinitionTableModel<Record<TaskComponentTableType, any>>();

  function setTaskComponentId(_taskComponentId: string | null) {
    taskComponentId.value = _taskComponentId;
  }

  function initTable() {
    tableModel.initState();

    tableModel.tableState.fields = [
      { label: 'Task Component Information', name: 'name' },
      { label: 'ID', name: 'id' },
      { label: 'Description', name: 'description' },
      { label: 'Created Date Time', name: 'createdDatetime' },
      { label: 'Updated Date Time', name: 'updatedDatetime' },
      {
        label: 'Task Component JSON',
        name: 'taskComponentJSON',
        disableCopy: true,
      },
    ];
  }

  function setDefineTableData(taskComponentId: string) {
    const taskComponent =
      taskComponentsStore.getTaskComponentById(taskComponentId);
    let data: Partial<Record<TaskComponentTableType, any>> = {};

    if (taskComponent) {
      data = {
        name: taskComponent.name,
        id: taskComponent.id,
        description: taskComponent.description,
        createdDatetime: taskComponent.createdDatetime,
        updatedDatetime: taskComponent.updatedDatetime,
        taskComponentJSON: taskComponent.taskComponentJSON,
      };
    }
    return data;
  }

  function loadTaskComponentData(taskComponentId: string | null | undefined) {
    tableModel.tableState.loading = true;
    if (taskComponentId) {
      tableModel.tableState.data = setDefineTableData(taskComponentId);
    }
    tableModel.tableState.loading = false;
  }

  watch(taskComponentId, nv => {
    loadTaskComponentData(nv);
  });

  return {
    setTaskComponentId,
    taskComponentsStore,
    initTable,
    tableModel,
  };
}
