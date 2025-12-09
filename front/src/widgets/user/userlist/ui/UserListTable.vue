<script setup lang="ts">
import {
  PHorizontalLayout,
  PToolboxTable,
  PButton,
  PStatus,
  PButtonModal,
} from '@cloudforet-test/mirinae';
import { onBeforeMount, onMounted, ref, computed, nextTick } from 'vue';
import TableLoadingSpinner from '@/shared/ui/LoadingSpinner/TableLoadingSpinner.vue';
import {
  getUserList,
  IUserInfoResponse,
  UserInformationTableType,
  UserWorkspaceTableType,
} from '@/entities';
import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import { insertDynamicComponent } from '@/shared/utils/insertDynamicComponent';
import DeleteUsers from '@/features/user/deleteUser/ui/DeleteUsers.vue';
import AddUser from '@/features/user/addUser/ui/AddUser.vue';
import { useDynamicTableHeight } from '@/shared/hooks/table/useDynamicTableHeight';
import { useToolboxTableHeight } from '@/shared/hooks/table/useToolboxTableHeight';

const resUserList = getUserList();

const emit = defineEmits(['selectRow']);

const tableModel =
  useToolboxTableModel<
    Partial<
      Record<
        UserInformationTableType | UserWorkspaceTableType | 'originalData',
        any
      >
    >
  >();

const { dynamicHeight, minHeight, maxHeight } = useDynamicTableHeight(
  computed(() => tableModel.tableState.items.length),
  computed(() => tableModel.tableOptions.pageSize),
);

const { toolboxTableRef, adjustedDynamicHeight } = useToolboxTableHeight(
  computed(() => dynamicHeight.value),
);

const isDataLoaded = ref(false);

tableModel.tableState.fields = [
  { name: 'userId', label: 'User Id' },
  { name: 'name', label: 'Name' },
  { name: 'description', label: 'Description' },
  { name: 'company', label: 'Company' },
  { name: 'department', label: 'Department' },
  { name: 'approved', label: 'Approved' },
];

tableModel.querySearchState.keyItemSet = [
  {
    title: 'columns',
    items: [
      { name: 'userid', label: 'User Id' },
      {
        name: 'name',
        label: 'Name',
      },
      { name: 'description', label: 'Description' },
      { name: 'company', label: 'Company' },
      { name: 'department', label: 'Department' },
    ],
  },
];

let modalState = ref(false);
let trashBtn;

function addDeleteIconAtTable() {
  const toolboxTable = this.$refs.toolboxTable.$el;
  const targetElement = toolboxTable.querySelector('.right-tool-group');
  const instance = insertDynamicComponent(
    DeleteUsers,
    {
      label: 'Dynamic Button',
    },
    {
      'button-click': message => {
        trashBtn.$props.focus = true;
      },
    },
    targetElement,
    'prepend',
  );

  return instance;
}

const handleSelectedIndex = (index: number[]) => {
  const selectedData = tableModel.tableState.displayItems[index];
  emit('selectRow', selectedData);
};

const handleClose = e => {
  modalState.value = false;
  if (e && e.isSuccess) {
    handleTableDataFetch();
  }
};

const organizeResponseUserList = (userRes: IUserInfoResponse) => {
  const organizedDatum: Partial<
    Record<
      UserInformationTableType | UserWorkspaceTableType | 'originalData',
      any
    >
  > = {
    userId: userRes.email || '',
    name: `${userRes.firstName}${userRes.lastName}`,
    description: userRes.description || '',
    company: userRes.company || '',
    group: userRes.group || '',
    approved: userRes.approved || '',
    callInvite: userRes.callInvite || '',
    receiveInvite: userRes.receiveInvite || '',
    defaultRoles: userRes.defaultRoles || '',
    originalData: userRes,
    username: userRes.username,
  };

  return organizedDatum;
};

const handleTableDataFetch = () => {
  resUserList.execute().then(res => {
    if (res.data.responseData && res.data.responseData.length > 0) {
      tableModel.tableState.items = res.data.responseData.map(userInfo =>
        organizeResponseUserList(userInfo),
      );
    } else {
      tableModel.initState();
    }
    tableModel.tableState.sortedItems = tableModel.tableState.items;
    tableModel.handleChange(null);
  });
};

onBeforeMount(() => {
  tableModel.initState();
  handleTableDataFetch();
});

onMounted(function () {
  trashBtn = addDeleteIconAtTable.bind(this)();
  trashBtn._props.label = '동적변경';
});
</script>

<template>
  <div>
    <p-horizontal-layout :height="adjustedDynamicHeight">
      <template #container="{ height }">
        <!-- 로딩 중일 때 스피너 표시 -->
        <table-loading-spinner
          :loading="tableModel.tableState.loading || resUserList.isLoading.value"
          :height="height"
          message="Loading users..."
        />
        
        <!-- 로딩 완료 후 테이블 표시 -->
        <p-toolbox-table
          v-if="!tableModel.tableState.loading && !resUserList.isLoading.value"
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
          @refresh="handleTableDataFetch"
          @select="handleSelectedIndex"
        >
          <template #toolbox-left>
            <p-button
              style-type="primary"
              icon-left="ic_plus_bold"
              @click="modalState = true"
            >
              Add user
            </p-button>
          </template>
          <template #col-approved-format="{ item }">
            <p-status
              :icon-color="`${item.approved ? '#60b731' : '#C2C2C6'}`"
              :text="`${item.approved ? 'Approved' : 'Not approved'}`"
              :style="{ margin: '1rem' }"
            />
          </template>
        </p-toolbox-table>
      </template>
    </p-horizontal-layout>
    <p-button-modal
      :visible="modalState"
      size="md"
      :header-title="'Add New User'"
      :hideFooter="true"
      @close="handleClose"
    >
      <template #body>
        <AddUser @modalClose="handleClose"></AddUser>
      </template>
    </p-button-modal>
  </div>
</template>

<style scoped lang="postcss"></style>
