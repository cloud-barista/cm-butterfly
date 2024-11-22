import { useRecommendedModelStore } from '@/entities/recommendedModel/model/stores.ts';
import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel.ts';
import {
  IEsimateCostSpecResponse,
  IRecommendModelResponse,
} from '@/entities/recommendedModel/model/types.ts';
import { RecommendedModelTableType } from '@/entities/recommendedModel/model/types.ts';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useSourceModelStore } from '@/entities';
import { useAuthStore } from '@/shared/libs/store/auth';
import {
  IProviderResponse,
  IRegionOfProviderResponse,
} from '@/entities/provider/model/types.ts';

export function useRecommendedModel() {
  const tableModel =
    useToolboxTableModel<Partial<Record<RecommendedModelTableType, any>>>();
  const sourceModelStore = useSourceModelStore();
  const targetRecommendModel = ref<
    | (IRecommendModelResponse & {
        estimateResponse: IEsimateCostSpecResponse;
      })
    | null
  >(null);
  const userStore = useAuthStore();

  function initToolBoxTableModel() {
    tableModel.initState();

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
    recommendedModel: IRecommendModelResponse & {
      estimateResponse: IEsimateCostSpecResponse;
    },
  ) {
    const organizedDatum: Partial<
      Record<RecommendedModelTableType | 'originalData', any>
    > = {
      name: recommendedModel.targetInfra.name,
      id: recommendedModel['id'] || '',
      description: recommendedModel.description,
      label: recommendedModel.targetInfra.label,
      spec: recommendedModel['spec'] || '',
      image: recommendedModel['image'] || '',
      rootDiskType: recommendedModel['rootDiskType'] || '',
      rootDiskSize: recommendedModel['rootDiskSize'] || '',
      userPassword: recommendedModel['userPassword'] || '',
      connection: recommendedModel['connection'] || '',
      estimateCost:
        recommendedModel.estimateResponse.result.esimateCostSpecResults[0]
          .estimateForecastCostSpecDetailResults[0].calculatedMonthlyPrice +
          recommendedModel.estimateResponse.result.esimateCostSpecResults[0]
            .estimateForecastCostSpecDetailResults[0].currency || '',
      originalData: recommendedModel,
    };
    console.log(organizedDatum);
    return organizedDatum;
  }

  function setTargetRecommendModel(
    _targetRecommendModel: IRecommendModelResponse & {
      estimateResponse: IEsimateCostSpecResponse;
    },
  ) {
    targetRecommendModel.value = _targetRecommendModel;
  }

  interface ISelectMenu {
    name: string;
    label: string;
    type: string;
  }

  function generateProviderSelectMenu(
    providerResponse: IProviderResponse,
  ): Array<ISelectMenu> {
    const menu: Array<ISelectMenu> = [];

    providerResponse.output.forEach(provider => {
      menu.push({
        name: provider,
        label: provider,
        type: 'item',
      });
    });
    menu.sort((a, b) => a.label.localeCompare(b.label));

    return menu;
  }

  function generateRegionSelectMenu(
    regionOfProviderResponse: IRegionOfProviderResponse,
  ): Array<ISelectMenu> {
    const menu: Array<ISelectMenu> = [];

    regionOfProviderResponse.regions.forEach(region => {
      menu.push({
        name: region.regionId,
        label: `${region.location.display} / ${region.regionName}`,
        type: 'item',
      });
    });
    menu.sort((a, b) => a.label.localeCompare(b.label));
    return menu;
  }

  watch(targetRecommendModel, nv => {
    if (nv)
      tableModel.tableState.items = [organizeRecommendedModelTableItem(nv)];
  });

  return {
    userStore,
    tableModel,
    initToolBoxTableModel,
    sourceModelStore,
    setTargetRecommendModel,
    generateProviderSelectMenu,
    generateRegionSelectMenu,
  };
}
