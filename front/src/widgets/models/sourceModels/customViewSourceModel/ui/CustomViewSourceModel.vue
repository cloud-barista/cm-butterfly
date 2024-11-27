<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { i18n } from '@/app/i18n';
import { SimpleEditForm } from '@/widgets/layout';
import { reactive, ref, watch } from 'vue';
import {
  ISourceModelResponse,
  useCreateOnpremmodel,
  useSourceModelStore,
} from '@/entities';
import { PTextEditor } from '@cloudforet-test/mirinae';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';

const modelName = ref<string>('');

interface iProps {
  sourceModelName: string;
  sourceModelId: string;
}

const props = defineProps<iProps>();
const emit = defineEmits(['update:close-modal', 'update:trigger']);

const modalState = reactive({
  open: false,
  context: {
    name: '',
    description: '',
  },
});

const sourceModelStore = useSourceModelStore();
const targetModel = ref<ISourceModelResponse | undefined>(undefined);
const resCreateSourceModel = useCreateOnpremmodel(null);
const serverCode = ref<string>('');

watch(
  () => props.sourceModelId,
  () => {
    targetModel.value = sourceModelStore.getSourceModelById(
      props.sourceModelId,
    );
    serverCode.value =
      <string>targetModel.value?.onpremiseInfraModel.servers || '';
  },
  { immediate: true },
);

function handleModal() {
  emit('update:close-modal', false);
}

function handleSave() {
  modalState.open = true;
}

function handleSaveModal(e) {
  modalState.context.name = e.name;
  modalState.context.description = e.description;

  const requestBody = Object.assign({}, targetModel.value, {
    userModelName: e.name,
    description: e.description,
    isInitUserModel: false,
    onpremiseInfraModel: {
      ...targetModel.value?.onpremiseInfraModel,
      servers: JSON.parse(serverCode.value),
    },
  });

  console.log(requestBody);
  console.log(targetModel.value);
  resCreateSourceModel
    .execute({
      request: requestBody,
    })
    .then(res => {
      showSuccessMessage('success', 'Successfully created source model');
      emit('update:close-modal', false);
      emit('update:trigger');
      modalState.open = false;
    })
    .catch(e => {
      showErrorMessage('error', e.errorMsg);
    });
}

function handleCodeUpdate(value: string) {
  serverCode.value = value;
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
        <p-text-editor :code="serverCode" @update:code="handleCodeUpdate" />
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
      v-if="modalState.open"
      header-title="Save new custom Source model"
      name=""
      name-label="Model Name"
      name-placeholder="Model Name"
      @update:save-modal="handleSaveModal"
      @update:close-modal="modalState.open = false"
    />
  </div>
</template>

<style scoped lang="postcss"></style>
