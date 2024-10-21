<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { SimpleEditForm } from '@/widgets/layout';
import { JsonEditor } from '@/widgets/layout';
import { ref } from 'vue';

const formData = {
  os_version: 'Amazon Linux release 2 (Karoo)',
  os: 'Amazon Linux 2',
  email: 'glee@mz.co.kr',
};

const modelName = ref<string>('');

interface iProps {
  targetModelName: string;
}

const props = defineProps<iProps>();

const emit = defineEmits(['update:close-modal']);

const targetModalState = ref<boolean>(false);

function handleModal() {
  emit('update:close-modal', false);
  targetModalState.value = false;
}

function handleModelName(value: string) {
  modelName.value = value;
}

const schema = {
  json: true,
  properties: {
    os_version: {
      type: 'string',
      title: 'OS Version',
    },
    os: {
      type: 'string',
      title: 'OS',
    },
    email: {
      type: 'string',
      title: 'Email',
    },
  },
};
</script>

<template>
  <div>
    <create-form
      class="page-modal-layout"
      :badge-title="targetModelName"
      title="Custom & View Target Model"
      first-title="JSON Viewer"
      @update:modal-state="handleModal"
    >
      <template #add-info>
        <json-editor
          :form-data="formData"
          title="Target Model"
          :read-only="false"
          :json="schema.json"
          :shema-properties="schema.properties"
        />
      </template>
      <template #buttons>
        <p-button
          style-type="tertiary"
          @click="$emit('update:close-modal', false)"
        >
          Cancel
        </p-button>
        <p-button @click="targetModalState = true"> Save </p-button>
      </template>
    </create-form>
    <simple-edit-form
      v-if="targetModalState"
      header-title="Save Target Model"
      name=""
      name-label="Name"
      name-placeholder="Target Model Name"
      @update:save-modal="handleModal"
      @update:close-modal="targetModalState = false"
      @update:name-value="handleModelName"
    />
  </div>
</template>

<style scoped lang="postcss"></style>
