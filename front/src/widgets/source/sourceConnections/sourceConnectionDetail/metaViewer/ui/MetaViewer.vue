<script setup lang="ts">
import { JsonViewer } from '@/widgets/sourceServices';
import CreateForm from '@/widgets/layout/createForm/ui/CreateForm.vue';
import { PButton } from '@cloudforet-test/mirinae';
import { i18n } from '@/app/i18n';
import { SimpleEditForm } from '@/widgets/layout';
import { ref } from 'vue';

interface iProps {
  infraData: string | undefined;
  sourceConnectionName: string;
}

const props = defineProps<iProps>();

const emit = defineEmits(['update:is-meta-viewer-opened']);

const isConverted = ref<boolean>(false);
const isSaveModal = ref<boolean>(false);

const handleSave = () => {
  isSaveModal.value = true;
};

const handleMetaViewer = () => {
  isSaveModal.value = false;
  emit('update:is-meta-viewer-opened');
};
</script>

<template>
  <div class="page-modal-layout">
    <create-form
      title="Source Connection Viewer"
      :badge-title="sourceConnectionName"
      @update:modal-state="emit('update:is-meta-viewer-opened', false)"
    >
      <template #add-info>
        <json-viewer
          :form-data="infraData"
          @update:is-converted="isConverted = true"
        />
      </template>
      <template #buttons>
        <p-button
          style-type="tertiary"
          @click="emit('update:is-meta-viewer-opened')"
        >
          {{ i18n.t('COMPONENT.BUTTON_MODAL.CANCEL') }}
        </p-button>
        <p-button :disabled="!isConverted" @click="handleSave">
          {{ i18n.t('COMPONENT.BUTTON_MODAL.SAVE') }}
        </p-button>
      </template>
    </create-form>
    <simple-edit-form
      v-if="isSaveModal"
      name=""
      header-title="Save Source Modal"
      name-label="Name"
      name-placeholder="Source Service name"
      @update:close-modal="isSaveModal = false"
      @update:save-modal="handleMetaViewer"
    />
    <!-- <save-source-model-modal
      v-if="isSaveModal"
      header-title="Save Source Model"
      name-label="Source Service name"
      @update:save-modal="handleMetaViewer"
    /> -->
  </div>
</template>
