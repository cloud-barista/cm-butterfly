<script setup lang="ts">
import { PToolboxTable, PButton, PButtonModal, PHorizontalLayout } from '@cloudforet-test/mirinae';
import {
  insertDynamicComponent,
  showErrorMessage,
  showSuccessMessage,
} from '@/shared/utils';
import { onBeforeMount, onMounted, reactive, watch, computed, ref, nextTick } from 'vue';
import TableLoadingSpinner from '@/shared/ui/LoadingSpinner/TableLoadingSpinner.vue';
import { useSourceConnectionListModel } from '@/widgets/source/sourceConnections/sourceConnectionList/model/sourceConnectionListModel';
import { useBulkDeleteSourceConnection } from '@/entities/sourceConnection/api';
import DynamicTableIconButton from '@/shared/ui/Button/dynamicIconButton/DynamicTableIconButton.vue';
import { useDynamicTableHeight } from '@/shared/hooks/table/useDynamicTableHeight';
import { useToolboxTableHeight } from '@/shared/hooks/table/useToolboxTableHeight';

interface IProps {
  selectedServiceId: string;
  trigger: boolean;
}

const props = defineProps<IProps>();
const emit = defineEmits([
  'selectRow',
  'select:multi-row',
  'update:trigger',
  'update:addModalState',
  'update:title',
]);

const {
  tableModel,
  resSourceConnectionList,
  initToolBoxTableModel,
  sourceConnectionStore,
  setTargetConnections,
} = useSourceConnectionListModel();

const { dynamicHeight, minHeight, maxHeight } = useDynamicTableHeight(
  computed(() => tableModel.tableState.items.length),
  computed(() => tableModel.tableOptions.pageSize),
);

const { toolboxTableRef, adjustedDynamicHeight } = useToolboxTableHeight(
  computed(() => dynamicHeight.value),
);

const isDataLoaded = ref(false);
const tableKey = ref(0); // 컴포넌트 재렌더링을 위한 key

const modals = reactive({
  alertModalState: { open: false },
});

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
  // addDeleteIconAtTable will be called after data loaded
});

watch(isDataLoaded, (nv) => {
  if (nv && toolboxTableRef.value) {
    nextTick(() => {
      addDeleteIconAtTable.call({ $refs: { toolboxTable: toolboxTableRef.value } });
    });
  }
});

function getSourceConnectionList() {
  isDataLoaded.value = false;
  
  resSourceConnectionList
    .execute({
      pathParams: { sgId: props.selectedServiceId },
    })
    .then(res => {
      if (res.data.responseData) {
        sourceConnectionStore.setConnections(res.data.responseData);

        const connectionIds = res.data.responseData.connection_info.map(
          el => el.id,
        );
        setTargetConnections(connectionIds);
      }
      
      nextTick(() => {
        isDataLoaded.value = true;
        // 데이터 로드 후 컴포넌트 재렌더링
        tableKey.value++;
      });
    })
    .catch(e => {
      if (e.errorMsg.value) showErrorMessage('Error', e.errorMsg.value);
      isDataLoaded.value = true;
    });
}

function handleSelectedIndex(index: number[]) {
  let arr: string[] = [];
  const selectedData = tableModel.tableState.displayItems[index];
  if (selectedData) {
    emit('selectRow', selectedData.id);
  } else {
    emit('selectRow', '');
  }
  index.forEach((i: number) => {
    arr.push(tableModel.tableState.displayItems[i].id);
  });
  emit('select:multi-row', arr);
}

function handleDeleteConnections() {
  const selectedConnectionsIds = [];

  tableModel.tableState.selectIndex.reduce((acc, selectIndex) => {
    acc.push({
      sgId: props.selectedServiceId,
      connId: tableModel.tableState.displayItems[selectIndex].id,
    });
    return acc;
  }, selectedConnectionsIds);

  if (selectedConnectionsIds.length) {
    useBulkDeleteSourceConnection(selectedConnectionsIds)
      .then(res => {
        handleRefresh();
        showSuccessMessage('success', 'Delete Success');
      })
      .catch(err => {
        showErrorMessage('Error', err);
      });
  }
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
        if (tableModel.tableState.selectIndex.length > 0)
          modals.alertModalState.open = true;
      },
    },
    targetElement,
    'prepend',
  );
  return instance;
}

function handleRefresh() {
  tableModel.initState();
  emit('selectRow', '');
  sourceConnectionStore.clear();
  getSourceConnectionList();
}

watch(
  () => props.trigger,
  nv => {
    if (nv) {
      handleRefresh();
      emit('update:trigger');
    }
  },
);

function handleSourceConnectionList() {
  emit('update:addModalState', true);
  emit('update:title', 'edit');
}
</script>

<template>
  <div>
    <section>
      <p-horizontal-layout :key="tableKey" :height="adjustedDynamicHeight">
        <template #container="{ height }">
          <!-- 로딩 중일 때 스피너 표시 -->
          <table-loading-spinner
            :loading="resSourceConnectionList.isLoading.value || tableModel.tableState.loading"
            :height="height"
            message="Loading source connections..."
          />
          
          <!-- 로딩 완료 후 테이블 표시 -->
          <p-toolbox-table
            v-if="!resSourceConnectionList.isLoading.value && !tableModel.tableState.loading"
            ref="toolboxTableRef"
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
            @refresh="handleRefresh"
            @select="handleSelectedIndex"
          >
            <template #toolbox-left>
              <p-button
                style-type="secondary"
                icon-left="ic_plus_bold"
                @click="handleSourceConnectionList"
              >
                Add / Edit
              </p-button>
            </template>
          </p-toolbox-table>
        </template>
      </p-horizontal-layout>
    </section>
    <section class="relative">
      <slot :name="'sourceConnectionDetail'" />
    </section>
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
          handleDeleteConnections();
        }
      "
    />
  </div>
</template>

<style scoped lang="postcss"></style>
