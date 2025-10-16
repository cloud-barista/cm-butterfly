<script setup lang="ts">
import {
  PToolboxTable,
  PHorizontalLayout,
  PButton,
  PButtonModal,
} from '@cloudforet-test/mirinae';
import { useWorkflowListModel } from '@/widgets/workflow/workflows/workflowList/model/workflowListModel';
import {
  insertDynamicComponent,
  showSuccessMessage,
  showErrorMessage,
} from '@/shared/utils';
import DynamicTableIconButton from '@/shared/ui/Button/dynamicIconButton/DynamicTableIconButton.vue';
import { onBeforeMount, onMounted, reactive, ref, watch } from 'vue';
import { useGetWorkflowList, useBulkDeleteWorkflow } from '@/entities';
import { useRunWorkflow } from '@/entities';

const runWorkflow = useRunWorkflow('');
const getWorkflowList = useGetWorkflowList();

const { tableModel, initToolBoxTableModel, workflowStore } =
  useWorkflowListModel();

interface iProps {
  trigger: boolean;
  selectedWfId: any;
}

const props = defineProps<iProps>();

const emit = defineEmits(['select-row', 'update:trigger']);

const modal = reactive({
  alertModalState: { open: false },
});
const isRunLoading = ref<boolean>(false);

onBeforeMount(() => {
  initToolBoxTableModel();
});

onMounted(function (this: any) {
  addDeleteIconAtTable.bind(this)();
  fetchWorkflowList();
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

function handleDeleteWorkflow() {
  const selectedWorkflowsIds: any[] = [];

  tableModel.tableState.selectIndex.reduce((acc, selectIndex) => {
    acc.push(tableModel.tableState.displayItems[selectIndex].id);
    return acc;
  }, selectedWorkflowsIds);

  if (selectedWorkflowsIds.length > 0) {
    useBulkDeleteWorkflow(selectedWorkflowsIds)
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
  fetchWorkflowList();
}

function handleSelectedIndex(selectedIndex: number) {
  const selectedData = tableModel.tableState.displayItems[selectedIndex];
  if (selectedData) {
    emit('select-row', selectedData.id);
  } else {
    emit('select-row', '');
  }
}

async function fetchWorkflowList() {
  try {
    tableModel.tableState.loading = true;
    const { data } = await getWorkflowList.execute();
    if (data.status?.code === 200 && Array.isArray(data.responseData)) {
      workflowStore.setWorkFlows(data.responseData);
      if (data.responseData.length === 0) {
        showErrorMessage('info', '조회된 Workflow가 없습니다.');
      }
    } else {
      workflowStore.setWorkFlows([]);
      showErrorMessage('error', 'Workflow 목록을 불러오지 못했습니다.');
    }
  } catch (e) {
    workflowStore.setWorkFlows([]);
    showErrorMessage('error', 'Workflow 목록 조회 중 오류가 발생했습니다.');
  } finally {
    tableModel.tableState.loading = false;
  }
}

async function handleRunWorkflow(e: any) {
  const selectedWfId: string =
    e.target.parentNode.parentNode.children[2].textContent.split(' ')[1];
  try {
    isRunLoading.value = true;

    const { data } = await runWorkflow.execute({
      pathParams: {
        wfId: selectedWfId,
      },
    });

    // @ts-ignore
    if (data.responseData?.message === 'success') {
      isRunLoading.value = false;
      showSuccessMessage(
        'success',
        `Workflow ID: ${selectedWfId} run successfully`,
      );
    }
  } catch (error) {
    console.log(error);
    showErrorMessage('failed', 'Workflow Run Failed');
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
);
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
          :loading="
            runWorkflow.isLoading.value ||
            getWorkflowList.isLoading.value ||
            tableModel.tableState.loading
          "
          @change="tableModel.handleChange"
          @refresh="handleRefreshTable"
          @select="handleSelectedIndex"
        >
          <template #toolbox-left>
            <p-button disabled icon-left="ic_plus_bold">Add</p-button>
          </template>
          <template #th-run> &nbsp; </template>
          <template #col-run-format>
            <p-button
              style-type="tertiary"
              size="sm"
              @click="handleRunWorkflow"
            >
              Run
            </p-button>
          </template>
        </p-toolbox-table>
      </template>
    </p-horizontal-layout>
    <p-button-modal
      v-model="modal.alertModalState.open"
      :visible="modal.alertModalState.open"
      size="sm"
      backdrop
      theme-color="alert"
      header-title="Are you sure you want to delete it?"
      :hide-body="true"
      :hide-header-close-button="true"
      @confirm="
        () => {
          modal.alertModalState.open = false;
          handleDeleteWorkflow();
        }
      "
    />
  </div>
</template>
