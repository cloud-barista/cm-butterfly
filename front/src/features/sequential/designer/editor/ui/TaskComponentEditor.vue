<template>
  <div class="task-component-editor">
    <!-- Task Configuration Section -->
    <div class="task-configuration-section">
      <div class="section-header">
        <h4>Task Configuration</h4>
      </div>

      <!-- Task Name Section -->
      <div class="component-name-section">
        <div class="field-label">
          <span class="label-text">Task Name</span>
          <span v-if="getComponentNameIsValid() === false" class="required-indicator">*</span>
        </div>
        <input
          type="text"
          :value="getComponentNameValue()"
          @input="handleComponentNameInput"
          class="component-name-input"
          :class="{ 'invalid': !getComponentNameIsValid() }"
          @blur="getComponentNameOnBlur"
          placeholder="Enter task name"
        />
      </div>

      <!-- Path Parameters -->
      <div v-if="hasPathParams()" class="params-section">
        <h5 class="params-title">Path Parameters</h5>
        <div class="params-content">
          <div v-for="(value, key) in getPathParams()" :key="key" class="param-item">
            <label :for="`path-${key}`" class="param-label">
              {{ key }}<span v-if="isPathParamRequired(key)" class="required-mark">*</span>
            </label>
            <input 
              :id="`path-${key}`"
              type="text" 
              :value="value"
              @input="handlePathParamInput(key, $event)"
              class="param-input"
            />
          </div>
        </div>
      </div>

      <!-- Query Parameters -->
      <div v-if="hasQueryParams()" class="params-section">
        <h5 class="params-title">Query Parameters</h5>
        <div class="params-content">
          <div v-for="(value, key) in getQueryParams()" :key="key" class="param-item">
            <label :for="`query-${key}`" class="param-label">
              {{ key }}<span v-if="isQueryParamRequired(key)" class="required-mark">*</span>
            </label>
            <input 
              :id="`query-${key}`"
              type="text" 
              :value="value"
              @input="handleQueryParamInput(key, $event)"
              class="param-input"
            />
          </div>
        </div>
      </div>

      <!-- Body Parameters - JSON Editor -->
      <div v-if="hasBodyParams" class="params-section body-params-section">
        <h5 class="params-title">Body Parameters</h5>
      
      <div class="json-editor-container">
          <!-- Recursive Form Renderer -->
          <div class="recursive-form-container">
            <div v-if="bodyParamsSchema && bodyParamsSchema.properties">
              <recursive-form-field
                v-for="propName in sortedBodyParamPropertyNames"
                :key="String(propName)"
                :field-name="String(propName)"
                :field-schema="bodyParamsSchema.properties[propName]"
                :field-value="bodyParamsModel[propName]"
                :step-properties="getStepProperties()"
                :max-auto-expand-depth="2"
                :parent-required="bodyParamsSchema.required || []"
                :task-name="getCurrentTaskComponentName()"
                :current-path="`body_params.${propName}`"
                @update="updateBodyParamField(String(propName), $event)"
                :depth="0"
              />
            </div>
          </div>
          
          <!-- vue-json-ui-editor 컴포넌트 (숨김 처리) -->
          <div style="display: none;">
        <json-editor 
              v-if="bodyParamsSchema && bodyParamsSchema.properties"
          ref="jsonEditor" 
              :schema="bodyParamsSchema" 
              v-model="bodyParamsModel"
        >
              <button @click="saveConfiguration">Submit</button>
          <button @click="resetEditor">Reset</button>
        </json-editor>
      </div>
    </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted, computed, watch, nextTick } from 'vue';
import JsonEditor from 'vue-json-ui-editor';
import { PButton } from '@cloudforet-test/mirinae';
import { useCommonTaskEditorModel } from '../model/commonTaskEditorModel';
import type { Step } from '@/features/workflow/workflowEditor/model/types';
import RecursiveFormField from './RecursiveFormField.vue';
import { useWorkflowStore } from '@/entities/workflow/model/stores';
import { storeToRefs } from 'pinia';
import { decodeBase64, encodeBase64 } from '@/shared/utils/base64';
import { getPropertyOrder, sortPropertiesByOrder } from '../config/taskPropertyOrderConfig';

export default defineComponent({
  name: 'TaskComponentEditor',
  components: {
    JsonEditor,
    PButton,
    RecursiveFormField
  },
  props: {
    step: {
      type: Object as () => Step,
      required: true
    }
  },
  emits: ['saveComponentName', 'saveContext', 'saveFixedModel'],
  setup(props, { emit }) {
    // props를 reactive하게 사용하기 위해 computed로 래핑
    const step = computed(() => props.step);
    const taskEditorModel = useCommonTaskEditorModel();
    const jsonEditor = ref();
    const isInitialized = ref(false);

    // Workflow Store에서 task components 가져오기
    const workflowStore = useWorkflowStore();
    const { taskComponents } = storeToRefs(workflowStore);

    // 현재 task에 해당하는 task component의 data 찾기
    const getCurrentTaskComponentData = () => {
      console.log('=== Finding Task Component Data ===');
      
      // 1. Step properties에 직접 저장된 taskComponentData 확인 (우선순위)
      if ((step.value.properties as any)?.taskComponentData) {
        console.log('✅ Found taskComponentData in step.properties');
        const taskComponentData = (step.value.properties as any).taskComponentData;
        console.log('✅ Task component data:', taskComponentData);
        console.log('✅ Task component data.body_params:', taskComponentData?.body_params);
        return taskComponentData;
      }
      
      // 2. Store에서 찾기 (fallback)
      const taskName = step.value.name || step.value.type;
      console.log('🔍 Task name:', taskName);
      console.log('🔍 Task type:', step.value.type);
      console.log('🔍 Available task components count:', taskComponents.value.length);
      console.log('🔍 Available task components:', taskComponents.value.map(tc => tc.name));
      
      const taskComponent = taskComponents.value.find(tc => tc.name === taskName);
      
      if (taskComponent) {
        console.log('✅ Found task component in store:', taskComponent.name);
        console.log('✅ Task component data:', taskComponent.data);
        console.log('✅ Task component data.body_params:', (taskComponent.data as any)?.body_params);
        return taskComponent.data;
      }
      
      console.warn('❌ Task component not found for:', taskName);
      console.log('❌ taskComponents.value:', taskComponents.value);
      return null;
    };

    // Path Parameters
    const pathParams = ref<Record<string, any>>({});
    const pathParamsSchema = ref<any>(null);
    
    // Query Parameters
    const queryParams = ref<Record<string, any>>({});
    const queryParamsSchema = ref<any>(null);
    
    // Body Parameters - JSON Editor용 Schema와 Model 분리
    const bodyParamsSchema = ref<Record<string, any>>({
      type: 'object',
      title: 'Body Parameters',
      properties: {},
      additionalProperties: true
    });
    
    const bodyParamsModel = ref<Record<string, any>>({});
    
    // 초기 데이터 저장 (비교용 - originalData와 비교)
    const initialData = ref<{
      name: string;
      path_params: Record<string, any>;
      query_params: Record<string, any>;
      body_params: any;
      request_body: string;
    }>({
      name: '',
      path_params: {},
      query_params: {},
      body_params: {},
      request_body: ''
    });
    
    // 전체 Task Schema (디버그용)
    const taskSchema = ref({
      type: 'object',
      title: 'Task Component Configuration',
      properties: {
        name: {
          type: 'string',
          title: 'Task Name'
        },
        type: {
          type: 'string',
          title: 'Task Type',
          enum: ['task', 'container', 'switch'],
          default: 'task'
        },
        description: {
          type: 'string',
          title: 'Description'
        },
        path_params: {
          type: 'object',
          title: 'Path Parameters',
          additionalProperties: {
            type: 'string'
          }
        },
        query_params: {
          type: 'object',
          title: 'Query Parameters',
          additionalProperties: {
            type: 'string'
          }
        }
      },
      required: ['name', 'type']
    });

    // body_params 기반 동적 스키마 생성
    const generateBodyParamsSchema = (bodyParams: any) => {
      if (!bodyParams || typeof bodyParams !== 'object') {
        return {
          type: 'object',
          title: 'Body Parameters',
          additionalProperties: true
        };
      }

      const properties: any = {};
      
      // bodyParams의 각 속성을 분석하여 스키마 생성
      for (const [key, value] of Object.entries(bodyParams)) {
        const title = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
        
        if (typeof value === 'string') {
          properties[key] = {
            type: 'string',
            title: title,
            description: `String value for ${key}`,
            default: value
          };
        } else if (typeof value === 'number') {
          properties[key] = {
            type: 'number',
            title: title,
            description: `Numeric value for ${key}`,
            default: value
          };
        } else if (typeof value === 'boolean') {
          properties[key] = {
            type: 'boolean',
            title: title,
            description: `Boolean value for ${key}`,
            default: value
          };
        } else if (Array.isArray(value)) {
          properties[key] = {
            type: 'array',
            title: title,
            description: `Array of ${typeof value[0] || 'string'} values`,
            items: {
              type: typeof value[0] || 'string'
            },
            default: value
          };
        } else if (typeof value === 'object' && value !== null) {
          // 객체인 경우 재귀적으로 처리
          const nestedSchema = generateBodyParamsSchema(value);
          properties[key] = {
            type: 'object',
            title: title,
            description: `Object containing ${Object.keys(value).length} properties`,
            properties: nestedSchema.properties || {},
            additionalProperties: true,
            default: value
          };
        } else {
          properties[key] = {
            type: 'string',
            title: title,
            description: `Value for ${key}`,
            default: value
          };
        }
      }

      return {
        type: 'object',
        title: 'Body Parameters',
        description: 'Configuration parameters for the task',
        properties,
        additionalProperties: true
      };
    };

    // Task Model (reactive data) - body_params 중심 구조
    const taskModel = ref({
      name: '',
      type: 'task',
      description: '',
      path_params: {},
      query_params: {},
      body_params: {}
    });

    // Component Name 관련 메서드들
    const getComponentNameTitle = () => {
      return (taskEditorModel.componentNameModel as any)?.context?.title || '';
    };

    const getComponentNameValue = () => {
      // componentNameModel은 단순 ref이므로 .value로 직접 접근
      return (taskEditorModel.componentNameModel as any)?.value || '';
    };

    const setComponentNameValue = (value: string) => {
      // componentNameModel은 단순 ref이므로 .value로 직접 설정
      if (taskEditorModel.componentNameModel) {
        (taskEditorModel.componentNameModel as any).value = value;
      }
    };

    const getComponentNameIsValid = () => {
      return (taskEditorModel.componentNameModel as any)?.context?.model?.isValid ?? true;
    };

    const getComponentNameOnBlur = () => {
      return (taskEditorModel.componentNameModel as any)?.context?.model?.onBlur;
    };

    // Vue 2.7 템플릿에서 사용할 이벤트 핸들러 (타입 단언 제거)
    const handleComponentNameInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      setComponentNameValue(target.value);
      
      // step.name 업데이트를 위해 emit
      // editorProviders: step.name = e
      emit('saveComponentName', target.value);
      console.log('✅ Task name updated:', target.value);
    };

    // Step Properties 접근 메서드 (타입 단언을 script로 이동)
    const getStepProperties = () => {
      return step.value.properties;
    };

    // Task Component Name Getter (Property Order Config용)
    const getCurrentTaskComponentName = (): string => {
      return step.value.name || step.value.type || '';
    };

    // Path/Query Parameters Getter
    const getPathParams = () => {
      return pathParams.value;
    };

    const getQueryParams = () => {
      return queryParams.value;
    };

    // Has Parameters Checker
    const hasPathParams = () => {
      return Object.keys(pathParams.value).length > 0;
    };

    const hasQueryParams = () => {
      return Object.keys(queryParams.value).length > 0;
    };

    // Body Parameters 존재 여부 확인 (computed property로 변경하여 reactive하게)
    const hasBodyParams = computed(() => {
      const result = bodyParamsSchema.value && 
             bodyParamsSchema.value.properties && 
             Object.keys(bodyParamsSchema.value.properties).length > 0;
      console.log('🔍 hasBodyParams computed:', {
        hasSchema: !!bodyParamsSchema.value,
        hasProperties: !!bodyParamsSchema.value?.properties,
        propertiesKeys: Object.keys(bodyParamsSchema.value?.properties || {}),
        result
      });
      return result;
    });

    // Body Parameters Property Names (정렬 적용)
    const sortedBodyParamPropertyNames = computed(() => {
      console.log('⭐ sortedBodyParamPropertyNames computed called!');
      console.log('   bodyParamsSchema.value:', bodyParamsSchema.value);
      console.log('   bodyParamsSchema.value?.properties:', bodyParamsSchema.value?.properties);
      
      if (!bodyParamsSchema.value?.properties) {
        console.log('   ❌ No properties, returning empty array');
        return [];
      }
      
      const keys = Object.keys(bodyParamsSchema.value.properties);
      console.log('   📋 Properties keys:', keys);
      
      const taskName = getCurrentTaskComponentName();
      console.log('   📋 Task name:', taskName);
      
      if (!taskName) {
        console.log('   ⚠️ No task name, returning unsorted keys');
        return keys;
      }
      
      const order = getPropertyOrder(taskName, 'body_params');
      console.log('   📋 Order from config:', order);
      
      const sortedKeys = order ? sortPropertiesByOrder(keys, order) : keys;
      console.log('   ✅ Final sorted keys:', sortedKeys);
      
      console.log('🔍 Body Params Property Sorting:', {
        taskName,
        originalKeys: keys,
        order,
        sortedKeys
      });
      
      return sortedKeys;
    });

    // Required Checker
    const isPathParamRequired = (key: string) => {
      return pathParamsSchema.value?.required?.includes(key) || false;
    };

    const isQueryParamRequired = (key: string) => {
      return queryParamsSchema.value?.required?.includes(key) || false;
    };

    // Path/Query Parameters 업데이트 핸들러
    const handlePathParamInput = (key: string, event: Event) => {
      const target = event.target as HTMLInputElement;
      pathParams.value[key] = target.value;
      
      console.log(`Path param updated: ${key} = ${target.value}`);
      
      // Auto-save path params changes
      if (isInitialized.value) {
        updateStepWithParams();
      }
    };

    const handleQueryParamInput = (key: string, event: Event) => {
      const target = event.target as HTMLInputElement;
      queryParams.value[key] = target.value;
      
      console.log(`Query param updated: ${key} = ${target.value}`);
      
      // Auto-save query params changes
      if (isInitialized.value) {
        updateStepWithParams();
      }
    };
    
    // Path/Query Params 변경 시 step.properties.fixedModel 업데이트
    const updateStepWithParams = () => {
      console.log('=== Updating path/query params ===');
      console.log('Path params:', pathParams.value);
      console.log('Query params:', queryParams.value);
      console.log('Current step.properties.fixedModel:', step.value.properties?.fixedModel);
      
      const updatedFixedModel = {
        path_params: pathParams.value || {},
        query_params: queryParams.value || {}
      };
      
      console.log('Updated fixedModel to emit:', updatedFixedModel);
      
      const updatedStep = {
        ...step.value,
        properties: {
          ...step.value.properties,
          fixedModel: updatedFixedModel as any
        }
      };
      
      console.log('Updated step.properties.fixedModel:', updatedStep.properties.fixedModel);
      
      // 🔍 Verify fixedModel structure
      if (!updatedStep.properties.fixedModel.path_params) {
        console.error('❌ BUG: path_params is missing from fixedModel!');
      }
      if (!updatedStep.properties.fixedModel.query_params) {
        console.error('❌ BUG: query_params is missing from fixedModel!');
      }
      
      // 부모 컴포넌트에 변경사항 전달
      // ⚠️ IMPORTANT: editorProviders에서 step.properties.fixedModel = e 로 할당하므로
      // 전체 step이 아니라 fixedModel만 emit해야 함!
      emit('saveFixedModel', updatedStep.properties.fixedModel);
      
      console.log('✅ Auto-saved path/query params to step.properties.fixedModel');
      console.log('===================================');
    };

    // JSON Editor 관련 메서드들 (공식 예시 기반)
    const resetEditor = () => {
      console.log('Resetting JSON Editor');
      if (jsonEditor.value) {
        jsonEditor.value.reset();
      }
    };

    const saveConfiguration = () => {
      console.log('=== Saving Task Configuration ===');
      console.log('Current taskModel:', taskModel.value);
      
      // model 구조에 맞게 저장
      const model = step.value.properties?.model || {} as any;
      const modelProperties = (model as any).properties || {};
      
      let updatedModel;
      if (modelProperties.targetSoftwareModel) {
        // grasshopper_task_software_migration의 경우 targetSoftwareModel 업데이트
        updatedModel = {
          ...model,
          properties: {
            ...modelProperties,
            targetSoftwareModel: taskModel.value.body_params
          }
        };
        console.log('Updating targetSoftwareModel structure');
      } else if (modelProperties && Object.keys(modelProperties).length > 0) {
        // Step Model Properties를 사용하는 경우 properties 업데이트
        updatedModel = {
          ...model,
          properties: {
            ...modelProperties,
            ...taskModel.value.body_params
          }
        };
        console.log('Updating Step Model Properties structure');
      } else {
        // 일반적인 경우 data 구조 사용
        updatedModel = {
          ...model,
          data: {
            ...(model as any).data,
            path_params: taskModel.value.path_params,
            query_params: taskModel.value.query_params,
            body_params: taskModel.value.body_params
          }
        };
        console.log('Updating data structure');
      }
      
      const updatedStep = {
        ...step.value,
        name: taskModel.value.name,
        type: taskModel.value.type,
        properties: {
          ...step.value.properties,
          model: updatedModel
        },
        metadata: {
          ...(step.value as any).metadata,
          description: taskModel.value.description
        }
      };

      console.log('Updated step:', updatedStep);
      console.log('Model structure being saved:', updatedModel);
      console.log('Body params being saved:', taskModel.value.body_params);

      // 부모 컴포넌트에 변경사항 전달
      // ⚠️ IMPORTANT: editorProviders에서 각각 할당하므로 해당 property만 emit
      emit('saveComponentName', updatedStep.name);  // step.name = e
      emit('saveContext', updatedModel);  // step.properties.model = e
      
      // fixedModel 업데이트 (path_params, query_params)
      if (taskModel.value.path_params || taskModel.value.query_params) {
        const updatedFixedModel = {
          path_params: taskModel.value.path_params || pathParams.value || {},
          query_params: taskModel.value.query_params || queryParams.value || {}
        };
        emit('saveFixedModel', updatedFixedModel);  // step.properties.fixedModel = e
      }
      
      console.log('Task configuration saved successfully');
    };


    // 초기화
    onMounted(async () => {
      console.log('\n\n\n');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('🚀🚀🚀 TaskComponentEditor MOUNTED (or RE-OPENED) 🚀🚀🚀');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('✅ Task components in store:', taskComponents.value.length);
      console.log('📋 Current step.name:', step.value.name);
      console.log('📋 Current step.type:', step.value.type);
      console.log('📋 Current step.properties.model keys:', Object.keys(step.value.properties?.model || {}));
      console.log('📋 Current step.properties.model JSON (first 500 chars):', JSON.stringify(step.value.properties?.model || {}).substring(0, 500));
      
      // 🔍 Critical check: Is step.properties.model actual data?
      const stepModel: any = step.value.properties?.model || {};
      if (stepModel.targetSoftwareModel && stepModel.targetSoftwareModel.servers) {
        console.log('✅ step.properties.model contains targetSoftwareModel.servers');
        console.log(`   servers count: ${stepModel.targetSoftwareModel.servers.length}`);
        if (stepModel.targetSoftwareModel.servers.length > 0) {
          console.log('   First server keys:', Object.keys(stepModel.targetSoftwareModel.servers[0]));
          console.log('   First server.source_connection_info_id:', stepModel.targetSoftwareModel.servers[0].source_connection_info_id);
        }
      }
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('\n');
      
      // Step 데이터를 taskModel에 매핑
      if (step.value) {
        console.log('=== Step Structure Analysis ===');
        console.log('Step:', step.value);
        console.log('Step.properties:', step.value.properties);
        console.log('Step.properties.model:', step.value.properties?.model);
        console.log('Step.properties.originalData:', (step.value.properties as any)?.originalData);
        
        // Task Component의 data 가져오기 (list-task-component의 결과)
        const taskComponentData = getCurrentTaskComponentData();
        console.log('Task Component Data from store:', taskComponentData);
        
        // model 구조에서 params 추출
        const model = step.value.properties?.model || {} as any;
        const modelProperties = (model as any).properties || {};
        
        console.log('=== Model Structure ===');
        console.log('model:', model);
        console.log('model keys:', Object.keys(model));
        console.log('model.targetSoftwareModel:', (model as any).targetSoftwareModel);
        console.log('model.properties:', (model as any).properties);
        console.log('modelProperties:', modelProperties);
        console.log('modelProperties keys:', Object.keys(modelProperties));
        
        // model에서 기존 데이터 확인
        let existingBodyParamsData: any = null;
        let hasExistingData = false;
        
        console.log('=== 🔍 Checking for existing data in model ===');
        console.log('model keys:', Object.keys(model));
        console.log('model:', model);
        console.log('model.properties:', (model as any).properties);
        console.log('modelProperties:', modelProperties);
        console.log('modelProperties keys:', Object.keys(modelProperties));
        
        // modelProperties의 각 필드 상세 로그
        if (modelProperties && Object.keys(modelProperties).length > 0) {
          console.log('📊 modelProperties detail:');
          Object.keys(modelProperties).forEach(key => {
            const value = modelProperties[key];
            console.log(`   - ${key}:`, {
              type: typeof value,
              isArray: Array.isArray(value),
              hasProperties: value && value.properties ? true : false,
              hasType: value && value.type ? true : false,
              keys: typeof value === 'object' && value !== null ? Object.keys(value) : [],
              value: value
            });
          });
        }
        
        // ✨ 데이터 로딩 우선순위 (✅ CORRECTED):
        // Priority 1: step.properties.model (현재 세션의 최신 데이터 - Task Editor를 닫고 다시 열 때 변경사항 유지)
        // Priority 2: originalData.request_body (초기 로드 시 fallback)
        
        const originalData = (step.value.properties as any)?.originalData;
        
        // Priority 1: step.properties.model 먼저 확인 (현재 세션의 최신 데이터)
        console.log('🔍 Priority 1: Checking step.properties.model (current session data - 변경사항 포함)');
        console.log('   model:', model);
        console.log('   model keys:', Object.keys(model));
        console.log('   modelProperties:', modelProperties);
        console.log('   modelProperties keys:', Object.keys(modelProperties));
        
        // model이 실제 데이터인지 확인 (schema 제외)
        const modelIsSchema = model.type === 'object' && 
                             model.properties && 
                             typeof model.properties === 'object';
        
        console.log('   🔍 Is model a schema?:', modelIsSchema);
        
        if (!modelIsSchema && model && Object.keys(model).length > 0) {
          // model이 schema가 아니고 데이터가 있으면 사용
          
          // modelProperties가 있으면 (properties 안에 실제 데이터가 있는 경우)
          if (modelProperties && Object.keys(modelProperties).length > 0) {
            // modelProperties의 targetSoftwareModel이 schema가 아닌지 확인
            const targetSoftwareModelProp = (modelProperties as any).targetSoftwareModel;
            if (targetSoftwareModelProp) {
              const isTSMSchema = targetSoftwareModelProp.type === 'object' && 
                                 targetSoftwareModelProp.properties;
              
              if (!isTSMSchema) {
                // targetSoftwareModel이 schema가 아니면 실제 데이터
                existingBodyParamsData = modelProperties;
                hasExistingData = true;
                console.log('✅ Using step.properties.model (contains current changes)');
                console.log('   Data keys:', Object.keys(existingBodyParamsData));
              } else {
                console.log('⚠️ step.properties.model.properties.targetSoftwareModel is schema');
              }
            } else {
              // targetSoftwareModel이 없으면 modelProperties 전체가 데이터일 수 있음
              existingBodyParamsData = modelProperties;
              hasExistingData = true;
              console.log('✅ Using step.properties.model (no targetSoftwareModel schema)');
              console.log('   Data keys:', Object.keys(existingBodyParamsData));
            }
          } else {
            // modelProperties가 없으면 model 자체를 사용
            existingBodyParamsData = model;
            hasExistingData = true;
            console.log('✅ Using step.properties.model directly (current changes)');
            console.log('   Data keys:', Object.keys(existingBodyParamsData));
          }
        } else {
          console.log('⚠️ step.properties.model is schema or empty');
        }
        
        // Priority 2: originalData.request_body 확인 (fallback - 초기 로드 시에만)
        if (!hasExistingData) {
          console.log('🔍 Priority 2: Checking originalData.request_body (fallback for initial load)');
          console.log('   originalData:', originalData);
        
        if (!hasExistingData && originalData && originalData.request_body) {
          console.log('   Found originalData.request_body');
          console.log('   request_body type:', typeof originalData.request_body);
          
          let requestBody = originalData.request_body;
          
          // JSON 문자열이면 파싱
          if (typeof requestBody === 'string') {
            try {
              console.log('   📦 Parsing JSON string (length:', requestBody.length, ')');
              requestBody = JSON.parse(requestBody);
              console.log('   ✅ Successfully parsed JSON string');
              console.log('   Parsed keys:', Object.keys(requestBody));
            } catch (error) {
              console.warn('   ⚠️ Failed to parse request_body as JSON:', error);
              requestBody = {};
            }
          }
          
          // request_body가 실제 데이터인지 확인 (schema 제외)
          const requestBodyIsSchema = requestBody && typeof requestBody === 'object' && 
                                     requestBody.type === 'object' && 
                                     requestBody.properties && 
                                     typeof requestBody.properties === 'object';
          
          console.log('   🔍 Is requestBody a schema?:', requestBodyIsSchema);
          
          if (!requestBodyIsSchema && requestBody && typeof requestBody === 'object' && 
              Object.keys(requestBody).length > 0) {
            existingBodyParamsData = requestBody;
            hasExistingData = true;
            console.log('✅ Using originalData.request_body (saved data)');
            console.log('   Data keys:', Object.keys(existingBodyParamsData));
            console.log('   Data:', existingBodyParamsData);
          } else if (requestBodyIsSchema) {
            console.log('❌ originalData.request_body is SCHEMA, not data!');
          } else {
            console.log('⚠️ originalData.request_body is empty or invalid');
          }
        } else if (!hasExistingData) {
          console.log('⚠️ No originalData.request_body found');
        }
        }
        
        console.log('🔍 Final data loading result:');
        console.log('   hasExistingData:', hasExistingData);
        if (hasExistingData) {
          console.log('   existingBodyParamsData keys:', Object.keys(existingBodyParamsData));
          console.log('   existingBodyParamsData:', existingBodyParamsData);
          
          // Decode content field for cicada_task_script once here
          // cicada_task_script의 content 필드를 여기서 한 번만 디코딩
          // Use task_component (fixed identifier) instead of name (user-changeable)
          // task_component 사용 (고정 식별자), name은 사용자가 변경 가능
          const taskComponentName = step.value.properties?.originalData?.task_component || 
                                   step.value.type;
          
          console.log('🔍 Checking for cicada_task_run_script decoding:');
          console.log('   taskComponentName:', taskComponentName);
          console.log('   Has content?:', !!existingBodyParamsData.content);
          console.log('   Content value:', existingBodyParamsData.content);
          
          if (taskComponentName === 'cicada_task_run_script' && existingBodyParamsData.content) {
            console.log('🔓 Decoding content for cicada_task_script');
            console.log('   Encoded content:', existingBodyParamsData.content);
            existingBodyParamsData.content = decodeBase64(existingBodyParamsData.content);
            console.log('   Decoded content:', existingBodyParamsData.content);
          } else {
            console.log('❌ NOT decoding - taskComponentName or content check failed');
          }
        }
        
        // Schema와 Data 분리
        let bodyParamsSchemaSource: any = null;  // Schema (form 구조)
        let pathParamsData: any = {};
        let queryParamsData: any = {};
        let bodyParamsData: any = {};  // 실제 저장된 데이터
        
        // ✨ 핵심 로직 변경: taskComponentData.body_params가 있으면 무조건 schema로 사용
        if (taskComponentData && (taskComponentData as any).body_params) {
          console.log('=== 📋 PATH B: Using taskComponentData.body_params as schema ===');
          console.log('taskComponentData.body_params:', (taskComponentData as any).body_params);
          
          // Schema는 taskComponentData에서
          bodyParamsSchemaSource = (taskComponentData as any).body_params;
          
          // path_params와 query_params는 schema이므로 properties에서 실제 필드 추출
          const pathParamsSchemaObj = (taskComponentData as any).path_params;
          const queryParamsSchemaObj = (taskComponentData as any).query_params;
          
          pathParamsSchema.value = pathParamsSchemaObj || null;
          queryParamsSchema.value = queryParamsSchemaObj || null;
          
          // properties에서 실제 필드명을 추출하여 빈 데이터 객체 생성
          if (pathParamsSchemaObj?.properties) {
            Object.keys(pathParamsSchemaObj.properties).forEach(key => {
              pathParamsData[key] = '';
            });
          }
          
          if (queryParamsSchemaObj?.properties) {
            Object.keys(queryParamsSchemaObj.properties).forEach(key => {
              queryParamsData[key] = '';
            });
          }
          
          // Data는 existingBodyParamsData에서 (originalData.request_body 또는 model.properties)
          if (hasExistingData) {
            console.log('✅ Using existing data');
            console.log('   existingBodyParamsData keys:', Object.keys(existingBodyParamsData));
            console.log('   existingBodyParamsData sample:', JSON.stringify(existingBodyParamsData).substring(0, 200));
            
            // 🔍 Final schema check: existingBodyParamsData가 schema가 아닌지 한번 더 확인
            const stillLooksLikeSchema = existingBodyParamsData.type === 'object' && 
                                        existingBodyParamsData.properties && 
                                        typeof existingBodyParamsData.properties === 'object';
            
            if (stillLooksLikeSchema) {
              console.error('❌ CRITICAL: existingBodyParamsData is SCHEMA, not data!');
              console.error('   This should not happen. Setting empty data.');
              bodyParamsData = {};
            } else {
              bodyParamsData = existingBodyParamsData;
              console.log('✅ existingBodyParamsData confirmed as actual data');
            }
          } else {
            console.log('ℹ️ No existing data, showing empty form');
            bodyParamsData = {};
          }
          
          // 실제 저장된 path_params와 query_params 데이터 가져오기
          const originalData = (step.value.properties as any)?.originalData;
          const savedPathParams = (model as any)?.path_params || originalData?.path_params || {};
          const savedQueryParams = (model as any)?.query_params || originalData?.query_params || {};
          
          // Schema에서 정의된 필드에 실제 값이 있으면 덮어쓰기
          Object.keys(savedPathParams).forEach(key => {
            if (pathParamsData.hasOwnProperty(key)) {
              pathParamsData[key] = savedPathParams[key];
            }
          });
          
          Object.keys(savedQueryParams).forEach(key => {
            if (queryParamsData.hasOwnProperty(key)) {
              queryParamsData[key] = savedQueryParams[key];
            }
          });
          
          console.log('✅ Schema loaded from taskComponentData.body_params');
          console.log('   Schema properties:', Object.keys(bodyParamsSchemaSource?.properties || {}));
          console.log('✅ Data loaded from model.properties');
          console.log('   Data keys:', Object.keys(bodyParamsData));
          console.log('✅ Path params data:', pathParamsData);
          console.log('✅ Query params data:', queryParamsData);
        } else if (hasExistingData) {
          console.log('=== 🎯 PATH A: No taskComponentData, using model data for both schema and values ===');
          console.log('existingBodyParamsData keys:', Object.keys(existingBodyParamsData));
          console.log('existingBodyParamsData:', existingBodyParamsData);
          
          // Schema도 model 데이터 구조로부터 생성
          bodyParamsSchemaSource = {
            type: 'object',
            properties: {},
            required: []
          };
          
          // 데이터 구조를 분석하여 schema 생성
          Object.keys(existingBodyParamsData).forEach(key => {
            const value = existingBodyParamsData[key];
            const propSchema: any = { type: 'string' };
            
            if (Array.isArray(value)) {
              propSchema.type = 'array';
              if (value.length > 0) {
                const firstItem = value[0];
                if (typeof firstItem === 'object' && firstItem !== null) {
                  propSchema.items = {
                    type: 'object',
                    properties: {}
                  };
                  // 객체 배열의 첫 번째 item 구조 분석
                  Object.keys(firstItem).forEach(itemKey => {
                    const itemValue = firstItem[itemKey];
                    if (Array.isArray(itemValue)) {
                      propSchema.items.properties[itemKey] = {
                        type: 'array',
                        items: { type: typeof itemValue[0] !== 'object' ? typeof itemValue[0] : 'object' }
                      };
                    } else if (typeof itemValue === 'object' && itemValue !== null) {
                      propSchema.items.properties[itemKey] = {
                        type: 'object'
                      };
                    } else {
                      propSchema.items.properties[itemKey] = {
                        type: typeof itemValue
                      };
                    }
                  });
                } else {
                  propSchema.items = { type: typeof firstItem };
                }
              } else {
                propSchema.items = { type: 'string' };
              }
            } else if (typeof value === 'object' && value !== null) {
              propSchema.type = 'object';
              propSchema.properties = {};
            } else {
              propSchema.type = typeof value;
            }
            
            bodyParamsSchemaSource.properties[key] = propSchema;
          });
          
          bodyParamsData = existingBodyParamsData;
          
          console.log('✅ Generated schema from model data');
          console.log('   Schema properties:', Object.keys(bodyParamsSchemaSource.properties));
          console.log('   Data keys:', Object.keys(bodyParamsData));
          
          pathParamsData = (model as any).path_params || {};
          queryParamsData = (model as any).query_params || {};
        } else {
          // Task Component가 없으면 fallback (기존 로직)
          console.log('=== ⚠️ PATH C: Task Component not found, using fallback logic ===');
          
          if (modelProperties.targetSoftwareModel) {
            bodyParamsData = modelProperties.targetSoftwareModel;
        } else if (modelProperties && Object.keys(modelProperties).length > 0) {
            bodyParamsData = modelProperties;
        } else {
            const data = (model as any).data || model;
            bodyParamsData = (data as any).body_params || {};
        }
        
          // Decode content field for cicada_task_script in fallback path
          // fallback 경로에서도 cicada_task_script의 content 필드 디코딩
          // Use task_component (fixed identifier) instead of name (user-changeable)
          // task_component 사용 (고정 식별자), name은 사용자가 변경 가능
          const taskComponentName = step.value.properties?.originalData?.task_component || 
                                   step.value.type;
          
          console.log('🔍 PATH C - Checking for cicada_task_run_script decoding:');
          console.log('   taskComponentName:', taskComponentName);
          console.log('   Has content?:', !!bodyParamsData.content);
          console.log('   Content type:', typeof bodyParamsData.content);
          console.log('   Content value:', bodyParamsData.content);
          
          if (taskComponentName === 'cicada_task_run_script' && 
              bodyParamsData.content && 
              typeof bodyParamsData.content === 'string') {
            console.log('🔓 Decoding content in PATH C (fallback)');
            console.log('   Encoded content:', bodyParamsData.content);
            bodyParamsData.content = decodeBase64(bodyParamsData.content);
            console.log('   Decoded content:', bodyParamsData.content);
          } else {
            console.log('❌ PATH C - NOT decoding - condition check failed');
          }
        
          pathParamsData = (model as any).path_params || {};
          queryParamsData = (model as any).query_params || {};
        }
        
        console.log('Model structure:', model);
        console.log('Model properties (Step Model Properties):', modelProperties);
        console.log('Body params schema source:', bodyParamsSchemaSource);
        console.log('Body params data:', bodyParamsData);
        console.log('Path params data:', pathParamsData);
        console.log('Query params data:', queryParamsData);
        
        // 분리된 params 변수에 할당
        pathParams.value = pathParamsData;
        queryParams.value = queryParamsData;
        
        // Body Params Schema와 Model 설정
        if (bodyParamsSchemaSource) {
          // Schema 설정 (Task Component의 body_params)
          console.log('=== Setting Body Params ===');
          console.log('1️⃣ Schema (form structure):');
          console.log('   Full schema:', bodyParamsSchemaSource);
          console.log('   - Type:', bodyParamsSchemaSource.type);
          console.log('   - Properties count:', Object.keys(bodyParamsSchemaSource.properties || {}).length);
          console.log('   - Properties keys:', Object.keys(bodyParamsSchemaSource.properties || {}));
          console.log('   - Required:', bodyParamsSchemaSource.required);
          
          // Schema의 각 property 상세 정보
          if (bodyParamsSchemaSource.properties) {
            console.log('   Schema properties detail:');
            Object.keys(bodyParamsSchemaSource.properties).forEach(key => {
              const prop = bodyParamsSchemaSource.properties[key];
              console.log(`     - ${key}:`, {
                type: prop.type,
                hasProperties: !!prop.properties,
                hasItems: !!prop.items,
                propertiesKeys: prop.properties ? Object.keys(prop.properties) : []
              });
            });
          }
          
          // vue-json-ui-editor에 schema 전달
          // Schema 구조를 기반으로 데이터 매핑
          let finalProperties = bodyParamsSchemaSource.properties || {};
          let finalRequired = bodyParamsSchemaSource.required || [];
          let finalBodyParamsData = bodyParamsData;
          
          console.log('📋 Schema structure analysis:');
          console.log('   Schema properties:', Object.keys(finalProperties));
          
          // Schema에 targetSoftwareModel이 있는지 확인
          if (finalProperties.targetSoftwareModel && 
              finalProperties.targetSoftwareModel.properties) {
            console.log('🔍 Schema has targetSoftwareModel property');
            console.log('   targetSoftwareModel properties:', Object.keys(finalProperties.targetSoftwareModel.properties));
            
            // 데이터 구조 확인
            if (bodyParamsData && Object.keys(bodyParamsData).length > 0) {
              console.log('📊 Data structure analysis:');
              console.log('   Data keys:', Object.keys(bodyParamsData));
              
              // 데이터가 { targetSoftwareModel: {...} } 형태인지 확인
              if (bodyParamsData.targetSoftwareModel) {
                console.log('✅ Data already has targetSoftwareModel wrapper');
                console.log('   Data.targetSoftwareModel keys:', Object.keys(bodyParamsData.targetSoftwareModel));
                finalBodyParamsData = bodyParamsData;
              } else {
                // 데이터가 { servers: [...], source_connection_info_id: "..." } 형태면
                // Schema 구조에 맞춰 { targetSoftwareModel: { servers: [...], ... } }로 변환
                console.log('🔄 Wrapping data to match schema structure');
                console.log('   Before wrap:', Object.keys(bodyParamsData));
                finalBodyParamsData = {
                  targetSoftwareModel: bodyParamsData
                };
                console.log('   After wrap:', Object.keys(finalBodyParamsData));
              }
            }
            
            // Schema는 그대로 사용 (targetSoftwareModel 포함)
            console.log('✅ Using schema as-is (with targetSoftwareModel)');
          } else {
            // Schema에 targetSoftwareModel이 없으면 데이터도 그대로
            console.log('✅ Schema has no targetSoftwareModel, using data as-is');
            finalBodyParamsData = bodyParamsData;
          }
          
          bodyParamsSchema.value = {
            type: 'object',
            properties: finalProperties,
            required: finalRequired
          };
          
          console.log('✅ Schema set to bodyParamsSchema.value');
          console.log('✅ Schema type:', bodyParamsSchema.value.type);
          console.log('✅ Schema properties keys:', Object.keys(bodyParamsSchema.value.properties));
          
          // Model 설정 (실제 데이터)
          console.log('2️⃣ Setting model data...');
          console.log('   finalBodyParamsData type:', typeof finalBodyParamsData);
          console.log('   finalBodyParamsData keys:', Object.keys(finalBodyParamsData || {}));
          
          // 🔍 CRITICAL CHECK: finalBodyParamsData가 schema인지 확인
          if (finalBodyParamsData && 
              finalBodyParamsData.type === 'object' && 
              finalBodyParamsData.properties &&
              typeof finalBodyParamsData.properties === 'object') {
            console.error('❌❌❌ CRITICAL ERROR: Trying to set SCHEMA as model data!');
            console.error('   finalBodyParamsData.type:', finalBodyParamsData.type);
            console.error('   finalBodyParamsData.properties:', Object.keys(finalBodyParamsData.properties));
            console.error('   This is a SCHEMA, not actual form data!');
            console.error('   Setting empty object instead.');
            bodyParamsModel.value = {};
          } else {
            // No need to decode here - already decoded in existingBodyParamsData
            // existingBodyParamsData에서 이미 디코딩되었으므로 여기서는 불필요
            bodyParamsModel.value = finalBodyParamsData || {};
            console.log('✅ Data set to bodyParamsModel.value');
          }
          
          // 데이터 매핑 결과 상세 로그
          if (Object.keys(bodyParamsModel.value).length > 0) {
            console.log('✅ Data successfully mapped to form');
            console.log('   📦 Mapped fields:', Object.keys(bodyParamsModel.value));
            
            // 🔍 Check if bodyParamsModel looks like schema
            if (bodyParamsModel.value.type === 'object' && bodyParamsModel.value.properties) {
              console.error('❌❌❌ bodyParamsModel.value IS SCHEMA! This is wrong!');
              console.error('   Expected: { targetSoftwareModel: { servers: [...] } }');
              console.error('   Got: { type: "object", properties: {...} }');
            } else {
              console.log('✅ bodyParamsModel.value looks like actual data');
            }
            
            Object.keys(bodyParamsModel.value).forEach(key => {
              const value = bodyParamsModel.value[key];
              if (Array.isArray(value)) {
                console.log(`   - ${key}: array with ${value.length} items`);
                if (value.length > 0 && typeof value[0] === 'object') {
                  console.log(`     First item keys: [${Object.keys(value[0]).join(', ')}]`);
                }
              } else if (typeof value === 'object' && value !== null) {
                console.log(`   - ${key}: object with keys [${Object.keys(value).join(', ')}]`);
              } else {
                console.log(`   - ${key}: ${typeof value} = ${value}`);
              }
            });
          } else {
            console.log('ℹ️ No data to map, showing empty form');
          }
          
          // 전체 taskSchema 업데이트 (디버그용)
          (taskSchema.value as any) = {
            type: 'object',
            title: 'Task Component Configuration',
            properties: {
              ...taskSchema.value.properties,
              body_params: bodyParamsSchema.value
            }
          };
          
          console.log('Updated full taskSchema (for debug):', taskSchema.value);
        } else if (Object.keys(bodyParamsData).length > 0) {
          // body_params가 데이터 형식이면 스키마 생성
          console.log('Generating schema from body_params data:', bodyParamsData);
          const generatedSchema = generateBodyParamsSchema(bodyParamsData);
          console.log('Generated body_params schema:', generatedSchema);
          
          bodyParamsSchema.value = generatedSchema;
          
          // No need to decode here - already decoded in existingBodyParamsData
          // existingBodyParamsData에서 이미 디코딩되었으므로 여기서는 불필요
          bodyParamsModel.value = bodyParamsData;
          
          console.log('Updated bodyParamsSchema with generated schema');
        } else {
          console.log('No body_params found, using default schema');
          bodyParamsSchema.value = {
                type: 'object',
                title: 'Body Parameters',
            properties: {},
                additionalProperties: true
          };
          bodyParamsModel.value = {};
        }
        
        console.log('=== Final Initialization Results ===');
        console.log('Path Params:', pathParams.value);
        console.log('Query Params:', queryParams.value);
        console.log('Body Params Schema:', bodyParamsSchema.value);
        console.log('Body Params Model:', bodyParamsModel.value);
        console.log('Full taskSchema (debug):', taskSchema.value);
        console.log('Full taskModel (debug):', taskModel.value);
        
        // vue-json-ui-editor는 reactive schema prop를 통해 자동으로 업데이트됨
        console.log('✅ Body params schema set reactively via :schema prop');
      }

      // TaskEditorModel 초기화
      if (step.value?.properties?.fixedModel) {
        taskEditorModel.setParamsContext(step.value.properties.fixedModel);
      }

      // Task Name 설정: step.name이 없으면 step.type을 기본값으로 사용
      const taskName = step.value?.name || step.value?.type || '';
      taskEditorModel.setComponentName(taskName);
      
      await nextTick();
      console.log('✅ Task name set to:', taskName);
      console.log('✅ Task name value from getter:', getComponentNameValue());
      
      // 초기 데이터 저장 (비교용)
      // ✨ BeetleTaskEditor 방식: originalData가 아닌 현재 model 상태 사용
      const currentModel = step.value.properties?.model || {};
      initialData.value = {
        name: step.value.name || '',
        path_params: { ...pathParams.value },
        query_params: { ...queryParams.value },
        body_params: JSON.parse(JSON.stringify(bodyParamsModel.value)),
        request_body: JSON.stringify(currentModel)  // 현재 model 상태 저장 (BeetleTaskEditor 방식)
      };
      
      console.log('=== Initial Data Saved (for comparison - BeetleTaskEditor style) ===');
      console.log('Initial name:', initialData.value.name);
      console.log('Initial path_params:', initialData.value.path_params);
      console.log('Initial query_params:', initialData.value.query_params);
      console.log('Initial body_params:', initialData.value.body_params);
      console.log('Initial request_body from step.properties.model:', initialData.value.request_body);
      console.log('=======================================================================');
      
      isInitialized.value = true;
    });

    // 데이터 비교 함수 (초기 데이터와 현재 데이터 비교)
    const compareWithInitialData = () => {
      console.log('\n');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('🔍 DATA COMPARISON: Initial vs Current');
      console.log('═══════════════════════════════════════════════════════════════');
      
      const currentName = step.value.name || '';
      const currentPathParams = pathParams.value;
      const currentQueryParams = queryParams.value;
      const currentBodyParams = bodyParamsModel.value;
      const currentRequestBody = JSON.stringify(step.value.properties?.model);
      
      // Name 비교
      const nameChanged = currentName !== initialData.value.name;
      console.log('\n📌 Task Name:');
      console.log('  Initial:', initialData.value.name);
      console.log('  Current:', currentName);
      console.log('  Changed:', nameChanged ? '❌ YES' : '✅ NO (Same)');
      
      // Path Params 비교
      const pathParamsChanged = JSON.stringify(currentPathParams) !== JSON.stringify(initialData.value.path_params);
      console.log('\n📌 Path Params:');
      console.log('  Initial:', JSON.stringify(initialData.value.path_params));
      console.log('  Current:', JSON.stringify(currentPathParams));
      console.log('  Changed:', pathParamsChanged ? '❌ YES' : '✅ NO (Same)');
      
      // Query Params 비교
      const queryParamsChanged = JSON.stringify(currentQueryParams) !== JSON.stringify(initialData.value.query_params);
      console.log('\n📌 Query Params:');
      console.log('  Initial:', JSON.stringify(initialData.value.query_params));
      console.log('  Current:', JSON.stringify(currentQueryParams));
      console.log('  Changed:', queryParamsChanged ? '❌ YES' : '✅ NO (Same)');
      
      // Body Params 비교
      const bodyParamsChanged = JSON.stringify(currentBodyParams) !== JSON.stringify(initialData.value.body_params);
      console.log('\n📌 Body Params (step.properties.model):');
      console.log('  Initial:', JSON.stringify(initialData.value.body_params));
      console.log('  Current:', JSON.stringify(currentBodyParams));
      console.log('  Changed:', bodyParamsChanged ? '❌ YES' : '✅ NO (Same)');
      
      // Request Body 비교 (originalData와 비교)
      const requestBodyChanged = currentRequestBody !== initialData.value.request_body;
      console.log('\n📌 Request Body (for API):');
      console.log('  Initial (from originalData):', initialData.value.request_body);
      console.log('  Current (will be sent):', currentRequestBody);
      console.log('  Changed:', requestBodyChanged ? '❌ YES' : '✅ NO (Same)');
      
      // 전체 요약
      const anyChanges = nameChanged || pathParamsChanged || queryParamsChanged || bodyParamsChanged;
      console.log('\n📊 Summary:');
      console.log('  Any changes detected:', anyChanges ? '❌ YES - Data was modified' : '✅ NO - Data is identical to original');
      
      if (!anyChanges) {
        console.log('  ✅ DATA INTEGRITY CHECK PASSED: Current data matches originalData');
      } else {
        console.log('  ⚠️ DATA WAS MODIFIED: Current data differs from originalData');
        console.log('  Changed fields:', [
          nameChanged && 'name',
          pathParamsChanged && 'path_params',
          queryParamsChanged && 'query_params',
          bodyParamsChanged && 'body_params'
        ].filter(Boolean).join(', '));
      }
      
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('\n');
      
      return {
        anyChanges,
        changes: {
          name: nameChanged,
          pathParams: pathParamsChanged,
          queryParams: queryParamsChanged,
          bodyParams: bodyParamsChanged
        }
      };
    };

    // Body Params Schema 변경 감지 (reactive prop으로 자동 업데이트됨)
    watch(bodyParamsSchema, (newSchema) => {
      console.log('Body Params Schema changed (auto-updated via reactive prop):', newSchema);
    }, { deep: true });

    // Body Params Model 변경 감지 - 변경 시 자동으로 step.properties.model 업데이트
    watch(bodyParamsModel, (newModel) => {
      console.log('\n');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('⚡ Body Params Model WATCH triggered');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('New model type:', typeof newModel);
      console.log('New model keys:', Object.keys(newModel));
      console.log('New model (first 300 chars):', JSON.stringify(newModel).substring(0, 300));
      
      // 🔍 Check if newModel is actually the step object (bug detection)
      if ((newModel as any).componentType === 'task') {
        console.error('❌ BUG DETECTED: bodyParamsModel contains step object instead of actual data!');
        console.error('bodyParamsModel should NOT have componentType, id, properties, etc.');
        console.error('This means initialization loaded wrong data into bodyParamsModel');
        return;
      }
      
      // 🔍 Check if newModel is a schema (critical bug detection)
      if ((newModel as any).type === 'object' && 
          (newModel as any).properties && 
          typeof (newModel as any).properties === 'object') {
        console.error('❌❌❌ CRITICAL BUG: bodyParamsModel contains SCHEMA instead of actual data!');
        console.error('Schema structure detected:');
        console.error('   - type:', (newModel as any).type);
        console.error('   - properties keys:', Object.keys((newModel as any).properties || {}));
        console.error('Expected structure: { targetSoftwareModel: { servers: [...], ... } }');
        console.error('Got structure: { type: "object", properties: {...} }');
        console.error('❌ NOT SAVING - This would corrupt the data!');
        return;
      }
      
      if (!isInitialized.value) {
        console.log('⏭️ Skipping auto-save during initialization');
        return;
      }
      
      // ✅ Looks good, proceed with save
      console.log('✅ newModel validation passed - looks like actual data');
      
      // step.properties.model을 newModel로 직접 업데이트
      // convertToCicadaTask는 JSON.stringify(step.properties.model)을 request_body로 사용
      let modelToSave = { ...newModel };
      
      // Encode content field for cicada_task_script before saving
      // cicada_task_script의 content 필드를 저장 전에 인코딩
      // Use task_component (fixed identifier) instead of name (user-changeable)
      // task_component 사용 (고정 식별자), name은 사용자가 변경 가능
      const taskComponentName = step.value.properties?.originalData?.task_component || 
                               step.value.type;
      
      if (taskComponentName === 'cicada_task_run_script' && modelToSave.content) {
        console.log('🔐 Encoding content for cicada_task_script before save');
        console.log('   Original content:', modelToSave.content);
        modelToSave = {
          ...modelToSave,
          content: encodeBase64(modelToSave.content)
        };
        console.log('   Encoded content:', modelToSave.content);
      }
      
      console.log('📤 Model to save:');
      console.log('   Keys:', Object.keys(modelToSave));
      console.log('   JSON (first 300 chars):', JSON.stringify(modelToSave).substring(0, 300));
      
      const updatedStep = {
        ...step.value,
        properties: {
          ...step.value.properties,
          model: modelToSave  // actual data를 직접 저장
        }
      };
      
      console.log('📝 Updated step.properties.model keys:', Object.keys(updatedStep.properties.model));
      console.log('📝 Updated step.properties.model (first 300 chars):', JSON.stringify(updatedStep.properties.model).substring(0, 300));
      
      // 부모 컴포넌트에 변경사항 전달
      // ⚠️ IMPORTANT: editorProviders에서 step.properties.model = e 로 할당하므로
      // 전체 step이 아니라 model만 emit해야 함!
      emit('saveContext', updatedStep.properties.model);
      
      console.log('✅ Auto-saved body params changes to step.properties.model');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('\n');
    }, { deep: true });

    return {
      // Data
      step,
      taskEditorModel,
      jsonEditor,
      isInitialized,
      taskSchema,
      taskModel,
      
      // Separated Parameters
      pathParams,
      queryParams,
      bodyParamsSchema,
      bodyParamsModel,
      sortedBodyParamPropertyNames,
      
      // Component Name Methods
      getComponentNameTitle,
      getComponentNameValue,
      setComponentNameValue,
      getComponentNameIsValid,
      getComponentNameOnBlur,
      handleComponentNameInput,
      
      // Step Properties Method
      getStepProperties,
      getCurrentTaskComponentName,
      
      // Parameters Getter
      getPathParams,
      getQueryParams,
      
      // Parameters Checker
      hasPathParams,
      hasQueryParams,
      hasBodyParams,
      isPathParamRequired,
      isQueryParamRequired,
      
      // Parameters Update Handlers
      handlePathParamInput,
      handleQueryParamInput,
      updateStepWithParams,
      
      // Body Param Field Update Handler
      updateBodyParamField: (fieldName: string, value: any) => {
        console.log('\n');
        console.log('🔄🔄🔄 updateBodyParamField CALLED 🔄🔄🔄');
        console.log(`   Field name: ${fieldName}`);
        console.log('   New value type:', typeof value);
        
        // Deep inspection of new value
        if (typeof value === 'object' && value !== null) {
          console.log('   New value keys:', Object.keys(value));
          if (value.servers && Array.isArray(value.servers)) {
            console.log(`   New value.servers: array[${value.servers.length}]`);
            if (value.servers.length > 0) {
              console.log('   First server keys:', Object.keys(value.servers[0]));
              console.log('   First server.source_connection_info_id:', value.servers[0].source_connection_info_id);
            }
          }
        }
        console.log('   New value JSON (first 500 chars):', JSON.stringify(value).substring(0, 500));
        
        console.log('   Current bodyParamsModel keys BEFORE update:', Object.keys(bodyParamsModel.value));
        console.log('   Current bodyParamsModel JSON (first 500 chars):', JSON.stringify(bodyParamsModel.value).substring(0, 500));
        
        // 🔍 Create NEW object to trigger Vue reactivity
        // Deep clone to ensure Vue detects all changes
        const oldModel = bodyParamsModel.value;
        const newModel = JSON.parse(JSON.stringify({
          ...bodyParamsModel.value,
          [fieldName]: value
        }));
        
        bodyParamsModel.value = newModel;
        
        console.log('   bodyParamsModel keys AFTER update:', Object.keys(bodyParamsModel.value));
        
        // Verify update
        if (bodyParamsModel.value[fieldName] && typeof bodyParamsModel.value[fieldName] === 'object') {
          if (bodyParamsModel.value[fieldName].servers && Array.isArray(bodyParamsModel.value[fieldName].servers)) {
            console.log(`   Updated bodyParamsModel.${fieldName}.servers: array[${bodyParamsModel.value[fieldName].servers.length}]`);
            if (bodyParamsModel.value[fieldName].servers.length > 0) {
              console.log(`   Updated first server.source_connection_info_id: ${bodyParamsModel.value[fieldName].servers[0].source_connection_info_id}`);
            }
          }
        }
        
        console.log('   Updated bodyParamsModel JSON (first 500 chars):', JSON.stringify(bodyParamsModel.value).substring(0, 500));
        console.log('   ✅ bodyParamsModel.value object reference changed:', oldModel !== bodyParamsModel.value);
        console.log('   ⏰ Waiting for watch(bodyParamsModel) to trigger...');
        console.log('🔄🔄🔄 updateBodyParamField COMPLETE 🔄🔄🔄');
        console.log('\n');
        // watch will auto-save changes
      },
      
      // JSON Editor Methods (공식 예시 기반)
      resetEditor,
      saveConfiguration,
      generateBodyParamsSchema,
      
      // Data Comparison
      compareWithInitialData,
      initialData
    };
  }
});
</script>

<style scoped lang="postcss">
.task-component-editor {
  @apply p-4 bg-white;
}

.component-name-section {
  @apply mb-6;
}

.field-label {
  @apply flex items-center mb-2;
}

.label-text {
  @apply text-sm font-medium text-gray-700;
}

.required-indicator {
  @apply text-red-500 ml-1;
}

.component-name-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md text-sm;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  @apply transition-colors duration-200;
}

.component-name-input.invalid {
  @apply border-red-500 focus:ring-red-500 focus:border-red-500;
}

.task-configuration-section {
  @apply mb-6;
}

.params-section {
  @apply mb-6 p-4 bg-gray-100 rounded-lg border border-gray-200;
}

.params-title {
  @apply text-base font-semibold text-gray-700 mb-3;
}

.params-content {
  @apply space-y-3;
}

.param-item {
  @apply flex flex-col;
}

.param-label {
  @apply text-sm font-medium text-gray-600 mb-1;
}

.param-label .required-mark {
  color: #dc2626;
  margin-left: 0.125rem;
  font-weight: bold;
}

.param-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md text-sm;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  @apply transition-colors duration-200;
}

.empty-params {
  @apply text-sm text-gray-400 italic;
}

.body-params-section {
  @apply bg-white border-gray-300;
}

.recursive-form-container {
  @apply bg-white;
  padding: 0;
}

.section-header {
  @apply mb-4 pb-3 border-b border-gray-200;
}

.section-header h4 {
  @apply text-lg font-semibold text-gray-800;
}

.json-editor-container {
  @apply bg-white;
  min-height: 400px;
  padding: 0;
}

/* vue-json-ui-editor 기본 스타일 */
.json-editor-container :deep(.json-editor) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

/* 폼 전체 스타일 */
.json-editor-container :deep(.el-form) {
  margin: 0;
  padding: 0;
}

.json-editor-container :deep(.el-form-item) {
  margin-bottom: 18px;
}

.json-editor-container :deep(.el-form-item__label) {
  font-size: 14px;
  color: #606266;
  line-height: 40px;
  padding: 0 12px 0 0;
  display: block;
  text-align: right;
  font-weight: 500;
}

.json-editor-container :deep(.el-form-item__content) {
  line-height: 40px;
  position: relative;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.json-editor-container :deep(.el-input) {
  position: relative;
  font-size: 14px;
  display: inline-block;
  width: 100%;
}

.json-editor-container :deep(.el-input__inner) {
  -webkit-appearance: none;
  appearance: none;
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: none;
  padding: 0 15px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
}

.json-editor-container :deep(.el-input__inner:focus) {
  outline: none;
  border-color: #409eff;
}

.json-editor-container :deep(.el-select) {
  display: inline-block;
  position: relative;
  width: 100%;
}

.json-editor-container :deep(.el-select .el-input__inner) {
  cursor: pointer;
  padding-right: 30px;
}

.json-editor-container :deep(.el-textarea) {
  position: relative;
  display: inline-block;
  width: 100%;
  vertical-align: bottom;
  font-size: 14px;
}

.json-editor-container :deep(.el-textarea__inner) {
  display: block;
  resize: vertical;
  padding: 5px 15px;
  line-height: 1.5;
  box-sizing: border-box;
  width: 100%;
  font-size: inherit;
  color: #606266;
  background-color: #fff;
  background-image: none;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.json-editor-container :deep(.el-textarea__inner:focus) {
  outline: none;
  border-color: #409eff;
}

/* JSON Editor 슬롯 버튼 스타일 (공식 예시 기반) */
.json-editor-container :deep(.json-editor button) {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  -webkit-appearance: none;
  appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: 0.1s;
  font-weight: 500;
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 4px;
  margin-right: 10px;
  margin-top: 10px;
}

.json-editor-container :deep(.json-editor button:hover) {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.json-editor-container :deep(.json-editor button:active) {
  color: #3a8ee6;
  border-color: #3a8ee6;
  outline: none;
}

.json-editor-container :deep(.json-editor button:focus) {
  outline: none;
  border-color: #409eff;
}

/* 객체/배열 스타일 */
.json-editor-container :deep(.json-editor-object) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  margin: 5px 0;
  background-color: #fafafa;
}

.json-editor-container :deep(.json-editor-array) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  margin: 5px 0;
  background-color: #f9f9f9;
}

</style>
