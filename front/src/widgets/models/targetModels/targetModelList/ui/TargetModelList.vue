<script setup lang="ts">
import {
  PToolboxTable,
  PHorizontalLayout,
  PButton,
  PButtonModal,
} from '@cloudforet-test/mirinae';
import { useTargetModelListModel } from '@/widgets/models/targetModels/targetModelList/model/targetModelListModel';
import TableLoadingSpinner from '@/shared/ui/LoadingSpinner/TableLoadingSpinner.vue';
import { insertDynamicComponent, showErrorMessage, showSuccessMessage } from '@/shared/utils';
import DynamicTableIconButton from '@/shared/ui/Button/dynamicIconButton/DynamicTableIconButton.vue';
import { onBeforeMount, onMounted, reactive, watch, computed, ref, nextTick } from 'vue';
import { useGetTargetModelList, useBulkDeleteTargetModel, useBulkDeleteTargetSoftwareModel, useBulkDeleteTargetOnPremModel } from '@/entities';
import { useDynamicTableHeight } from '@/shared/hooks/table/useDynamicTableHeight';
import { useToolboxTableHeight } from '@/shared/hooks/table/useToolboxTableHeight';

const { tableModel, initToolBoxTableModel, targetModelStore } =
  useTargetModelListModel();

const { dynamicHeight, minHeight, maxHeight } = useDynamicTableHeight(
  computed(() => tableModel.tableState.displayItems?.length ?? 0),
  computed(() => tableModel.tableOptions.pageSize),
  {
    minTableHeight: 193,  // 기본 최소 높이 (1개 row 기준)
  },
);

const { toolboxTableRef, adjustedDynamicHeight } = useToolboxTableHeight(
  computed(() => dynamicHeight.value),
);

interface IProps {
  trigger: boolean;
}

const props = defineProps<IProps>();

const emit = defineEmits(['select-row', 'update:trigger']);

const isDataLoaded = ref(false);
const tableKey = ref(0); // 컴포넌트 재렌더링을 위한 key

const modals = reactive({
  alertModalState: { open: false },
  sourceModelAddModalState: { open: false },
});

const resGetTargetModelList = useGetTargetModelList();

onBeforeMount(() => {
  initToolBoxTableModel();
});

onMounted(function () {
  getTableList();
});

watch(isDataLoaded, (nv) => {
  if (nv && toolboxTableRef.value) {
    nextTick(() => {
      addDeleteIconAtTable.call({ $refs: { toolboxTable: toolboxTableRef.value } });
    });
  }
});

watch(
  () => props.trigger,
  () => {
    tableModel.tableState.selectIndex = [];
    getTableList();
    emit('update:trigger', false);
  },
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
        if (tableModel.tableState.selectIndex.length > 0) {
          modals.alertModalState.open = true;
        }
      },
    },
    targetElement,
    'prepend',
  );
  return instance;
}

function getTableList() {
  isDataLoaded.value = false;
  resGetTargetModelList.execute().then(res => {
    if (res.data.responseData) {
      targetModelStore.setTargetModel(res.data.responseData);
    }
    nextTick(() => {
      isDataLoaded.value = true;
      // 데이터 로드 후 컴포넌트 재렌더링
      tableKey.value++;
    });
  }).catch(e => {
    isDataLoaded.value = true;
  });
}

function handleSelectedIndex(selectedIndex: number) {
  const selectedData = tableModel.tableState.displayItems[selectedIndex];
  if (selectedData) {
    emit('select-row', { id: selectedData.id, name: selectedData.name });
  } else {
    emit('select-row', '');
  }
}

/**
 * Delete selected target models
 * 선택된 대상 모델들을 삭제합니다.
 */
function multiDelete() {
  console.log('🗑️ [TargetModelList] multiDelete 시작');
  
  const selectedData = tableModel.tableState.selectIndex.map(index => {
    return tableModel.tableState.displayItems[index].id;
  });
  console.log('📋 [TargetModelList] 선택된 데이터 ID 목록:', selectedData);

  // Check if any selected models are software models
  const selectedModels = tableModel.tableState.selectIndex.map(index => {
    return tableModel.tableState.displayItems[index];
  });
  console.log('🔍 [TargetModelList] 선택된 모델 상세 정보:', selectedModels);

  // 각 모델을 하나의 카테고리에만 분류하도록 수정
  const softwareModelIds: string[] = [];
  const cloudModelIds: string[] = [];
  const onPremModelIds: string[] = [];

  selectedModels.forEach(model => {
    const modelType = model?.modelType;
    
    // modelType 기반으로 분류
    if (modelType === 'SoftwareModel') {
      softwareModelIds.push(model.id);
      console.log(`🔧 [TargetModelList] 모델 ${model?.id} (${model?.name}) - Software 분류 (modelType)`);
    } else if (modelType === 'CloudModel') {
      cloudModelIds.push(model.id);
      console.log(`☁️ [TargetModelList] 모델 ${model?.id} (${model?.name}) - Cloud 분류 (modelType)`);
    } else if (modelType === 'OnPremiseModel') {
      onPremModelIds.push(model.id);
      console.log(`🏢 [TargetModelList] 모델 ${model?.id} (${model?.name}) - OnPrem 분류 (modelType)`);
    } else {
      // modelType이 없는 경우 기존 속성으로 fallback
      const isSoftwareByTargetSoftwareModel = model?.targetSoftwareModel;
      const isSoftwareByMigrationType = model?.migrationType === 'software';
      const isSoftwareByName = model?.name?.toLowerCase().includes('sw') || false;
      
      const isSoftware = isSoftwareByTargetSoftwareModel || isSoftwareByMigrationType || isSoftwareByName;
      
      if (isSoftware) {
        softwareModelIds.push(model.id);
        console.log(`🔧 [TargetModelList] 모델 ${model?.id} (${model?.name}) - Software 분류 (fallback)`, {
          targetSoftwareModel: model?.targetSoftwareModel,
          migrationType: model?.migrationType,
          nameContainsSw: isSoftwareByName
        });
      } else {
        // Software가 아닌 경우 Cloud로 분류 (기본값)
        cloudModelIds.push(model.id);
        console.log(`☁️ [TargetModelList] 모델 ${model?.id} (${model?.name}) - Cloud 분류 (fallback)`, {
          targetSoftwareModel: model?.targetSoftwareModel,
          migrationType: model?.migrationType,
          nameContainsSw: isSoftwareByName
        });
      }
    }
  });

  console.log('📊 [TargetModelList] 분류 결과:', {
    softwareModelIds,
    cloudModelIds,
    onPremModelIds,
    softwareCount: softwareModelIds.length,
    cloudCount: cloudModelIds.length,
    onPremCount: onPremModelIds.length
  });

  const deletePromises = [];

  if (softwareModelIds.length > 0) {
    console.log('🚀 [TargetModelList] Software 모델 삭제 API 호출:', softwareModelIds);
    const softwareDeletePromise = useBulkDeleteTargetSoftwareModel(softwareModelIds);
    console.log('📡 [TargetModelList] Software 삭제 Promise 객체:', softwareDeletePromise);
    
    // Promise 실행 전에 네트워크 요청 정보 로깅
    softwareDeletePromise.then(responses => {
      console.log('🌐 [TargetModelList] Software 삭제 네트워크 응답:', responses);
      responses.forEach((response, index) => {
        console.log(`📊 [TargetModelList] Software 삭제 응답 ${index + 1}:`, {
          status: response.status,
          statusText: response.statusText,
          method: response.config?.method?.toUpperCase(),
          url: response.config?.url,
          baseURL: response.config?.baseURL,
          fullURL: `${response.config?.baseURL}${response.config?.url}`,
          data: response.data
        });
      });
    }).catch(error => {
      console.error('❌ [TargetModelList] Software 삭제 네트워크 오류:', error);
      if (error.config) {
        console.log('🔍 [TargetModelList] Software 삭제 요청 정보:', {
          method: error.config.method?.toUpperCase(),
          url: error.config.url,
          baseURL: error.config.baseURL,
          fullURL: `${error.config.baseURL}${error.config.url}`,
          data: error.config.data
        });
      }
    });
    
    deletePromises.push(softwareDeletePromise);
  }

  if (cloudModelIds.length > 0) {
    console.log('🚀 [TargetModelList] Cloud 모델 삭제 API 호출 (DeleteCloudModel):', cloudModelIds);
    const cloudDeletePromise = useBulkDeleteTargetModel(cloudModelIds);
    console.log('📡 [TargetModelList] Cloud 삭제 Promise 객체:', cloudDeletePromise);
    
    // Promise 실행 전에 네트워크 요청 정보 로깅
    cloudDeletePromise.then(responses => {
      console.log('🌐 [TargetModelList] Cloud 삭제 네트워크 응답:', responses);
      responses.forEach((response, index) => {
        console.log(`📊 [TargetModelList] Cloud 삭제 응답 ${index + 1}:`, {
          status: response.status,
          statusText: response.statusText,
          method: response.config?.method?.toUpperCase(),
          url: response.config?.url,
          baseURL: response.config?.baseURL,
          fullURL: `${response.config?.baseURL}${response.config?.url}`,
          data: response.data
        });
      });
    }).catch(error => {
      console.error('❌ [TargetModelList] Cloud 삭제 네트워크 오류:', error);
      if (error.config) {
        console.log('🔍 [TargetModelList] Cloud 삭제 요청 정보:', {
          method: error.config.method?.toUpperCase(),
          url: error.config.url,
          baseURL: error.config.baseURL,
          fullURL: `${error.config.baseURL}${error.config.url}`,
          data: error.config.data
        });
      }
    });
    
    deletePromises.push(cloudDeletePromise);
  }

  if (onPremModelIds.length > 0) {
    console.log('🚀 [TargetModelList] OnPrem 모델 삭제 API 호출 (DeleteOnPremModel):', onPremModelIds);
    const onPremDeletePromise = useBulkDeleteTargetOnPremModel(onPremModelIds);
    console.log('📡 [TargetModelList] OnPrem 삭제 Promise 객체:', onPremDeletePromise);
    
    // Promise 실행 전에 네트워크 요청 정보 로깅
    onPremDeletePromise.then(responses => {
      console.log('🌐 [TargetModelList] OnPrem 삭제 네트워크 응답:', responses);
      responses.forEach((response, index) => {
        console.log(`📊 [TargetModelList] OnPrem 삭제 응답 ${index + 1}:`, {
          status: response.status,
          statusText: response.statusText,
          method: response.config?.method?.toUpperCase(),
          url: response.config?.url,
          baseURL: response.config?.baseURL,
          fullURL: `${response.config?.baseURL}${response.config?.url}`,
          data: response.data
        });
      });
    }).catch(error => {
      console.error('❌ [TargetModelList] OnPrem 삭제 네트워크 오류:', error);
      if (error.config) {
        console.log('🔍 [TargetModelList] OnPrem 삭제 요청 정보:', {
          method: error.config.method?.toUpperCase(),
          url: error.config.url,
          baseURL: error.config.baseURL,
          fullURL: `${error.config.baseURL}${error.config.url}`,
          data: error.config.data
        });
      }
    });
    
    deletePromises.push(onPremDeletePromise);
  }

  console.log('⏳ [TargetModelList] 삭제 API Promise 실행 중...');
  Promise.all(deletePromises)
    .then(res => {
      console.log('✅ [TargetModelList] 삭제 성공:', res);
      handleRefreshTable();
      tableModel.tableState.selectIndex = [];
      showSuccessMessage('success', 'Delete Success');
    })
    .catch(err => {
      console.error('❌ [TargetModelList] 삭제 실패:', err);
      showErrorMessage('Error', err);
    });
}

/**
 * Refresh table data
 * 테이블 데이터를 새로고침합니다.
 */
function handleRefreshTable() {
  getTableList();
}

/**
 * Handle delete confirmation
 * 삭제 확인을 처리합니다.
 */
function handleDeleteConfirm() {
  console.log('✅ [TargetModelList] 삭제 확인 버튼 클릭 - 삭제 실행');
  multiDelete();
  modals.alertModalState.open = false;
  console.log('🔒 [TargetModelList] 삭제 확인 모달 닫기');
}
</script>

<template>
  <div>
    <p-horizontal-layout :key="tableKey" :height="adjustedDynamicHeight">
      <template #container="{ height }">
        <!-- 로딩 중일 때 스피너 표시 -->
        <table-loading-spinner
          :loading="resGetTargetModelList.isLoading.value"
          :height="height"
          message="Loading target models..."
        />
        
        <!-- 로딩 완료 후 테이블 표시 -->
        <p-toolbox-table
          v-if="!resGetTargetModelList.isLoading.value"
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
          @refresh="getTableList"
          @select="handleSelectedIndex"
        >
          <template #toolbox-left>
            <p-button style-type="primary" icon-left="ic_plus_bold" disabled>
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
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<style scoped lang="postcss"></style>
