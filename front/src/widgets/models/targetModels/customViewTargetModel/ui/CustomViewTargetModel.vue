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

watch(
  () => props.selectedTargetId,
  () => {
    targetModel.value = targetModelStore.getTargetModelById(
      props.selectedTargetId,
    );
  },
  { immediate: true },
);

function handleCreateTargetModel(e) {
  modalState.context.name = e.name;
  modalState.context.description = e.description;
  const requestBody = Object.assign(targetModel.value, {
    userModelName: e.name,
    description: e.description,
    isInitUserModel: false,
  });

  resCreateTargetModel
    .execute({
      pathParams: { id: props.selectedTargetId },
      request: requestBody,
    })
    .then(res => {
      showSuccessMessage('success', 'Successfully Create target model');
      emit('update:trigger');
    })
    .catch(e => {
      showErrorMessage('error', e.errorMsg);
    });
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
      @update:save-modal="handleCreateTargetModel"
      @update:close-modal="modalState.open = false"
    />
  </div>
</template>

<style scoped lang="postcss"></style>
