<script setup lang="ts">
import { PDefinitionTable } from '@cloudforet-test/mirinae';
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
  'update:source-model-description',
  'update:recommended-model-list',
]);

const { sourceModelStore, setSourceModelId, initTable, tableModel } =
  useSourceModelDetailModel();

const sourceModelName = ref<string | undefined>('');
const sourceModelDescription = ref<string | undefined>('');
const recommendedModelList = ref<any>([]);

watchEffect(() => {
  sourceModelName.value = sourceModelStore.getSourceModelById(
    props.selectedSourceModelId,
  )?.id;
});

watchEffect(() => {
  sourceModelDescription.value = sourceModelStore.getSourceModelById(
    props.selectedSourceModelId,
  )?.description;
});

watch(
  sourceModelName,
  nv => {
    emit('update:source-model-name', nv);
  },
  { immediate: true },
);

watch(
  sourceModelDescription,
  nv => {
    emit('update:source-model-description', nv);
  },
  { immediate: true },
);

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
  // 디버깅을 위한 로그 출력
  const sourceModel = sourceModelStore.getSourceModelById(props.selectedSourceModelId);
  // console.log('=== SourceModelDetail Debug Info ===');
  // console.log('selectedSourceModelId:', props.selectedSourceModelId);
  // console.log('sourceModel:', sourceModel);
  // console.log('sourceModelName:', sourceModelName.value);
  // console.log('connection_info_list:', sourceModel?.connection_info_list);
  // console.log('connection_info_list type:', typeof sourceModel?.connection_info_list);
  // console.log('connection_info_list length:', sourceModel?.connection_info_list?.length);
  // console.log('Full sourceModel structure:', JSON.stringify(sourceModel, null, 2));
  // console.log('==================================');
  
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
