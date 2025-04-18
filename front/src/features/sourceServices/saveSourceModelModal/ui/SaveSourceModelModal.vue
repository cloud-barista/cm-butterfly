<script setup lang="ts">
import { PButtonModal, PPaneLayout } from '@cloudforet-test/mirinae';
import { SourceModelTextInput } from '@/features/sourceServices';
import { i18n } from '@/app/i18n';
import { ref, watchEffect } from 'vue';

interface iProps {
  headerTitle: string;
  nameLabel: string;
}

const props = defineProps<iProps>();

const emit = defineEmits(['update:save-modal']);

const name = ref<string>('');
const description = ref<string>('');

const handleName = (value: any) => {
  name.value = value;
};

const handleDescription = (value: any) => {
  description.value = value;
};

const isTextInputBlank = ref<boolean>(false);

watchEffect(
  () => {
    name.value !== ''
      ? (isTextInputBlank.value = true)
      : (isTextInputBlank.value = false);
  },
  { flush: 'post' },
);
</script>

<template>
  <p-button-modal
    :visible="true"
    :header-title="props.headerTitle"
    size="md"
    :disabled="!isTextInputBlank"
    @confirm="emit('update:save-modal')"
    @cancel="emit('update:save-modal')"
    @close="emit('update:save-modal')"
  >
    <template #body>
      <p-pane-layout class="layout">
        <source-model-text-input
          :name-label="nameLabel"
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
