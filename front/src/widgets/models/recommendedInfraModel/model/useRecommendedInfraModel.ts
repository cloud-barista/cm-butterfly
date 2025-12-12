import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import {
  IEsimateCostSpecResponse,
  IRecommendModelResponse,
} from '@/entities/recommendedModel/model/types';
import { RecommendedModelTableType } from '@/entities/recommendedModel/model/types';
import { ref, watch } from 'vue';
import { useSourceModelStore } from '@/entities';
import { useAuthStore } from '@/shared/libs/store/auth';
import {
  IProviderResponse,
  IRegionOfProviderResponse,
} from '@/entities/provider/model/types';

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
      { name: 'index', label: 'No.' },
      //{ name: 'name', label: 'Name' },
      //{ name: 'id', label: 'ID' },
      //{ name: 'description', label: 'Description' },
      { name: 'spec', label: 'Spec' },
      { name: 'vCpu', label: 'vCPU' },
      { name: 'memory', label: 'Memory' },
      { name: 'disk', label: 'Disk' },
      { name: 'image', label: 'Image' },
      { name: 'os', label: 'OS' },
      { name: 'architecture', label: 'Architecture' },
      { name: 'estimateCost', label: 'Total Estimate Cost' },
    ];

    tableModel.querySearchState.keyItemSet = [
      {
        title: 'columns',
        items: [
          //{ name: 'id', label: 'ID' },
          //{ name: 'name', label: 'Name' },
          //{ name: 'description', label: 'Description' },
          { name: 'spec', label: 'Spec' },
          { name: 'vCpu', label: 'vCPU' },
          { name: 'memory', label: 'Memory' },
          { name: 'disk', label: 'Disk' },
          { name: 'image', label: 'Image' },
          { name: 'os', label: 'OS' },
          { name: 'architecture', label: 'Architecture' },
          { name: 'estimateCost', label: 'Total Estimate Cost' },
        ],
      },
    ];

    tableModel.tableState.selectIndex = [0];
  }

  function organizeRecommendedModelTableItem(
    recommendedModel: IExtendRecommendModelResponse,
  ) {
    // 입력 데이터 유효성 검사
    if (!recommendedModel || !recommendedModel.targetVmInfra || !recommendedModel.targetVmInfra.subGroups) {
      console.warn('Invalid recommendedModel data:', recommendedModel);
      return {
        name: 'Invalid Data',
        spec: 'n/a',
        vCpu: 'n/a',
        memory: 'n/a',
        disk: 'n/a',
        image: 'n/a',
        os: 'n/a',
        architecture: 'n/a',
        estimateCost: 'n/a',
        originalData: recommendedModel,
      };
    }
    let estimateCost: string;
    try {
      const monthlyPrice = recommendedModel?.estimateResponse?.result?.esimateCostSpecResults?.reduce(
        (acc, cur) => {
          return (
            acc +
            cur.estimateForecastCostSpecDetailResults[0].calculatedMonthlyPrice
          );
        },
        0,
      );
      
      const hourlyPrice = recommendedModel?.estimateResponse?.result?.esimateCostSpecResults?.[0]
        ?.estimateForecastCostSpecDetailResults[0]?.calculatedHourlyPrice;
      
      const currency = recommendedModel?.estimateResponse?.result?.esimateCostSpecResults[0]
        ?.estimateForecastCostSpecDetailResults[0]?.currency || '';
      
      if (monthlyPrice !== undefined && hourlyPrice !== undefined) {
        estimateCost = `${monthlyPrice.toFixed(4)}/mon (${hourlyPrice.toFixed(5)}/hour)${currency}`;
      } else {
        estimateCost = 'n/a';
      }
    } catch (error) {
      console.error('Error calculating estimateCost:', error);
      estimateCost = 'n/a';
    }

    // Extract vCPU, memory, and disk from targetVmSpecList
    const vCpuValues: string[] = [];
    const memoryValues: string[] = [];
    const diskValues: string[] = [];
    
    recommendedModel.targetVmInfra.subGroups?.forEach(subGroup => {
      // Find matching spec
      const matchingSpec = recommendedModel.targetVmSpecList?.find(
        spec => spec.id === subGroup.specId
      );
      
      if (matchingSpec) {
        // Extract vCPU
        if (matchingSpec.vCPU !== undefined && matchingSpec.vCPU !== -1) {
          vCpuValues.push(String(matchingSpec.vCPU));
        }
        
        // Extract memory
        if (matchingSpec.memoryGiB !== undefined && matchingSpec.memoryGiB !== -1) {
          memoryValues.push(`${matchingSpec.memoryGiB} GB`);
        }
      }
      
      // Extract disk from rootDiskSize
      if (subGroup.rootDiskSize && subGroup.rootDiskSize !== '' && subGroup.rootDiskSize !== '-1') {
        diskValues.push(`${subGroup.rootDiskSize} GB`);
      }
    });

    // Extract OS and Architecture from targetVmOsImageList
    const osValues: string[] = [];
    const archValues: string[] = [];
    
    recommendedModel.targetVmInfra.subGroups?.forEach(subGroup => {
      // Find matching image
      const matchingImage = recommendedModel.targetVmOsImageList?.find(
        image => image.cspImageName === subGroup.imageId
      );
      
      if (matchingImage) {
        // Extract OS from description (e.g., "Canonical, Ubuntu, 22.04, amd64 jammy image")
        if (matchingImage.description) {
          // Try to parse OS name from description
          const desc = matchingImage.description;
          // Common patterns: "Ubuntu 22.04", "Canonical, Ubuntu, 22.04", etc.
          const osMatch = desc.match(/Ubuntu\s+[\d.]+|Windows\s+Server\s+[\d]+|CentOS\s+[\d.]+|RHEL\s+[\d.]+|Amazon\s+Linux\s+[\d]+/i);
          if (osMatch) {
            osValues.push(osMatch[0]);
          } else {
            // Fallback: use first part of description
            const parts = desc.split(',').map(p => p.trim());
            if (parts.length >= 2) {
              osValues.push(`${parts[1]} ${parts[2] || ''}`.trim());
            } else {
              osValues.push(parts[0] || 'Unknown');
            }
          }
        }
        
        // Extract Architecture from details
        if (matchingImage.details && Array.isArray(matchingImage.details)) {
          const archDetail = matchingImage.details.find(
            (detail: any) => detail.key === 'Architecture'
          );
          if (archDetail && archDetail.value) {
            archValues.push(archDetail.value);
          }
        }
      }
    });

    const organizedDatum: Partial<
      Record<RecommendedModelTableType | 'originalData', any>
    > = {
      name: recommendedModel.targetVmInfra.name,
      //id: recommendedModel['id'] || '',
      //description: recommendedModel['description'] || '',
      spec:
        recommendedModel.targetVmInfra.subGroups
          ?.reduce((acc, cur) => {
            // specId가 "empty"인 경우도 포함
            if (!cur.specId || cur.specId.trim() === '') {
              return acc;
            }
            // specId가 "empty"면 그대로 사용
            if (cur.specId === 'empty') {
              return `${acc}empty / `;
            }
            // specId에 +가 있으면 마지막 부분을, 없으면 전체를 사용
            const specValue = cur.specId.includes('+') ? cur.specId.split('+').at(-1) : cur.specId;
            return `${acc}${specValue} / `;
          }, '')
          .replace(/\/\s$/g, '') || 'n/a',
      vCpu: vCpuValues.length > 0 ? vCpuValues.join(' / ') : 'n/a',
      memory: memoryValues.length > 0 ? memoryValues.join(' / ') : 'n/a',
      disk: diskValues.length > 0 ? diskValues.join(' / ') : 'n/a',
      image:
        recommendedModel.targetVmInfra.subGroups
          ?.reduce((acc, cur) => {
            // imageId가 "empty"인 경우도 포함
            if (!cur.imageId || cur.imageId.trim() === '') {
              return acc;
            }
            // imageId가 "empty"면 그대로 사용
            if (cur.imageId === 'empty') {
              return `${acc}empty / `;
            }
            // imageId에 +가 있으면 마지막 부분을, 없으면 전체를 사용
            const imageValue = cur.imageId.includes('+') ? cur.imageId.split('+').at(-1) : cur.imageId;
            return `${acc}${imageValue} / `;
          }, '')
          .replace(/\/\s$/g, '') || 'n/a',
      os: osValues.length > 0 ? osValues.join(' / ') : 'n/a',
      architecture: archValues.length > 0 ? archValues.join(' / ') : 'n/a',
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
    organizeRecommendedModelTableItem,
  };
}
