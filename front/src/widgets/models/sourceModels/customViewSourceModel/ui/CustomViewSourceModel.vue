<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { JsonEditor } from '@/features/sourceServices';
import { i18n } from '@/app/i18n';
</script>

<template>
  <create-form
    class="page-modal-layout"
    title="Custom & View Source Model"
    subtitle="JSON Viewer"
  >
    <template #add-info>
      <json-editor :form-data="''" title="Source Model" :read-only="false" />
    </template>
    <template #buttons>
      <p-button style-type="tertiary">
        {{ i18n.t('COMPONENT.BUTTON_MODAL.CANCEL') }}
      </p-button>
      <p-button>
        {{ i18n.t('COMPONENT.BUTTON_MODAL.SAVE') }}
      </p-button>
    </template>
  </create-form>
</template>

<style scoped lang="postcss"></style>
