<script setup lang="ts">
import {
  PButtonModal,
  PPaneLayout,
  PFieldGroup,
  PTextInput,
  PTextarea,
} from '@cloudforet-test/mirinae';
import { i18n } from '@/app/i18n';
import { ref, watchEffect } from 'vue';

interface iProps {
  headerTitle: string;
  nameLabel: string;
  namePlaceholder: string;
}

const props = defineProps<iProps>();

const emit = defineEmits(['update:save-modal', 'update:close-modal']);

const name = ref<string>('');
const description = ref<string>('');

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
    @cancel="emit('update:close-modal')"
    @close="emit('update:close-modal')"
  >
    <template #body>
      <p-pane-layout class="layout">
        <p-pane-layout class="text-input-layout">
          <p-field-group :label="nameLabel" required>
            <p-text-input v-model="name" :placeholder="namePlaceholder" />
          </p-field-group>
          <p-field-group label="Description">
            <p-textarea v-model="description" />
          </p-field-group>
        </p-pane-layout>
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
.text-input-layout {
  @apply p-[0.75rem] border-none;
  .p-text-input {
    @apply w-full;
  }
}
</style>
