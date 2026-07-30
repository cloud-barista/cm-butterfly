<script setup lang="ts">
import { PDefinitionTable } from '@cloudforet-test/mirinae';
import { useTargetModelDetailModel } from '@/widgets/models/targetModels/targetModelDetail';
import { onBeforeMount, watch, watchEffect, ref, computed } from 'vue';

interface iProps {
  selectedTargetModelId: string;
}

const props = defineProps<iProps>();

const emit = defineEmits([
  'update:custom-view-json-modal',
  'update:target-model-name',
  'update:target-model-description',
  'update:workflow-edit-modal',
]);

const { targetModelStore, setTargetModelId, initTable, tableModel } =
  useTargetModelDetailModel();

// Computed that decides whether this is a Software model
const isSoftwareModel = computed(() => {
  const targetModel = targetModelStore.getTargetModelById(
    props.selectedTargetModelId,
  );

  // Treat as a Software model if modelType is 'SoftwareModel'
  if (targetModel?.modelType === 'SoftwareModel') {
    return true;
  }

  // Treat as a Software model if targetSoftwareModel exists (backward compatibility)
  if (targetModel?.targetSoftwareModel) {
    return true;
  }

  // Treat as a Software model if migrationType is 'software' (backward compatibility)
  if (targetModel?.migrationType === 'software') {
    return true;
  }

  // Default to an Infra model
  return false;
});

watch(
  props,
  () => {
    setTargetModelId(props.selectedTargetModelId);
  },
  { immediate: true },
);

onBeforeMount(() => {
  initTable();
});

const targetModelName = ref<string | undefined>('');
const targetModelDescription = ref<string | undefined>('');

watchEffect(() => {
  targetModelName.value = targetModelStore.getTargetModelById(
    props.selectedTargetModelId,
  )?.userModelName;
});

watchEffect(() => {
  targetModelDescription.value = targetModelStore.getTargetModelById(
    props.selectedTargetModelId,
  )?.description;
});

watch(
  targetModelName,
  nv => {
    emit('update:target-model-name', nv);
  },
  { immediate: true },
);

watch(
  targetModelDescription,
  nv => {
    emit('update:target-model-description', nv);
  },
  { immediate: true },
);

function handleJsonModal() {
  emit('update:custom-view-json-modal', true);
  emit('update:target-model-name', targetModelName.value);

  // For a Software model, pass along the targetSoftwareModel info
  if (isSoftwareModel.value) {
    const targetModel = targetModelStore.getTargetModelById(
      props.selectedTargetModelId,
    );
    if (targetModel?.targetSoftwareModel) {
      // Pass the targetSoftwareModel info to the parent component
      // This info is used by CustomViewTargetModel
      console.log(
        'Software model detected, targetSoftwareModel:',
        targetModel.targetSoftwareModel,
      );
    }
  }
}

function handleOpenWorkflowEditor() {
  const targetModel = targetModelStore.getTargetModelById(
    props.selectedTargetModelId,
  );

  console.log('TargetModelDetail - handleOpenWorkflowEditor called:', {
    selectedTargetModelId: props.selectedTargetModelId,
    targetModelName: targetModelName.value,
    targetModelDescription: targetModelDescription.value,
    targetModel: targetModel,
    isSoftwareModel: isSoftwareModel.value,
    targetSoftwareModel: targetModel?.targetSoftwareModel,
  });

  emit('update:workflow-edit-modal', true);
}
</script>

<template>
  <div>
    <p-definition-table
      :fields="tableModel.tableState.fields"
      :data="tableModel.tableState.data"
      :loading="tableModel.tableState.loading"
      :block="true"
    >
      <template #data-customAndViewJSON>
        <p
          class="link-button-text"
          data-testid="target-detail-custom-view"
          @click="handleJsonModal"
        >
          Custom & View Target Model
        </p>
      </template>
      <template #data-workflowTool>
        <p
          data-testid="target-make-workflow"
          class="link-button-text"
          @click="handleOpenWorkflowEditor"
        >
          Make Workflow
        </p>
      </template>
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss"></style>
