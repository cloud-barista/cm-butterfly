/**
 * Task Schema Store
 * list-task-component API에서 모든 task의 schema를 미리 로드하고 관리
 */

import { ref, computed } from 'vue';
import { getTaskComponentList } from '@/features/sequential/designer/toolbox/model/api';
import type { ITaskComponentInfoResponse } from '@/features/sequential/designer/toolbox/model/api';

interface TaskSchema {
  name: string;
  description: string;
  body_params: {
    properties: Record<string, any>;
    required?: string[];
  };
  path_params: Record<string, any>;
  query_params: Record<string, any>;
}

class TaskSchemaStore {
  private taskSchemas = ref<Map<string, TaskSchema>>(new Map());
  private isLoading = ref(false);
  private isLoaded = ref(false);
  private error = ref<string | null>(null);

  // Computed properties
  get isSchemaLoaded() {
    return computed(() => this.isLoaded.value);
  }

  get loading() {
    return computed(() => this.isLoading.value);
  }

  get errorMessage() {
    return computed(() => this.error.value);
  }

  // 기존 API 응답에서 task schema 로드
  loadTaskSchemasFromResponse(response: any): void {
    if (this.isLoaded.value) {
      console.log('Task schemas already loaded');
      return;
    }

    this.isLoading.value = true;
    this.error.value = null;

    try {
      console.log('Loading task schemas from existing API response...');
      
      if (response?.responseData) {
        console.log(`Found ${response.responseData.length} task components`);
        
        response.responseData.forEach((taskComponent: ITaskComponentInfoResponse) => {
          console.log(`Processing task component: ${taskComponent.name}`);
          console.log(`Has body_params:`, !!taskComponent.data?.body_params);
          
          if (taskComponent.data?.body_params) {
            const taskSchema: TaskSchema = {
              name: taskComponent.name,
              description: taskComponent.data.options?.request_body || '',
              body_params: taskComponent.data.body_params,
              path_params: taskComponent.data.path_params || {},
              query_params: taskComponent.data.query_params || {}
            };
            
            this.taskSchemas.value.set(taskComponent.name, taskSchema);
            console.log(`Loaded schema for task: ${taskComponent.name}`);
            console.log(`Schema properties:`, Object.keys(taskComponent.data.body_params.properties || {}));
            
            // tumblebug_mci_dynamic 특별 처리
            if (taskComponent.name === 'tumblebug_mci_dynamic') {
              console.log('=== tumblebug_mci_dynamic schema details ===');
              console.log('Body params:', taskComponent.data.body_params);
              console.log('Properties:', taskComponent.data.body_params.properties);
              console.log('==========================================');
            }
          } else {
            console.warn(`No body_params found for task: ${taskComponent.name}`);
          }
        });
        
        this.isLoaded.value = true;
        console.log(`Successfully loaded ${this.taskSchemas.value.size} task schemas`);
      } else {
        throw new Error('No responseData found in API response');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      this.error.value = errorMsg;
      console.error('Error loading task schemas:', errorMsg);
      throw err;
    } finally {
      this.isLoading.value = false;
    }
  }

  // 모든 task schema 로드 (API 호출)
  async loadAllTaskSchemas(): Promise<void> {
    if (this.isLoaded.value) {
      console.log('Task schemas already loaded');
      return;
    }

    this.isLoading.value = true;
    this.error.value = null;

    try {
      console.log('Loading all task schemas from list-task-component API...');
      const { data: response } = await getTaskComponentList();
      this.loadTaskSchemasFromResponse(response);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      this.error.value = errorMsg;
      console.error('Error loading task schemas:', errorMsg);
      throw err;
    }
  }

  // 특정 task의 schema 가져오기
  getTaskSchema(taskName: string): TaskSchema | null {
    console.log(`Looking for schema for task: ${taskName}`);
    console.log(`Current loaded schemas:`, Array.from(this.taskSchemas.value.keys()));
    
    const schema = this.taskSchemas.value.get(taskName);
    if (schema) {
      console.log(`Found schema for task: ${taskName}`);
      console.log(`Schema properties:`, Object.keys(schema.body_params?.properties || {}));
      return schema;
    } else {
      console.warn(`No schema found for task: ${taskName}`);
      console.log(`Available task names:`, Array.from(this.taskSchemas.value.keys()));
      return null;
    }
  }

  // 모든 task 이름 목록 가져오기
  getAllTaskNames(): string[] {
    return Array.from(this.taskSchemas.value.keys());
  }

  // 특정 task의 body_params schema 가져오기
  getBodyParamsSchema(taskName: string): any {
    const schema = this.getTaskSchema(taskName);
    return schema?.body_params || null;
  }

  // 특정 task의 path_params schema 가져오기
  getPathParamsSchema(taskName: string): any {
    const schema = this.getTaskSchema(taskName);
    return schema?.path_params || null;
  }

  // 특정 task의 query_params schema 가져오기
  getQueryParamsSchema(taskName: string): any {
    const schema = this.getTaskSchema(taskName);
    return schema?.query_params || null;
  }

  // Store 초기화
  reset(): void {
    this.taskSchemas.value.clear();
    this.isLoading.value = false;
    this.isLoaded.value = false;
    this.error.value = null;
  }

  // 디버깅용: 모든 로드된 schema 출력
  debugPrintAllSchemas(): void {
    console.log('=== Loaded Task Schemas ===');
    this.taskSchemas.value.forEach((schema, name) => {
      console.log(`Task: ${name}`);
      console.log(`  Description: ${schema.description}`);
      console.log(`  Body params properties:`, Object.keys(schema.body_params.properties || {}));
      console.log(`  Required fields:`, schema.body_params.required || []);
    });
    console.log('========================');
  }
}

// Singleton instance
const taskSchemaStore = new TaskSchemaStore();

export default taskSchemaStore;
export type { TaskSchema };
