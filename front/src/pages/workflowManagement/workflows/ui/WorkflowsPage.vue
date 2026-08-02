<script setup lang="ts">
import { PTab, PButton } from '@cloudforet-test/mirinae';
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router/composables';
import {
  WorkflowList,
  WorkflowDetail,
  WorkflowJsonViewer,
  WorkflowHistory,
  WorkflowRunViewer,
} from '@/widgets/workflow';
import { SimpleEditForm } from '@/widgets/layout';
import {
  useGetWorkflow,
  useUpdateWorkflow,
  useWorkflowStore,
} from '@/entities';
import {
  showErrorMessage,
  showSuccessMessage,
  toErrorMessage,
} from '@/shared/utils';
import WorkflowEditor from '@/features/workflow/workflowEditor/ui/WorkflowEditor.vue';

const getWorkflow = useGetWorkflow(null);
const updateWorkflow = useUpdateWorkflow(null, null);
const workflowStore = useWorkflowStore();
const route = useRoute();

const pageName = 'Workflows';

/**
 * Clone from the run viewer and edit.
 *
 * When you want to change values and run again, *don't edit the original* — the engine does not
 * return "the definition used for that run", so editing the original makes that workflow's past
 * runs show wrong values on screen. Set the clone as selected and open it in the editor.
 */
function handleEditClone(clonedWorkflowId: string) {
  // The viewer already put the clone in the store. Both the list and the editor render from the
  // store, so there's no need to refetch the list here — refetching redraws the table and closes
  // the editor we just opened.
  selectedWorkflowId.value = clonedWorkflowId;
  modalState.workflowToolModal.open = true;
}

/**
 * Open an unrun original in the graphic editor (without cloning). With no run history, editing the original directly is fine.
 */
function handleEditOriginal(workflowId: string) {
  selectedWorkflowId.value = workflowId;
  modalState.workflowToolModal.open = true;
}

/**
 * Open a workflow the graphic editor can't handle (because it's parallel) in the JSON editor.
 * Original (unrun Edit) or clone (run Clone&Edit) — either way, pull the definition from the
 * store by id and pass it to the JSON editor. (The viewer already put the clone in the store.)
 */
/** Open graphs the workflow tool can't move over as-is in the JSON editor */
function handleEditJson(workflowId: string) {
  selectedWorkflowId.value = workflowId;
  const wf = workflowStore.getWorkflowById(workflowId);
  workflowName.value = wf?.name ?? '';
  workflowJson.value = wf?.data ?? {};
  modalState.workflowJsonModal.open = true;
}

/**
 * After saving, send to the run-status view. The usual next step after saving is *running*,
 * and the status screen lets you go on to decide between running and editing.
 */
function handleSavedWorkflow(workflowId: string) {
  if (workflowId) selectedWorkflowId.value = workflowId;
  mainTabState.activeTab = 'runViewer';
  markDefinitionSaved();
}

/**
 * Tell the run status screen that the definition it is showing is no longer the current one.
 *
 * ★ The id is not enough to notice a save. Clone & Edit selects the clone up front, so the id is
 *   already the clone's while it is being edited and does not move when it is saved — the screen
 *   then keeps the definition it read before the edit and shows the old values under the words
 *   "Values from the current definition". Saying it plainly is what this does.
 */
function markDefinitionSaved() {
  runViewerReloadToken.value += 1;
}

const selectedWorkflowId = ref<string>('');
/** Goes up by one on every save — the run status screen reads it as "read the definition again". */
const runViewerReloadToken = ref<number>(0);

/**
 * When arriving after creating a workflow on another screen (the target model).
 *
 * The destination right after saving should be the same even from a different screen — that side
 * can't switch tabs, so it passes which workflow via the query, and here we pick it and open the run status.
 */
onMounted(() => {
  const wfId = route.query.wfId;
  if (typeof wfId === 'string' && wfId) handleSavedWorkflow(wfId);
});

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
  // When a workflow is selected, **show the run status first.** This is where running vs. editing
  // is decided (the buttons differ by whether there is history), and the definition itself is shown as a graph below.
  activeTab: 'runViewer',
  tabs: [
    {
      name: 'details',
      label: 'Details',
    },
    {
      name: 'history',
      label: 'History',
    },
    {
      name: 'runViewer',
      label: 'Run Status',
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

    // The response may arrive without the data wrapper, so read all the way down optionally.
    // This used to throw and fall into the catch, which then showed a hardcoded, unrelated message.
    if (data.responseData?.data?.task_groups != null) {
      modalState.addWorkflow.trigger = true;
      // Same event: saving from the JSON editor dates the definition on screen just as much.
      markDefinitionSaved();
      showSuccessMessage('Success', 'Workflow data updated successfully.');
    } else {
      modalState.addWorkflow.trigger = true;
      showErrorMessage('Error', 'Workflow data cannot be null.');
    }
  } catch (error) {
    showErrorMessage(
      'Error',
      toErrorMessage(error, 'Failed to update the workflow.'),
    );
  }
}
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header>
      <p data-testid="workflow-page-header">{{ pageName }}</p>
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
              @update:workflow-name="e => (workflowName = e)"
              @update:workflow-json="e => (workflowJson = e)"
            />
          </template>
          <template #history>
            <div class="tab-section-header">
              <p>Workflow History</p>
            </div>
            <workflow-history :selected-workflow-id="selectedWorkflowId" />
          </template>
          <template #runViewer>
            <div class="tab-section-header">
              <p>Workflow Run Status</p>
            </div>
            <workflow-run-viewer
              :workflow-id="selectedWorkflowId"
              :reload-token="runViewerReloadToken"
              @edit-json="handleEditJson"
              @view-json="handleEditJson"
              @edit-clone="handleEditClone"
              @edit-original="handleEditOriginal"
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
        :tool-type="'edit'"
        :wft-id="selectedWorkflowId"
        @update:close-modal="e => (modalState.workflowToolModal.open = e)"
        @update:trigger="modalState.addWorkflow.trigger = true"
        @update:saved="handleSavedWorkflow"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>
