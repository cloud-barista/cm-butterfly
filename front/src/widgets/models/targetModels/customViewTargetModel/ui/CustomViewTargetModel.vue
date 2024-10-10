<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { SimpleEditForm } from '@/widgets/layout';
import { JsonEditor } from '@/features/sourceServices';
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
          :form-data="JSON.stringify(formData, null, 2)"
          title="Target Model"
          :read-only="false"
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
      name-label="Name"
      name-placeholder="Target Model Name"
      @update:save-modal="handleModal"
      @update:close-modal="targetModalState = false"
      @update:name-value="handleModelName"
    />
  </div>
</template>

<style scoped lang="postcss"></style>
