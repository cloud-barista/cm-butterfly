<script setup lang="ts">
import { PTab, PButton } from '@cloudforet-test/mirinae';
import { ref, reactive } from 'vue';
import {
  WorkflowList,
  WorkflowDetail,
  WorkflowJsonViewer,
} from '@/widgets/workflow';
import { SimpleEditForm } from '@/widgets/layout';

const pageName = 'Workflows';

const selectedWorkflowId = ref<string>('');
const workflowName = ref<string>('');

const modalState = reactive({
  editModal: { open: false, trigger: false },
  workflowToolModal: { open: false, trigger: false },
  workflowJsonModal: { open: false, trigger: false },
});

const mainTabState = reactive({
  activeTab: 'details',
  tabs: [
    {
      name: 'details',
      label: 'Details',
    },
  ],
});

function handleClickWorkflowId(id: string) {
  selectedWorkflowId.value = id;
}
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header>
      <p>{{ pageName }}</p>
    </header>
    <section :class="`${pageName}-page-body`">
      <workflow-list @select-row="handleClickWorkflowId" />
      <p v-if="!selectedWorkflowId" class="more-details">
        Select an item for more details
      </p>
      <div v-if="selectedWorkflowId">
        <p-tab v-model="mainTabState.activeTab" :tabs="mainTabState.tabs">
          <template #details>
            <div class="tab-section-header">
              <p>Workflow Information</p>
              <p-button
                style-type="tertiary"
                icon-left="ic_edit"
                @click="modalState.editModal.open = true"
              >
                Edit
              </p-button>
            </div>
            <workflow-detail
              :selected-workflow-id="selectedWorkflowId"
              @update:workflow-json-modal="
                modalState.workflowJsonModal.open = true
              "
              @update:workflow-name="e => (workflowName = e)"
            />
          </template>
        </p-tab>
      </div>
    </section>
    <div class="relative z-60">
      <simple-edit-form
        v-if="modalState.editModal.open"
        header-title="Edit Workflow"
        name-label="Workflow Name"
        name-placeholder="Workflow Name"
        @update:save-modal="modalState.editModal.open = false"
        @update:close-modal="modalState.editModal.open = false"
      />
    </div>
    <div class="relative z-70">
      <workflow-json-viewer
        v-if="modalState.workflowJsonModal.open"
        title="Custom & View Workflow"
        :workflow-name="workflowName"
        @update:close-modal="e => (modalState.workflowJsonModal.open = e)"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>
