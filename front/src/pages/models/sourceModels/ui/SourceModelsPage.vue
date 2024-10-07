<script setup lang="ts">
import { PTab, PButton } from '@cloudforet-test/mirinae';
import { SourceModelList } from '@/widgets/models/sourceModels';
import { SourceModelDetail } from '@/widgets/models/sourceModels';
import { CustomViewSourceModel } from '@/widgets/models/sourceModels';
import { reactive, ref, watch, watchEffect } from 'vue';

const pageName = 'Source Models';

const selectedSourceModelId = ref<string>('');

function handleClickSourceModelId(id: string) {
  selectedSourceModelId.value = id;
}

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
  customViewJsonModal: { open: true, trigger: false },
});
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header>
      <p>{{ pageName }}</p>
    </header>
    <section :class="`${pageName}-page-body`">
      <source-model-list @select-row="handleClickSourceModelId" />
      <p
        v-if="!selectedSourceModelId"
        class="flex justify-center text-gray-300 text-sm font-normal"
      >
        Select an item for more details.
      </p>
      <div v-if="selectedSourceModelId">
        <p-tab v-model="mainTabState.activeTab" :tabs="mainTabState.tabs">
          <template #details>
            <div class="tab-section-header">
              <p>Source Model Information</p>
              <p-button style-type="tertiary" icon-left="ic_edit">
                Edit
              </p-button>
            </div>
            <source-model-detail
              :selected-source-model-id="selectedSourceModelId"
            />
          </template>
        </p-tab>
      </div>
    </section>
    <div class="relative z-60">
      <!-- TODO: small modal -->
    </div>
    <div class="relative z-70">
      <custom-view-source-model v-if="modalState.customViewJsonModal.open" />
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>
