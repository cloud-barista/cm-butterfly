<script setup lang="ts">
import { PButtonModal, PPaneLayout } from '@cloudforet-test/mirinae';
import { SourceModelTextInput } from '@/features/sourceServices';
import { i18n } from '@/app/i18n';
import { computed, ref, watchEffect } from 'vue';

const name = ref<string>('');
const description = ref<string>('');

const handleName = (value: any) => {
  name.value = value;
};

const handleDescription = (value: any) => {
  description.value = value;
};

const isTextInputBlank = computed(() => name.value === '');
</script>

<template>
  <p-button-modal
    :visible="true"
    header-title="Save Source Model"
    size="md"
    :disabled="isTextInputBlank"
  >
    <template #body>
      <p-pane-layout class="layout">
        <source-model-text-input
          @update:model-name="handleName"
          @update:model-description="handleDescription"
        />
      </p-pane-layout>
    </template>
    <template #close-button>
      <span>{{ i18n.t('COMPONENT.BUTTON_MODAL.CANCEL') }}</span>
    </template>
    <template #confirm-button>
      <span>{{ i18n.t('COMPONENT.BUTTON_MODAL.SAVE') }}</span>
    </template>
  </p-button-modal>
</template>

<style scoped lang="postcss">
.layout {
  @apply rounded-[6px] p-[16px] bg-gray-100 border-none;
}
</style>
