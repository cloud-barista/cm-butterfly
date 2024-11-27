<script setup lang="ts">
import {
  PButtonModal,
  PPaneLayout,
  PFieldGroup,
  PTextInput,
  PTextarea,
} from '@cloudforet-test/mirinae';
import { i18n } from '@/app/i18n';
import { ref, watch, watchEffect } from 'vue';

interface iProps {
  headerTitle: string;
  nameLabel: string;
  namePlaceholder: string;
  name: string;
  description?: string;
}

const props = defineProps<iProps>();

const emit = defineEmits([
  'update:save-modal',
  'update:close-modal',
  'update:trigger',
]);

const _name = ref<string>(props.name);
const _description = ref<string>(props.description ?? '');

const isTextInputBlank = ref<boolean>(false);

watchEffect(
  () => {
    _name.value !== ''
      ? (isTextInputBlank.value = true)
      : (isTextInputBlank.value = false);
  },
  { flush: 'post' },
);

function handleConfirm() {
  emit('update:save-modal', {
    name: _name.value,
    description: _description.value,
  });
  emit('update:trigger');
}

watch(_name, () => {}, { immediate: true });
</script>

<template>
  <p-button-modal
    :visible="true"
    :header-title="props.headerTitle"
    size="md"
    :disabled="!isTextInputBlank"
    @confirm="handleConfirm"
    @cancel="emit('update:close-modal')"
    @close="emit('update:close-modal')"
  >
    <template #body>
      <p-pane-layout class="layout">
        <p-pane-layout class="text-input-layout">
          <p-field-group :label="nameLabel" required>
            <p-text-input v-model="_name" :placeholder="namePlaceholder" />
          </p-field-group>
          <p-field-group label="Description">
            <p-textarea v-model="_description" />
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
