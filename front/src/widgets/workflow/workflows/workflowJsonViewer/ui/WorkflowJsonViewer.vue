<script setup lang="ts">
import {
  PButton,
  PJsonSchemaForm,
  PTextEditor,
} from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { JsonEditor } from '@/widgets/layout';
import { useUpdateWorkflow } from '@/entities/workflowManagement';
import { watchEffect, ref, watch, computed } from 'vue';
import { showSuccessMessage, showErrorMessage } from '@/shared/utils';

const updateWorkflow = useUpdateWorkflow(null, null);

interface iProps {
  title: string;
  workflowId: string | any;
  workflowName: string;
  workflowJson: object | null | undefined | any;
}

const props = defineProps<iProps>();

const emit = defineEmits(['update:close-modal']);

const updatedData = ref(props.workflowJson);

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

function handleModal() {
  emit('update:close-modal', false);
}

function handleSchemaUpdate(data: any) {
  updatedData.value = data;
}

async function handleSave() {
  emit('update:close-modal', false);
  // TODO: update api (only data)
  if (updatedData.value !== null) {
    const { data } = await updateWorkflow.execute({
      pathParams: {
        wfId: props.workflowId,
      },
      request: updatedData.value,
      // pathParams: {
      //   wfId: props.workflowId,
      // },
      // request: updatedData.value,
    });

    console.log(data);
  } else {
    showErrorMessage('Workflow data cannot be null.', 'error');
  }
}
</script>

<template>
  <create-form
    class="page-modal-layout"
    :badge-title="workflowName"
    :title="title"
    first-title="JSON Viewer"
    @update:modal-state="handleModal"
  >
    <template #add-info>
      <json-editor
        title="Target Model"
        :json="schema.json"
        :shema-properties="schema.properties"
        :form-data="updatedData"
        @update:form-data="handleSchemaUpdate"
      />
    </template>
    <template #buttons>
      <p-button
        style-type="tertiary"
        @click="emit('update:close-modal', false)"
      >
        Cancel
      </p-button>
      <p-button @click="handleSave">Save</p-button>
    </template>
  </create-form>
</template>
