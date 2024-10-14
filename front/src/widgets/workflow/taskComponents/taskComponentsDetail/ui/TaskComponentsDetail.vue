<script setup lang="ts">
import { PDefinitionTable } from '@cloudforet-test/mirinae';
import { useTaskComponentsDetailModel } from '../model/taskComponentsDetailModel';
import { onBeforeMount, watch, watchEffect } from 'vue';

interface iProps {
  selectedTaskComponentId: string;
}

const props = defineProps<iProps>();

const emit = defineEmits([
  'update:task-component-name',
  'update:task-component-json-modal',
]);

const { taskComponentsStore, setTaskComponentId, initTable, tableModel } =
  useTaskComponentsDetailModel();

onBeforeMount(() => {
  initTable();
});

watch(
  props,
  () => {
    setTaskComponentId(props.selectedTaskComponentId);
  },
  { immediate: true },
);

watchEffect(() => {
  emit(
    'update:task-component-name',
    taskComponentsStore.getTaskComponentById(props.selectedTaskComponentId)
      ?.name,
  );
});

function handleJsonModal() {
  emit('update:task-component-json-modal', true);
}
</script>

<template>
  <div>
    <p-definition-table
      :fields="tableModel.tableState.fields"
      :data="tableModel.tableState.data"
      :loading="tableModel.tableState.loading"
      block
    >
      <template #data-taskComponentJSON>
        <p class="link-button-text" @click="handleJsonModal">
          View Task Component JSON
        </p>
      </template>
    </p-definition-table>
  </div>
</template>
