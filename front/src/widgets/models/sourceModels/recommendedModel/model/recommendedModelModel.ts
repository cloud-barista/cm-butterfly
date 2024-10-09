import { useRecommendedModelStore } from '@/entities/recommendedModel/model/stores';
import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import { IRecommendedModel } from '@/entities/recommendedModel/model/types';
import { RecommendedModelTableType } from '@/entities/recommendedModel/model/types';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';

export function useRecommendedModelModel() {
  const tableModel =
    useToolboxTableModel<Partial<Record<RecommendedModelTableType, any>>>();
  const recommendedModelStore = useRecommendedModelStore();
  const { recommendedModels } = storeToRefs(recommendedModelStore);

  function initToolBoxTableModel() {
    tableModel.tableState.fields = [
      { name: 'name', label: 'Name' },
      { name: 'id', label: 'ID' },
      { name: 'description', label: 'Description' },
      { name: 'label', label: 'Label' },
      { name: 'spec', label: 'Spec' },
      { name: 'image', label: 'Image' },
      { name: 'rootDiskType', label: 'Root Disk Type' },
      { name: 'rootDiskSize', label: 'Root Disk Size' },
      { name: 'userPassword', label: 'User Password' },
      { name: 'connection', label: 'Connection' },
      { name: 'estimateCost', label: 'Estimate Cost' },
    ];

    tableModel.querySearchState.keyItemSet = [
      {
        title: 'columns',
        items: [
          { name: 'id', label: 'ID' },
          { name: 'name', label: 'Name' },
          { name: 'description', label: 'Description' },
          { name: 'label', label: 'Label' },
          { name: 'spec', label: 'Spec' },
          { name: 'image', label: 'Image' },
          { name: 'rootDiskType', label: 'Root Disk Type' },
          { name: 'rootDiskSize', label: 'Root Disk Size' },
          { name: 'userPassword', label: 'User Password' },
          { name: 'connection', label: 'Connection' },
          { name: 'estimateCost', label: 'Estimate Cost' },
        ],
      },
    ];

    tableModel.tableState.selectIndex = [0];
  }

  function organizeRecommendedModelTableItem(
    recommendedModel: IRecommendedModel,
  ) {
    const organizedDatum: Partial<
      Record<RecommendedModelTableType | 'originalData', any>
    > = {
      name: recommendedModel.name,
      id: recommendedModel.id,
      description: recommendedModel.description,
      label: recommendedModel.label,
      spec: recommendedModel.spec,
      image: recommendedModel.image,
      rootDiskType: recommendedModel.rootDiskType,
      rootDiskSize: recommendedModel.rootDiskSize,
      userPassword: recommendedModel.userPassword,
      connection: recommendedModel.connection,
      estimateCost: recommendedModel.estimateCost,
      originalData: recommendedModel,
    };
    return organizedDatum;
  }

  watch(recommendedModels, nv => {
    tableModel.tableState.items = nv.map(value =>
      organizeRecommendedModelTableItem(value),
    );
  });

  return {
    tableModel,
    recommendedModels,
    initToolBoxTableModel,
    recommendedModelStore,
  };
}
