<script setup lang="ts">
import { PDefinitionTable } from '@cloudforet-test/mirinae';
import { useTargetModelDetailModel } from '@/widgets/models/targetModels/targetModelDetail';
import { onBeforeMount, watch, watchEffect, ref } from 'vue';

interface iProps {
  selectedTargetModelId: string;
}

const props = defineProps<iProps>();

const emit = defineEmits([
  'update:custom-view-json-modal',
  'update:target-model-name',
  'update:target-model-description',
]);

const { targetModelStore, setTargetModelId, initTable, tableModel } =
  useTargetModelDetailModel();

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
  )?.name;
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
          Custom & View Source Model
        </p>
      </template>
      <template #data-workflowTool>
        <p class="link-button-text">Make Workflow</p>
      </template>
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss"></style>
