import { TaskComponentTableType } from '@/entities';
import { useWorkflowStore } from '@/entities';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { ref, watch } from 'vue';

export function useTaskComponentsDetailModel() {
  const workflowStore = useWorkflowStore();
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
      { label: 'Created Date Time', name: 'created_at' },
      { label: 'Updated Date Time', name: 'updated_at' },
      {
        label: 'Task Component JSON',
        name: 'taskComponentJSON',
        disableCopy: true,
      },
    ];
  }

  function setDefineTableData(taskComponentId: string) {
    const taskComponent = workflowStore.getTaskComponentById(taskComponentId);
    let data: Partial<Record<TaskComponentTableType, any>> = {};

    if (taskComponent) {
      data = {
        name: taskComponent.name,
        id: taskComponent.id,
        description: '',
        created_at: taskComponent.created_at,
        updated_at: taskComponent.updated_at,
        taskComponentJSON: {},
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
    taskComponentId,
    setTaskComponentId,
    workflowStore,
    initTable,
    tableModel,
  };
}
