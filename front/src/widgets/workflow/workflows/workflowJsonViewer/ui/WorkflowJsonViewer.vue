<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { JsonEditor } from '@/features/sourceServices';

const formData = {
  os_version: 'Amazon Linux release 2 (Karoo)',
  os: 'Amazon Linux 2',
  email: 'glee@mz.co.kr',
};

interface iProps {
  title: string;
  workflowName: string;
}

const props = defineProps<iProps>();

const emit = defineEmits(['update:close-modal']);

function handleModal() {
  emit('update:close-modal', false);
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
        :form-data="JSON.stringify(formData)"
        read-only
      />
    </template>
    <template #buttons>
      <p-button
        style-type="tertiary"
        @click="emit('update:close-modal', false)"
      >
        Cancel
      </p-button>
      <p-button @click="emit('update:close-modal', false)">Save</p-button>
    </template>
  </create-form>
</template>

<style scoped lang="postcss"></style>
