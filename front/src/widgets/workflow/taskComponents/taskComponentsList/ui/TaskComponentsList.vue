<script setup lang="ts">
import {
  PToolboxTable,
  PHorizontalLayout,
  PButton,
  PButtonModal,
} from '@cloudforet-test/mirinae';
import { useTaskComponentsListModel } from '@/widgets/workflow/taskComponents/taskComponentsList/model/taskComponenetsListModel';
import TableLoadingSpinner from '@/shared/ui/LoadingSpinner/TableLoadingSpinner.vue';
import {
  insertDynamicComponent,
  showErrorMessage,
  showSuccessMessage,
} from '@/shared/utils';
import DynamicTableIconButton from '@/shared/ui/Button/dynamicIconButton/DynamicTableIconButton.vue';
import { onBeforeMount, onMounted, reactive, watch, computed, ref, nextTick } from 'vue';
import {
  useBulkDeleteTaskComponent,
  useGetTaskComponentList,
} from '@/entities';
import { useDynamicTableHeight } from '@/shared/hooks/table/useDynamicTableHeight';
import { useToolboxTableHeight } from '@/shared/hooks/table/useToolboxTableHeight';

const getTaskComponentList = useGetTaskComponentList();

const { tableModel, initToolBoxTableModel, workflowStore } =
  useTaskComponentsListModel();

const { dynamicHeight, minHeight, maxHeight } = useDynamicTableHeight(
  computed(() => tableModel.tableState.items.length),
  computed(() => tableModel.tableOptions.pageSize),
);

const { toolboxTableRef, adjustedDynamicHeight } = useToolboxTableHeight(
  computed(() => dynamicHeight.value),
);

interface iProps {
  trigger: boolean;
}

const props = defineProps<iProps>();
const emit = defineEmits(['select-row', 'update:trigger']);

const modal = reactive({
  alertModalState: { open: false },
});

const isDataLoaded = ref(false);

onBeforeMount(() => {
  initToolBoxTableModel();
});

onMounted(function (this: any) {
  fetchTaskComponentsList();
});

watch(isDataLoaded, (nv) => {
  if (nv && toolboxTableRef.value) {
    nextTick(() => {
      addDeleteIconAtTable.call({ $refs: { toolboxTable: toolboxTableRef.value } });
    });
  }
});

function addDeleteIconAtTable(this: any) {
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
          modal.alertModalState.open = true;
        }
      },
    },
    targetElement,
    'prepend',
  );
  return instance;
}

function handleDeleteTaskComponent() {
  const selectedTaskComponentsIds: any[] = [];

  tableModel.tableState.selectIndex.reduce((acc, selectIndex) => {
    acc.push(tableModel.tableState.displayItems[selectIndex].id);
    return acc;
  }, selectedTaskComponentsIds);

  if (selectedTaskComponentsIds.length > 0) {
    useBulkDeleteTaskComponent(selectedTaskComponentsIds)
      .then(res => {
        handleRefreshTable();
        showSuccessMessage('success', 'Delete Success');
      })
      .catch(err => {
        showErrorMessage('Error', err);
      });
  }
}

function handleRefreshTable() {
  tableModel.initState();
  emit('select-row', '');
  fetchTaskComponentsList();
}

function handleSelectedIndex(selectedIndex: number) {
  const selectedData = tableModel.tableState.displayItems[selectedIndex];
  if (selectedData) {
    emit('select-row', selectedData.id);
  } else {
    emit('select-row', '');
  }
}
async function fetchTaskComponentsList() {
  isDataLoaded.value = false;
  try {
    const { data } = await getTaskComponentList.execute();
    if (
      data.status?.code === 200 &&
      data.responseData &&
      data.responseData.length > 0
    ) {
      // cicada_task_run_script is now included in API response
      // cicada_task_run_script는 이제 API 응답에 포함됨
      workflowStore.setTaskComponents(data.responseData);
    }
    nextTick(() => {
      isDataLoaded.value = true;
    });
  } catch (e) {
    console.log(e);
    isDataLoaded.value = true;
  }
}

watch(
  () => props.trigger,
  nv => {
    if (nv) {
      handleRefreshTable();
      emit('update:trigger');
    }
  },
  { immediate: true },
);
</script>

<template>
  <div>
    <p-horizontal-layout :height="adjustedDynamicHeight">
      <template #container="{ height }">
        <!-- 로딩 중일 때 스피너 표시 -->
        <table-loading-spinner
          :loading="getTaskComponentList.isLoading.value"
          :height="height"
          message="Loading task components..."
        />
        
        <!-- 로딩 완료 후 테이블 표시 -->
        <p-toolbox-table
          v-if="!getTaskComponentList.isLoading.value"
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
          @refresh="handleRefreshTable"
          @select="handleSelectedIndex"
        >
          <template #toolbox-left>
            <p-button disabled icon-left="ic_plus_bold">Add</p-button>
          </template>
        </p-toolbox-table>
      </template>
    </p-horizontal-layout>
    <p-button-modal
      v-model="modal.alertModalState.open"
      :visible="true"
      size="sm"
      backdrop
      theme-color="alert"
      header-title="Are you sure you want to delete it?"
      :hide-body="true"
      :hide-header-close-button="true"
      @confirm="
        () => {
          modal.alertModalState.open = false;
          handleDeleteTaskComponent();
        }
      "
    />
  </div>
</template>
