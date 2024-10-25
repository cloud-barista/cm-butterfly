<script setup lang="ts">
import { PTab, PButton } from '@cloudforet-test/mirinae';
import { TargetModelList } from '@/widgets/models/targetModels';
import { TargetModelDetail } from '@/widgets/models/targetModels';
import { SimpleEditForm } from '@/widgets/layout';
import { CustomViewTargetModel } from '@/widgets/models/targetModels';
import { reactive, ref } from 'vue';

const pageName = 'Target Models';

const selectedTargetModelId = ref<string>('');
const targetModelName = ref<string>('');
const targetModelDescription = ref<string>('');

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
  editModelModal: { open: false, trigger: false },
  customViewJsonModal: { open: false, trigger: false },
  workflowToolModal: { open: false, trigger: false },
});

function handleClickTargetModelId(id: string) {
  selectedTargetModelId.value = id;
}
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header>
      <p>{{ pageName }}</p>
    </header>
    <section :class="`${pageName}-page-body`">
      <target-model-list @select-row="handleClickTargetModelId" />
      <div v-if="selectedTargetModelId">
        <p-tab v-model="mainTabState.activeTab" :tabs="mainTabState.tabs">
          <template #details>
            <div class="tab-section-header">
              <p>Target Model Information</p>
              <p-button
                style-type="tertiary"
                icon-left="ic_edit"
                @click="modalState.editModelModal.open = true"
              >
                Edit
              </p-button>
            </div>
            <target-model-detail
              :selected-target-model-id="selectedTargetModelId"
              @update:custom-view-json-modal="
                modalState.customViewJsonModal.open = true
              "
              @update:target-model-name="e => (targetModelName = e)"
              @update:target-model-description="
                e => (targetModelDescription = e)
              "
            />
          </template>
        </p-tab>
      </div>
      <p v-else class="flex justify-center text-gray-300 text-sm font-normal">
        Select an item for more details.
      </p>
    </section>
    <div class="relative z-60">
      <simple-edit-form
        v-if="modalState.editModelModal.open"
        header-title="Edit Model"
        :name="targetModelName"
        :description="targetModelDescription"
        name-label="Model Name"
        name-placeholder="Model Name"
        @update:save-modal="modalState.editModelModal.open = false"
        @update:close-modal="modalState.editModelModal.open = false"
      />
    </div>
    <div class="relative z-70">
      <custom-view-target-model
        v-if="modalState.customViewJsonModal.open"
        :target-model-name="targetModelName"
        @update:close-modal="modalState.customViewJsonModal.open = false"
      />
    </div>
  </div>
</template>
