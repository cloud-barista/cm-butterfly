<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { EnhancedJsonEditor } from '@/shared/ui/EnhancedJsonEditor';
import { CreateForm } from '@/widgets/layout';
import { SimpleEditForm } from '@/widgets/layout';
import { reactive, ref, watch, computed } from 'vue';
import {
  createTargetModel,
  createTargetSoftwareModel,
  ITargetModelResponse,
  useTargetModelStore,
} from '@/entities';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';
import { useAuth } from '@/features/auth/model/useAuth.ts';

interface IProps {
  selectedTargetName: string;
  selectedTargetId: string;
  migrationData?: any; // Migration recommendations data
}

const props = defineProps<IProps>();
const emit = defineEmits([
  'update:close-modal',
  'update:trigger',
  'update:close-target-model-detail',
]);

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

// Use migration data if present, otherwise fall back to the existing target model
const modelData = computed(() => {
  if (props.migrationData) {
    return props.migrationData;
  }

  // For a Software model, return targetSoftwareModel
  if (isSoftwareModel.value && targetModel.value?.targetSoftwareModel) {
    return targetModel.value.targetSoftwareModel;
  }

  // For an Infra model, return cloudInfraModel
  return targetModel.value?.cloudInfraModel;
});

// computed that determines whether this is a Software model
const isSoftwareModel = computed(() => {
  // Treat as a Software model when migrationData is present (came from RecommendedSoftwareModel)
  if (props.migrationData) {
    return true;
  }

  // Treat as a Software model when targetSoftwareModel is present
  if (targetModel.value?.targetSoftwareModel) {
    return true;
  }

  // Treat as a Software model when migrationType is 'software'
  if (targetModel.value?.migrationType === 'software') {
    return true;
  }

  // Default to an Infra model (preserves compatibility with existing logic)
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

    // Stringify migration data with JSON.stringify if present, otherwise use the existing logic
    if (props.migrationData) {
      cloudInfraModelCode.value = JSON.stringify(props.migrationData, null, 2);
    } else {
      // For a Software model, display targetSoftwareModel
      if (isSoftwareModel.value && targetModel.value?.targetSoftwareModel) {
        cloudInfraModelCode.value = JSON.stringify(
          targetModel.value.targetSoftwareModel,
          null,
          2,
        );
      } else {
        // For an Infra model, display cloudInfraModel
        cloudInfraModelCode.value = JSON.stringify(
          targetModel.value?.cloudInfraModel || {},
          null,
          2,
        );
      }
    }
  },
  { immediate: true },
);

function handleCreateTargetModel(e) {
  modalState.context.name = e.name;
  modalState.context.description = e.description;

  if (isSoftwareModel.value) {
    // Save the Software model
    handleCreateSoftwareTargetModel(e);
  } else {
    // Save the Infra model (existing logic)
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
    showErrorMessage(
      'error',
      error instanceof Error ? error.message : 'Invalid JSON format',
    );
    return;
  }

  resCreateTargetSoftwareModel
    .execute({
      request: requestBody,
    })
    .then(res => {
      showSuccessMessage(
        'success',
        'Successfully created software target model',
      );
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
    showErrorMessage(
      'error',
      error instanceof Error ? error.message : 'Invalid JSON format',
    );
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
      :title="
        isSoftwareModel
          ? 'Save Software Migration as Target Model'
          : 'Custom & View Target Model'
      "
      first-title="JSON Viewer"
      @update:modal-state="$emit('update:close-modal', false)"
    >
      <template #add-info>
        <div class="enhanced-editor-wrapper">
          <EnhancedJsonEditor
            :model-value="cloudInfraModelCode"
            :read-only="false"
            :mode="'tree'"
            :main-menu-bar="true"
            :navigation-bar="true"
            :status-bar="true"
            height="600px"
            file-name="target-model"
            @update:modelValue="handleCodeUpdate"
          />
        </div>
      </template>
      <template #buttons>
        <p-button
          style-type="tertiary"
          data-testid="target-custom-cancel"
          @click="$emit('update:close-modal', false)"
        >
          Cancel
        </p-button>
        <p-button
          data-testid="target-custom-save"
          @click="modalState.open = true"
        >
          Save</p-button
        >
      </template>
    </create-form>
    <simple-edit-form
      v-if="modalState.open"
      :header-title="
        isSoftwareModel
          ? 'Save software migration as target model'
          : 'Save new custom target model'
      "
      :name="modalState.context.name"
      :description="modalState.context.description"
      name-label="Name"
      name-placeholder="Target Model Name"
      @update:save-modal="handleCreateTargetModel"
      @update:close-modal="modalState.open = false"
    />
  </div>
</template>

<style scoped lang="postcss">
.enhanced-editor-wrapper {
  width: 100%;
  min-height: 500px;
  padding: 0.5rem;
}
</style>
