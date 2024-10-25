<script setup lang="ts">
import { PTab, PButton } from '@cloudforet-test/mirinae';
import {
  WorkflowTemplatesList,
  WorkflowTemplatesDetail,
  WorkflowJsonViewer,
} from '@/widgets/workflow';
import { reactive, ref } from 'vue';
// import { SimpleEditForm } from '@/widgets/layout';

const pageName = 'Workflow Templates';

const selectedWorkflowTemplateId = ref<string>('');
const workflowTemplateName = ref<string>('');
const workflowTemplateJson = ref<object>({});

const modalState = reactive({
  addWorkflowTemplate: {
    open: false,
    trigger: false,
    updateTrigger() {
      this.trigger = false;
    },
  },

  editModal: { open: false, trigger: false },
  workflowTemplateJsonModal: { open: false, trigger: false },
});

const mainTabState = {
  activeTab: 'details',
  tabs: [
    {
      name: 'details',
      label: 'Details',
    },
  ],
};

const schema = {
  json: true,
  properties: {
    description: {
      type: 'string',
      title: 'Description',
    },
    task_groups: {
      type: 'array',
      title: 'Task Groups',
    },
  },
};

function handleClickWorkflowTemplateId(id: string) {
  selectedWorkflowTemplateId.value = id;
}
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header>
      <p>{{ pageName }}</p>
    </header>
    <section :class="`${pageName}-page-body`">
      <workflow-templates-list
        :trigger="modalState.addWorkflowTemplate.trigger"
        @select-row="handleClickWorkflowTemplateId"
        @update:trigger="modalState.addWorkflowTemplate.updateTrigger"
      />
      <p v-if="!selectedWorkflowTemplateId" class="more-details">
        Select an item for more details.
      </p>
      <div v-if="selectedWorkflowTemplateId">
        <p-tab v-model="mainTabState.activeTab" :tabs="mainTabState.tabs">
          <template #details>
            <div class="tab-section-header">
              <p>Workflow Template Information</p>
              <!-- TODO: -->
              <p-button
                style-type="tertiary"
                icon-left="ic_edit"
                disabled
                @click="modalState.editModal.open = true"
              >
                Edit
              </p-button>
            </div>
            <workflow-templates-detail
              :selected-workflow-template-id="selectedWorkflowTemplateId"
              @update:workflow-template-json-modal="
                e => (modalState.workflowTemplateJsonModal.open = e)
              "
              @update:workflow-template-name="e => (workflowTemplateName = e)"
              @update:workflow-template-json="e => (workflowTemplateJson = e)"
            />
          </template>
        </p-tab>
      </div>
    </section>
    <div class="relative z-60">
      <!-- <simple-edit-form
        v-if="modalState.editModal.open"
        header-title="Edit Workflow Template"
        name-label="Workflow Template Name"
        name-placeholder="Workflow Template Name"
        @update:save-modal="modalState.editModal.open = false"
        @update:close-modal="modalState.editModal.open = false"
      /> -->
    </div>
    <div class="relative z-70">
      <workflow-json-viewer
        v-if="modalState.workflowTemplateJsonModal.open"
        :read-only="true"
        :schema="schema"
        :name="workflowTemplateName"
        title="Custom & View Workflow Template"
        :json="workflowTemplateJson"
        @update:close-modal="
          e => (modalState.workflowTemplateJsonModal.open = e)
        "
      />
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>
