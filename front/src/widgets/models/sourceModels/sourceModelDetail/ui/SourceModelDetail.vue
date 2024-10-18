<script setup lang="ts">
import { PDefinitionTable } from '@cloudforet-test/mirinae';
import { useSourceModelDetailModel } from '@/widgets/models/sourceModels';
import { onBeforeMount, ref, watch, watchEffect } from 'vue';
import { IRecommendedModel } from '@/entities/recommendedModel/model/types';

interface iProps {
  selectedSourceModelId: string;
}

const props = defineProps<iProps>();

const emit = defineEmits([
  'update:custom-view-json-modal',
  'update:view-recommend-list-modal',
  'update:source-model-name',
  'update:recommended-model-list',
]);

const { sourceModelStore, setSourceModelId, initTable, tableModel } =
  useSourceModelDetailModel();

const sourceModelName = ref<string | undefined>('');
const recommendedModelList = ref<any>([]);

watchEffect(() => {
  sourceModelName.value = sourceModelStore.getModelById(
    props.selectedSourceModelId,
  )?.name;
});

watchEffect(() => {
  recommendedModelList.value = sourceModelStore.getModelById(
    props.selectedSourceModelId,
  )?.recommendModel;
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

function handleRecommendedList() {
  emit('update:view-recommend-list-modal', true);
  emit('update:source-model-name', sourceModelName.value);
  emit('update:recommended-model-list', recommendedModelList.value);
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
      <!-- :disable-copy="true" -->
      <template #data-customAndViewJSON>
        <p class="link-button-text" @click="handleJsonModal">
          Custom & View Source Model
        </p>
        <!-- <p-button style-type="transparent" @click="handleJsonModal">
        </p-button> -->
      </template>
      <template #data-recommendModel>
        <p class="link-button-text" @click="handleRecommendedList">
          View Recommended List
        </p>
      </template>
    </p-definition-table>
  </div>
</template>
