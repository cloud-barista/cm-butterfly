<script setup lang="ts">
import { PTab, PButton } from '@cloudforet-test/mirinae';
import { ref, reactive } from 'vue';
import {
  WorkflowList,
  WorkflowDetail,
  WorkflowJsonViewer,
} from '@/widgets/workflow';
import { SimpleEditForm } from '@/widgets/layout';
import { useGetWorkflow, useUpdateWorkflow } from '@/entities';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';
import WorkflowEditor from '@/features/workflow/workflowEditor/ui/WorkflowEditor.vue';

const getWorkflow = useGetWorkflow(null);
const updateWorkflow = useUpdateWorkflow(null, null);

const pageName = 'Workflows';

const selectedWorkflowId = ref<string>('');
const workflowName = ref<string>('');
const workflowJson = ref<object>({});
const wfIdData = ref<object>({});

const modalState = reactive({
  addWorkflow: {
    open: false,
    trigger: false,
    updateTrigger() {
      this.trigger = false;
    },
  },

  editModal: { open: false },
  workflowToolModal: { open: false },
  workflowJsonModal: { open: false },
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

function handleClickWorkflowId(id: string) {
  selectedWorkflowId.value = id;
}

async function getWorkflowById() {
  try {
    const { data } = await getWorkflow.execute({
      pathParams: {
        wfId: selectedWorkflowId.value,
      },
    });

    if (
      data.responseData?.data &&
      Object.values(data.responseData.data).length > 0
    ) {
      wfIdData.value = data.responseData?.data;
    }
  } catch (error) {
    showErrorMessage('error', 'Failed to get the workflow.');
  }
}

// watch(selectedWorkflowId, () => {
//   getWorkflowById();
// });

async function handleUpdateWorkflowEdit() {
  try {
    if (selectedWorkflowId.value.length > 0) {
      await getWorkflowById();

      if (Object.values(wfIdData.value).length > 0) {
        const { data } = await updateWorkflow.execute({
          pathParams: {
            wfId: selectedWorkflowId.value,
          },
          request: {
            data: wfIdData.value,
            name: workflowName.value,
          },
        });

        if (data.responseData?.data !== null) {
          showSuccessMessage('success', 'Workflow data updated successfully.');
          modalState.addWorkflow.trigger = true;
        }
      }
    }
  } catch (error) {
    showErrorMessage('error', 'Failed to update the workflow.');
  }
}

async function handleUpdateWorkflow(updatedData: object) {
  try {
    const { data } = await updateWorkflow.execute({
      pathParams: {
        wfId: selectedWorkflowId.value,
      },
      request: {
        data: updatedData,
      },
    });

    if (
      data.responseData?.data.description !== '' &&
      data.responseData?.data.task_groups !== null
    ) {
      modalState.addWorkflow.trigger = true;
      showSuccessMessage('success', 'Workflow data updated successfully.');
    } else {
      // modalState.addWorkflow.trigger = true;
      showErrorMessage('error', 'Workflow data cannot be null.');
    }
  } catch (error) {
    showErrorMessage(
      'error',
      'Failed to update the workflow. (Error:wrong dependency found in migrate_infra.infra_get (infra_impor111t))',
    );
  }
}
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header>
      <p>{{ pageName }}</p>
    </header>
    <section :class="`${pageName}-page-body`">
      <workflow-list
        :trigger="modalState.addWorkflow.trigger"
        :selected-wf-id="selectedWorkflowId"
        @select-row="handleClickWorkflowId"
        @update:trigger="modalState.addWorkflow.updateTrigger()"
      />
      <p v-if="!selectedWorkflowId" class="more-details">
        Select an item for more details.
      </p>
      <div v-if="selectedWorkflowId">
        <p-tab v-model="mainTabState.activeTab" :tabs="mainTabState.tabs">
          <template #details>
            <div class="tab-section-header">
              <p>Workflow Information</p>
              <p-button
                style-type="tertiary"
                icon-left="ic_edit"
                @click="
                  () => {
                    modalState.editModal.open = true;
                  }
                "
              >
                Edit
              </p-button>
            </div>
            <workflow-detail
              :selected-workflow-id="selectedWorkflowId"
              @update:workflow-json-modal="
                modalState.workflowJsonModal.open = true
              "
              @update:workflow-tool-modal="
                e => (modalState.workflowToolModal.open = e)
              "
              @update:workflow-name="e => (workflowName = e)"
              @update:workflow-json="e => (workflowJson = e)"
            />
          </template>
        </p-tab>
      </div>
    </section>
    <div class="relative z-60">
      <simple-edit-form
        v-if="modalState.editModal.open"
        :name="workflowName"
        header-title="Edit Workflow"
        name-label="Workflow Name"
        name-placeholder="Workflow Name"
        @update:save-modal="
          () => {
            modalState.editModal.open = false;
            handleUpdateWorkflowEdit();
          }
        "
        @update:close-modal="modalState.editModal.open = false"
        @update:name-value="e => (workflowName = e)"
        @update:trigger="modalState.addWorkflow.trigger = true"
      />
    </div>
    <div class="relative z-70">
      <workflow-json-viewer
        v-if="modalState.workflowJsonModal.open"
        :name="workflowName"
        title="Custom & View Workflow"
        :json="workflowJson"
        :schema="schema"
        :read-only="false"
        @update:close-modal="e => (modalState.workflowJsonModal.open = e)"
        @update:api="handleUpdateWorkflow"
      />
      <WorkflowEditor
        v-if="modalState.workflowToolModal.open"
        @update:close-modal="e => (modalState.workflowToolModal.open = e)"
        :tool-type="'edit'"
        :wft-id="selectedWorkflowId"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>
