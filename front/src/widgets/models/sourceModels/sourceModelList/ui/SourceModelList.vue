<script setup lang="ts">
import {
  PToolboxTable,
  PHorizontalLayout,
  PButton,
  PButtonModal,
} from '@cloudforet-test/mirinae';
import { useSourceModelListModel } from '@/widgets/models/sourceModels/sourceModelList/model/sourceModelListModel';
import { onBeforeMount, onMounted, reactive, watch } from 'vue';
import {
  insertDynamicComponent,
  showErrorMessage,
  showSuccessMessage,
} from '@/shared/utils';
import DynamicTableIconButton from '@/shared/ui/Button/dynamicIconButton/DynamicTableIconButton.vue';
import { useBulkAddWorkspaceList, useGetSourceModelList } from '@/entities';

interface IProps {
  trigger: boolean;
}

const props = defineProps<IProps>();
const emit = defineEmits(['select-row', 'update:trigger']);

const { tableModel, initToolBoxTableModel, sourceModelStore } =
  useSourceModelListModel();

const modals = reactive({
  alertModalState: { open: false },
  sourceModelAddModalState: { open: false },
});

const resSourceList = useGetSourceModelList();

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
    getTableList();
    emit('update:trigger', false);
  },
);

function getTableList() {
  resSourceList
    .execute()
    .then(res => {
      if (res.data.responseData) {
        sourceModelStore.setSourceModel(res.data.responseData);
      }
    })
    .catch(e => {
      showErrorMessage('error', e.errorMsg);
    });
}

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
        if (tableModel.tableState.selectIndex.length > 0) {
          modals.alertModalState.open = true;
        }
      },
    },
    targetElement,
    'prepend',
  );
  return instance;
}

function multiDelete() {
  const selectedData = tableModel.tableState.selectIndex.map(index => {
    return tableModel.tableState.displayItems[index].id;
  });

  useBulkAddWorkspaceList(selectedData)
    .then(res => {
      handleRefreshTable();
      tableModel.tableState.selectIndex = [];
      showSuccessMessage('success', 'Delete Success');
    })
    .catch(err => {
      showErrorMessage('Error', err);
    });
}

function handleRefreshTable() {
  getTableList();
}

function handleSelectedIndex(selectedIndex: number) {
  const selectedData = tableModel.tableState.displayItems[selectedIndex];
  if (selectedData) {
    emit('select-row', { id: selectedData.id, name: selectedData.name ?? '' });
  } else {
    emit('select-row', { id: '', name: '' });
  }
}

function handleDeleteConfirm() {
  multiDelete();
  modals.alertModalState.open = false;
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
          @change="tableModel.handleChange"
          @refresh="handleRefreshTable"
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
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<style scoped lang="postcss"></style>
