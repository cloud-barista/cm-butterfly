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

// Value validation: decides whether a spec/image field holds "an abnormal value
// that is not a real input value". The goal is not to catch input-guidance
// placeholders, but to detect bad values/types that cm-beetle left because it
// could not fill them in (`string`, `npt`, `undefined`, etc.) or empty values.
// Saving such a candidate as a target model does succeed, but later, when the
// infrastructure (MCI) is created, beetle fails to resolve the image and errors out.
//
// Set treated as abnormal (provisional): '' / whitespace / null / undefined (value) /
// the string 'string' / 'npt' / 'undefined' / 'empty' (an earlier stage substitutes
// this for empty values).
// Note: 'default' is not abnormal — in cb-spider `string` is an error, but `default`
// is a legitimately allowed value implemented to "behave as the default", so it counts
// as a complete value.
//
// TODO(cb-spider): which values are a "legitimate default" versus an "error" can differ
// per column. The exact set must be confirmed by inspecting the cb-spider source, and
// INVALID_FIELD_VALUES below is a provisional definition covering only what is currently known.
const INVALID_FIELD_VALUES = new Set(['', 'string', 'npt', 'undefined', 'empty']);

function isInvalidFieldValue(value?: string | null): boolean {
  if (value === undefined || value === null) return true;
  const normalized = String(value).trim().toLowerCase();
  // Legitimately allowed values such as 'default' are not caught here (not in the set).
  return INVALID_FIELD_VALUES.has(normalized);
}

// True if any of the candidate's (recommended infra) nodeGroups holds an abnormal value
// in its spec (specId) or image (imageId). It does not block saving; it is only used for
// the on-screen warning (`!`), markers, and tooltips.
function hasMissingRequiredFields(
  model?: IExtendRecommendModelResponse | null,
): boolean {
  const groups = model?.targetInfra?.nodeGroups;
  if (!groups || groups.length === 0) return true;
  return groups.some(
    group =>
      isInvalidFieldValue(group?.specId) || isInvalidFieldValue(group?.imageId),
  );
}

// Returns the on-screen labels (Spec/Image) of the required columns holding an abnormal
// value — so the tooltip text can name the actual empty column. Shares the same
// isInvalidFieldValue criterion as hasMissingRequiredFields.
function getMissingRequiredFieldLabels(
  model?: IExtendRecommendModelResponse | null,
): string[] {
  const groups = model?.targetInfra?.nodeGroups;
  const missing: string[] = [];
  if (!groups || groups.length === 0) {
    return ['Spec', 'Image'];
  }
  if (groups.some(group => isInvalidFieldValue(group?.specId))) {
    missing.push('Spec');
  }
  if (groups.some(group => isInvalidFieldValue(group?.imageId))) {
    missing.push('Image');
  }
  return missing;
}

export function useRecommendedInfraModel() {
  const tableModel =
    useToolboxTableModel<
      Partial<
        Record<
          | RecommendedModelTableType
          | 'originalData'
          | 'hasMissingInfo'
          | 'missingFields',
          any
        >
      >
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
    // Validate the input data
    if (!recommendedModel || !recommendedModel.targetInfra || !recommendedModel.targetInfra.nodeGroups) {
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
        hasMissingInfo: true,
        missingFields: 'Spec, Image',
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

    // Extract vCPU, memory, and disk from targetSpecList
    const vCpuValues: string[] = [];
    const memoryValues: string[] = [];
    const diskValues: string[] = [];
    
    recommendedModel.targetInfra.nodeGroups?.forEach(subGroup => {
      // Find matching spec
      const matchingSpec = recommendedModel.targetSpecList?.find(
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

    // OS and Architecture come from the image entry's own normalized fields.
    //
    // The image list carries two layers. `osType`/`osArchitecture` are normalized by
    // cb-tumblebug so every provider reports them the same way, while `description` and
    // `details[]` are whatever the provider itself returned — their shape differs per
    // provider and is not something to parse. This used to read the provider-supplied
    // layer, so it only worked where that layer happened to look like AWS: `description`
    // is empty on NCP, and the architecture key is named `CpuArchitectureType` there
    // rather than `Architecture`. Both columns then showed "n/a" even though the
    // normalized fields held the right values all along.
    //
    // `imageId` on a nodeGroup refers to the image entry's `id`, so match on that.
    // Nothing is guessed when a value is absent — the column stays empty and the table
    // renders "n/a", which is the honest answer.
    const osValues: string[] = [];
    const archValues: string[] = [];

    recommendedModel.targetInfra.nodeGroups?.forEach(subGroup => {
      const matchingImage = recommendedModel.targetOsImageList?.find(
        image => image.id === subGroup.imageId,
      );

      if (matchingImage) {
        if (matchingImage.osType) {
          osValues.push(matchingImage.osType);
        }
        // 'NA' is the image list's way of saying the architecture is unknown, so it is
        // not shown as if it were an answer.
        if (matchingImage.osArchitecture && matchingImage.osArchitecture !== 'NA') {
          archValues.push(matchingImage.osArchitecture);
        }
      }
    });

    const organizedDatum: Partial<
      Record<
        | RecommendedModelTableType
        | 'originalData'
        | 'hasMissingInfo'
        | 'missingFields',
        any
      >
    > = {
      name: recommendedModel.targetInfra.name,
      //id: recommendedModel['id'] || '',
      //description: recommendedModel['description'] || '',
      spec:
        recommendedModel.targetInfra.nodeGroups
          ?.reduce((acc, cur) => {
            // Also covers the case where specId is "empty"
            if (!cur.specId || cur.specId.trim() === '') {
              return acc;
            }
            // If specId is "empty", use it as-is
            if (cur.specId === 'empty') {
              return `${acc}empty / `;
            }
            // If specId contains a '+', use the last part; otherwise use the whole value
            const specValue = cur.specId.includes('+') ? cur.specId.split('+').at(-1) : cur.specId;
            return `${acc}${specValue} / `;
          }, '')
          .replace(/\/\s$/g, '') || 'n/a',
      vCpu: vCpuValues.length > 0 ? vCpuValues.join(' / ') : 'n/a',
      memory: memoryValues.length > 0 ? memoryValues.join(' / ') : 'n/a',
      disk: diskValues.length > 0 ? diskValues.join(' / ') : 'n/a',
      image:
        recommendedModel.targetInfra.nodeGroups
          ?.reduce((acc, cur) => {
            // Also covers the case where imageId is "empty"
            if (!cur.imageId || cur.imageId.trim() === '') {
              return acc;
            }
            // If imageId is "empty", use it as-is
            if (cur.imageId === 'empty') {
              return `${acc}empty / `;
            }
            // If imageId contains a '+', use the last part; otherwise use the whole value
            const imageValue = cur.imageId.includes('+') ? cur.imageId.split('+').at(-1) : cur.imageId;
            return `${acc}${imageValue} / `;
          }, '')
          .replace(/\/\s$/g, '') || 'n/a',
      os: osValues.length > 0 ? osValues.join(' / ') : 'n/a',
      architecture: archValues.length > 0 ? archValues.join(' / ') : 'n/a',
      estimateCost: estimateCost || 'n/a',
      hasMissingInfo: hasMissingRequiredFields(recommendedModel),
      missingFields:
        getMissingRequiredFieldLabels(recommendedModel).join(', ') ||
        'Spec, Image',
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

    // With no registered provider the output is empty — that is an empty menu, not an error.
    (providerResponse?.output ?? []).forEach(provider => {
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
