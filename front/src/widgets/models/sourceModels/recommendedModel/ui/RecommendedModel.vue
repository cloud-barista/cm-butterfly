<script setup lang="ts">
import { PButton, PIconModal, PToolboxTable } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { TargetModelNameSave } from '@/features/models';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { SimpleEditForm } from '@/widgets/layout';
import { useRecommendedModel } from '@/widgets/models/sourceModels/recommendedModel/model/useRecommendedModel.ts';
import { createTargetModel, ISourceModelResponse } from '@/entities';
import {
  getRecommendCost,
  useGetRecommendModelListBySourceModel,
} from '@/entities/recommendedModel/api';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';
import { IRecommendModelResponse } from '@/entities/recommendedModel/model/types.ts';

interface iProps {
  sourceModelName: string;
  sourceModelId: string;
}

const props = defineProps<iProps>();

const emit = defineEmits(['update:close-modal']);

const selectedRecommendedModelId = ref<string>('');
const modelName = ref<string>('');
const description = ref<string>('');

const modalState = reactive({
  targetModal: false,
  checkModal: false,
});

const recommendModel_Model = useRecommendedModel();
const targetSourceModel = computed(() =>
  recommendModel_Model.sourceModelStore.getSourceModelById(props.sourceModelId),
);
const getRecommendModel = useGetRecommendModelListBySourceModel(
  targetSourceModel.value ? targetSourceModel.value.onpremiseInfraModel : null,
);

const resCreateTargetModel = createTargetModel(null);
const resGetRecommendCost = getRecommendCost(null);

watch(
  () => targetSourceModel,
  () => {
    getRecommendModel
      .execute()
      .then(res => {
        if (res.data.responseData) {
          const commonImage =
            res.data.responseData.targetInfra.vm[0].commonImage;
          const commonSpec = res.data.responseData.targetInfra.vm[0].commonSpec;

          resGetRecommendCost
            .execute({
              request: { specsWithFormat: [{ commonSpec, commonImage }] },
            })
            .then(costRes => {
              if (costRes.data.responseData) {
                recommendModel_Model.setTargetRecommendModel(
                  Object.assign(res.data.responseData, {
                    estimateResponse: costRes.data.responseData,
                  }),
                );
              }
            })
            .catch();
        }
      })
      .catch(err => {
        showErrorMessage('error', err.errorMsg);
      });
  },
  { immediate: true },
);

onMounted(() => {
  recommendModel_Model.initToolBoxTableModel();
});

function handleClickRecommendedModelId(id: string) {
  selectedRecommendedModelId.value = id;
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
        console.log(res);
        modalState.targetModal = false;
        modalState.checkModal = true;
      })
      .catch();
  } catch (e) {
    console.log(e);
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
        <p-toolbox-table
          ref="toolboxTable"
          :items="recommendModel_Model.tableModel.tableState.displayItems"
          :fields="recommendModel_Model.tableModel.tableState.fields"
          :total-count="recommendModel_Model.tableModel.tableState.tableCount"
          :style="{ height: '500px' }"
          :sortable="recommendModel_Model.tableModel.tableOptions.sortable"
          :sort-by="recommendModel_Model.tableModel.tableOptions.sortBy"
          :selectable="recommendModel_Model.tableModel.tableOptions.selectable"
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
      </template>
      <template #buttons>
        <p-button style-type="tertiary">cancel</p-button>
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

:deep(g) {
  fill: #3c2c84;
}
</style>
