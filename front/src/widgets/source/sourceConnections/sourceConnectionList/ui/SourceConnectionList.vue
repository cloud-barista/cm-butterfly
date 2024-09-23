<script setup lang="ts">
import { PToolboxTable, PButton } from '@cloudforet-test/mirinae';
import { showErrorMessage } from '@/shared/utils';
import { onBeforeMount, onMounted } from 'vue';
import { useSourceConnectionListModel } from '@/widgets/source/sourceConnections/sourceConnectionList/model/sourceConnectionListModel.ts';

interface IProps {
  selectedServiceId: string;
}

const props = defineProps<IProps>();
const emit = defineEmits(['selectRow']);
const {
  tableModel,
  connections,
  resSourceConnectionList,
  initToolBoxTableModel,
  sourceConnectionStore,
} = useSourceConnectionListModel();

function getSourceConnectionList() {
  resSourceConnectionList
    .execute({
      pathParams: { sgId: props.selectedServiceId },
    })
    .then(res => {
      if (res.data.responseData) {
        sourceConnectionStore.setConnections(res.data.responseData);
      }
    })
    .catch(e => {
      showErrorMessage('Error', e.errorMsg.value);
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

onBeforeMount(() => {
  initToolBoxTableModel();
});

onMounted(() => {
  getSourceConnectionList();
});
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
        @refresh="getSourceConnectionList"
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
