<script setup lang="ts">
import { PButton, PTextEditor } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { SimpleEditForm } from '@/widgets/layout';
import { JsonEditor } from '@/widgets/layout';
import { reactive, ref, watch } from 'vue';
import { ITargetModelResponse, useTargetModelStore } from '@/entities';

interface IProps {
  selectedTargetName: string;
  selectedTargetId: string;
}

const props = defineProps<IProps>();
const emit = defineEmits(['update:close-modal']);

const modalState = reactive({
  open: false,
  context: {
    name: '',
    description: '',
  },
});

const targetModelStore = useTargetModelStore();
const targetModel = ref<ITargetModelResponse | undefined>(undefined);

watch(
  () => props.selectedTargetId,
  () => {
    targetModel.value = targetModelStore.getTargetModelById(
      props.selectedTargetId,
    );
  },
  { immediate: true },
);

function handleModal(e) {
  modalState.context.name = e.name;
  modalState.context.description = e.description;

  emit('update:close-modal', false);
  modalState.open = false;
}
</script>

<template>
  <div>
    <create-form
      class="page-modal-layout"
      :badge-title="selectedTargetName"
      :need-widget-layout="true"
      title="Custom & View Target Model"
      first-title="JSON Viewer"
      @update:modal-state="handleModal"
    >
      <template #add-info>
        <p-text-editor :code="targetModel?.cloudInfraModel" :read-only="true" />
      </template>
      <template #buttons>
        <p-button
          style-type="tertiary"
          @click="$emit('update:close-modal', false)"
        >
          Cancel
        </p-button>
        <p-button @click="modalState.open = true"> Save</p-button>
      </template>
    </create-form>
    <simple-edit-form
      v-if="modalState.open"
      header-title="Save Target Model"
      :name="modalState.context.name"
      :description="modalState.context.description"
      name-label="Name"
      name-placeholder="Target Model Name"
      @update:save-modal="handleModal"
      @update:close-modal="modalState.open = false"
    />
  </div>
</template>

<style scoped lang="postcss"></style>
