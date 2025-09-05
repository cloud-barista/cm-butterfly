<script setup lang="ts">
import { PTab, PButton } from '@cloudforet-test/mirinae';
import { ref, reactive } from 'vue';
import { SimpleEditForm } from '@/widgets/layout';
import {
  TaskComponentsDetail,
  TaskComponentsList,
  WorkflowJsonViewer,
} from '@/widgets/workflow';
import { useGetTaskComponent, useUpdateTaskComponent } from '@/entities';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';

const getTaskComponent = useGetTaskComponent(null);
const updateTaskComponent = useUpdateTaskComponent(null, null);

const pageName = 'Task Components';

const selectedTaskComponentId = ref<string>('');
const taskComponentName = ref<string>('');
const taskComponentJson = ref<object>({});
const tcIdData = ref<object>({});

const modalState = reactive({
  addTaskComponent: {
    open: false,
    trigger: false,
    updateTrigger() {
      this.trigger = false;
    },
  },

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

const schema = {
  json: true,
  properties: {
    options: {
      type: 'object',
      title: 'Options',
    },
    param_option: {
      type: 'object',
      title: 'Param Option',
    },
  },
};

function handleClickTemplateComponentId(id: string) {
  selectedTaskComponentId.value = id;
}

async function handleUpdateTaskComponent(updatedData: object) {
  try {
    const { data } = await updateTaskComponent.execute({
      pathParams: {
        tcId: selectedTaskComponentId.value,
      },
      request: {
        data: updatedData,
      },
    });

    if (
      data.responseData &&
      updatedData !== null &&
      Object.keys(updatedData).length > 0
    ) {
      modalState.addTaskComponent.trigger = true;
      showSuccessMessage(
        'success',
        'Task Component data updated successfully.',
      );
    } else {
      showErrorMessage('error', 'Task Component data cannot be null.');
    }
  } catch (error) {
    console.error(error);
    showErrorMessage('error', 'Task Component data cannot be null.');
  }
}

async function getTaskComponentById() {
  try {
    const { data } = await getTaskComponent.execute({
      pathParams: {
        tcId: selectedTaskComponentId.value,
      },
    });

    if (
      data.responseData?.data &&
      Object.values(data.responseData.data).length > 0
    ) {
      tcIdData.value = data.responseData?.data;
    }
  } catch (error) {
    showErrorMessage('error', 'Failed to get the task component.');
  }
}

// watchEffect(async () => {
//   if (selectedTaskComponentId.value.length > 0) {
//     await getTaskComponentById();
//     console.log(tcIdData.value);
//   }
// });

async function handleUpdateTaskComponentEdit() {
  try {
    //get api true??
    // TODO: api
    if (selectedTaskComponentId.value.length > 0) {
      await getTaskComponentById()
        .then(async () => {
          const { data } = await updateTaskComponent.execute({
            pathParams: {
              tcId: selectedTaskComponentId.value,
            },
            request: {
              data: tcIdData.value,
              name: taskComponentName.value,
            },
          });

          if (data.responseData?.data !== null) {
            showSuccessMessage(
              'success',
              'Task Component data updated successfully.',
            );
            modalState.addTaskComponent.trigger = true;
          }
        })
        .catch(() => {
          showErrorMessage('error', 'Failed to get the task component.');
        });
    }
    // updateTaskComponent.execute({
    //   pathParams: {
    //     tcId: selectedTaskComponentId.value,
    //   },
    //   request: {
    //     data: updatedData
    //   }
    // })
  } catch (error) {
    showErrorMessage('error', 'Failed to update the task component.');
  }
}
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header>
      <p>{{ pageName }}</p>
    </header>
    <section :class="`${pageName}-page-body`">
      <task-components-list
        :trigger="modalState.addTaskComponent.trigger"
        @select-row="handleClickTemplateComponentId"
        @update:trigger="modalState.addTaskComponent.updateTrigger()"
      />
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
              @update:task-component-json="e => (taskComponentJson = e)"
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
        :name="taskComponentName"
        @update:save-modal="
          () => {
            modalState.editModal.open = false;
            handleUpdateTaskComponentEdit();
          }
        "
        @update:close-modal="modalState.editModal.open = false"
        @update:name-value="e => (taskComponentName = e)"
      />
    </div>
    <div class="relative z-70">
      <workflow-json-viewer
        v-if="modalState.taskComponentJsonModal.open"
        :name="taskComponentName"
        :schema="schema"
        title="Custom & View Task Component"
        :json="taskComponentJson"
        :read-only="false"
        @update:close-modal="modalState.taskComponentJsonModal.open = false"
        @update:api="handleUpdateTaskComponent"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>
