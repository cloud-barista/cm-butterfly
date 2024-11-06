<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
// import { collectJsonEditor } from '@/features/sourceServices';
import { JsonEditor } from '@/widgets/layout';
import { i18n } from '@/app/i18n';
import { SimpleEditForm } from '@/widgets/layout';
import { ref, watch } from 'vue';
import { ISourceModelResponse, useSourceModelStore } from '@/entities';
import { PTextEditor } from '@cloudforet-test/mirinae';

const modelName = ref<string>('');

interface iProps {
  sourceModelName: string;
  sourceModelId: string;
}

const props = defineProps<iProps>();
const emit = defineEmits(['update:close-modal']);

const modalState = ref<boolean>(false);
const sourceModelStore = useSourceModelStore();
const targetModel = ref<ISourceModelResponse | undefined>(undefined);
watch(
  () => props.sourceModelId,
  () => {
    targetModel.value = sourceModelStore.getSourceModelById(
      props.sourceModelId,
    );
  },
  { immediate: true },
);

function handleModal() {
  emit('update:close-modal', false);
}

function handleSave() {
  modalState.value = true;
}

function handleSaveModal() {
  emit('update:close-modal', false);
  modalState.value = false;
}

function handleModelName(value: string) {
  modelName.value = value;
}
</script>

<template>
  <div>
    <create-form
      class="page-modal-layout"
      :badge-title="sourceModelName"
      :need-widget-layout="true"
      title="Custom & View Source Model"
      first-title="JSON Viewer"
      @update:modal-state="handleModal"
    >
      <template #add-info>
        <p-text-editor
          :code="targetModel?.onpremiseInfraModel.servers"
          :read-only="true"
          folded
        />
      </template>
      <template #buttons>
        <p-button style-type="tertiary" @click="handleModal">
          {{ i18n.t('COMPONENT.BUTTON_MODAL.CANCEL') }}
        </p-button>
        <p-button @click="handleSave">
          {{ i18n.t('COMPONENT.BUTTON_MODAL.SAVE') }}
        </p-button>
      </template>
    </create-form>
    <simple-edit-form
      v-if="modalState"
      header-title="Save Target Model"
      name=""
      name-label="Model Name"
      name-placeholder="Model Name"
      @update:save-modal="handleSaveModal"
      @update:close-modal="modalState = false"
      @update:name-value="handleModelName"
    />
  </div>
</template>

<style scoped lang="postcss"></style>
