<script setup lang="ts">
import {
  PPaneLayout,
  PFieldGroup,
  PTextInput,
  PTextarea,
} from '@cloudforet-test/mirinae';
import { ref } from 'vue';

const name = ref<string>('');
const description = ref<string>('');

interface iProps {
  nameLabel: string;
}

const props = defineProps<iProps>();

const emit = defineEmits(['update:model-name', 'update:model-description']);

const handleNameInput = () => {
  emit('update:model-name', name.value);
};

const handleDescriptionInput = () => {
  emit('update:model-description', description.value);
};
</script>

<template>
  <p-pane-layout class="text-input-layout">
    <p-field-group label="Name" required>
      <p-text-input
        v-model="name"
        :placeholder="nameLabel"
        @change="handleNameInput"
      />
    </p-field-group>
    <p-field-group label="Description">
      <p-textarea v-model="description" @change="handleDescriptionInput" />
    </p-field-group>
  </p-pane-layout>
</template>

<style scoped lang="postcss">
.text-input-layout {
  @apply p-[0.75rem] border-none;
  .p-text-input {
    @apply w-full;
  }
}
</style>
