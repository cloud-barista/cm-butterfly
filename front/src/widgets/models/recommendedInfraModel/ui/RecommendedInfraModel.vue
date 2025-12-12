<script setup lang="ts">
import {
  PButton,
  PIconModal,
  PToolboxTable,
  PSelectDropdown,
} from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { TargetModelNameSave } from '@/features/models';
import { computed, onMounted, reactive, ref } from 'vue';
import { SimpleEditForm } from '@/widgets/layout';
import { useRecommendedInfraModel } from '@/widgets/models/recommendedInfraModel/model/useRecommendedInfraModel';
import { createTargetModel } from '@/entities';
import {
  getRecommendCost,
  useGetRecommendModelListBySourceModel,
  useGetRecommendModelCandidates,
} from '@/entities/recommendedModel/api';
import { showErrorMessage } from '@/shared/utils';
import { IRecommendModelResponse } from '@/entities/recommendedModel/model/types';
import { useGetProviderList, useGetRegionList } from '@/entities/provider/api';
import { useAuth } from '@/features/auth/model/useAuth.ts';

interface IProps {
  sourceModelName: string;
  sourceModelId: string;
}

const props = defineProps<IProps>();

const emit = defineEmits(['update:close-modal']);

const auth = useAuth();

// VM 데이터 유효성 검사 헬퍼 함수
function isValidVmData(vm: any): boolean {
  return vm && 
         vm.specId && 
         vm.specId.trim() !== '' && 
         vm.imageId && 
         vm.imageId.trim() !== '';
}

// "empty" 문구를 빨간색으로 표시하는 헬퍼 함수
function formatEmptyValue(value: string): string {
  if (!value) return '';
  
  // "empty" 문자열을 빨간색으로 변환 (단어 단위로 대체)
  return value.replace(/\bempty\b/g, '<span style="color: red; font-weight: bold;">empty</span>');
}
const recommendInfraModel = useRecommendedInfraModel();

const modelName = ref<string>('');
const description = ref<string>('');

const resGetProviderList = useGetProviderList();
const resGetRegionList = useGetRegionList(null);

const resCreateTargetModel = createTargetModel(null);
const resGetRecommendCost = getRecommendCost(null);

const provider = reactive({
  menu: [] as any[],
  loading: true,
  selected: '',
});

const region = reactive({
  menu: [] as any[],
  loading: true,
  selected: '',
});

async function handleProviderMenuClick(e: any) {
  if (!e) return;

  provider.loading = true;
  const { data } = await resGetProviderList.execute();

  if (data.responseData) {
    provider.menu = recommendInfraModel.generateProviderSelectMenu(
      data.responseData,
    );
  }

  provider.loading = false;
}

async function handleRegionMenuClick(e: any) {
  if (!e) return;

  region.loading = true;
  const { data } = await resGetRegionList.execute({
    pathParams: {
      providerName: provider.selected,
    },
  });

  if (data.responseData) {
    region.menu = recommendInfraModel.generateRegionSelectMenu(
      data.responseData,
    );
  }

  region.loading = false;
}

const targetSourceModel = computed(() =>
  recommendInfraModel.sourceModelStore.getSourceModelById(props.sourceModelId),
);

// Query parameter 입력값
const candidateLimit = ref<number>(3);
const minimumMatchRateMin = ref<number | null>(null);
const minimumMatchRateMax = ref<number>(100);  // 기본값 100

const modalState = reactive({
  targetModal: false,
  checkModal: false,
});

onMounted(() => {
  recommendInfraModel.initToolBoxTableModel();
  handleProviderMenuClick(true);
});

async function getRecommendModelList() {
  recommendInfraModel.initToolBoxTableModel();

  try {
    // minimumMatchRate 파라미터 조합
    let minimumMatchRateParam: string | number | null = null;
    if (minimumMatchRateMin.value !== null && minimumMatchRateMax.value !== null) {
      minimumMatchRateParam = `${minimumMatchRateMin.value}-${minimumMatchRateMax.value}`;
    } else if (minimumMatchRateMin.value !== null) {
      minimumMatchRateParam = minimumMatchRateMin.value;
    } else if (minimumMatchRateMax.value !== null) {
      minimumMatchRateParam = minimumMatchRateMax.value;
    }
    
    // Candidates API 호출 (복수 후보 조회)
    const getRecommendCandidates = useGetRecommendModelCandidates(
      targetSourceModel.value?.onpremiseInfraModel || null,
      provider.selected,
      region.selected,
      candidateLimit.value,
      minimumMatchRateParam,
    );

    const res = await getRecommendCandidates.execute();
    
    console.log('=== Recommend Candidates Response ===');
    console.log('Type of res:', typeof res);
    console.log('Keys of res:', Object.keys(res));
    console.log('res.data type:', typeof res.data);
    console.log('res.data keys:', res.data ? Object.keys(res.data) : 'null');
    
    // API 응답 구조: { responseData: { data: [...] } }
    if (res.data?.responseData?.data && Array.isArray(res.data.responseData.data)) {
      const candidates = res.data.responseData.data;
      console.log(`Found ${candidates.length} candidate(s)`);
      
      // 각 후보에 대해 비용 계산 및 데이터 정제
      const processedCandidates = candidates.map((candidate, index) => {
        console.log(`Processing candidate ${index + 1}:`, JSON.stringify(candidate, null, 2));
        
        // API 응답 데이터 검증 및 정리
        if (candidate.targetVmInfra?.subGroups) {
          const originalLength = candidate.targetVmInfra.subGroups.length;
          
          // 무효한 데이터 로깅
          const invalidVms = candidate.targetVmInfra.subGroups.filter(vm => 
            !vm || !vm.specId || vm.specId.trim() === '' || !vm.imageId || vm.imageId.trim() === ''
          );
          
          if (invalidVms.length > 0) {
            console.warn(`Candidate ${index + 1}: Found ${invalidVms.length} invalid VMs`);
          }
          
          // 무효한 데이터의 빈 필드를 "empty"로 대체
          candidate.targetVmInfra.subGroups = candidate.targetVmInfra.subGroups.map(vm => {
            const updatedVm = { ...vm };
            if (!vm.specId || vm.specId.trim() === '') {
              updatedVm.specId = 'empty';
            }
            if (!vm.imageId || vm.imageId.trim() === '') {
              updatedVm.imageId = 'empty';
            }
            return updatedVm;
          });
        }

        // 비용 계산 (targetVmSpecList 기반)
        try {
          let totalCostPerHour = 0;
          let currency = '';
          let skippedVms: Array<{ vmName: string; specId: string; costPerHour: number }> = [];
          
          candidate.targetVmInfra.subGroups?.forEach(vm => {
            const matchingSpec = candidate.targetVmSpecList?.find(spec => spec.id === vm.specId);
            if (matchingSpec && matchingSpec.costPerHour !== undefined && matchingSpec.costPerHour !== null) {
              if (matchingSpec.costPerHour < 0) {
                skippedVms.push({
                  vmName: vm.name,
                  specId: vm.specId,
                  costPerHour: matchingSpec.costPerHour
                });
                console.warn(`Skipping VM with negative cost: ${vm.name} (${vm.specId})`);
              } else {
                totalCostPerHour += matchingSpec.costPerHour;
                currency = matchingSpec.currency || 'USD';
              }
            } else {
              console.warn(`No cost information found for VM: ${vm.name} (${vm.specId})`);
            }
          });
          
          if (skippedVms.length > 0) {
            console.warn(`Candidate ${index + 1}: Skipped ${skippedVms.length} VMs due to invalid cost`);
          }

          const totalCostPerMonth = totalCostPerHour * 24 * 30;

          return {
            ...candidate,
            estimateResponse: {
              result: {
                esimateCostSpecResults: [{
                  estimateForecastCostSpecDetailResults: [{
                    calculatedMonthlyPrice: totalCostPerMonth,
                    calculatedHourlyPrice: totalCostPerHour,
                    currency: currency
                  }]
                }]
              }
            }
          };
        } catch (e) {
          console.error(`Error calculating cost for candidate ${index + 1}:`, e);
          return {
            ...candidate,
            estimateResponse: {
              result: {
                esimateCostSpecResults: [{
                  estimateForecastCostSpecDetailResults: [{
                    calculatedMonthlyPrice: 0,
                    calculatedHourlyPrice: 0,
                    currency: 'USD'
                  }]
                }]
              }
            }
          };
        }
      });

      console.log('Processed candidates:', processedCandidates);
      console.log('=== End Response Log ===');

      // n개의 후보를 모두 테이블에 표시
      try {
        const tableItems = processedCandidates.map((candidate, index) => {
          console.log(`Organizing table item ${index + 1}:`, candidate);
          const item = recommendInfraModel.organizeRecommendedModelTableItem(candidate);
          item.index = index + 1; // 순번 추가
          console.log(`Organized item ${index + 1}:`, item);
          return item;
        });
        
        console.log('Setting table items:', tableItems);
        recommendInfraModel.tableModel.tableState.items = tableItems;
        console.log('Table items set successfully');
      } catch (tableError) {
        console.error('Error organizing table items:', tableError);
        throw tableError;
      }
      
    } else {
      showErrorMessage('error', 'No candidates found');
      recommendInfraModel.initToolBoxTableModel();
    }
  } catch (err: any) {
    showErrorMessage('error', err?.errorMsg || 'Failed to get recommendations');
    recommendInfraModel.initToolBoxTableModel();
  }
}

function handleModal() {
  emit('update:close-modal', false);
  modalState.targetModal = false;
  modalState.checkModal = true;
}

function handleConfirm() {
  modalState.targetModal = false;
  modalState.checkModal = false;
  emit('update:close-modal', false);
}

function handleSave(e: { name: string; description: string }) {
  modelName.value = e.name;
  description.value = e.description;

  try {
    let selectedModel: IRecommendModelResponse =
      recommendInfraModel.tableModel.tableState.displayItems[
        (recommendInfraModel.tableModel.tableState.selectIndex as unknown) as number
      ].originalData;

    // 선택된 Row의 데이터를 가공 없이 그대로 사용
    const selectedVmIndex = Array.isArray(recommendInfraModel.tableModel.tableState.selectIndex) 
      ? recommendInfraModel.tableModel.tableState.selectIndex[0] 
      : recommendInfraModel.tableModel.tableState.selectIndex as number;
    const selectedVm = selectedModel.targetVmInfra.subGroups[selectedVmIndex];
    
    // 기존 targetVmInfra를 그대로 사용 (가공 없이)
    const modifiedTargetVmInfra = {
      ...selectedModel.targetVmInfra
      // subGroups는 원본 그대로 유지
    };

    // API 스펙에 맞는 cloudInfraModel 구조 생성
    const cloudInfraModel = {
      description: selectedModel.description || '',
      status: selectedModel.status || '',
      targetSecurityGroupList: selectedModel.targetSecurityGroupList || [],
      targetSshKey: selectedModel.targetSshKey || {},
      targetVNet: selectedModel.targetVNet || {},
      targetVmInfra: modifiedTargetVmInfra, // 가공되지 않은 targetVmInfra 사용
      targetVmOsImageList: selectedModel.targetVmOsImageList || [],
      targetVmSpecList: selectedModel.targetVmSpecList || []
    };

    console.log('=== Save Target Model ===');
    console.log('Selected VM index:', selectedVmIndex);
    console.log('Selected VM:', selectedVm);
    console.log('Original targetVmInfra (no modification):', modifiedTargetVmInfra);
    console.log('CloudInfraModel:', cloudInfraModel);

    // specId가 빈 문자열이거나 +가 없는 경우 기본값 사용
    let csp = 'default-csp';
    let region = 'default-region';
    
    if (selectedVm.specId && selectedVm.specId !== 'empty' && selectedVm.specId.includes('+')) {
      const commonSpecSplitData = selectedVm.specId.split('+');
      csp = commonSpecSplitData[0];
      region = commonSpecSplitData[1];
    } else if (selectedVm.specId === 'empty') {
      console.warn('Selected VM has empty specId, using default values');
    }

    resCreateTargetModel
      .execute({
        request: {
          cloudInfraModel: cloudInfraModel as any, // 가공되지 않은 데이터 전달
          csp: csp,
          description: description.value,
          isInitUserModel: true,
          isTargetModel: true,
          region: region,
          userModelName: modelName.value,
          userModelVersion: '1',
          zone: '',
          userId: auth.getUser().id,
        },
      })
      .then(res => {
        modalState.targetModal = false;
        modalState.checkModal = true;
      })
      .catch();
  } catch (e: any) {
    showErrorMessage('error', e?.message || 'An error occurred');
  }
}
</script>

<template>
  <div>
    <create-form
      class="page-modal-layout"
      title="Recommend Model"
      :need-widget-layout="true"
      :badge-title="sourceModelName"
      first-title="Recommend Model List"
      @update:modal-state="handleModal"
    >
      <template #add-info>
        <div class="flex gap-4 flex-col w-full">
          <!-- Provider, Region, Search 버튼을 같은 라인에 배치 -->
          <section class="select-service-box flex w-full items-center gap-4">
            <p class="text-label-lg font-bold">Provider</p>
            <p-select-dropdown
              :menu="provider.menu"
              :loading="provider.loading"
              @update:visible-menu="handleProviderMenuClick"
              @select="
                e => {
                  provider.selected = e;
                  handleRegionMenuClick(true);
                }
              "
            ></p-select-dropdown>
            <p class="text-label-lg font-bold">Region</p>
            <p-select-dropdown
              :menu="region.menu"
              :loading="region.loading"
              :disabled="provider.selected === ''"
              @update:visible-menu="handleRegionMenuClick"
              @select="
                e => {
                  region.selected = e;
                }
              "
            ></p-select-dropdown>
            
            <!-- Search 버튼을 오른쪽 끝으로 -->
            <div class="flex-grow"></div>
            <p-button
              :disabled="!provider.selected || !region.selected"
              @click="getRecommendModelList"
            >
              Search
            </p-button>
          </section>
          <!-- Query Parameters를 가로로 배치 -->
          <section class="select-service-box flex w-full items-center gap-4">
            <!-- Candidate Limit with tooltip -->
            <p class="text-label-lg font-bold" title="Maximum number of recommended infrastructures to return (default: 3)">Candidate Limit</p>
            <input
              v-model.number="candidateLimit"
              type="number"
              :min="1"
              :max="10"
              class="p-2 border rounded"
              style="width: 80px"
              placeholder="3"
              title="Maximum number of recommended infrastructures to return (default: 3)"
            />
            
            <!-- Minimum Match Rate with tooltip -->
            <p class="text-label-lg font-bold" title="Minimum match rate threshold for highly-matched classification (default: 90.0, range: 0-100)">Minimum Match Rate(%)</p>
            <input
              v-model.number="minimumMatchRateMin"
              type="number"
              :min="1"
              :max="100"
              step="1"
              class="p-2 border rounded"
              style="width: 80px"
              placeholder="Min"
              title="Minimum match rate threshold for highly-matched classification (default: 90.0, range: 0-100)"
            />
            <span class="text-label-lg">~</span>
            <input
              v-model.number="minimumMatchRateMax"
              type="number"
              :min="1"
              :max="100"
              step="1"
              class="p-2 border rounded"
              style="width: 80px"
              placeholder="Max"
              title="Maximum match rate threshold for highly-matched classification (default: 100, range: 0-100)"
            />
          </section>
          <p-toolbox-table
            ref="toolboxTable"
            :items="recommendInfraModel.tableModel.tableState.displayItems"
            :fields="recommendInfraModel.tableModel.tableState.fields"
            :total-count="recommendInfraModel.tableModel.tableState.tableCount"
            :style="{ height: '500px' }"
            :sortable="recommendInfraModel.tableModel.tableOptions.sortable"
            :sort-by="recommendInfraModel.tableModel.tableOptions.sortBy"
            :selectable="
              recommendInfraModel.tableModel.tableOptions.selectable
            "
            :loading="resGetRecommendCost.isLoading.value"
            :select-index.sync="
              recommendInfraModel.tableModel.tableState.selectIndex
            "
            :multi-select="false"
            @change="recommendInfraModel.tableModel.handleChange"
          >
            <template #col-spec-format="{ item }">
              <span v-html="formatEmptyValue(item.spec)"></span>
            </template>
            <template #col-image-format="{ item }">
              <span v-html="formatEmptyValue(item.image)"></span>
            </template>
          </p-toolbox-table>
        </div>
      </template>
      <template #buttons>
        <p-button style-type="tertiary" @click="handleModal">cancel</p-button>
        <p-button @click="modalState.targetModal = true">
          Save as a Target Model
        </p-button>
      </template>
    </create-form>
    <simple-edit-form
      v-if="modalState.targetModal"
      header-title="Save Target Model"
      name=""
      name-label="Model name"
      name-placeholder="Model name"
      @update:save-modal="handleSave"
      @update:close-modal="modalState.targetModal = false"
    />
    <p-icon-modal
      size="md"
      :visible="modalState.checkModal"
      icon-name="ic_check-circle"
      header-title="The Target Model was successfully saved."
      button-text="Confirm"
      @clickButton="handleConfirm"
    >
      <template #body>
        <target-model-name-save :model-name="modelName" />
      </template>
    </p-icon-modal>
  </div>
</template>

<style scoped lang="postcss">
.layout {
  padding: 32px 16px;

  .title {
    font-size: 18px;
    font-weight: 400;
  }
}

.model-name {
  font-size: 14px;
  font-weight: 700;
}

.divider {
  margin: 7.5px 0 16px 0;
}

:deep(.menu-container) {
  max-height: 190px;
  overflow-y: auto;
}

.parameters-section {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.parameter-input input {
  width: 120px;
}
</style>
