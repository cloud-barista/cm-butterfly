<script setup lang="ts">
import { PTab, PButton } from '@cloudforet-test/mirinae';
import { SourceModelList } from '@/widgets/models/sourceModels';
import { SourceModelDetail } from '@/widgets/models/sourceModels';
import { CustomViewSourceModel } from '@/widgets/models/sourceModels';
import { RecommendedModel } from '@/widgets/models/sourceModels';
import { reactive, ref } from 'vue';
import { SimpleEditForm } from '@/widgets/layout';

const pageName = 'Source Models';

const selectedSourceModelId = ref<string>('');
const sourceModelName = ref<string>('');

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
  customViewJsonModal: { open: false, trigger: false },
  editModelModal: { open: false, trigger: false },
  viewRecommendedListModal: { open: false, trigger: false },
});

function handleClickSourceModelId(id: string) {
  selectedSourceModelId.value = id;
}

function handleJsonModal(value: boolean) {
  modalState.customViewJsonModal.open = value;
}

const recommendedModelList = ref<any>([]);
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header>
      <p>{{ pageName }}</p>
    </header>
    <section :class="`${pageName}-page-body`">
      <source-model-list @select-row="handleClickSourceModelId" />
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
              @update:view-recommend-list-modal="
                e => (modalState.viewRecommendedListModal.open = e)
              "
              @update:source-model-name="e => (sourceModelName = e)"
              @update:recommended-model-list="e => (recommendedModelList = e)"
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
        :name-placeholder="'Model Name'"
        @update:save-modal="modalState.editModelModal.open = false"
        @update:close-modal="modalState.editModelModal.open = false"
      />
    </div>
    <div class="relative z-70">
      <custom-view-source-model
        v-if="modalState.customViewJsonModal.open"
        :source-model-name="sourceModelName"
        @update:close-modal="handleJsonModal"
      />
      <recommended-model
        v-if="modalState.viewRecommendedListModal.open"
        :source-model-name="sourceModelName"
        :recommended-model-list="recommendedModelList"
        @update:close-modal="
          e => (modalState.viewRecommendedListModal.open = e)
        "
      />
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>
