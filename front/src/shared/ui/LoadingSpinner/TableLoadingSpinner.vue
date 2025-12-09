<script setup lang="ts">
/**
 * TableLoadingSpinner
 * 
 * 테이블 데이터 로딩 시 표시되는 공통 스피너 컴포넌트
 * 
 * @example
 * <table-loading-spinner 
 *   :loading="apiInstance.isLoading.value"
 *   :height="height"
 *   message="Loading data..."
 * />
 * <p-toolbox-table
 *   v-if="!apiInstance.isLoading.value"
 *   :items="tableModel.tableState.displayItems"
 *   @refresh="fetchData"
 * />
 * 
 * @prop {boolean} loading - 로딩 상태 (필수)
 * @prop {string} message - 표시할 메시지 (선택, 기본값: 'Loading...')
 * @prop {string|number} height - 스피너 영역 높이 (선택)
 */
import { PSpinner } from '@cloudforet-test/mirinae';
import { computed } from 'vue';

interface Props {
  loading: boolean;
  message?: string;
  height?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  message: 'Loading...',
});

const computedStyle = computed(() => {
  if (props.height) {
    const heightValue = typeof props.height === 'number' 
      ? `${props.height}px` 
      : props.height;
    return { height: heightValue };
  }
  return {};
});
</script>

<template>
  <div v-if="loading" class="table-loading-spinner" :style="computedStyle">
    <p-spinner size="xl" />
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
.table-loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: white;
  border-radius: 8px;
  min-height: 300px;
}

.table-loading-spinner p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}
</style>

