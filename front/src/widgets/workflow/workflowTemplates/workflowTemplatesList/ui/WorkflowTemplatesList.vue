<script setup lang="ts">
import {
  PToolboxTable,
  PHorizontalLayout,
  PButton,
} from '@cloudforet-test/mirinae';
import { useWorkflowTemplatesListModel } from '@/widgets/workflow/workflowTemplates/workflowTemplatesList/model/workflowTemplatesListModel';
import TableLoadingSpinner from '@/shared/ui/LoadingSpinner/TableLoadingSpinner.vue';
import { insertDynamicComponent } from '@/shared/utils';
import DynamicTableIconButton from '@/shared/ui/Button/dynamicIconButton/DynamicTableIconButton.vue';
import { onBeforeMount, onMounted, reactive, watch, computed, ref, nextTick } from 'vue';
import { useGetWorkflowTemplateList } from '@/entities';
import { useDynamicTableHeight } from '@/shared/hooks/table/useDynamicTableHeight';
import { useToolboxTableHeight } from '@/shared/hooks/table/useToolboxTableHeight';

interface iProps {
  trigger: boolean;
}

const props = defineProps<iProps>();

const getworkflowTemplateList = useGetWorkflowTemplateList();

const { tableModel, initToolBoxTableModel, workflowStore } =
  useWorkflowTemplatesListModel();

const { dynamicHeight, minHeight, maxHeight } = useDynamicTableHeight(
  computed(() => tableModel.tableState.items.length),
  computed(() => tableModel.tableOptions.pageSize),
);

const { toolboxTableRef, adjustedDynamicHeight } = useToolboxTableHeight(
  computed(() => dynamicHeight.value),
);

const emit = defineEmits(['select-row', 'update:trigger']);

const modals = reactive({
  // alertModalState: { open: false },
  workflowTemplateAddModalState: { open: false },
});

const isDataLoaded = ref(false);

onBeforeMount(() => {
  initToolBoxTableModel();
});

onMounted(function (this: any) {
  // addDeleteIconAtTable.bind(this)();
  fetchWorkflowTemplateList();
});

watch(isDataLoaded, (nv) => {
  if (nv && toolboxTableRef.value) {
    nextTick(() => {
      // addDeleteIconAtTable.call({ $refs: { toolboxTable: toolboxTableRef.value } });
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
          // modals.alertModalState.open = true;
        }
      },
    },
    targetElement,
    'prepend',
  );
  return instance;
}

function handleRefreshTable() {
  tableModel.initState();
  emit('select-row', '');
  fetchWorkflowTemplateList();
}

function handleSelectedIndex(selectedIndex: number) {
  const selectedData = tableModel.tableState.displayItems[selectedIndex];
  if (selectedData) {
    emit('select-row', selectedData.id);
  } else {
    emit('select-row', '');
  }
}

async function fetchWorkflowTemplateList() {
  isDataLoaded.value = false;
  try {
    const { data } = await getworkflowTemplateList.execute();
    if (
      data.status?.code === 200 &&
      data.responseData &&
      data.responseData.length > 0
    ) {
      workflowStore.setWorkflowTemplates(data.responseData);
    }
    nextTick(() => {
      isDataLoaded.value = true;
    });
  } catch (e) {
    console.error(e);
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
);
</script>

<template>
  <div>
    <p-horizontal-layout :height="adjustedDynamicHeight">
      <template #container="{ height }">
        <!-- 로딩 중일 때 스피너 표시 -->
        <table-loading-spinner
          :loading="getworkflowTemplateList.isLoading.value"
          :height="height"
          message="Loading workflow templates..."
        />
        
        <!-- 로딩 완료 후 테이블 표시 -->
        <p-toolbox-table
          v-if="!getworkflowTemplateList.isLoading.value"
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
    <!-- <p-button-modal
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
    /> -->
  </div>
</template>

<style scoped lang="postcss"></style>
