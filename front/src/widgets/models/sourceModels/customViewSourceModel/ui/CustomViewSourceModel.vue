<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { i18n } from '@/app/i18n';
import { SimpleEditForm } from '@/widgets/layout';
import { reactive, ref, watch, computed } from 'vue';
import {
  ISourceModelResponse,
  useCreateOnpremmodel,
  useSourceModelStore,
} from '@/entities';
import { useCreateSourceSoftwareModel } from '@/entities/sourceModels/api';
import { PTextEditor } from '@cloudforet-test/mirinae';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';

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
const resCreateSoftwareModel = useCreateSourceSoftwareModel(null);
const serverCode = ref<string>('');

// migrationType 또는 isSoftwareModel 값으로 Software/Infra 구분
const isSoftwareModel = computed(() => {
  // targetModel에 isSoftwareModel 속성이 있으면 그것을 우선 사용
  if (targetModel.value?.isSoftwareModel !== undefined) {
    return targetModel.value.isSoftwareModel;
  }
  
  // isSoftwareModel이 없으면 migrationType으로 판단
  if (!targetModel.value?.migrationType) return false;
  return targetModel.value.migrationType.toLowerCase().startsWith('sw');
});

// 모달 제목을 동적으로 설정
const modalTitle = computed(() => {
  const baseTitle = 'Custom & View Source Model';
  if (isSoftwareModel.value) {
    return `${baseTitle} - Software`;
  } else {
    return `${baseTitle} - Infra`;
  }
});

watch(
  () => props.sourceModelId,
  () => {
    targetModel.value = sourceModelStore.getSourceModelById(
      props.sourceModelId,
    );
    
    // 디버깅을 위한 로그 출력
    console.log('=== CustomViewSourceModel Debug Info ===');
    console.log('targetModel.value:', targetModel.value);
    console.log('isSoftwareModel (from targetModel):', targetModel.value?.isSoftwareModel);
    console.log('migrationType:', targetModel.value?.migrationType);
    console.log('computed isSoftwareModel:', isSoftwareModel.value);
    console.log('onpremiseInfraModel:', targetModel.value?.onpremiseInfraModel);
    console.log('sourceSoftwareModel:', targetModel.value?.sourceSoftwareModel);
    console.log('connection_info_list:', targetModel.value?.connection_info_list);
    console.log('connection_info_list type:', typeof targetModel.value?.connection_info_list);
    console.log('connection_info_list length:', targetModel.value?.connection_info_list?.length);
    console.log('=====================================');
    
    // migrationType에 따라 다른 데이터 처리
    if (isSoftwareModel.value) {
      // Software 모델인 경우
      if (targetModel.value?.sourceSoftwareModel) {
        try {
          serverCode.value = JSON.stringify(targetModel.value.sourceSoftwareModel, null, 2);
        } catch (error) {
          console.error('Failed to stringify software data:', error);
          serverCode.value = '';
        }
      } else {
        serverCode.value = '';
        console.warn('Source software model data is not available');
      }
    } else {
      // Infra 모델인 경우 (기존 로직)
      if (targetModel.value?.onpremiseInfraModel?.servers) {
        try {
          serverCode.value = JSON.stringify(targetModel.value.onpremiseInfraModel.servers, null, 2);
        } catch (error) {
          console.error('Failed to stringify servers data:', error);
          serverCode.value = '';
        }
      } else {
        serverCode.value = '';
        console.warn('Source model or onpremiseInfraModel is not available');
        console.log('=== Infra Model Debug Info ===');
        console.log('targetModel.value exists:', !!targetModel.value);
        console.log('onpremiseInfraModel exists:', !!targetModel.value?.onpremiseInfraModel);
        console.log('servers exists:', !!targetModel.value?.onpremiseInfraModel?.servers);
        console.log('Full targetModel structure:', JSON.stringify(targetModel.value, null, 2));
        console.log('================================');
      }
    }
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

  if (isSoftwareModel.value) {
    // Software 모델 저장
    const softwareRequestBody = {
      description: e.description,
      isInitUserModel: false,
      sourceSoftwareModel: JSON.parse(serverCode.value),
      userId: targetModel.value?.userId || 'string',
      userModelName: e.name,
      userModelVersion: targetModel.value?.userModelVersion || 'v0.1',
    };

    console.log('Software request body:', softwareRequestBody);
    
    resCreateSoftwareModel
      .execute({
        request: softwareRequestBody,
      })
      .then(res => {
        showSuccessMessage('success', 'Successfully created software source model');
        emit('update:close-modal', false);
        emit('update:trigger');
        modalState.open = false;
      })
      .catch(e => {
        showErrorMessage('error', e.errorMsg);
      });
  } else {
    // Infra 모델 저장 (기존 로직)
    if (!targetModel.value?.onpremiseInfraModel) {
      showErrorMessage('error', 'Infra model data is not available');
      return;
    }

    const infraRequestBody = {
      description: e.description,
      userModelName: e.name,
      isInitUserModel: false,
      userModelVersion: targetModel.value?.userModelVersion || 'v0.1',
      onpremiseInfraModel: {
        servers: JSON.parse(serverCode.value),
        network: {
          ipv4Networks: targetModel.value.onpremiseInfraModel.network?.ipv4Networks || [],
          ipv6Networks: targetModel.value.onpremiseInfraModel.network?.ipv6Networks || [],
        },
      },
    };

    console.log('Infra request body:', infraRequestBody);
    
    resCreateSourceModel
      .execute({
        request: infraRequestBody,
      })
      .then(res => {
        showSuccessMessage('success', 'Successfully created infra source model');
        emit('update:close-modal', false);
        emit('update:trigger');
        modalState.open = false;
      })
      .catch(e => {
        showErrorMessage('error', e.errorMsg);
      });
  }
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
      :title="modalTitle"
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
