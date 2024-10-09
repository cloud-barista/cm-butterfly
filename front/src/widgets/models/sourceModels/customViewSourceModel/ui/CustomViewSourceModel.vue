<script setup lang="ts">
import {
  PButton,
  PIconModal,
  PPaneLayout,
  PDivider,
} from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { JsonEditor } from '@/features/sourceServices';
import { i18n } from '@/app/i18n';
import { SimpleEditForm } from '@/widgets/layout';
import { useRouter } from 'vue-router/composables';
import { reactive } from 'vue';

const router = useRouter();

const formData = {
  os_version: 'Amazon Linux release 2 (Karoo)',
  os: 'Amazon Linux 2',
  email: 'glee@mz.co.kr',
};

const emit = defineEmits(['update:close-modal']);

const modalState = reactive({
  targetModal: false,
  checkModal: false,
});

function handleModal() {
  // emit('update:close-modal', false);
  modalState.targetModal = false;
  modalState.checkModal = true;
}

function handleSave() {
  modalState.targetModal = true;
}

function handleConfirm() {
  modalState.targetModal = false;
  modalState.checkModal = false;
  emit('update:close-modal', false);
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
      v-if="modalState.targetModal"
      header-title="Save Target Model"
      name-label="Model Name"
      name-placeholder="Model Name"
      @update:save-modal="handleModal"
      @update:close-modal="modalState.targetModal = false"
    />
    <p-icon-modal
      size="sm"
      :visible="modalState.checkModal"
      icon-name="ic_check-circle"
      header-title="The Target Model was successfully saved."
      button-text="Confirm"
      @clickButton="handleConfirm"
    >
      <template class="modal-body" #body>
        <p-pane-layout class="layout">
          <p class="title">Target Model Name</p>
          <div>
            <p class="model-name">modelname01</p>
            <p-divider />
            <p-button
              style-type="secondary"
              icon-left="ic_arrow-right"
              @click="() => router.push({ name: 'targetmodels' })"
              >Go to Target Model List</p-button
            >
          </div>
        </p-pane-layout>
      </template>
    </p-icon-modal>
  </div>
</template>

<style scoped lang="postcss">
.modal-body {
  @apply flex flex-row;
  margin: 0 auto;
}
.layout {
  padding: 32px 16px;
  .title {
    font-size: 18px;
    font-weight: 400;
  }
}
</style>
