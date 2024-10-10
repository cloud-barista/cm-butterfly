import { useSourceModelStore, SourceModelTableType } from '@/entities';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { ref, watch } from 'vue';

export function useSourceModelDetailModel() {
  const sourceModelStore = useSourceModelStore();
  const sourceModelId = ref<string | null>();
  const tableModel =
    useDefinitionTableModel<Record<SourceModelTableType, any>>();

  function setSourceModelId(_sourceModelId: string | null) {
    sourceModelId.value = _sourceModelId;
  }

  function initTable() {
    tableModel.initState();

    tableModel.tableState.fields = [
      { label: 'Source Model Information', name: 'name' },
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
      { label: 'Recommend Model', name: 'recommendModel', disableCopy: true },
    ];
  }

  function setDefineTableData(sourceModelId: string) {
    const sourceModel = sourceModelStore.getModelById(sourceModelId);
    let data: Partial<Record<SourceModelTableType, any>> = {};

    if (sourceModel) {
      data = {
        name: sourceModel.name,
        id: sourceModel.id,
        description: sourceModel.description,
        migrationType: sourceModel.migrationType,
        custom: sourceModel.custom,
        modelType: 'Source',
        createdDateTime: sourceModel.createdDateTime,
        updatedDateTime: sourceModel.updatedDateTime,
        customAndViewJSON: sourceModel.customAndViewJSON,
        recommendModel: sourceModel.recommendModel,
      };
    }
    return data;
  }

  function loadSourceModelData(sourceModelId: string | null | undefined) {
    tableModel.tableState.loading = true;
    if (sourceModelId) {
      tableModel.tableState.data = setDefineTableData(sourceModelId);
    }
    tableModel.tableState.loading = false;
  }

  watch(sourceModelId, nv => {
    loadSourceModelData(nv);
  });

  return {
    setSourceModelId,
    sourceModelStore,
    initTable,
    tableModel,
  };
}
