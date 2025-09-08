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

interface ISelectMenu {
  name: string;
  label: string;
  type: string;
}

interface IExtendRecommendModelResponse extends IRecommendModelResponse {
  estimateResponse?: IEsimateCostSpecResponse;
}

export function useRecommendedInfraModel() {
  const tableModel =
    useToolboxTableModel<
      Partial<Record<RecommendedModelTableType | 'originalData', any>>
    >();
  const sourceModelStore = useSourceModelStore();
  const targetRecommendModel = ref<IExtendRecommendModelResponse | null>(null);
  const userStore = useAuthStore();

  function initToolBoxTableModel() {
    tableModel.initState();
    tableModel.tableState.fields = [
      { name: 'name', label: 'Name' },
      //{ name: 'id', label: 'ID' },
      //{ name: 'description', label: 'Description' },
      { name: 'spec', label: 'Spec' },
      { name: 'image', label: 'Image' },
      { name: 'estimateCost', label: 'Total Estimate Cost' },
    ];

    tableModel.querySearchState.keyItemSet = [
      {
        title: 'columns',
        items: [
          //{ name: 'id', label: 'ID' },
          { name: 'name', label: 'Name' },
          //{ name: 'description', label: 'Description' },
          { name: 'spec', label: 'Spec' },
          { name: 'image', label: 'Image' },
          { name: 'estimateCost', label: 'Total Estimate Cost' },
        ],
      },
    ];

    tableModel.tableState.selectIndex = [0];
  }

  function organizeRecommendedModelTableItem(
    recommendedModel: IExtendRecommendModelResponse,
  ) {
    let estimateCost: string;
  
    try {
      estimateCost = `${
        recommendedModel?.estimateResponse?.result?.esimateCostSpecResults?.reduce(
          (acc, cur) => {
            return (
              acc +
              cur.estimateForecastCostSpecDetailResults[0].calculatedMonthlyPrice
            );
          },
          0,
        )
      }${
        recommendedModel?.estimateResponse?.result?.esimateCostSpecResults[0]
          .estimateForecastCostSpecDetailResults[0].currency || ''
      }`;
    } catch (error) {
      console.error('Error calculating estimateCost:', error);
      estimateCost = 'n/a';
    }

    const organizedDatum: Partial<
      Record<RecommendedModelTableType | 'originalData', any>
    > = {
      name: recommendedModel.targetVmInfra.name,
      //id: recommendedModel['id'] || '',
      //description: recommendedModel['description'] || '',
      spec:
        recommendedModel.targetVmInfra.subGroups
          ?.reduce((acc, cur) => {
            // specId에 +가 있으면 마지막 부분을, 없으면 전체를 사용
            const specValue = cur.specId.includes('+') ? cur.specId.split('+').at(-1) : cur.specId;
            return `${acc}${specValue} / `;
          }, '')
          .replace(/\/\s$/g, '') || 'n/a',
      image:
        recommendedModel.targetVmInfra.subGroups
          ?.reduce((acc, cur) => {
            // imageId에 +가 있으면 마지막 부분을, 없으면 전체를 사용
            const imageValue = cur.imageId.includes('+') ? cur.imageId.split('+').at(-1) : cur.imageId;
            return `${acc}${imageValue} / `;
          }, '')
          .replace(/\/\s$/g, '') || 'n/a',
      estimateCost: estimateCost || 'n/a',
      originalData: recommendedModel,
    };

    return organizedDatum;
  }

  function setTargetRecommendInfraModel(
    _targetRecommendModel: IExtendRecommendModelResponse,
  ) {
    targetRecommendModel.value = _targetRecommendModel;
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

  function setTableStateItem() {
    if (targetRecommendModel.value) {
      tableModel.tableState.items = [
        organizeRecommendedModelTableItem(targetRecommendModel.value),
      ];
    }
  }

  watch(targetRecommendModel, nv => {
    if (nv) setTableStateItem();
  });

  return {
    userStore,
    tableModel,
    initToolBoxTableModel,
    targetRecommendModel,
    sourceModelStore,
    setTableStateItem,
    setTargetRecommendInfraModel,
    generateProviderSelectMenu,
    generateRegionSelectMenu,
  };
}
