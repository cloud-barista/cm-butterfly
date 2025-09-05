<script setup lang="ts">
import {
  PToolboxTable,
  PHorizontalLayout,
  PButton,
  PButtonModal,
} from '@cloudforet-test/mirinae';
import { useTargetModelListModel } from '@/widgets/models/targetModels/targetModelList/model/targetModelListModel';
import { insertDynamicComponent } from '@/shared/utils';
import DynamicTableIconButton from '@/shared/ui/Button/dynamicIconButton/DynamicTableIconButton.vue';
import { onBeforeMount, onMounted, reactive, watch } from 'vue';
import { useGetTargetModelList } from '@/entities/targetModels/api';

const { tableModel, initToolBoxTableModel, targetModelStore } =
  useTargetModelListModel();

interface IProps {
  trigger: boolean;
}

const props = defineProps<IProps>();

const emit = defineEmits(['select-row', 'update:trigger']);

const modals = reactive({
  alertModalState: { open: false },
  sourceModelAddModalState: { open: false },
});

const resGetTargetModelList = useGetTargetModelList();

onBeforeMount(() => {
  initToolBoxTableModel();
});

onMounted(function () {
  addDeleteIconAtTable.bind(this)();
  getTableList();
});

watch(
  () => props.trigger,
  () => {
    tableModel.tableState.selectIndex = [];
    getTableList();
    emit('update:trigger', false);
  },
);

function addDeleteIconAtTable() {
  const toolboxTable = this.$refs.toolboxTable.$el;
  const targetElement = toolboxTable.querySelector('.right-tool-group');
  const instance = insertDynamicComponent(
    DynamicTableIconButton,
    {
      name: 'ic_delete',
    },
    {
      click: () => {
        if (tableModel.tableState.selectIndex.length > 0)
          modals.alertModalState.open = true;
      },
    },
    targetElement,
    'prepend',
  );
  return instance;
}

function getTableList() {
  resGetTargetModelList.execute().then(res => {
    if (res.data.responseData) {
      targetModelStore.setTargetModel(res.data.responseData);
    }
  });
}

function handleSelectedIndex(selectedIndex: number) {
  const selectedData = tableModel.tableState.displayItems[selectedIndex];
  if (selectedData) {
    emit('select-row', { id: selectedData.id, name: selectedData.name });
  } else {
    emit('select-row', '');
  }
}
</script>

<template>
  <div>
    <p-horizontal-layout :height="400" :min-height="400" :max-height="1000">
      <template #container="{ height }">
        <p-toolbox-table
          ref="toolboxTable"
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
          :loading="resGetTargetModelList.isLoading.value"
          @change="tableModel.handleChange"
          @refresh="getTableList"
          @select="handleSelectedIndex"
        >
          <template #toolbox-left>
            <p-button style-type="primary" icon-left="ic_plus_bold" disabled>
              Add
            </p-button>
          </template>
        </p-toolbox-table>
      </template>
    </p-horizontal-layout>
    <p-button-modal
      v-model="modals.alertModalState.open"
      :visible="modals.alertModalState.open"
      size="sm"
      backdrop
      theme-color="alert"
      header-title="Are you sure you want to delete it?"
      :hide-body="true"
      :hide-header-close-button="true"
      @confirm="
        () => {
          modals.alertModalState.open = false;
        }
      "
    />
  </div>
</template>

<style scoped lang="postcss"></style>
