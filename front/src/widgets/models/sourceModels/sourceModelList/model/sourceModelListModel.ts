import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import type { ISourceModel } from '@/entities';
import { useSourceModelStore, SourceModelTableType } from '@/entities';
import { watch } from 'vue';
import { storeToRefs } from 'pinia';

export function useSourceModelListModel() {
  const tableModel =
    useToolboxTableModel<Partial<Record<SourceModelTableType, any>>>();
  const sourceModelStore = useSourceModelStore();
  const { models } = storeToRefs(sourceModelStore);

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

  function organizeSourceModelTableItem(sourceModel: ISourceModel) {
    const organizedDatum: Partial<
      Record<SourceModelTableType | 'originalData', any>
    > = {
      name: sourceModel.name,
      id: sourceModel.id,
      description: sourceModel.description,
      migrationType: sourceModel.migrationType,
      custom: sourceModel.custom,
      createdDateTime: sourceModel.createdDateTime,
      updatedDateTime: sourceModel.updatedDateTime,
      originalData: sourceModel,
    };
    return organizedDatum;
  }

  watch(models, nv => {
    tableModel.tableState.items = nv.map(value =>
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
