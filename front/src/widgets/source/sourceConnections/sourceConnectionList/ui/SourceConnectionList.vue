<script setup lang="ts">
import {
  PToolboxTable,
  PButton,
  PButtonModal,
  PHorizontalLayout,
  PRadio,
  PRadioGroup,
} from '@cloudforet-test/mirinae';
import {
  buildExportFileName,
  insertDynamicComponent,
  showErrorMessage,
  showSuccessMessage,
  toErrorMessage,
} from '@/shared/utils';
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
import { useSourceConnectionListModel } from '@/widgets/source/sourceConnections/sourceConnectionList/model/sourceConnectionListModel';
import { useBulkDeleteSourceConnection } from '@/entities/sourceConnection/api';
import {
  ITabularExportConnection,
  useExportTabularConnections,
} from '@/entities/sourceConnection/api/tabularExport';
import { useSourceServiceStore } from '@/entities/sourceService/model/stores';
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
const tableKey = ref(0); // key for re-rendering the component

const modals = reactive({
  alertModalState: { open: false },
  exportModalState: { open: false },
});

const sourceServiceStore = useSourceServiceStore();
const exportConnections = useExportTabularConnections();
const isExporting = ref(false);

// CSV opens everywhere but can be awkward to edit (encoding, auto-formatting);
// Excel is offered as an alternative. CSV stays the default.
type ExportFormat = 'csv' | 'xlsx';
const exportFormat = ref<ExportFormat>('csv');
const exportFormatOptions: { label: string; value: ExportFormat }[] = [
  { label: 'CSV', value: 'csv' },
  { label: 'Excel (.xlsx)', value: 'xlsx' },
];

// The table is a mirinae component whose selection is not a real checkbox, so
// the selected row indexes are the only reliable signal here.
const selectedCount = computed(() => tableModel.tableState.selectIndex.length);
const hasSelection = computed(() => selectedCount.value > 0);

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
  if (target.querySelector('[data-testid="source-connection-delete"]')) return;
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

function getSourceConnectionList() {
  isDataLoaded.value = false;

  resSourceConnectionList
    .execute({
      pathParams: { sgId: props.selectedServiceId },
    })
    .then(res => {
      // A source group with no connections returns connection_info as null or omits it.
      // Absent means none, not broken, so treat it as an empty list.
      sourceConnectionStore.setConnections(res.data.responseData);

      const connectionIds = (res.data.responseData?.connection_info ?? []).map(
        el => el.id,
      );
      setTargetConnections(connectionIds);

      nextTick(() => {
        isDataLoaded.value = true;
        // re-render the component after loading the data
        tableKey.value++;
      });
    })
    .catch(e => {
      showErrorMessage(
        'Error',
        toErrorMessage(e, 'Failed to load the connection list.'),
      );
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

// Read the checked rows the same way the delete flow does.
function selectedSourceConnections() {
  return tableModel.tableState.selectIndex
    .map(selectIndex => tableModel.tableState.displayItems[selectIndex])
    .filter(item => !!item);
}

function handleExportClick() {
  // A mirinae button renders disabled as a class only, so the click still
  // reaches this handler. Stop here rather than trusting the attribute.
  if (!hasSelection.value || isExporting.value) return;
  exportFormat.value = 'csv'; // reset to the default each time the dialog opens
  modals.exportModalState.open = true;
}

// The file name uses the connection name for a single row and the source group
// name for several, and always carries a timestamp so exporting twice does not
// overwrite the earlier file.
function exportBaseName(rows: ReturnType<typeof selectedSourceConnections>) {
  if (rows.length === 1) return rows[0].name;
  return sourceServiceStore.getServiceById(props.selectedServiceId)?.name ?? '';
}

const EXPORT_MIME: Record<ExportFormat, string> = {
  csv: 'text/csv;charset=utf-8;',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

function downloadExportedFile(
  contentBase64: string,
  fileName: string,
  format: ExportFormat,
) {
  const binary = atob(contentBase64);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  const blob = new Blob([bytes], { type: EXPORT_MIME[format] });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

async function handleExportConfirm() {
  modals.exportModalState.open = false;

  const rows = selectedSourceConnections();
  if (!rows.length) return;

  // Only the columns the server writes out. Encrypted fields are never sent,
  // so they cannot end up in the file.
  const connections: ITabularExportConnection[] = rows.map(row => ({
    name: row.originalData?.name ?? '',
    description: row.originalData?.description ?? '',
    ip_address: row.originalData?.ip_address ?? '',
    ssh_port: String(row.originalData?.ssh_port ?? ''),
  }));

  const format = exportFormat.value;
  isExporting.value = true;
  try {
    const { data } = await exportConnections.execute({
      format,
      connections,
    });

    if (data?.status?.code !== 200 || !data?.responseData?.contentBase64) {
      showErrorMessage(
        'Export Failed',
        data?.status?.message || 'The export file could not be created.',
      );
      return;
    }

    downloadExportedFile(
      data.responseData.contentBase64,
      buildExportFileName(exportBaseName(rows), format),
      format,
    );
    showSuccessMessage('success', `Exported ${rows.length} connection(s).`);
  } catch (error) {
    showErrorMessage(
      'Export Failed',
      toErrorMessage(error, 'The export file could not be created.'),
    );
  } finally {
    isExporting.value = false;
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
  // Give the dynamically injected delete icon a data-testid for e2e selectors
  instance.$el.setAttribute('data-testid', 'source-connection-delete');
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
          <!-- Show a spinner while loading -->
          <table-loading-spinner
            :loading="
              resSourceConnectionList.isLoading.value ||
              tableModel.tableState.loading
            "
            :height="height"
            message="Loading source connections..."
          />

          <!-- Show the table after loading completes -->
          <p-toolbox-table
            v-if="
              !resSourceConnectionList.isLoading.value &&
              !tableModel.tableState.loading
            "
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
                data-testid="source-connection-add-edit"
                style-type="secondary"
                icon-left="ic_plus_bold"
                @click="handleSourceConnectionList"
              >
                Add / Edit
              </p-button>
              <p-button
                data-testid="source-connection-export"
                class="ml-2"
                style-type="secondary"
                icon-left="ic_download"
                :disabled="!hasSelection || isExporting"
                @click="handleExportClick"
              >
                Export
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
    >
      <template #confirm-button>
        <span data-testid="source-connection-delete-confirm">OK</span>
      </template>
    </p-button-modal>
    <!-- Asked before the download so nobody is surprised by the blank
         credential columns after opening the file. -->
    <p-button-modal
      v-model="modals.exportModalState.open"
      :visible="modals.exportModalState.open"
      size="sm"
      backdrop
      header-title="Export connections"
      @confirm="handleExportConfirm"
    >
      <template #body>
        <p data-testid="source-connection-export-notice">
          The encrypted columns (user, password, private key) are not included
          in the export. Fill them in yourself before importing the file again.
        </p>
        <p class="mt-2">{{ selectedCount }} connection(s) will be exported.</p>
        <div class="export-format mt-2">
          <span class="export-format-label">File format</span>
          <p-radio-group>
            <p-radio
              v-for="option in exportFormatOptions"
              :key="option.value"
              v-model="exportFormat"
              :value="option.value"
              :data-testid="`source-connection-export-format-${option.value}`"
            >
              <span>{{ option.label }}</span>
            </p-radio>
          </p-radio-group>
        </div>
      </template>
      <template #confirm-button>
        <span data-testid="source-connection-export-confirm">Export</span>
      </template>
      <template #close-button>
        <span data-testid="source-connection-export-cancel">Cancel</span>
      </template>
    </p-button-modal>
  </div>
</template>

<style scoped lang="postcss">
.export-format {
  @apply flex items-center gap-[0.75rem];
}
.export-format-label {
  @apply text-[0.8125rem] text-gray-600;
}
</style>
