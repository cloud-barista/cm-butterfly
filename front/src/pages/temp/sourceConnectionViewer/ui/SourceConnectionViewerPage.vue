<script setup lang="ts">
import { JsonViewer } from '@/widgets/sourceServices';
import CreateForm from '@/widgets/layout/createFormPage/ui/CreateForm.vue';
import { PButton } from '@cloudforet-test/mirinae';
import { i18n } from '@/app/i18n';
</script>

<template>
  <div>
    <create-form title="Source Connection Viewer">
      <template #add-info>
        <json-viewer />
      </template>
      <template #buttons>
        <p-button style-type="tertiary">
          {{ i18n.t('COMPONENT.BUTTON_MODAL.CANCEL') }}
        </p-button>
        <p-button :disabled="true">
          {{ i18n.t('COMPONENT.BUTTON_MODAL.SAVE') }}
        </p-button>
      </template>
    </create-form>
    <!-- <save-source-model-modal /> -->
  </div>
</template>
