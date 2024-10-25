import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import type { ITargetModel } from '@/entities';
import { useTargetModelStore, TargetModelTableType } from '@/entities';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';

export function useTargetModelListModel() {
  const tableModel =
    useToolboxTableModel<Partial<Record<TargetModelTableType, any>>>();
  const targetModelStore = useTargetModelStore();
  const { targetModels } = storeToRefs(targetModelStore);

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

  function organizeTargetModelTableItem(targetModel: ITargetModel) {
    const organizedDatum: Partial<
      Record<TargetModelTableType | 'originalData', any>
    > = {
      name: targetModel.name,
      id: targetModel.id,
      description: targetModel.description,
      migrationType: targetModel.migrationType,
      custom: targetModel.custom,
      createdDateTime: targetModel.createdDateTime,
      updatedDateTime: targetModel.updatedDateTime,
      originalData: targetModel,
    };
    return organizedDatum;
  }

  watch(targetModels, nv => {
    tableModel.tableState.items = nv.map(value =>
      organizeTargetModelTableItem(value),
    );
  });

  return {
    tableModel,
    targetModels,
    initToolBoxTableModel,
    targetModelStore,
  };
}
