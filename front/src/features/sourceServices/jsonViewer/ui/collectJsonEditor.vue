<script setup lang="ts">
import { PTextEditor, PPaneLayout } from '@cloudforet-test/mirinae';
import { computed } from 'vue';

interface iProps {
  formData: any;
  title: string;
  readOnly: boolean;
  schema?: {
    json: boolean;
    properties: object;
  };
}

const props = defineProps<iProps>();

// 기본 schema 값 설정
const defaultSchema = {
  json: true,
  properties: {},
};

const finalSchema = computed(() => props.schema || defaultSchema);

// formData를 적절한 형식으로 변환
const processedFormData = computed(() => {
  if (!props.formData) return '';
  
  // 이미 문자열인 경우
  if (typeof props.formData === 'string') {
    return props.formData;
  }
  
  // 객체인 경우 JSON으로 변환
  if (typeof props.formData === 'object') {
    try {
      const result = JSON.stringify(props.formData, null, 2);
      return result;
    } catch (e) {
      console.error('Failed to stringify formData:', e);
      return String(props.formData);
    }
  }
  
  // 기타 타입은 문자열로 변환
  return String(props.formData);
});
</script>

<template>
  <p-pane-layout class="json-editor-layout">
    <p>{{ title }}</p>
    <div class="editor">
      <p-text-editor 
        :code="processedFormData" 
        :read-only="readOnly" 
        folded
        class="json-text-editor"
      />
    </div>
  </p-pane-layout>
</template>

<style scoped lang="postcss">
.json-editor-layout {
  overflow-y: auto;
  overflow-x: auto;
  min-width: 300px;
  max-width: 100%;
  width: 100%;
  border-bottom: 1px solid #dddddf;
  
  p {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 700;
    background-color: #F7F7F7;
    padding: 0.25rem 0.75rem;
    border-radius: 6px 0;
  }
  
  .data-wrapper {
    background-color: white;
  }
  
  .editor {
    background-color: white;
    padding: 1rem;
    width: 100%;
    min-width: 280px;
    
    .json-text-editor {
      width: 100%;
      min-width: 260px;
      /* Monaco Editor 전체 스타일 오버라이드 */
      :deep(.monaco-editor) {
        background-color: #f8f9fa !important;
      }
      
      /* 에디터 배경 */
      :deep(.monaco-editor .monaco-editor-background) {
        background-color: #f8f9fa !important;
      }
      
      /* 여백 배경 */
      :deep(.monaco-editor .margin) {
        background-color: #f1f3f4 !important;
      }
      
      /* 라인 번호 */
      :deep(.monaco-editor .margin .margin-view-overlays .cgmr) {
        color: #6b7280 !important;
      }
      
      /* 현재 라인 하이라이트 */
      :deep(.monaco-editor .view-overlays .current-line) {
        border-color: #e5e7eb !important;
        background-color: #f3f4f6 !important;
      }
      
      /* 텍스트 라인 */
      :deep(.monaco-editor .view-line) {
        color: #1f2937 !important;
      }
      
      /* 모든 텍스트 요소 */
      :deep(.monaco-editor .view-line span) {
        color: #1f2937 !important;
      }
      
      /* 키워드 */
      :deep(.monaco-editor .view-line .mtk1) {
        color: #1f2937 !important;
      }
      
      /* 문자열 */
      :deep(.monaco-editor .view-line .mtk5) {
        color: #059669 !important;
      }
      
      /* 숫자 */
      :deep(.monaco-editor .view-line .mtk6) {
        color: #dc2626 !important;
      }
      
      /* 불린값 */
      :deep(.monaco-editor .view-line .mtk7) {
        color: #7c3aed !important;
      }
      
      /* null */
      :deep(.monaco-editor .view-line .mtk8) {
        color: #6b7280 !important;
      }
      
      /* 선택된 텍스트 */
      :deep(.monaco-editor .view-line .selected-text) {
        background-color: #dbeafe !important;
        color: #1f2937 !important;
      }
      
      /* 스크롤바 */
      :deep(.monaco-editor .scrollbar .slider) {
        background-color: #d1d5db !important;
      }
      
      :deep(.monaco-editor .scrollbar .slider:hover) {
        background-color: #9ca3af !important;
      }
    }
  }
}
</style>
