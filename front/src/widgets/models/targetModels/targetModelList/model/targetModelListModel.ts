import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import {
  ISourceModelResponse,
  ITargetModel,
  ITargetModelResponse,
} from '@/entities';
import { useTargetModelStore, TargetModelTableType } from '@/entities';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
import { formatDate } from '@/shared/utils';

export function useTargetModelListModel() {
  const tableModel =
    useToolboxTableModel<Partial<Record<TargetModelTableType, any>>>();
  const targetModelStore = useTargetModelStore();
  const models = targetModelStore.getModels();

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

  function organizeTargetModelTableItem(targetModel: ITargetModelResponse) {
    const organizedDatum: Partial<
      Record<TargetModelTableType | 'originalData', any>
    > = {
      name: targetModel.userModelName,
      id: targetModel.id,
      description: targetModel.description,
      migrationType: targetModel['migrationType'] ?? '',
      custom: targetModel['custom '] ?? '',
      createdDateTime: formatDate(targetModel.createTime),
      updatedDateTime: formatDate(targetModel.updateTime),
      originalData: targetModel,
    };
    return organizedDatum;
  }

  watch(models, nv => {
    tableModel.tableState.items = nv.map((value: ITargetModelResponse) =>
      organizeTargetModelTableItem(value),
    );
  });

  return {
    tableModel,
    models,
    initToolBoxTableModel,
    targetModelStore,
  };
}
