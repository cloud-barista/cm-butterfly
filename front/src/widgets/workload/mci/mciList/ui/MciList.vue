<script setup lang="ts">
import { useMciListModel } from '@/widgets/workload/mci/mciList/model';
import {
  PButton,
  PHorizontalLayout,
  PToolboxTable,
  PBadge,
} from '@cloudforet-test/mirinae';
import { onBeforeMount, onMounted, reactive } from 'vue';

interface IProps {
  nsId: string;
}

const props = defineProps<IProps>();
const emit = defineEmits(['selectRow']);

const { mciTableModel, initToolBoxTableModel, fetchMciList, loading } =
  useMciListModel(props);

const mciCreateModalState = reactive({
  open: false,
  props: {},
});

function handleSelectedIndex(index: number[]) {
  const selectedData = mciTableModel.tableState.displayItems[index];
  if (selectedData) {
    emit('selectRow', selectedData.name);
  } else {
    emit('selectRow', '');
  }
}

onBeforeMount(() => {
  initToolBoxTableModel();
});

onMounted(() => {
  fetchMciList();
});
</script>

<template>
  <div>
    <p-horizontal-layout :height="400" :min-height="400" :max-height="1000">
      <template #container="{ height }">
        <p-toolbox-table
          ref="toolboxTable"
          :loading="loading"
          :items="mciTableModel.tableState.displayItems"
          :fields="mciTableModel.tableState.fields"
          :total-count="mciTableModel.tableState.tableCount"
          :style="{ height: `${height}px` }"
          :sortable="mciTableModel.tableOptions.sortable"
          :sort-by="mciTableModel.tableOptions.sortBy"
          :selectable="mciTableModel.tableOptions.selectable"
          :multi-select="mciTableModel.tableOptions.multiSelect"
          :search-type="mciTableModel.tableOptions.searchType"
          :key-item-sets="mciTableModel.querySearchState.keyItemSet"
          :value-handler-map="mciTableModel.querySearchState.valueHandlerMap"
          :query-tag="mciTableModel.querySearchState.queryTag"
          :select-index.sync="mciTableModel.tableState.selectIndex"
          :page-size="mciTableModel.tableOptions.pageSize"
          @change="mciTableModel.handleChange"
          @refresh="fetchMciList"
          @select="handleSelectedIndex"
        >
          <template #toolbox-left>
            <p-button
              style-type="primary"
              icon-left="ic_plus_bold"
              disabled
              @click="mciCreateModalState.open = true"
            >
              Create
            </p-button>
          </template>
          <template #col-provider-format="{ item, field }">
            <p-badge
              v-for="(provider, index) in item.provider"
              :key="index"
              :backgroundColor="provider.color"
              class="mr-1"
            >
              {{ provider.name }}
            </p-badge>
          </template>
        </p-toolbox-table>
      </template>
    </p-horizontal-layout>
  </div>
</template>

<style scoped lang="postcss"></style>
