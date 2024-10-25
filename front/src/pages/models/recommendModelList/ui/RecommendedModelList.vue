<script setup lang="ts">
import { PToolboxTable } from '@cloudforet-test/mirinae';
import { useRecommendedModelModel } from '@/widgets/models/sourceModels/recommendedModel/model/recommendedModelModel';
import { onBeforeMount, ref, watchEffect } from 'vue';
import { IRecommendedModel } from '@/entities/recommendedModel/model/types';

interface iProps {
  recommendedModelList: IRecommendedModel[];
}

const props = defineProps<iProps>();

const emit = defineEmits(['select-row']);

const {
  tableModel,
  initToolBoxTableModel,
  recommendedModelStore,
  recommendedModels,
} = useRecommendedModelModel();

const modalOpen = ref<boolean>(false);

onBeforeMount(() => {
  initToolBoxTableModel();
});

function handleRefreshTable() {
  tableModel.initState();
}

function handleSelectedIndex(selectedIndex: number) {
  const selectedData = tableModel.tableState.displayItems[selectedIndex];
  if (selectedData) {
    emit('select-row', selectedData.id);
  } else {
    emit('select-row', '');
  }
}

// TODO: api 연결 후 수정
watchEffect(() => {
  tableModel.tableState.items = props.recommendedModelList;
});
</script>

<template>
  <p-toolbox-table
    ref="toolboxTable"
    :items="tableModel.tableState.displayItems"
    :fields="tableModel.tableState.fields"
    :total-count="tableModel.tableState.tableCount"
    :style="{ height: '500px' }"
    :sortable="tableModel.tableOptions.sortable"
    :sort-by="tableModel.tableOptions.sortBy"
    :selectable="tableModel.tableOptions.selectable"
    :select-index.sync="tableModel.tableState.selectIndex"
    :multi-select="false"
    @refresh="handleRefreshTable"
    @select="handleSelectedIndex"
  >
    <!-- TODO: here -->
  </p-toolbox-table>
</template>

<style scoped lang="postcss"></style>
