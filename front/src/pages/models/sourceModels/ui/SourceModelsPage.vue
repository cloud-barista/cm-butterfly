<script setup lang="ts">
import { PTab, PButton } from '@cloudforet-test/mirinae';
import { SourceModelList } from '@/widgets/models/sourceModels';
import { SourceModelDetail } from '@/widgets/models/sourceModels';
import { CustomViewSourceModel } from '@/widgets/models/sourceModels';
import { RecommendedInfraModel } from '@/widgets/models/sourceModels';
import { RecommendedSoftwareModel } from '@/widgets/models/recommendedSoftwareModel';
import { computed, reactive, ref } from 'vue';
import { SimpleEditForm } from '@/widgets/layout';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';
import { useSourceModelStore, useUpdateSourceModel } from '@/entities';

const pageName = 'Source Models';

const selectedSourceModelId = ref<string>('');
const sourceModelName = ref<string>('');
const recommendedModelList = ref<string>('infra'); // 추가: recommended model list type
const sourceModelStore = useSourceModelStore();
const resUpdateSourceModel = useUpdateSourceModel(null, null);
const sourceModel = computed(() =>
  sourceModelStore.getSourceModelById(selectedSourceModelId.value),
);
const mainTabState = reactive({
  activeTab: 'details',
  tabs: [
    {
      name: 'details',
      label: 'Details',
    },
  ],
});

const modalState = reactive({
  customViewJsonModal: {
    open: false,
    trigger: false,
  },
  editModelModal: {
    open: false,
    trigger: false,
    context: {
      name: '',
      description: '',
    },
    updateTrigger() {
      modalState.editModelModal.trigger = false;
    },
  },
  viewRecommendedListModal: { open: false, trigger: false },
});

function handleClickSourceModelId(data: { id: string; name: string }) {
  console.log(data);
  selectedSourceModelId.value = data.id;
  sourceModelName.value = data.name ?? '';
}

function handleJsonModal(value: boolean) {
  modalState.customViewJsonModal.open = value;
}

function handleRecommendedListModal(value: boolean) {
  modalState.viewRecommendedListModal.open = value;
}

function handleRecommendedModelList(value: string) {
  recommendedModelList.value = value;
}

function handleUpdateSourceModel(e) {
  modalState.editModelModal.open = false;
  modalState.editModelModal.context.name = e.name;
  modalState.editModelModal.context.description = e.description;
  console.log(sourceModel.value);
  const requestBody = Object.assign({}, sourceModel.value, {
    userModelName: e.name,
    description: e.description,
  });
  resUpdateSourceModel
    .execute({
      pathParams: { id: selectedSourceModelId.value },
      request: requestBody,
    })
    .then(res => {
      showSuccessMessage('success', 'Successfully updated target model');
      modalState.editModelModal.trigger = true;
    })
    .catch(e => {
      showErrorMessage('error', e.errorMsg);
    });
}
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header>
      <p>{{ pageName }}</p>
    </header>
    <section :class="`${pageName}-page-body`">
      <source-model-list
        :trigger="modalState.editModelModal.trigger"
        @select-row="handleClickSourceModelId"
        @update:trigger="modalState.editModelModal.updateTrigger"
      />
      <p v-if="!selectedSourceModelId" class="more-details">
        Select an item for more details.
      </p>
      <div v-if="selectedSourceModelId">
        <p-tab v-model="mainTabState.activeTab" :tabs="mainTabState.tabs">
          <template #details>
            <div class="tab-section-header">
              <p>Source Model Information</p>
              <p-button
                style-type="tertiary"
                icon-left="ic_edit"
                @click="modalState.editModelModal.open = true"
              >
                Edit
              </p-button>
            </div>
            <source-model-detail
              :selected-source-model-id="selectedSourceModelId"
              @update:custom-view-json-modal="
                e => (modalState.customViewJsonModal.open = e)
              "
              @update:view-recommend-list-modal="handleRecommendedListModal"
              @update:recommended-model-list="handleRecommendedModelList"
            />
          </template>
        </p-tab>
      </div>
    </section>
    <div class="relative z-60">
      <simple-edit-form
        v-if="modalState.editModelModal.open"
        header-title="Edit Model"
        name-label="Model Name"
        :name="sourceModelName"
        :description="sourceModel?.description ?? ''"
        :name-placeholder="'Model Name'"
        @update:save-modal="handleUpdateSourceModel"
        @update:close-modal="modalState.editModelModal.open = false"
        @update:trigger="modalState.editModelModal.trigger = true"
      />
    </div>
    <div class="relative z-70">
      <custom-view-source-model
        v-if="modalState.customViewJsonModal.open"
        :source-model-name="sourceModelName"
        :source-model-id="selectedSourceModelId"
        @update:close-modal="handleJsonModal"
        @update:trigger="modalState.editModelModal.trigger = true"
      />
      <recommended-infra-model
        v-if="modalState.viewRecommendedListModal.open && recommendedModelList === 'infra'"
        :source-model-name="sourceModelName"
        :source-model-id="selectedSourceModelId"
        @update:close-modal="handleRecommendedListModal"
      />
      <recommended-software-model
        v-if="modalState.viewRecommendedListModal.open && recommendedModelList === 'software'"
        :source-model-name="sourceModelName"
        :source-model-id="selectedSourceModelId"
        @update:close-modal="handleRecommendedListModal"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>
