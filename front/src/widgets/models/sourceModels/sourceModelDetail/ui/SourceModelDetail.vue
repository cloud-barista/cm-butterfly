<script setup lang="ts">
import { PDefinitionTable, PButton } from '@cloudforet-test/mirinae';
import { useSourceModelDetailModel } from '@/widgets/models/sourceModels';
import { onBeforeMount, ref, watch, watchEffect } from 'vue';

interface iProps {
  selectedSourceModelId: string;
}

const props = defineProps<iProps>();

const emit = defineEmits([
  'update:custom-view-json-modal',
  'update:view-recommend-list-modal',
  'update:source-model-name',
]);

const { sourceModelStore, setSourceModelId, initTable, tableModel } =
  useSourceModelDetailModel();

const sourceModelName = ref<string | undefined>('');

watchEffect(() => {
  sourceModelName.value = sourceModelStore.getModelById(
    props.selectedSourceModelId,
  )?.name;
});

watch(
  props,
  () => {
    setSourceModelId(props.selectedSourceModelId);
  },
  { immediate: true },
);

onBeforeMount(() => {
  initTable();
});

function handleJsonModal() {
  emit('update:custom-view-json-modal', true);
  emit('update:source-model-name', sourceModelName.value);
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
        <p class="link-button-text" @click="handleJsonModal">
          Custom & View Source Model
        </p>
        <!-- <p-button style-type="transparent" @click="handleJsonModal">
        </p-button> -->
      </template>
      <template #data-recommendModel>
        <p
          class="link-button-text"
          @click="emit('update:view-recommend-list-modal', true)"
        >
          View Recommended List
        </p>
      </template>
    </p-definition-table>
  </div>
</template>
