<script setup lang="ts">
import {
  PToolboxTable,
  PHorizontalLayout,
  PButton,
  PButtonModal,
} from '@cloudforet-test/mirinae';
import {
  onBeforeMount,
  onMounted,
  reactive,
  watch,
  computed,
  ref,
  nextTick,
} from 'vue';
import TableLoadingSpinner from '@/shared/ui/LoadingSpinner/TableLoadingSpinner.vue';
import {
  insertDynamicComponent,
  showErrorMessage,
  showSuccessMessage,
  toErrorMessage,
} from '@/shared/utils';
import { useSourceServiceListModel } from '@/widgets/source/sourceServices/sourceServiceList/model/sourceServiceListModel';
import DynamicTableIconButton from '@/shared/ui/Button/dynamicIconButton/DynamicTableIconButton.vue';
import { useBulkDeleteSourceGroup } from '@/entities/sourceService/api';
import { useDynamicTableHeight } from '@/shared/hooks/table/useDynamicTableHeight';
import { useToolboxTableHeight } from '@/shared/hooks/table/useToolboxTableHeight';

const {
  tableModel,
  sourceServicesStore,
  resSourceServiceList,
  initToolBoxTableModel,
} = useSourceServiceListModel();

const { dynamicHeight, minHeight, maxHeight } = useDynamicTableHeight(
  computed(() => tableModel.tableState.items.length),
  computed(() => tableModel.tableOptions.pageSize),
);

const { toolboxTableRef, adjustedDynamicHeight } = useToolboxTableHeight(
  computed(() => dynamicHeight.value),
);

const isDataLoaded = ref(false);
const tableKey = ref(0); // key used to force the component to re-render

interface IProps {
  addModalState: boolean;
  trigger: boolean;
}

const props = defineProps<IProps>();
const emit = defineEmits([
  'selectRow',
  'update:addModalState',
  'update:trigger',
  'update:title',
  'update:connection-title',
]);

const modals = reactive({
  alertModalState: { open: false },
  serviceAddModalState: { open: false },
});

onBeforeMount(() => {
  initToolBoxTableModel();
});

onMounted(function () {
  getSourceServiceList();
});

/**
 * Put the delete icon back after every load.
 *
 * Loading the list bumps `tableKey`, which re-creates the table and takes the
 * injected icon with it. Watching only the load flag meant the icon went in just
 * before that re-render threw it away: it was there when the screen first opened
 * and gone after any refresh - including the one that follows saving - so there
 * was no way to delete a row without reloading the page.
 *
 * Both signals are watched and the injection is skipped when the icon is already
 * there, so a repeated call cannot stack a second icon.
 */
const ensureDeleteIcon = () => {
  const tableEl = toolboxTableRef.value?.$el as HTMLElement | undefined;
  const target = tableEl?.querySelector('.right-tool-group');
  if (!target) return;
  if (target.querySelector('[data-testid="source-group-delete"]')) return;
  addDeleteIconAtTable.call({
    $refs: { toolboxTable: toolboxTableRef.value },
  });
};

watch(
  [isDataLoaded, tableKey],
  async ([loaded]) => {
    if (!loaded || !toolboxTableRef.value) return;
    await nextTick();
    await nextTick();
    ensureDeleteIcon();
  },
  { immediate: true },
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
  // Give the dynamically injected delete icon a data-testid for e2e selectors
  instance.$el.setAttribute('data-testid', 'source-group-delete');
  return instance;
}

function handleDeleteSourceServices() {
  const selectedSourceServicesIds = [];

  tableModel.tableState.selectIndex.reduce((acc, selectIndex) => {
    acc.push(tableModel.tableState.displayItems[selectIndex].id);
    return acc;
  }, selectedSourceServicesIds);

  if (selectedSourceServicesIds.length) {
    useBulkDeleteSourceGroup(selectedSourceServicesIds)
      .then(res => {
        handleRefreshTable();
        showSuccessMessage('Success', 'Delete Success');
      })
      .catch(error => {
        showErrorMessage('Error', error);
      });
  }
}

function getSourceServiceList() {
  isDataLoaded.value = false;

  resSourceServiceList
    .execute()
    .then(res => {
      if (res.data.responseData) {
        sourceServicesStore.setService(res.data.responseData);
      }

      nextTick(() => {
        isDataLoaded.value = true;
        // Re-render the component after the data loads
        tableKey.value++;
      });
    })
    .catch(e => {
      showErrorMessage(
        'Error',
        toErrorMessage(e, 'Failed to load the source group list.'),
      );
      isDataLoaded.value = true;
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

function handleRefreshTable() {
  tableModel.initState();
  emit('selectRow', '');
  getSourceServiceList();
}

watch(
  () => props.trigger,
  nv => {
    if (nv) {
      handleRefreshTable();
      emit('update:trigger');
    }
  },
);

// :loading="
//             tableModel.tableState.loading ||
//             resSourceServiceList.isLoading.value
//           "
</script>

<template>
  <div>
    <p-horizontal-layout :key="tableKey" :height="adjustedDynamicHeight">
      <template #container="{ height }">
        <!-- Show a spinner while loading -->
        <table-loading-spinner
          :loading="resSourceServiceList.isLoading.value"
          :height="height"
          message="Loading source services..."
        />

        <!-- Show the table once loading completes -->
        <p-toolbox-table
          data-testid="source-group-list-table"
          v-if="!resSourceServiceList.isLoading.value"
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
            <p-button
              data-testid="source-group-add"
              style-type="primary"
              icon-left="ic_plus_bold"
              @click="
                () => {
                  emit('update:addModalState', true);
                  emit('update:title', 'add');
                  emit('update:connection-title', 'add');
                }
              "
            >
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
          handleDeleteSourceServices();
        }
      "
    >
      <template #confirm-button>
        <span data-testid="source-group-delete-confirm">OK</span>
      </template>
    </p-button-modal>
  </div>
</template>

<style scoped lang="postcss"></style>
