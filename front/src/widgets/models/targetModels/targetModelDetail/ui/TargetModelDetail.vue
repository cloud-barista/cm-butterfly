<script setup lang="ts">
import { PDefinitionTable, PButton } from '@cloudforet-test/mirinae';
import { useTargetModelDetailModel } from '@/widgets/models/targetModels/targetModelDetail';
import { onBeforeMount, watch, watchEffect, ref } from 'vue';

interface iProps {
  selectedTargetModelId: string;
}

const props = defineProps<iProps>();

const emit = defineEmits([
  'update:custom-view-json-modal',
  'update:target-model-name',
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

watchEffect(() => {
  targetModelName.value = targetModelStore.getTargetModelById(
    props.selectedTargetModelId,
  )?.name;
});

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
      :disable-copy="true"
    >
      <template #data-customAndViewJSON>
        <p-button style-type="transparent" @click="handleJsonModal">
          <p class="link-button-text">Custom & View Source Model</p>
        </p-button>
      </template>
      <template #data-workflowTool>
        <p-button style-type="transparent">
          <p class="link-button-text">Make Workflow</p>
        </p-button>
      </template>
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss"></style>
