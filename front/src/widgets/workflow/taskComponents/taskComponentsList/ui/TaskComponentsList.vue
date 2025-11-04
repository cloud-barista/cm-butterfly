<script setup lang="ts">
import {
  PToolboxTable,
  PHorizontalLayout,
  PButton,
  PButtonModal,
} from '@cloudforet-test/mirinae';
import { useTaskComponentsListModel } from '@/widgets/workflow/taskComponents/taskComponentsList/model/taskComponenetsListModel';
import {
  insertDynamicComponent,
  showErrorMessage,
  showSuccessMessage,
} from '@/shared/utils';
import DynamicTableIconButton from '@/shared/ui/Button/dynamicIconButton/DynamicTableIconButton.vue';
import { onBeforeMount, onMounted, reactive, watch } from 'vue';
import {
  useBulkDeleteTaskComponent,
  useGetTaskComponentList,
} from '@/entities';

const getTaskComponentList = useGetTaskComponentList();

const { tableModel, initToolBoxTableModel, workflowStore } =
  useTaskComponentsListModel();

interface iProps {
  trigger: boolean;
}

const props = defineProps<iProps>();
const emit = defineEmits(['select-row', 'update:trigger']);

const modal = reactive({
  alertModalState: { open: false },
});

onBeforeMount(() => {
  initToolBoxTableModel();
});

onMounted(function (this: any) {
  addDeleteIconAtTable.bind(this)();
  fetchTaskComponentsList();
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
  try {
    const { data } = await getTaskComponentList.execute();
    if (
      data.status?.code === 200 &&
      data.responseData &&
      data.responseData.length > 0
    ) {
      // Add hardcoded cicada_task_script task component
      // cicada_task_script 태스크 컴포넌트를 하드코드로 추가
      const hardcodedScriptTask = {
        created_at: '2025-09-30T07:54:08.132299806Z',
        updated_at: '2025-10-24T05:10:54.384852798Z',
        id: 'e024b410-fb78-4ded-9237-1234',
        name: 'cicada_task_script',
        description: 'Script task',
        is_example: true,
        data: {
          body_params: {
            properties: {
              ns_id: {
                type: 'string',
              },
              mci_id: {
                type: 'string',
              },
              vm_id: {
                type: 'string',
              },
              content: {
                type: 'string',
              },
            },
            required: ['ns_id', 'mci_id', 'vm_id', 'content'],
          },
          options: {
            request_body: '{"ns_id":"","mci_id":"","vm_id":"","content":""}',
          },
          path_params: {},
          query_params: {},
        },
      };

      // Combine API response with hardcoded task
      // API 응답과 하드코드된 태스크 결합
      const allTaskComponents = [...data.responseData, hardcodedScriptTask];
      workflowStore.setTaskComponents(allTaskComponents);
    }
  } catch (e) {
    console.log(e);
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
