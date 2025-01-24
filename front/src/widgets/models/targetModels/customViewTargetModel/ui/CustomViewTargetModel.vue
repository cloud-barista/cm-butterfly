<script setup lang="ts">
import { PButton, PTextEditor } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { SimpleEditForm } from '@/widgets/layout';
import { JsonEditor } from '@/widgets/layout';
import { reactive, ref, watch } from 'vue';
import {
  createTargetModel,
  ITargetModelResponse,
  useTargetModelStore,
  useUpdateTargetModel,
} from '@/entities';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';

interface IProps {
  selectedTargetName: string;
  selectedTargetId: string;
}

const props = defineProps<IProps>();
const emit = defineEmits(['update:close-modal', 'update:trigger']);

const modalState = reactive({
  open: false,
  context: {
    name: '',
    description: '',
  },
});

const targetModelStore = useTargetModelStore();
const targetModel = ref<ITargetModelResponse | undefined>(undefined);
const resCreateTargetModel = createTargetModel(null);
const cloudInfraModelCode = ref<string>('');

watch(
  () => props.selectedTargetId,
  () => {
    targetModel.value = targetModelStore.getTargetModelById(
      props.selectedTargetId,
    );
    cloudInfraModelCode.value =
      <string>targetModel.value?.cloudInfraModel || '';
  },
  { immediate: true },
);

function handleCreateTargetModel(e) {
  modalState.context.name = e.name;
  modalState.context.description = e.description;
  let requestBody: any = {};

  try {
    requestBody = {
      cloudInfraModel: JSON.parse(cloudInfraModelCode.value),
      csp: targetModel.value?.csp ?? '',
      description: e.description,
      isInitUserModel: false,
      isTargetModel: true,
      region: targetModel.value?.region ?? '',
      userId: targetModel.value?.userId ?? '',
      userModelName: e.name,
      userModelVersion: targetModel.value?.userModelVersion ?? '',
      zone: targetModel.value?.zone ?? '',
    };
  } catch (e) {
    showErrorMessage('error', e);
    return;
  }

  resCreateTargetModel
    .execute({
      pathParams: { id: props.selectedTargetId },
      request: requestBody,
    })
    .then(res => {
      showSuccessMessage('success', 'Successfully Create target model');
      modalState.open = false;
      emit('update:close-modal', false);
      emit('update:trigger', false);
    })
    .catch(e => {
      showErrorMessage('error', e.errorMsg);
    });
}

function handleCodeUpdate(value: string) {
  cloudInfraModelCode.value = value;
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
      @update:modal-state="$emit('update:close-modal', false)"
    >
      <template #add-info>
        <p-text-editor
          :code="cloudInfraModelCode"
          :read-only="false"
          @update:code="handleCodeUpdate"
        />
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
      header-title="Save new custom target model "
      :name="modalState.context.name"
      :description="modalState.context.description"
      name-label="Name"
      name-placeholder="Target Model Name"
      @update:save-modal="handleCreateTargetModel"
      @update:close-modal="modalState.open = false"
    />
  </div>
</template>

<style scoped lang="postcss"></style>
