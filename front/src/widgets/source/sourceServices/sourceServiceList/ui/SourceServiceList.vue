<script setup lang="ts">
import {
  PToolboxTable,
  PHorizontalLayout,
  PButton,
} from '@cloudforet-test/mirinae';
import { onBeforeMount, onMounted, watch } from 'vue';
import { showErrorMessage } from '@/shared/utils';
import { useSourceServiceListModel } from '@/widgets/source/sourceServices/sourceServiceList/model/sourceServiceListModel.ts';

const {
  tableModel,
  services,
  sourceServicesStore,
  resSourceServiceList,
  initToolBoxTableModel,
} = useSourceServiceListModel();

const emit = defineEmits(['selectRow']);

onBeforeMount(() => {
  initToolBoxTableModel();
});

onMounted(() => {
  getSourceServiceList();
});

function getSourceServiceList() {
  resSourceServiceList
    .execute()
    .then(res => {
      if (res.data.responseData) {
        sourceServicesStore.setService(res.data.responseData);
      }
    })
    .catch(e => {
      if (e.errorMsg.value) showErrorMessage('Error', e.errorMsg.value);
    });
}

function handleSelectedIndex(index: number[]) {
  const selectedData = tableModel.tableState.displayItems[index];
  if (selectedData) {
    emit('selectRow', selectedData.id);
  } else {
    emit('selectRow', '');
  }
}
</script>

<template>
  <p-horizontal-layout :height="400" :min-height="400" :max-height="1000">
    <template #container="{ height }">
      <p-toolbox-table
        ref="toolboxTable"
        :loading="
          tableModel.tableState.loading || resSourceServiceList.isLoading.value
        "
        :items="tableModel.tableState.displayItems"
        :fields="tableModel.tableState.fields"
        :total-count="tableModel.tableState.tableCount"
        :style="{ height: `${height}px` }"
        :sortable="tableModel.tableOptions.sortable"
        :sort-by="tableModel.tableOptions.sortBy"
        :selectable="tableModel.tableOptions.selectable"
        :multi-select="tableModel.tableOptions.multiSelect"
        :search-type="tableModel.tableOptions.searchType"
        :key-item-sets="tableModel.querySearchState.keyItemSet"
        :value-handler-map="tableModel.querySearchState.valueHandlerMap"
        :query-tag="tableModel.querySearchState.queryTag"
        :select-index.sync="tableModel.tableState.selectIndex"
        :page-size="tableModel.tableOptions.pageSize"
        @change="tableModel.handleChange"
        @refresh="getSourceServiceList"
        @select="handleSelectedIndex"
      >
        <template #toolbox-left>
          <p-button style-type="primary" icon-left="ic_plus_bold">
            Add
          </p-button>
        </template>
      </p-toolbox-table>
    </template>
  </p-horizontal-layout>
</template>

<style scoped lang="postcss"></style>
