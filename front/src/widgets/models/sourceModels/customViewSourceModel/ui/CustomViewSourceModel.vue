<script setup lang="ts">
import { PButton, PIconModal } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { JsonEditor } from '@/features/sourceServices';
import { i18n } from '@/app/i18n';
import { SimpleEditForm } from '@/widgets/layout';

import { ref } from 'vue';

const formData = {
  os_version: 'Amazon Linux release 2 (Karoo)',
  os: 'Amazon Linux 2',
  email: 'glee@mz.co.kr',
};

const emit = defineEmits(['update:close-modal']);

const targetModalState = ref<boolean>(false);

function handleModal() {
  emit('update:close-modal', false);
}

function handleSave() {
  targetModalState.value = true;
}
</script>

<template>
  <div>
    <create-form
      class="page-modal-layout"
      title="Custom & View Source Model"
      first-title="JSON Viewer"
      @update:modal-state="handleModal"
    >
      <template #add-info>
        <json-editor
          :form-data="JSON.stringify(formData)"
          title="Source Model"
          :read-only="false"
        />
      </template>
      <template #buttons>
        <p-button style-type="tertiary" @click="handleModal">
          {{ i18n.t('COMPONENT.BUTTON_MODAL.CANCEL') }}
        </p-button>
        <p-button @click="handleSave">
          {{ i18n.t('COMPONENT.BUTTON_MODAL.SAVE') }}
        </p-button>
      </template>
    </create-form>
    <simple-edit-form
      v-if="targetModalState"
      header-title="Save Target Model"
      name-label="Model Name"
      name-placeholder="Model Name"
      @update:save-modal="handleModal"
      @update:close-modal="targetModalState = false"
    />
    <p-icon-modal
      size="sm"
      :visible="true"
      icon-name="ic_done"
      header-title="The Target Model was successfully saved."
    />
  </div>
</template>

<style scoped lang="postcss"></style>
