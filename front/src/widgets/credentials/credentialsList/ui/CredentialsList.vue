<script setup lang="ts">
type DisplayItem = {
  configName?: string;
  CredentialName?: string;
  ProviderName?: string;
  checkbox?: any;
  originalData?: any;
};

import { ref, onMounted, reactive, watch, onBeforeMount } from 'vue';
import {
  PToolboxTable,
  PHorizontalLayout,
  PButton,
  PButtonModal,
} from '@cloudforet-test/mirinae';
import { useCredentialsListModel } from '../model/credentialsListModel';
import {
  useGetCredentialList,
  useDeleteCredentials,
} from '@/entities/credentials/api/index.ts';
import {
  insertDynamicComponent,
  showErrorMessage,
  showSuccessMessage,
} from '@/shared/utils';
import DynamicTableIconButton from '@/shared/ui/Button/dynamicIconButton/DynamicTableIconButton.vue';

interface IProps {
  addModalState: boolean;
  trigger: boolean;
}

const props = defineProps<IProps>();
const emit = defineEmits([
  'select-row',
  'update:addModalState',
  'update:trigger',
  'update:title',
  'update:connection-title',
  'select:multi-row',
]);

const { tableModel, credentials, initToolBoxTableModel, configStore } =
  useCredentialsListModel();

onBeforeMount(() => {
  initToolBoxTableModel();
});

onMounted(function () {
  addDeleteIconAtTable.bind(this)();
  getCredentialList();
});

watch(
  () => props.trigger,
  newVal => {
    if (newVal) {
      getCredentialList();
      emit('update:trigger', false);
    }
  },
);

// async function getCredentialList() {
//   try {
//     await useGetCredentialList()
//       .execute()
//       .then(res => {
//         if (res.data.responseData) {
//           configStore.setConfig(res.data.responseData.credential);
//         }
//       });
//   } catch (e: any) {
//     showErrorMessage(
//       'Error',
//       e.errorMsg || 'Credential 목록을 불러오는 데 실패했습니다.',
//     );
//   }
// }

async function getCredentialList() {
  try {
    await useGetCredentialList()
      .execute()
      .then(res => {
        if (res.data.responseData) {
          configStore.setConfig(res.data.responseData.credential);

          // 테이블 데이터 초기화
          tableModel.tableState.displayItems =
            res.data.responseData.credential.map((item: any) => ({
              configName: item.CredentialName, // 추가
              CredentialName: item.CredentialName,
              ProviderName: item.ProviderName,
            }));
        }
      });
  } catch (e: any) {
    showErrorMessage(
      'Error',
      e.errorMsg || 'Credential 목록을 불러오는 데 실패했습니다.',
    );
  }
}
// function addDeleteIconAtTable() {
//   const toolboxTable = this.$refs.toolboxTable.$el;
//   const targetElement = toolboxTable.querySelector('.right-tool-group');
//   const instance = insertDynamicComponent(
//     DynamicTableIconButton,
//     {
//       name: 'ic_delete',
//     },
//     {
//       click: () => {
//         if (tableModel.tableState.selectIndex.length > 0)
//           modals.alertModalState.open = true;
//       },
//     },
//     targetElement,
//     'prepend',
//   );
//   return instance;
// }
const loading = ref<boolean>(false);
const selectIndex = ref<number[]>([]);

const tableOptions = ref({
  sortable: true,
  sortBy: '',
  selectable: true,
  multiSelect: true,
  pageSize: 10,
});

const querySearchState = ref({
  keyItemSet: tableModel.querySearchState.keyItemSet,
  valueHandlerMap: tableModel.querySearchState.valueHandlerMap,
  queryTag: tableModel.querySearchState.queryTag,
});

const modals = reactive({
  alertModalState: { open: false },
  addModalState: { open: props.addModalState },
});

function handleSelectedIndex(selectedIndex: number) {
  const selectedData = tableModel.tableState.displayItems[selectedIndex];
  if (!selectedData) {
    console.error('Invalid index selected:', selectedIndex);
    return;
  }

  // Proxy 객체를 일반 객체로 변환
  const plainData = { ...selectedData };

  console.log('handleSelectedIndex - plainData:', plainData);

  emit('select-row', { id: plainData.CredentialName ?? '' });
}

function handleChange() {
  // 필요 시 구현
}

function handleAddCredential() {
  emit('update:addModalState', true);
  emit('update:title', 'add');
  emit('update:connection-title', 'add');
}

const toolboxTableRef = ref(null);

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
        console.log('123123');
        // if (tableModel.tableState.selectIndex.length > 0) {
        console.log('123123', modals.alertModalState.open);
        modals.alertModalState.open = true;
        // }
      },
    },
    targetElement,
    'prepend',
  );
  return instance;
}
async function handleDeleteCredentials() {
  console.log('1aa23123123');
  const selectedCredentialIds = selectIndex.value.map(
    index => tableModel.tableState.displayItems[index].CredentialName,
  );

  if (selectedCredentialIds.length === 0) {
    showErrorMessage('Error', '삭제할 Credential을 선택하지 않았습니다.');
    return;
  }

  try {
    for (const credentialName of selectedCredentialIds) {
      const { data } = await useDeleteCredentials(credentialName).execute();

      if (data.status?.code === 200 && data.responseData?.Result === 'true') {
        // Store에서 해당 Credential 제거
        configStore.removeCredentials([credentialName]);

        showSuccessMessage(
          'Success',
          `Credential '${credentialName}'이(가) 성공적으로 삭제되었습니다.`,
        );
      } else {
        showErrorMessage(
          'Error',
          data.status?.message ||
            `Credential '${credentialName}' 삭제에 실패했습니다.`,
        );
      }
    }

    // 모든 작업이 완료되면 리스트 새로고침
    await getCredentialList();

    // 선택 상태 초기화
    selectIndex.value = [];
  } catch (error: any) {
    showErrorMessage(
      'Error',
      error.message || '삭제 요청 중 오류가 발생했습니다.',
    );
  } finally {
    // 모달 닫기
    modals.alertModalState.open = false;
  }
}
</script>

<template>
  <div>
    <p-horizontal-layout :height="400" :min-height="400" :max-height="1000">
      <template #container="{ height }">
        <p-toolbox-table
          ref="toolboxTable"
          :loading="loading"
          :items="tableModel.tableState.items"
          :fields="tableModel.tableState.fields"
          :total-count="tableModel.tableState.items.length"
          :style="{ height: `${height}px` }"
          :sortable="tableOptions.sortable"
          :sort-by="tableOptions.sortBy"
          :selectable="tableOptions.selectable"
          :multi-select="tableOptions.multiSelect"
          :key-item-sets="querySearchState.keyItemSet"
          :value-handler-map="querySearchState.valueHandlerMap"
          :query-tag="querySearchState.queryTag"
          :select-index.sync="selectIndex"
          :page-size="tableOptions.pageSize"
          @change="handleChange"
          @select="handleSelectedIndex"
        >
          <template #toolbox-left>
            <p-button
              style-type="primary"
              icon-left="ic_plus_bold"
              @click="handleAddCredential"
            >
              Add
            </p-button>
          </template>
        </p-toolbox-table>
      </template>
    </p-horizontal-layout>

    <!-- 삭제 확인 모달 -->
    <p-button-modal
      v-model="modals.alertModalState.open"
      :visible="modals.alertModalState.open"
      size="sm"
      backdrop
      theme-color="alert"
      header-title="Are you sure you want to delete it?"
      :hide-body="true"
      :hide-header-close-button="true"
      @confirm="handleDeleteCredentials"
    />
  </div>
</template>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
