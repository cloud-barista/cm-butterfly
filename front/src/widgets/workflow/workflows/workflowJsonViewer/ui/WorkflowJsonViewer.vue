<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { JsonEditor } from '@/widgets/layout';
import { ref } from 'vue';

interface iProps {
  title: string;
  name: string;
  json: object | null | undefined | any;
  schema: {
    json: boolean;
    properties: object;
  };
  readOnly: boolean;
}

const props = defineProps<iProps>();

const emit = defineEmits(['update:close-modal', 'update:api']);

const updatedData = ref(props.json);

function handleModal() {
  emit('update:close-modal', false);
}

function handleSchemaUpdate(data: any) {
  updatedData.value = data;
}

async function handleSave() {
  if (updatedData.value !== null) {
    emit('update:close-modal', false);
    emit('update:api', updatedData.value);
  }
}
</script>

<template>
  <create-form
    class="page-modal-layout"
    :badge-title="name"
    :title="title"
    first-title="JSON Viewer"
    @update:modal-state="handleModal"
  >
    <template #add-info>
      <json-editor
        title="Target Model"
        :read-only="readOnly"
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
