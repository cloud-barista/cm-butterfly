<script setup lang="ts">
import {
  PButton,
  PIconModal,
  PToolboxTable,
  PSelectDropdown,
  PFieldTitle,
} from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { TargetModelNameSave } from '@/features/models';
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { SimpleEditForm } from '@/widgets/layout';
import { useRecommendedInfraModel } from '@/widgets/models/recommendedInfraModel/model/useRecommendedInfraModel.ts';
import { createTargetModel, ISourceModelResponse } from '@/entities';
import {
  getRecommendCost,
  useGetRecommendModelListBySourceModel,
} from '@/entities/recommendedModel/api';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';
import { IRecommendModelResponse } from '@/entities/recommendedModel/model/types.ts';
import { useGetProviderList, useGetRegionList } from '@/entities/provider/api';

interface IProps {
  sourceModelName: string;
  sourceModelId: string;
}

const props = defineProps<IProps>();

const emit = defineEmits(['update:close-modal']);

const recommendModel_Model = useRecommendedInfraModel();

const selectedRecommendedModelId = ref<string>('');
const modelName = ref<string>('');
const description = ref<string>('');

const resGetProviderList = useGetProviderList();
const resGetRegionList = useGetRegionList(null);

const resCreateTargetModel = createTargetModel(null);
const resGetRecommendCost = getRecommendCost(null);

const provider = reactive({
  menu: [],
  loading: true,
  selected: '',
});

const region = reactive({
  menu: [],
  loading: true,
  selected: '',
});

async function handleProviderMenuClick(e: any) {
  if (!e) return;

  provider.loading = true;
  const { data } = await resGetProviderList.execute();

  if (data.responseData) {
    provider.menu = recommendModel_Model.generateProviderSelectMenu(
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
    region.menu = recommendModel_Model.generateRegionSelectMenu(
      data.responseData,
    );
  }

  region.loading = false;
}

const targetSourceModel = computed(() =>
  recommendModel_Model.sourceModelStore.getSourceModelById(props.sourceModelId),
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
  recommendModel_Model.initToolBoxTableModel();
  handleProviderMenuClick(true);
});

async function getRecommendModelList() {
  recommendModel_Model.initToolBoxTableModel();

  try {
    const res = await getRecommendModel.execute({
      request: {
        desiredProvider: provider.selected,
        desiredRegion: region.selected,
        onpremiseInfraModel: targetSourceModel.value
          ? targetSourceModel.value.onpremiseInfraModel
          : null,
      },
    });

    const recommendModel = res.data.responseData;

    if (recommendModel) {
      const validationRes = recommendModel.targetInfra.vm.some(vm => {
        return vm.commonSpec === '';
      });

      if (validationRes) {
        throw new Error();
      }

      const specsWithFormat = recommendModel.targetInfra.vm.map(vm => {
        return {
          commonSpec: vm.commonSpec,
          commonImage: vm.commonImage,
        };
      });

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
        recommendModel_Model.setTargetRecommendModel(recommendModel);
      }
    }
  } catch (err) {
    showErrorMessage('error', err.errorMsg);
    recommendModel_Model.targetRecommendModel.value = null;
    recommendModel_Model.initToolBoxTableModel();
  } finally {
    recommendModel_Model.setTableStateItem();
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
      recommendModel_Model.tableModel.tableState.displayItems[
        recommendModel_Model.tableModel.tableState.selectIndex
      ].originalData;

    const commonSpecSplitData =
      selectedModel.targetInfra.vm[0].commonSpec.split('+');

    resCreateTargetModel
      .execute({
        request: {
          cloudInfraModel: selectedModel.targetInfra,
          csp: commonSpecSplitData[0],
          description: description.value,
          isInitUserModel: true,
          isTargetModel: true,
          region: commonSpecSplitData[1],
          userModelName: modelName.value,
          userModelVersion: '1',
          zone: '',
          userId: recommendModel_Model.userStore.id,
        },
      })
      .then(res => {
        modalState.targetModal = false;
        modalState.checkModal = true;
      })
      .catch();
  } catch (e) {
    showErrorMessage('error', e);
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
                  getRecommendModelList();
                }
              "
            ></p-select-dropdown>
          </section>
          <p-toolbox-table
            ref="toolboxTable"
            :items="recommendModel_Model.tableModel.tableState.displayItems"
            :fields="recommendModel_Model.tableModel.tableState.fields"
            :total-count="recommendModel_Model.tableModel.tableState.tableCount"
            :style="{ height: '500px' }"
            :sortable="recommendModel_Model.tableModel.tableOptions.sortable"
            :sort-by="recommendModel_Model.tableModel.tableOptions.sortBy"
            :selectable="
              recommendModel_Model.tableModel.tableOptions.selectable
            "
            :loading="
              getRecommendModel.isLoading.value ||
              resGetRecommendCost.isLoading.value
            "
            :select-index.sync="
              recommendModel_Model.tableModel.tableState.selectIndex
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
