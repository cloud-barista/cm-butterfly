<script setup lang="ts">
import { PButton, PIconModal } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { RecommendedModelList } from '@/pages/models';
import { TargetModelNameSave } from '@/features/models';
import { reactive, ref, watch } from 'vue';
import { SimpleEditForm } from '@/widgets/layout';
import { IRecommendedModel } from '@/entities/recommendedModel/model/types';
import { useTargetModelStore } from '@/entities';
import { dateType } from '@/entities';

const targetModelStore = useTargetModelStore();

interface iProps {
  sourceModelName: string;
  recommendedModelList: IRecommendedModel[];
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

function handleSave() {
  modalState.targetModal = false;
  modalState.checkModal = true;
}

watch(
  [modelName, description],
  nv => {
    if (nv[0] !== '')
      targetModelStore.setTargetModel({
        name: nv[0],
        id: '20001',
        description: nv[1],
        migrationType: 'Data',
        custom: 'Custom',
        createdDateTime: dateType,
        updatedDateTime: dateType,
        modelType: 'Target',
        customAndViewJSON: {},
        workflowTool: 'Airflow',
      });
  },
  { immediate: true },
);
</script>

<template>
  <div>
    <create-form
      class="page-modal-layout"
      title="Recommend Model"
      :badge-title="sourceModelName"
      first-title="Recommend Model List"
      @update:modal-state="handleModal"
    >
      <template #add-info>
        <recommended-model-list
          :recommended-model-list="recommendedModelList"
          @select-row="handleClickRecommendedModelId"
        />
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
      name-label="Model name"
      name-placeholder="Model name"
      @update:save-modal="handleSave"
      @update:close-modal="modalState.targetModal = false"
      @update:name-value="e => (modelName = e)"
      @update:description="e => (description = e)"
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
