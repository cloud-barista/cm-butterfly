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

const getRecommendModel = useGetRecommendModelListBySourceModel(
  null,
  null,
  null,
);

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
    const res = await getRecommendModel.execute({
      request: {
        desiredCspAndRegionPair: {
          csp: provider.selected,
          region: region.selected,
        },
        onpremiseInfraModel: targetSourceModel.value
          ? targetSourceModel.value.onpremiseInfraModel
          : null,
      },
    });

    const recommendModel = res.data.responseData;
    
    console.log('=== Recommend Model Response ===');
    console.log('Full response:', recommendModel);
    
    if (recommendModel) {
      console.log('Response keys:', Object.keys(recommendModel));
      console.log('targetVmInfra:', recommendModel.targetVmInfra);
      console.log('targetVmInfra type:', typeof recommendModel.targetVmInfra);
      
      if (recommendModel.targetVmInfra) {
        console.log('targetVmInfra keys:', Object.keys(recommendModel.targetVmInfra));
        
        if ('vm' in recommendModel.targetVmInfra && recommendModel.targetVmInfra.vm) {
          console.log('targetVmInfra.vm:', recommendModel.targetVmInfra.vm);
          console.log('VM count:', recommendModel.targetVmInfra.vm.length);
          
          // VM 객체의 상세 구조 확인
          recommendModel.targetVmInfra.vm.forEach((vm, index) => {
            console.log(`VM[${index}]:`, vm);
            console.log(`VM[${index}].specId:`, vm.specId);
            console.log(`VM[${index}].specId type:`, typeof vm.specId);
          });
        }
      }
      
      if ('vm' in recommendModel && recommendModel.vm && Array.isArray(recommendModel.vm)) {
        console.log('direct vm:', recommendModel.vm);
        console.log('Direct VM count:', recommendModel.vm.length);
      }
    }
    
    console.log('=== End Response Log ===');

    if (recommendModel) {
      console.log('=== Validation Data ===');
      console.log('VM array for validation:', recommendModel.targetVmInfra.subGroups);
      
      const validationRes = recommendModel.targetVmInfra.subGroups?.some(vm => {
        console.log('Checking VM:', vm);
        console.log('VM keys:', Object.keys(vm));
        console.log('VM.specId:', vm.specId);
        console.log('VM.imageId:', vm.imageId);
        console.log('VM.specId === undefined:', vm.specId === undefined);
        console.log('VM.specId === null:', vm.specId === null);
        console.log('VM.specId === empty string:', vm.specId === '');
        
        const isInvalid = vm.specId === undefined || vm.specId === null || vm.specId === '';
        console.log('Is invalid:', isInvalid);
        
        return isInvalid;
      });

      console.log('Validation result:', validationRes);

      if (validationRes) {
        console.log('Validation failed - throwing error');
        throw new Error('Validation failed: specId is undefined or null');
      }

      const specsWithFormat = recommendModel.targetVmInfra.subGroups?.map(vm => {
        return {
          specId: vm.specId,
          imageId: vm.imageId,
        };
      }) || [];

      try {
        const estimateCostList = await resGetRecommendCost.execute({
          request: { specsWithFormat },
        });

        Object.assign(recommendModel, {
          estimateResponse: estimateCostList.data.responseData,
        });

      } catch (e) {
        /* empty */
      } finally {
        recommendInfraModel.setTargetRecommendInfraModel(recommendModel);
      }
    }
  } catch (err: any) {
    showErrorMessage('error', err?.errorMsg || 'An error occurred');
    recommendInfraModel.targetRecommendModel.value = null;
    recommendInfraModel.initToolBoxTableModel();
  } finally {
    recommendInfraModel.setTableStateItem();
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
    const selectedVmIndex = recommendInfraModel.tableModel.tableState.selectIndex as number;
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
    
    if (selectedVm.specId && selectedVm.specId.includes('+')) {
      const commonSpecSplitData = selectedVm.specId.split('+');
      csp = commonSpecSplitData[0];
      region = commonSpecSplitData[1];
    }

    resCreateTargetModel
      .execute({
        request: {
          cloudInfraModel: cloudInfraModel, // 가공되지 않은 데이터 전달
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
          <section class="select-service-box flex w-full">
            <p class="text-label-lg font-bold m-2">Provider</p>
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
            <p class="text-label-lg font-bold m-2">Region</p>
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
            <p-button
              class="ml-2"
              :disabled="!provider.selected || !region.selected"
              @click="getRecommendModelList"
            >
              조회
            </p-button>
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
            :loading="
              getRecommendModel.isLoading.value ||
              resGetRecommendCost.isLoading.value
            "
            :select-index.sync="
              recommendInfraModel.tableModel.tableState.selectIndex
            "
            :multi-select="false"
          >
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
</style>
