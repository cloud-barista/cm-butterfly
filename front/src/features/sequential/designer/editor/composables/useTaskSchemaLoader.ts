/**
 * Task Schema Loader Composable
 * Workflow editor에서 task schema를 미리 로드하고 관리
 */

import { onMounted, onUnmounted } from 'vue';
import taskSchemaStore from '../store/taskSchemaStore';

export function useTaskSchemaLoader() {
  // Task schema store 로드 상태 확인
  const isSchemaLoaded = taskSchemaStore.isSchemaLoaded;
  const isLoading = taskSchemaStore.loading;
  const error = taskSchemaStore.errorMessage;

  // 기존 API 응답에서 task schema 로드
  const loadTaskSchemasFromResponse = (response: any) => {
    try {
      console.log('Loading task schemas from existing response...');
      taskSchemaStore.loadTaskSchemasFromResponse(response);
      console.log('Task schemas loaded from existing response successfully');
    } catch (error) {
      console.error('Failed to load task schemas from response:', error);
      throw error;
    }
  };

  // 모든 task schema 로드 (API 호출)
  const loadAllTaskSchemas = async () => {
    try {
      console.log('Loading all task schemas...');
      await taskSchemaStore.loadAllTaskSchemas();
      console.log('All task schemas loaded successfully');
    } catch (error) {
      console.error('Failed to load task schemas:', error);
      throw error;
    }
  };

  // 특정 task의 schema 가져오기
  const getTaskSchema = (taskName: string) => {
    return taskSchemaStore.getTaskSchema(taskName);
  };

  // 특정 task의 body_params schema 가져오기
  const getBodyParamsSchema = (taskName: string) => {
    return taskSchemaStore.getBodyParamsSchema(taskName);
  };

  // 모든 task 이름 목록 가져오기
  const getAllTaskNames = () => {
    return taskSchemaStore.getAllTaskNames();
  };

  // Store 초기화
  const resetStore = () => {
    taskSchemaStore.reset();
  };

  // 디버깅용: 모든 schema 출력
  const debugPrintAllSchemas = () => {
    taskSchemaStore.debugPrintAllSchemas();
  };

  return {
    // State
    isSchemaLoaded,
    isLoading,
    error,
    
    // Methods
    loadTaskSchemasFromResponse,
    loadAllTaskSchemas,
    getTaskSchema,
    getBodyParamsSchema,
    getAllTaskNames,
    resetStore,
    debugPrintAllSchemas
  };
}
