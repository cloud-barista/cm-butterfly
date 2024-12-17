<script setup lang="ts">
import { ref, onMounted, reactive, watch, nextTick } from 'vue';
import {
  PToolboxTable,
  PHorizontalLayout,
  PButton,
  PButtonModal,
} from '@cloudforet-test/mirinae';
import { useConfigStore } from '@/entities/credentials/model/stores.ts';
import {
  useGetConnconfigList,
  // useBulkDeleteConnconfigList,
} from '@/entities/credentials/api/index.ts';
import {
  IConnectionConfig,
  IGetConnconfigListResponse,
} from '@/entities/credentials/model/types.ts';
import {
  showErrorMessage,
  showSuccessMessage,
  // insertDynamicComponent,
} from '@/shared/utils';
// import DynamicTableIconButton from '@/shared/ui/Button/dynamicIconButton/DynamicTableIconButton.vue';

// Props 정의
interface IProps {
  addModalState: boolean;
  trigger: boolean;
}

// Props 수신
const props = defineProps<IProps>();
const emit = defineEmits([
  'selectRow',
  'update:addModalState',
  'update:trigger',
  'update:title',
  'select:multi-row',
]);

// Pinia 스토어 인스턴스
const store = useConfigStore();

// 상태 변수
const loading = ref<boolean>(false);
const selectIndex = ref<number[]>([]);

// 테이블 옵션 설정
const tableOptions = ref({
  sortable: true,
  sortBy: '',
  selectable: true,
  multiSelect: true, // 다중 선택 가능하도록 설정
  searchType: 'text',
  pageSize: 10,
});

// 검색 상태 설정 (필요에 따라 확장 가능)
const querySearchState = ref({
  keyItemSet: {},
  valueHandlerMap: {},
  queryTag: '',
});

// 테이블 필드 정의
const fields = ref([
  { label: 'Check', name: 'checkbox' },
  { label: 'Name', name: 'configName' },
  { label: 'Cloud Provider', name: 'providerName' },
  { label: 'Region', name: 'regionDetail.regionName' },
  { label: 'Zone', name: 'regionZoneInfo.assignedZone' },
  { label: 'Credential', name: 'credentialName' },
  { label: 'Driver', name: 'driverName' },
]);

// 모달 상태 관리
const modals = reactive({
  alertModalState: { open: false },
  addModalState: { open: props.addModalState }, // 초기 상태 설정
});

// API 응답 객체
const resConfigList = useGetConnconfigList();

// 데이터 로드 함수
async function getConfigList() {
  resConfigList
    .execute()
    .then(res => {
      if (res.data.responseData) {
        store.setConfig(res.data.responseData.connectionconfig);
      }
    })
    .catch(e => {
      showErrorMessage('error', e.errorMsg);
    });
}

// 컴포넌트 마운트 시 데이터 로드 및 Delete 아이콘 추가
onMounted(() => {
  getConfigList();
  // addDeleteIconAtTable();
});

// Props의 trigger가 변경될 때 데이터 리로드
watch(
  () => props.trigger,
  newVal => {
    if (newVal) {
      getConfigList();
      emit('update:trigger', false);
    }
  },
);

// 선택된 인덱스 처리
function handleSelectedIndex(indices: number[]) {
  selectIndex.value = indices;
  const selectedData = indices.map(index => store.models[index]);
  emit('select:multi-row', selectedData);
}

// 테이블 변경 핸들러 (정렬, 페이징 등)
function handleChange() {
  // 필요 시 구현
}

// Add 버튼 핸들러
function handleAddCredential() {
  emit('update:addModalState', true);
  emit('update:title', 'Add Credential');
}

// // Delete Selected 버튼 핸들러
// function handleDeleteSelected() {
//   if (selectIndex.value.length === 0) {
//     showErrorMessage('Error', 'No credentials selected for deletion.');
//     return;
//   }
//   modals.alertModalState.open = true;
// }

// 삭제 확인 핸들러
// async function handleDeleteConfirm() {
//   const selectedConfigs = selectIndex.value.map(
//     index => store.models[index].configName,
//   );
//   try {
//     await useBulkDeleteConnconfigList(selectedConfigs);
//     showSuccessMessage('Success', 'Selected credentials deleted successfully.');
//     loadTableData();
//     selectIndex.value = [];
//   } catch (error: any) {
//     showErrorMessage(
//       'Error',
//       error.message || 'Failed to delete selected credentials.',
//     );
//   } finally {
//     modals.alertModalState.open = false;
//   }
// }

// Delete 아이콘 동적 추가 함수
// function addDeleteIconAtTable() {
//   nextTick(() => {
//     const toolboxTableEl = (toolboxTable.value as any).$el;
//     const targetElement = toolboxTableEl.querySelector('.right-tool-group');
//     if (targetElement) {
//       insertDynamicComponent(
//         DynamicTableIconButton,
//         { name: 'ic_delete' },
//         {
//           click: handleDeleteSelected,
//         },
//         targetElement,
//         'prepend',
//       );
//     }
//   });
// }
</script>

<template>
  <div>
    <p-horizontal-layout :height="400" :min-height="400" :max-height="1000">
      <template #container="{ height }">
        <p-toolbox-table
          ref="toolboxTable"
          :loading="loading"
          :items="store.models"
          :fields="fields"
          :total-count="store.models.length"
          :style="{ height: `${height}px` }"
          :sortable="tableOptions.sortable"
          :sort-by="tableOptions.sortBy"
          :selectable="tableOptions.selectable"
          :multi-select="tableOptions.multiSelect"
          :search-type="tableOptions.searchType"
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
            <p-button
              style-type="danger"
              icon-left="ic_delete"
              @click="handleDeleteSelected"
              :disabled="selectIndex.length === 0"
            >
              Delete Selected
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
      header-title="Are you sure you want to delete the selected credentials?"
      :hide-body="true"
      :hide-header-close-button="true"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<style scoped>
/* 필요한 스타일 추가 */
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
