<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { RecommendedModelList } from '@/pages/models';
import { ref } from 'vue';
import { SimpleEditForm } from '@/widgets/layout';

const emit = defineEmits(['update:close-modal']);

const selectedRecommendedModelId = ref<string>('');

const modalState = ref<boolean>(false);

function handleClickRecommendedModelId(id: string) {
  selectedRecommendedModelId.value = id;
}

function handleModal() {
  emit('update:close-modal', false);
}

function handleSave() {
  modalState.value = false;
  emit('update:close-modal', false);
}
</script>

<template>
  <div>
    <create-form
      class="page-modal-layout"
      title="Recommend Model"
      first-title="Recommend Model List"
      @update:modal-state="handleModal"
    >
      <template #add-info>
        <recommended-model-list @select-row="handleClickRecommendedModelId" />
      </template>
      <template #buttons>
        <p-button style-type="tertiary">cancel</p-button>
        <p-button @click="modalState = true">Save as a Target Model</p-button>
      </template>
    </create-form>
    <simple-edit-form
      v-if="modalState"
      header-title="Save Target Model"
      name-label="Model name"
      name-placeholder="Model name"
      @update:save-modal="handleSave"
      @update:close-modal="modalState = false"
    />
  </div>
</template>

<style scoped lang="postcss"></style>
