<script setup lang="ts">
import { PToolboxTable, PButton, PIconButton } from '@cloudforet-test/mirinae';
import {
  insertDynamicComponent,
  showErrorMessage,
  showSuccessMessage,
} from '@/shared/utils';
import { onBeforeMount, onMounted, watch } from 'vue';
import { useSourceConnectionListModel } from '@/widgets/source/sourceConnections/sourceConnectionList/model/sourceConnectionListModel.ts';
import { useBulkDeleteSourceConnection } from '@/entities/sourceConnection/api';
import DynamicTableIconButton from '@/shared/ui/Button/dynamicIconButton/DynamicTableIconButton.vue';

interface IProps {
  selectedServiceId: string;
}

const props = defineProps<IProps>();
const emit = defineEmits(['selectRow']);
const {
  tableModel,
  resSourceConnectionList,
  initToolBoxTableModel,
  sourceConnectionStore,
  setTargetConnections,
} = useSourceConnectionListModel();

watch(
  props,
  () => {
    tableModel.initState();
    getSourceConnectionList();
  },
  { immediate: true },
);
onBeforeMount(() => {
  initToolBoxTableModel();
});

onMounted(function () {
  addDeleteIconAtTable.bind(this)();
});

function getSourceConnectionList() {
  resSourceConnectionList
    .execute({
      pathParams: { sgId: props.selectedServiceId },
    })
    .then(res => {
      if (res.data.responseData) {
        sourceConnectionStore.setConnections(res.data.responseData);

        const connectionIds = res.data.responseData.map(el => el.id);
        setTargetConnections(connectionIds);
      }
    })
    .catch(e => {
      if (e.errorMsg.value) showErrorMessage('Error', e.errorMsg.value);
    });
}

function handleRefresh() {
  tableModel.initState();
  emit('selectRow', '');
  sourceConnectionStore.clear();
  getSourceConnectionList();
}

function handleSelectedIndex(index: number[]) {
  const selectedData = tableModel.tableState.displayItems[index];
  if (selectedData) {
    emit('selectRow', selectedData.id);
  } else {
    emit('selectRow', '');
  }
}

//FIXME bulk로 요청을 보내고 끝나면 응답 모달.
// 삭제전 물어보는 alert
function handleDeleteConnections() {
  const selectedConnectionsIds = [];

  tableModel.tableState.selectIndex.reduce((acc, selectIndex) => {
    acc.push({
      sgId: props.selectedServiceId,
      connId: tableModel.tableState.displayItems[selectIndex].id,
    });
    return acc;
  }, selectedConnectionsIds);

  useBulkDeleteSourceConnection(selectedConnectionsIds)
    .then(res => {
      showSuccessMessage('success', 'Delete Success');
    })
    .catch(err => {
      if (err.errorMsg.value) showErrorMessage('Error', err.errorMsg.value);
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
      click: handleDeleteConnections,
    },
    targetElement,
    'prepend',
  );
  return instance;
}
</script>

<template>
  <div>
    <section>
      <p-toolbox-table
        ref="toolboxTable"
        :loading="
          tableModel.tableState.loading ||
          resSourceConnectionList.isLoading.value
        "
        :items="tableModel.tableState.displayItems"
        :fields="tableModel.tableState.fields"
        :total-count="tableModel.tableState.tableCount"
        :style="{ height: `500px` }"
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
        @refresh="handleRefresh"
        @select="handleSelectedIndex"
      >
        <template #toolbox-left>
          <p-button style-type="secondary" icon-left="ic_plus_bold">
            Add / Edit
          </p-button>
        </template>
      </p-toolbox-table>
    </section>
    <section class="relative">
      <slot :name="'sourceConnectionDetail'"></slot>
    </section>
  </div>
</template>

<style scoped lang="postcss"></style>
