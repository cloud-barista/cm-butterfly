import { useTargetModelStore, TargetModelTableType } from '@/entities';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { ref, watch } from 'vue';

export function useTargetModelDetailModel() {
  const targetModelStore = useTargetModelStore();
  const targetModelId = ref<string | null>();
  const tableModel =
    useDefinitionTableModel<Record<TargetModelTableType, any>>();

  function setTargetModelId(_targetModelId: string | null) {
    targetModelId.value = _targetModelId;
  }

  function initTable() {
    tableModel.initState();

    tableModel.tableState.fields = [
      { label: 'Target Model Information', name: 'name' },
      { label: 'ID', name: 'id' },
      { label: 'Description', name: 'description' },
      { label: 'Migration Type', name: 'migrationType' },
      { label: 'Custom', name: 'custom' },
      { label: 'Model Type', name: 'modelType' },
      { label: 'Created Date Time', name: 'createdDateTime' },
      { label: 'Updated Date Time', name: 'updatedDateTime' },
      {
        label: 'Custom & View JSON',
        name: 'customAndViewJSON',
        disableCopy: true,
      },
      { label: 'Workflow Tool', name: 'workflowTool', disableCopy: true },
    ];
  }

  function setDefineTableData(targetModelId: string) {
    const targetModel = targetModelStore.getTargetModelById(targetModelId);
    let data: Partial<Record<TargetModelTableType, any>> = {};

    if (targetModel) {
      data = {
        name: targetModel.name,
        id: targetModel.id,
        description: targetModel.description,
        migrationType: targetModel.migrationType,
        custom: targetModel.custom,
        modelType: 'Target',
        createdDateTime: targetModel.createdDateTime,
        updatedDateTime: targetModel.updatedDateTime,
        customAndViewJSON: targetModel.customAndViewJSON,
        workflowTool: targetModel.workflowTool,
      };
    }
    return data;
  }

  function loadTargetModelData(targetModelId: string | null | undefined) {
    tableModel.tableState.loading = true;
    if (targetModelId) {
      tableModel.tableState.data = setDefineTableData(targetModelId);
    }
    tableModel.tableState.loading = false;
  }

  watch(targetModelId, nv => {
    loadTargetModelData(nv);
  });

  return {
    setTargetModelId,
    targetModelStore,
    initTable,
    tableModel,
  };
}
