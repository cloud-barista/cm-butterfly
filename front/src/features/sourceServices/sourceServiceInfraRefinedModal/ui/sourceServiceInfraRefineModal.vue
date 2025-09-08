<script setup lang="ts">
import CreateForm from '@/widgets/layout/createForm/ui/CreateForm.vue';
import { PButton } from '@cloudforet-test/mirinae';
import { i18n } from '@/app/i18n';
import { SimpleEditForm } from '@/widgets/layout';
import { ref, computed } from 'vue';
import { AxiosResponse } from 'axios';
import { IUseAxiosWrapperReturnType } from '@/shared/libs';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';
import { useCreateOnpremmodel, useCreateSourceSoftwareModel } from '@/entities';
import JsonViewer from '@/features/sourceServices/jsonViewer/ui/JsonViewer.vue';
import { useGetInfraInfoRefined, useGetSoftwareInfoRefined } from '@/entities/sourceConnection/api';
import { useGetInfraSourceGroupInfraRefine } from '@/entities/sourceService/api';
import { useAuth } from '@/features/auth/model/useAuth.ts';

interface iProps {
  collectData: any;
  sgId: string;
  dataType?: 'infra' | 'software';
}

const props = defineProps<iProps>();

const emit = defineEmits(['update:is-meta-viewer-opened']);

const isConverted = ref<boolean>(false);
const isSaveModal = ref<boolean>(false);

const convertedData = ref<any>(null);

// 데이터 타입에 따라 적절한 변환 함수 선택
const getConvertFunction = computed(() => {
  if (props.collectData && typeof props.collectData === 'object') {
    // Software 데이터인지 확인 (예: software 관련 키가 있는지)
    if (props.collectData.software || props.collectData.installedPackages) {
      return handleConvertSoftware();
    }
  }
  // 기본적으로 Infra 변환 함수 사용
  return handleConvertInfra();
});

// dataType prop을 우선적으로 사용하고, 없을 때만 collectData의 내용을 기반으로 판단
const isSoftwareData = computed(() => {
  // dataType prop이 명시적으로 전달된 경우 우선 사용
  if (props.dataType === 'software') {
    console.log('Software detected by dataType prop');
    return true;
  }
  if (props.dataType === 'infra') {
    console.log('Infra detected by dataType prop');
    return false;
  }
  
  // dataType이 없는 경우 collectData의 내용을 기반으로 판단
  console.log('collectData:', props.collectData);
  console.log('collectData type:', typeof props.collectData);
  
  if (!props.collectData) return false;
  
  // Software 데이터인지 확인하는 다양한 방법
  if (typeof props.collectData === 'object') {
    // 1. software 관련 키가 있는지 확인
    if (props.collectData.software || props.collectData.installedPackages) {
      console.log('Software detected by software/installedPackages keys');
      return true;
    }
    
    // 2. collectData가 문자열이고 JSON으로 파싱 가능한 경우
    if (typeof props.collectData === 'string') {
      try {
        const parsed = JSON.parse(props.collectData);
        if (parsed.software || parsed.installedPackages) {
          console.log('Software detected by parsed JSON');
          return true;
        }
      } catch (e) {
        // JSON 파싱 실패 시 무시
      }
    }
    
    // 3. collectData의 키들을 확인하여 Software 관련 키가 있는지 검사
    const keys = Object.keys(props.collectData);
    console.log('collectData keys:', keys);
    
    // Software 관련 키들을 더 포괄적으로 검사
    const softwareKeywords = ['software', 'installedPackages', 'packages', 'applications', 'programs', 'sw'];
    const hasSoftwareKeywords = keys.some(key => 
      softwareKeywords.some(keyword => key.toLowerCase().includes(keyword))
    );
    
    if (hasSoftwareKeywords) {
      console.log('Software detected by keyword matching');
      return true;
    }
  }
  
  console.log('Infra detected (default)');
  return false;
});

// 데이터 타입에 따라 동적으로 title 생성
const modalTitle = computed(() => {
  const baseTitle = 'Source Group Connection Viewer';
  if (isSoftwareData.value) {
    return `${baseTitle} - Software`;
  } else {
    return `${baseTitle} - Infra`;
  }
});

const auth = useAuth();
const createOnpremmodel = useCreateOnpremmodel(null);
const createSourceSoftwareModel = useCreateSourceSoftwareModel(null);
const getInfraInfoRefined = useGetInfraSourceGroupInfraRefine(props.sgId);
const getSoftwareInfoRefined = useGetSoftwareInfoRefined(props.sgId, null);
const handleSave = () => {
  isSaveModal.value = true;
};

const handleMetaViewer = e => {
  isSaveModal.value = false;
  console.log('isSoftwareData', isSoftwareData.value);
  if (isSoftwareData.value) {
    // Software 타입인 경우 CreateSourceSoftwareModel 호출
    createSourceSoftwareModel
      .execute({
        request: {
          description: e.description,
          isInitUserModel: true,
          sourceSoftwareModel: convertedData.value,
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
      convertedData.value = res.data.responseData;
      return res;
    });
}
</script>

<template>
  <div class="page-modal-layout">
    <create-form
      :title="modalTitle"
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
      header-title="Save Source Model"
      name-label="Name"
      name-placeholder="Source Service name"
      @update:close-modal="isSaveModal = false"
      @update:save-modal="e => handleMetaViewer(e)"
    />
  </div>
</template>
