import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import type { ISourceModel } from '@/entities';
import {
  useSourceModelStore,
  SourceModelTableType,
  ISourceModelResponse,
} from '@/entities';
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useDateFormat } from '@vueuse/core';
import { formatDate } from '@/shared/utils';

export function useSourceModelListModel() {
  const tableModel =
    useToolboxTableModel<Partial<Record<SourceModelTableType, any>>>();
  const sourceModelStore = useSourceModelStore();
  const models = sourceModelStore.getModels();

  function initToolBoxTableModel() {
    tableModel.tableState.fields = [
      { name: 'name', label: 'Name' },
      { name: 'id', label: 'ID' },
      { name: 'description', label: 'Description' },
      { name: 'migrationType', label: 'Migration Type' },
      { name: 'custom', label: 'Custom' },
      { name: 'createdDateTime', label: 'Created Date Time' },
      { name: 'updatedDateTime', label: 'Updated Date Time' },
    ];

    tableModel.querySearchState.keyItemSet = [
      {
        title: 'columns',
        items: [
          { name: 'id', label: 'ID' },
          { name: 'name', label: 'Name' },
          { name: 'description', label: 'Description' },
          { name: 'migrationType', label: 'Migration Type' },
          { name: 'custom', label: 'Custom' },
          { name: 'createdDateTime', label: 'Created Date Time' },
          { name: 'updatedDateTime', label: 'Updated Date Time' },
        ],
      },
    ];
  }

  function organizeSourceModelTableItem(sourceModel: ISourceModelResponse) {
    console.log(sourceModel);
    const organizedDatum: Partial<
      Record<SourceModelTableType | 'originalData', any>
    > = {
      name: sourceModel.userModelName,
      id: sourceModel.id,
      description: sourceModel.description,
      migrationType: sourceModel['migrationType'] ?? '',
      custom: sourceModel['custom '] ?? '',
      createdDateTime: formatDate(sourceModel.createTime),
      updatedDateTime: formatDate(sourceModel.updateTime),
      originalData: sourceModel,
    };
    return organizedDatum;
  }

  watch(models, nv => {
    tableModel.tableState.items = nv.map((value: ISourceModelResponse) =>
      organizeSourceModelTableItem(value),
    );
  });

  return {
    tableModel,
    models,
    initToolBoxTableModel,
    sourceModelStore,
  };
}
