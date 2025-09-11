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

// Software 모델인지 판단하는 computed
const isSoftwareModel = computed(() => {
  const targetModel = targetModelStore.getTargetModelById(props.selectedTargetModelId);
  
  // targetSoftwareModel이 있으면 Software 모델로 간주
  if (targetModel?.targetSoftwareModel) {
    return true;
  }
  
  // migrationType이 'software'이면 Software 모델로 간주
  if (targetModel?.migrationType === 'software') {
    return true;
  }
  
  // 기본적으로 Infra 모델로 간주
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
  
  // Software 모델인 경우 targetSoftwareModel 정보를 전달
  if (isSoftwareModel.value) {
    const targetModel = targetModelStore.getTargetModelById(props.selectedTargetModelId);
    if (targetModel?.targetSoftwareModel) {
      // targetSoftwareModel 정보를 부모 컴포넌트로 전달
      // 이 정보는 CustomViewTargetModel에서 사용됩니다
      console.log('Software model detected, targetSoftwareModel:', targetModel.targetSoftwareModel);
    }
  }
}

function handleOpenWorkflowEditor() {
  const targetModel = targetModelStore.getTargetModelById(props.selectedTargetModelId);
  
  console.log('TargetModelDetail - handleOpenWorkflowEditor called:', {
    selectedTargetModelId: props.selectedTargetModelId,
    targetModelName: targetModelName.value,
    targetModelDescription: targetModelDescription.value,
    targetModel: targetModel,
    isSoftwareModel: isSoftwareModel.value,
    targetSoftwareModel: targetModel?.targetSoftwareModel
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
        <p class="link-button-text" @click="handleJsonModal">
          Custom & View Target Model
        </p>
      </template>
      <template #data-workflowTool>
        <p class="link-button-text" @click="handleOpenWorkflowEditor">
          Make Workflow
        </p>
      </template>
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss"></style>
