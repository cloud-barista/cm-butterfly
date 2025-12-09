<script setup lang="ts">
import {
  PToolboxTable,
  PHorizontalLayout,
  PButton,
  PButtonModal,
} from '@cloudforet-test/mirinae';
import { useSourceModelListModel } from '@/widgets/models/sourceModels/sourceModelList/model/sourceModelListModel';
import TableLoadingSpinner from '@/shared/ui/LoadingSpinner/TableLoadingSpinner.vue';
import { onBeforeMount, onMounted, reactive, watch, computed, ref, nextTick } from 'vue';
import {
  insertDynamicComponent,
  showErrorMessage,
  showSuccessMessage,
} from '@/shared/utils';
import DynamicTableIconButton from '@/shared/ui/Button/dynamicIconButton/DynamicTableIconButton.vue';
import { useBulkDeleteSourceInfraModel, useBulkDeleteSourceCloudModel, useBulkDeleteSourceSoftwareModel, useGetSourceModelList } from '@/entities';
import { useDynamicTableHeight } from '@/shared/hooks/table/useDynamicTableHeight';
import { useToolboxTableHeight } from '@/shared/hooks/table/useToolboxTableHeight';

interface IProps {
  trigger: boolean;
}

const props = defineProps<IProps>();
const emit = defineEmits(['select-row', 'update:trigger']);

const { tableModel, initToolBoxTableModel, sourceModelStore } =
  useSourceModelListModel();

const { dynamicHeight, minHeight, maxHeight } = useDynamicTableHeight(
  computed(() => tableModel.tableState.items.length),
  computed(() => tableModel.tableOptions.pageSize),
);

const { toolboxTableRef, adjustedDynamicHeight } = useToolboxTableHeight(
  computed(() => dynamicHeight.value),
);

const modals = reactive({
  alertModalState: { open: false },
  sourceModelAddModalState: { open: false },
});

const resSourceList = useGetSourceModelList();
const isDataLoaded = ref(false);

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
    getTableList();
    emit('update:trigger', false);
  },
);

function getTableList() {
  isDataLoaded.value = false;
  resSourceList
    .execute()
    .then(res => {
      if (res.data.responseData) {
        sourceModelStore.setSourceModel(res.data.responseData);
      }
      nextTick(() => {
        isDataLoaded.value = true;
      });
    })
    .catch(e => {
      showErrorMessage('error', e.errorMsg);
      isDataLoaded.value = true;
    });
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
        console.log('🔘 [SourceModelList] 삭제 버튼 클릭');
        console.log('📊 [SourceModelList] 선택된 항목 수:', tableModel.tableState.selectIndex.length);
        console.log('📋 [SourceModelList] 선택된 인덱스:', tableModel.tableState.selectIndex);
        
        if (tableModel.tableState.selectIndex.length > 0) {
          console.log('✅ [SourceModelList] 삭제 확인 모달 열기');
          modals.alertModalState.open = true;
        } else {
          console.log('⚠️ [SourceModelList] 선택된 항목이 없어서 모달을 열지 않음');
        }
      },
    },
    targetElement,
    'prepend',
  );
  return instance;
}

/**
 * Delete selected source models
 * 선택된 소스 모델들을 삭제합니다.
 */
function multiDelete() {
  console.log('🗑️ [SourceModelList] multiDelete 시작');
  
  const selectedData = tableModel.tableState.selectIndex.map(index => {
    return tableModel.tableState.displayItems[index].id;
  });
  console.log('📋 [SourceModelList] 선택된 데이터 ID 목록:', selectedData);

  // Check if any selected models are software models
  // Detail tab의 View Recommended List와 동일한 방법으로 구분
  const selectedModels = tableModel.tableState.selectIndex.map(index => {
    return tableModel.tableState.displayItems[index];
  });
  console.log('🔍 [SourceModelList] 선택된 모델 상세 정보:', selectedModels);

  // 각 모델을 하나의 카테고리에만 분류하도록 수정
  const softwareModelIds: string[] = [];
  const cloudModelIds: string[] = [];
  const onPremModelIds: string[] = [];

  selectedModels.forEach(model => {
    const modelType = model?.modelType;
    
    // modelType 기반으로 분류
    if (modelType === 'SoftwareModel') {
      softwareModelIds.push(model.id);
      console.log(`🔧 [SourceModelList] 모델 ${model?.id} (${model?.name}) - Software 분류 (modelType)`);
    } else if (modelType === 'CloudModel') {
      cloudModelIds.push(model.id);
      console.log(`☁️ [SourceModelList] 모델 ${model?.id} (${model?.name}) - Cloud 분류 (modelType)`);
    } else if (modelType === 'OnPremiseModel') {
      onPremModelIds.push(model.id);
      console.log(`🏢 [SourceModelList] 모델 ${model?.id} (${model?.name}) - OnPrem 분류 (modelType)`);
    } else {
      // modelType이 없는 경우 기존 속성으로 fallback
      const isSoftwareByMigrationType = model?.migrationType === 'Software';
      const isSoftwareByIsSoftwareModel = model?.isSoftwareModel;
      const isSoftwareByName = model?.name?.toLowerCase().includes('sw') || false;
      
      const isSoftware = isSoftwareByMigrationType || isSoftwareByIsSoftwareModel || isSoftwareByName;
      
      if (isSoftware) {
        softwareModelIds.push(model.id);
        console.log(`🔧 [SourceModelList] 모델 ${model?.id} (${model?.name}) - Software 분류 (fallback)`, {
          migrationType: model?.migrationType,
          isSoftwareModel: model?.isSoftwareModel,
          nameContainsSw: isSoftwareByName
        });
      } else {
        // Software가 아닌 경우 OnPrem으로 분류 (기본값)
        onPremModelIds.push(model.id);
        console.log(`🏢 [SourceModelList] 모델 ${model?.id} (${model?.name}) - OnPrem 분류 (fallback)`, {
          migrationType: model?.migrationType,
          isSoftwareModel: model?.isSoftwareModel,
          nameContainsSw: isSoftwareByName
        });
      }
    }
  });

  console.log('📊 [SourceModelList] 분류 결과:', {
    softwareModelIds,
    cloudModelIds,
    onPremModelIds,
    softwareCount: softwareModelIds.length,
    cloudCount: cloudModelIds.length,
    onPremCount: onPremModelIds.length
  });

  const deletePromises = [];

  if (softwareModelIds.length > 0) {
    console.log('🚀 [SourceModelList] Software 모델 삭제 API 호출:', softwareModelIds);
    const softwareDeletePromise = useBulkDeleteSourceSoftwareModel(softwareModelIds);
    console.log('📡 [SourceModelList] Software 삭제 Promise 객체:', softwareDeletePromise);
    
    // Promise 실행 전에 네트워크 요청 정보 로깅
    softwareDeletePromise.then(responses => {
      console.log('🌐 [SourceModelList] Software 삭제 네트워크 응답:', responses);
      responses.forEach((response, index) => {
        console.log(`📊 [SourceModelList] Software 삭제 응답 ${index + 1}:`, {
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
      console.error('❌ [SourceModelList] Software 삭제 네트워크 오류:', error);
      if (error.config) {
        console.log('🔍 [SourceModelList] Software 삭제 요청 정보:', {
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
    console.log('🚀 [SourceModelList] Cloud 모델 삭제 API 호출 (DeleteCloudModel):', cloudModelIds);
    const cloudDeletePromise = useBulkDeleteSourceCloudModel(cloudModelIds);
    console.log('📡 [SourceModelList] Cloud 삭제 Promise 객체:', cloudDeletePromise);
    
    // Promise 실행 전에 네트워크 요청 정보 로깅
    cloudDeletePromise.then(responses => {
      console.log('🌐 [SourceModelList] Cloud 삭제 네트워크 응답:', responses);
      responses.forEach((response, index) => {
        console.log(`📊 [SourceModelList] Cloud 삭제 응답 ${index + 1}:`, {
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
      console.error('❌ [SourceModelList] Cloud 삭제 네트워크 오류:', error);
      if (error.config) {
        console.log('🔍 [SourceModelList] Cloud 삭제 요청 정보:', {
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
    console.log('🚀 [SourceModelList] OnPrem 모델 삭제 API 호출 (DeleteOnPremModel):', onPremModelIds);
    const onPremDeletePromise = useBulkDeleteSourceInfraModel(onPremModelIds);
    console.log('📡 [SourceModelList] OnPrem 삭제 Promise 객체:', onPremDeletePromise);
    
    // Promise 실행 전에 네트워크 요청 정보 로깅
    onPremDeletePromise.then(responses => {
      console.log('🌐 [SourceModelList] OnPrem 삭제 네트워크 응답:', responses);
      responses.forEach((response, index) => {
        console.log(`📊 [SourceModelList] OnPrem 삭제 응답 ${index + 1}:`, {
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
      console.error('❌ [SourceModelList] OnPrem 삭제 네트워크 오류:', error);
      if (error.config) {
        console.log('🔍 [SourceModelList] OnPrem 삭제 요청 정보:', {
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

  console.log('⏳ [SourceModelList] 삭제 API Promise 실행 중...');
  Promise.all(deletePromises)
    .then(res => {
      console.log('✅ [SourceModelList] 삭제 성공:', res);
      handleRefreshTable();
      tableModel.tableState.selectIndex = [];
      showSuccessMessage('success', 'Delete Success');
    })
    .catch(err => {
      console.error('❌ [SourceModelList] 삭제 실패:', err);
      showErrorMessage('Error', err);
    });
}

function handleRefreshTable() {
  getTableList();
}

function handleSelectedIndex(selectedIndex: number) {
  const selectedData = tableModel.tableState.displayItems[selectedIndex];
  if (selectedData) {
    emit('select-row', { id: selectedData.id, name: selectedData.name ?? '' });
  } else {
    emit('select-row', { id: '', name: '' });
  }
}

function handleDeleteConfirm() {
  console.log('✅ [SourceModelList] 삭제 확인 버튼 클릭 - 삭제 실행');
  multiDelete();
  modals.alertModalState.open = false;
  console.log('🔒 [SourceModelList] 삭제 확인 모달 닫기');
}
</script>

<template>
  <div>
    <p-horizontal-layout :height="adjustedDynamicHeight">
      <template #container="{ height }">
        <!-- 로딩 중일 때 스피너 표시 -->
        <table-loading-spinner
          :loading="resSourceList.isLoading.value"
          :height="height"
          message="Loading source models..."
        />
        
        <!-- 로딩 완료 후 테이블 표시 -->
        <p-toolbox-table
          v-if="!resSourceList.isLoading.value"
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
