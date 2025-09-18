<script setup lang="ts">
import CreateForm from '@/widgets/layout/createForm/ui/CreateForm.vue';
import { PButton } from '@cloudforet-test/mirinae';
import { i18n } from '@/app/i18n';
import { SimpleEditForm } from '@/widgets/layout';
import { ref, computed } from 'vue';
import { AxiosResponse } from 'axios';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';
import { useCreateOnpremmodel, useCreateSourceSoftwareModel } from '@/entities';
import JsonViewer from '@/features/sourceServices/jsonViewer/ui/JsonViewer.vue';
import { useGetInfraInfoRefined, useGetSoftwareInfoRefined } from '@/entities/sourceConnection/api';
import { useAuth } from '@/features/auth/model/useAuth.ts';


interface iProps {
  collectData: string | undefined;
  sourceConnectionName: string;
  sgId: string;
  connId: string;
  dataType?: 'infra' | 'software';
}

const props = defineProps<iProps>();

const emit = defineEmits(['update:is-meta-viewer-opened']);

const isConverted = ref<boolean>(false);
const isSaveModal = ref<boolean>(false);

const convertedData = ref();

const auth = useAuth();
const createOnpremmodel = useCreateOnpremmodel(null);
const createSourceSoftwareModel = useCreateSourceSoftwareModel(null);
const getInfraInfoRefined = useGetInfraInfoRefined(props.sgId, props.connId);
const getSoftwareInfoRefined = useGetSoftwareInfoRefined(props.sgId, props.connId);

// 데이터 타입에 따라 적절한 변환 함수 선택
const getConvertFunction = computed(() => {
  // dataType prop에 따라 변환 함수 선택
  if (props.dataType === 'software') {
    return handleConvertSoftware();
  }
  
  // 기본적으로 Infra 변환 함수 사용
  return handleConvertInfra();
});

// dataType에 따라 동적으로 title 생성
const modalTitle = computed(() => {
  const baseTitle = 'Source Connection Viewer';
  if (props.dataType === 'software') {
    return `${baseTitle} - Software`;
  } else if (props.dataType === 'infra') {
    return `${baseTitle} - Infra`;
  }
  return baseTitle;
});

const handleSave = () => {
  isSaveModal.value = true;
};

const handleMetaViewer = e => {
  isSaveModal.value = false;
  
  // Software 타입인 경우 CreateSourceSoftwareModel 호출
  if (props.dataType === 'software') {
    console.log('MetaViewer Creating Source Software Model with data:', convertedData.value);
    
    // API 응답에서 sourceSoftwareModel 속성 추출
    const sourceSoftwareModelData = convertedData.value?.sourceSoftwareModel || convertedData.value;
    console.log('MetaViewer Extracted sourceSoftwareModel data:', sourceSoftwareModelData);
    
    createSourceSoftwareModel
      .execute({
        request: {
          description: e.description,
          isInitUserModel: true,
          sourceSoftwareModel: sourceSoftwareModelData,
          userId: auth.getUser().id,
          userModelName: e.name,
          userModelVersion: 'v0.1',
        },
      })
      .then(res => {
        showSuccessMessage('success', 'create Software Model');
      })
      .catch(e => {
        showErrorMessage('error', e.errorMsg);
      });
  } else {
    // Infra 타입인 경우 기존 CreateOnpremmodel 호출
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
  }
  
  emit('update:is-meta-viewer-opened');
};

function handleConvertInfra(): (
  payload?: any,
  config?: any,
) => Promise<AxiosResponse<any> | void> {
  return () =>
    getInfraInfoRefined.execute().then(res => {
      isConverted.value = true;
      convertedData.value = res.data.responseData;
      return res;
    });
}

function handleConvertSoftware(): (
  payload?: any,
  config?: any,
) => Promise<AxiosResponse<any> | void> {
  return () =>
    getSoftwareInfoRefined.execute().then(res => {
      isConverted.value = true;
      console.log('MetaViewer Software API Response:', res.data.responseData);
      convertedData.value = res.data.responseData;
      return res;
    });
}
</script>

<template>
  <div class="page-modal-layout">
    <create-form
      :title="modalTitle"
      :badge-title="sourceConnectionName"
      :need-widget-layout="true"
      @update:modal-state="emit('update:is-meta-viewer-opened', false)"
    >
      <template #add-info>
        <json-viewer
          :form-data="collectData"
          :convertedJSON="convertedData"
          :promiseFunc="getConvertFunction"
          :loading="getInfraInfoRefined.isLoading.value || getSoftwareInfoRefined.isLoading.value"
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
      header-title="Save Source Model2"
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
