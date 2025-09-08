<script setup lang="ts">
import { PButton, PTextEditor } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { SimpleEditForm } from '@/widgets/layout';
import { JsonEditor } from '@/widgets/layout';
import { reactive, ref, watch, computed } from 'vue';
import {
  createTargetModel,
  createTargetSoftwareModel,
  ITargetModelResponse,
  useTargetModelStore,
  useUpdateTargetModel,
} from '@/entities';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';
import { useAuth } from '@/features/auth/model/useAuth.ts';

interface IProps {
  selectedTargetName: string;
  selectedTargetId: string;
  migrationData?: any; // Migration recommendations data
}

const props = defineProps<IProps>();
const emit = defineEmits(['update:close-modal', 'update:trigger', 'update:close-target-model-detail']);

const modalState = reactive({
  open: false,
  context: {
    name: '',
    description: '',
  },
});

const auth = useAuth();
const targetModelStore = useTargetModelStore();
const targetModel = ref<ITargetModelResponse | undefined>(undefined);
const resCreateTargetModel = createTargetModel(null);
const resCreateTargetSoftwareModel = createTargetSoftwareModel(null);
const cloudInfraModelCode = ref<string>('');

// Migration data가 있으면 그것을 사용하고, 없으면 기존 target model을 사용
const modelData = computed(() => {
  if (props.migrationData) {
    return props.migrationData;
  }
  return targetModel.value?.cloudInfraModel;
});

// Software 모델인지 판단하는 computed
const isSoftwareModel = computed(() => {
  // migrationData가 있으면 Software 모델로 간주 (RecommendedSoftwareModel에서 온 경우)
  if (props.migrationData) {
    return true;
  }
  
  // 기존 target model의 속성으로 판단 (ITargetModelResponse에는 isSoftwareModel이 없으므로 다른 방법 사용)
  // cloudInfraModel이 있으면 Infra 모델로 간주
  if (targetModel.value?.cloudInfraModel) {
    return false;
  }
  
  // 기본적으로 Infra 모델로 간주 (기존 로직과 호환성 유지)
  return false;
});

watch(
  () => props.selectedTargetId,
  () => {
    if (!props.migrationData) {
      targetModel.value = targetModelStore.getTargetModelById(
        props.selectedTargetId,
      );
    }
    
    // Migration data가 있으면 JSON.stringify로 변환, 없으면 기존 로직 사용
    if (props.migrationData) {
      cloudInfraModelCode.value = JSON.stringify(props.migrationData, null, 2);
    } else {
      cloudInfraModelCode.value = JSON.stringify(targetModel.value?.cloudInfraModel || {}, null, 2);
    }
  },
  { immediate: true },
);

function handleCreateTargetModel(e) {
  modalState.context.name = e.name;
  modalState.context.description = e.description;

  if (isSoftwareModel.value) {
    // Software 모델 저장
    handleCreateSoftwareTargetModel(e);
  } else {
    // Infra 모델 저장 (기존 로직)
    handleCreateInfraTargetModel(e);
  }
}

function handleCreateSoftwareTargetModel(e) {
  let requestBody: any = {};

  try {
    const parsedData = JSON.parse(cloudInfraModelCode.value);
    requestBody = {
      description: e.description,
      isInitUserModel: false,
      targetSoftwareModel: parsedData,
      userId: auth.getUser().id,
      userModelName: e.name,
      userModelVersion: targetModel.value?.userModelVersion ?? 'v0.1',
    };
  } catch (error) {
    showErrorMessage('error', error instanceof Error ? error.message : 'Invalid JSON format');
    return;
  }

  resCreateTargetSoftwareModel
    .execute({
      request: requestBody,
    })
    .then(res => {
      showSuccessMessage('success', 'Successfully created software target model');
      modalState.open = false;
      emit('update:close-modal', false);
      emit('update:trigger', false);
      emit('update:close-target-model-detail');
    })
    .catch(e => {
      showErrorMessage('error', e.errorMsg);
    });
}

function handleCreateInfraTargetModel(e) {
  let requestBody: any = {};

  try {
    const parsedData = JSON.parse(cloudInfraModelCode.value);
    requestBody = {
      cloudInfraModel: parsedData,
      csp: targetModel.value?.csp ?? '',
      description: e.description,
      isInitUserModel: false,
      isTargetModel: true,
      region: targetModel.value?.region ?? '',
      userId: auth.getUser().id,
      userModelName: e.name,
      userModelVersion: targetModel.value?.userModelVersion ?? '',
      zone: targetModel.value?.zone ?? '',
    };
  } catch (error) {
    showErrorMessage('error', error instanceof Error ? error.message : 'Invalid JSON format');
    return;
  }

  resCreateTargetModel
    .execute({
      request: requestBody,
    })
    .then(res => {
      showSuccessMessage('success', 'Successfully created infra target model');
      modalState.open = false;
      emit('update:close-modal', false);
      emit('update:trigger', false);
      emit('update:close-target-model-detail');
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
      :title="isSoftwareModel ? 'Save Software Migration as Target Model' : 'Custom & View Target Model'"
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
      :header-title="isSoftwareModel ? 'Save software migration as target model' : 'Save new custom target model'"
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
