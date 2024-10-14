<script setup lang="ts">
import { PTab, PButton } from '@cloudforet-test/mirinae';
import { ref, reactive } from 'vue';
import { SimpleEditForm } from '@/widgets/layout';
import {
  TaskComponentsDetail,
  TaskComponentsList,
  WorkflowJsonViewer,
} from '@/widgets/workflow';

const pageName = 'Task Components';

const selectedTaskComponentId = ref<string>('');
const taskComponentName = ref<string>('');

const modalState = reactive({
  editModal: { open: false, trigger: false },
  taskComponentJsonModal: { open: false, trigger: false },
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

function handleClickTemplateComponentId(id: string) {
  selectedTaskComponentId.value = id;
}
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header>
      <p>{{ pageName }}</p>
    </header>
    <section :class="`${pageName}-page-body`">
      <task-components-list @select-row="handleClickTemplateComponentId" />
      <p v-if="!selectedTaskComponentId" class="more-details">
        Select an item for more details.
      </p>
      <div v-if="selectedTaskComponentId">
        <p-tab v-model="mainTabState.activeTab" :tabs="mainTabState.tabs">
          <template #details>
            <div class="tab-section-header">
              <p>Task Component Information</p>
              <p-button
                style-type="tertiary"
                icon-left="ic_edit"
                @click="modalState.editModal.open = true"
              >
                Edit
              </p-button>
            </div>
            <task-components-detail
              :selected-task-component-id="selectedTaskComponentId"
              @update:task-component-json-modal="
                e => (modalState.taskComponentJsonModal.open = e)
              "
              @update:task-component-name="e => (taskComponentName = e)"
            />
          </template>
        </p-tab>
      </div>
    </section>
    <div class="relative z-60">
      <simple-edit-form
        v-if="modalState.editModal.open"
        header-title="Edit Task Component"
        name-label="Task Component name"
        name-placeholder="Task Component Name"
        @update:save-modal="modalState.editModal.open = false"
        @update:close-modal="modalState.editModal.open = false"
      />
    </div>
    <div class="relative z-70">
      <workflow-json-viewer
        v-if="modalState.taskComponentJsonModal.open"
        title="Custom & View Task Component"
        :workflow-name="taskComponentName"
        @update:close-modal="modalState.taskComponentJsonModal.open = false"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>
