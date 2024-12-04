<script setup lang="ts">
import CreateForm from '@/widgets/layout/createForm/ui/CreateForm.vue';
import { PButton } from '@cloudforet-test/mirinae';
import { i18n } from '@/app/i18n';
import { SimpleEditForm } from '@/widgets/layout';
import { ref } from 'vue';
import { AxiosResponse } from 'axios';
import { IUseAxiosWrapperReturnType } from '@/shared/libs';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';
import { useCreateOnpremmodel } from '@/entities';
import JsonViewer from '@/features/sourceServices/jsonViewer/ui/JsonViewer.vue';
import { useGetInfraInfoRefined } from '@/entities/sourceConnection/api';

interface iProps {
  collectData: string | undefined;
  sourceConnectionName: string;
  sgId: string;
  connId: string;
}

const props = defineProps<iProps>();

const emit = defineEmits(['update:is-meta-viewer-opened']);

const isConverted = ref<boolean>(false);
const isSaveModal = ref<boolean>(false);

const convertedData = ref();

const createOnpremmodel = useCreateOnpremmodel(null);
const getInfraInfoRefined = useGetInfraInfoRefined(props.sgId, props.connId);
const handleSave = () => {
  isSaveModal.value = true;
};

const handleMetaViewer = e => {
  isSaveModal.value = false;
  createOnpremmodel
    .execute({
      request: {
        ...convertedData.value,
        description: e.description,
        userModelName: e.name,
        isInitUserModel: true,
        userModelVersion: 'v0.1',
      },
    })
    .then(res => {
      showSuccessMessage('success', 'create Model');
    })
    .catch(e => {
      showErrorMessage('error', e.errorMsg);
    });
  emit('update:is-meta-viewer-opened');
};

function handleConvertInfra(): (
  payload?: any,
  config?: any,
) => Promise<AxiosResponse<any>> {
  return () =>
    getInfraInfoRefined.execute().then(res => {
      isConverted.value = true;
      convertedData.value = res.data.responseData;
    });
}
</script>

<template>
  <div class="page-modal-layout">
    <create-form
      title="Source Connection Viewer"
      :badge-title="sourceConnectionName"
      :need-widget-layout="true"
      @update:modal-state="emit('update:is-meta-viewer-opened', false)"
    >
      <template #add-info>
        <json-viewer
          :form-data="collectData"
          :convertedJSON="convertedData"
          :promiseFunc="handleConvertInfra()"
          :loading="getInfraInfoRefined.isLoading.value"
        />
      </template>
      <template #buttons>
        <p-button
          style-type="tertiary"
          @click="emit('update:is-meta-viewer-opened')"
        >
          {{ i18n.t('COMPONENT.BUTTON_MODAL.CANCEL') }}
        </p-button>
        <p-button :disabled="!isConverted" @click="handleSave">
          {{ i18n.t('COMPONENT.BUTTON_MODAL.SAVE') }}
        </p-button>
      </template>
    </create-form>
    <simple-edit-form
      v-if="isSaveModal"
      name=""
      header-title="Save Source Model"
      name-label="Name"
      name-placeholder="Source Service name"
      @update:close-modal="isSaveModal = false"
      @update:save-modal="e => handleMetaViewer(e)"
    />
    <!-- <save-source-model-modal
      v-if="isSaveModal"
      header-title="Save Source Model"
      name-label="Source Service name"
      @update:save-modal="handleMetaViewer"
    /> -->
  </div>
</template>
