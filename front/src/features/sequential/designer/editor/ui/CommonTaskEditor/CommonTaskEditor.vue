<script setup lang="ts">
import { PTextInput } from '@cloudforet-test/mirinae';
import { FieldGroup } from '@/shared/ui/Input/FieldGroup';
import RecursiveFieldRenderer from './RecursiveFieldRenderer.vue';
import { ref, watch, computed, onMounted } from 'vue';
import { DEFAULT_NAMESPACE } from '@/shared/constants/namespace';

interface Field {
  type: 'input' | 'array' | 'nestedObject' | 'entity';
  context: {
    title?: string;
    subject?: string;
    model?: {
      value: string;
      isValid?: boolean;
      onBlur?: () => void;
    };
    values?: Field[];
  };
}

interface TaskComponentDefinition {
  data: {
    options: {
      request_body: string;
      path_params: object;
    };
    path_params: {
      properties: Record<string, { description: string; type: string }> | null;
    };
    query_params: {
      properties: Record<string, { description: string; type: string }> | null;
    };
  };
}

interface IProps {
  step: any; // step 객체를 받아서 task component 정의를 추출
  taskComponentDefinition?: TaskComponentDefinition; // task component 정의 (선택적)
}

const props = defineProps<IProps>();
const emit = defineEmits(['saveComponentName', 'saveContext', 'saveFixedModel']);

// Task component 정의 추출
const taskComponentDef = computed(() => {
  return props.taskComponentDefinition || props.step?.taskComponentDefinition;
});

// Component Name을 위한 reactive model
const componentNameModel = ref({
  context: {
    title: 'Component Name',
    model: {
      value: props.step?.name || '',
      isValid: true,
      onBlur: () => {}
    }
  }
});

// Path Params를 위한 reactive model
const pathParamsModel = ref<Field[]>([]);

// Query Params를 위한 reactive model  
const queryParamsModel = ref<Field[]>([]);

// Body Params (Form Data)를 위한 reactive model
const bodyParamsModel = ref<Field[]>([]);

// Task component 정의에서 params 추출
function extractParamsFromTaskComponent() {
  if (!taskComponentDef.value) return;

  const { path_params, query_params, options } = taskComponentDef.value.data;

  // Path Params 추출
  if (path_params?.properties) {
    pathParamsModel.value = Object.entries(path_params.properties).map(([key, value]) => ({
      type: 'input' as const,
      context: {
        title: key,
        model: {
          value: key === 'nsId' ? DEFAULT_NAMESPACE : '',
          isValid: true,
          onBlur: () => {}
        }
      }
    }));
  }

  // Query Params 추출
  if (query_params?.properties) {
    queryParamsModel.value = Object.entries(query_params.properties).map(([key, value]) => ({
      type: 'input' as const,
      context: {
        title: key,
        model: {
          value: key === 'nsId' ? DEFAULT_NAMESPACE : '',
          isValid: true,
          onBlur: () => {}
        }
      }
    }));
  }

  // Body Params 추출 (request_body에서)
  if (options?.request_body) {
    try {
      const requestBodySchema = JSON.parse(options.request_body);
      bodyParamsModel.value = parseRequestBodySchema(requestBodySchema);
    } catch (error) {
      console.warn('Failed to parse request body schema:', error);
      bodyParamsModel.value = [];
    }
  }
}

// Request body schema를 Field 배열로 파싱
function parseRequestBodySchema(schema: any): Field[] {
  const fields: Field[] = [];
  
  if (typeof schema === 'object' && schema !== null) {
    Object.entries(schema).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        fields.push({
          type: 'array',
          context: {
            subject: key,
            values: value.map((item, index) => ({
              type: 'input' as const,
              context: {
                title: `${key}[${index}]`,
                model: {
                  value: typeof item === 'string' ? item : JSON.stringify(item),
                  isValid: true,
                  onBlur: () => {}
                }
              }
            }))
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        fields.push({
          type: 'nestedObject',
          context: {
            subject: key,
            values: parseRequestBodySchema(value)
          }
        });
      } else {
        fields.push({
          type: 'input',
          context: {
            title: key,
            model: {
              value: typeof value === 'string' ? value : String(value),
              isValid: true,
              onBlur: () => {}
            }
          }
        });
      }
    });
  }
  
  return fields;
}

// Component Name 변경 감지
watch(
  componentNameModel,
  (newValue) => {
    if (newValue.context.model.value !== '') {
      emit('saveComponentName', newValue.context.model.value);
    }
  },
  { deep: true }
);

// Path Params 변경 감지
watch(
  pathParamsModel,
  (newValue) => {
    const pathParamsData = newValue.reduce((acc, param) => {
      if (param.context.title) {
        acc[param.context.title] = param.context.model?.value || '';
      }
      return acc;
    }, {} as Record<string, string>);
    
    emit('saveFixedModel', {
      path_params: pathParamsData
    });
  },
  { deep: true }
);

// Query Params 변경 감지
watch(
  queryParamsModel,
  (newValue) => {
    const queryParamsData = newValue.reduce((acc, param) => {
      if (param.context.title) {
        acc[param.context.title] = param.context.model?.value || '';
      }
      return acc;
    }, {} as Record<string, string>);
    
    emit('saveFixedModel', {
      query_params: queryParamsData
    });
  },
  { deep: true }
);

// Body Params 변경 감지
watch(
  bodyParamsModel,
  (newValue) => {
    const requestBody = convertFormDataToRequestBody(newValue);
    emit('saveContext', requestBody);
  },
  { deep: true }
);

// Form Data를 request body 형식으로 변환하는 함수
function convertFormDataToRequestBody(formData: Field[]): any {
  const result: any = {};
  
  formData.forEach(field => {
    if (field.type === 'input' && field.context.title) {
      result[field.context.title] = field.context.model?.value || '';
    } else if (field.type === 'array' && field.context.subject) {
      result[field.context.subject] = field.context.values?.map(item => {
        if (item.type === 'input' && item.context.title) {
          return item.context.model?.value || '';
        }
        return item;
      }) || [];
    } else if (field.type === 'nestedObject' && field.context.subject) {
      result[field.context.subject] = convertFormDataToRequestBody(field.context.values || []);
    }
  });
  
  return result;
}

onMounted(() => {
  extractParamsFromTaskComponent();
});

// 디버깅을 위한 로그
console.log('=== CommonTaskEditor Props ===');
console.log('props:', props);
console.log('taskComponentDef:', taskComponentDef.value);
console.log('pathParamsModel:', pathParamsModel.value);
console.log('queryParamsModel:', queryParamsModel.value);
console.log('bodyParamsModel:', bodyParamsModel.value);
</script>

<template>
  <div class="task-editor-form">
    <!-- Component Name -->
    <div class="step-name-box w-full">
      <div class="subject-title border-bottom">Component Name</div>
      <div class="field-group flex border-bottom">
        <div class="field-title-box">
          {{ componentNameModel.context.title }}
        </div>
        <div class="field-content-box">
          <p-text-input
            v-model="componentNameModel.context.model.value"
            :size="'md'"
            block
            readonly
            :invalid="!componentNameModel.context.model.isValid"
            @blur="componentNameModel.context.model.onBlur"
          />
        </div>
      </div>
    </div>

    <!-- Path Params -->
    <div v-if="pathParamsModel.length > 0" class="params-box w-full h-full">
      <div class="subject-title border-bottom">
        Path Parameters
      </div>
      <div
        v-for="(param, paramIndex) of pathParamsModel"
        :key="paramIndex"
        class="field-group flex border-bottom"
      >
        <div class="field-title-box">
          {{ param.context.title }}
        </div>
        <div class="field-content-box">
          <p-text-input
            v-model="param.context.model.value"
            :size="'md'"
            block
            :invalid="!param.context.model.isValid"
            :readonly="param.context.title === 'nsId'"
            @blur="param.context.model.onBlur"
          />
        </div>
      </div>
    </div>
    
    <!-- Query Params -->
    <div v-if="queryParamsModel.length > 0" class="params-box w-full h-full">
      <div class="subject-title border-bottom">
        Query Parameters
      </div>
      <div
        v-for="(param, paramIndex) of queryParamsModel"
        :key="paramIndex"
        class="field-group flex border-bottom"
      >
        <div class="field-title-box">
          {{ param.context.title }}
        </div>
        <div class="field-content-box">
          <p-text-input
            v-model="param.context.model.value"
            :size="'md'"
            block
            :invalid="!param.context.model.isValid"
            :readonly="param.context.title === 'nsId'"
            @blur="param.context.model.onBlur"
          />
        </div>
      </div>
    </div>

    <!-- Body Params (Form Data) - 재귀적 렌더링 -->
    <div v-for="(field, index) of bodyParamsModel" :key="index">
      <RecursiveFieldRenderer :field="field" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.task-editor-form {
  position: relative;
  overflow: hidden;
  overflow-y: scroll;
  width: 100%;
  height: calc(100% - 20px);

  .field-group {
    .field-title-box {
      display: flex;
      align-items: center;
      width: 200px;
      height: 44px;
      font-size: 14px;
      font-weight: 700;
      padding: 6px 16px 6px 16px;
    }

    .field-content-box {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 310px;
      height: 44px;
      padding: 6px 16px 6px 16px;
    }
    
    .json-textarea {
      width: 100%;
      height: 200px;
      padding: 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      line-height: 1.4;
      resize: vertical;
      background-color: #f9fafb;
    }
    
    .json-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 1px #3b82f6;
    }
  }
}

.border-bottom {
  border-bottom: 1px solid;
  @apply border-gray-200;
}

.subject-title {
  @apply pr-[16px] pl-[16px] mt-[16px] h-[44px] text-gray-500;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.software-model-box {
  margin-bottom: 20px;
}

.array-box {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  
  .array-item {
    margin-bottom: 15px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px;
    background-color: #f9fafb;
    width: 100%;
  }
}

.nested-object-box {
  display: flex;
  flex-direction: column;
  
  .field-group {
    margin-left: 20px;
    display: flex;
    flex-direction: column;
    
    .field-title-box {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 5px;
    }
    
    .field-content-box {
      width: 100%;
    }
  }
}

.field-group {
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
  align-items: center;
  
  .field-title-box {
    font-size: 13px;
    color: #6b7280;
    margin-right: 10px;
    min-width: 120px;
    flex-shrink: 0;
  }
  
  .field-content-box {
    flex: 1;
    width: 100%;
  }
}

/* flex 클래스가 있는 field-group은 가로 배치 강제 */
.field-group.flex {
  display: flex;
  flex-direction: row;
  align-items: center;
  
  .field-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    
    .field-title-box {
      margin-right: 10px;
      min-width: 80px;
      max-width: 120px;
      flex-shrink: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .field-content-box {
      flex: 1;
      min-width: 0;
      max-width: calc(100% - 130px);
      overflow: hidden;
    }
  }
}

.field-group-vertical {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  
  .field-title-box {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 5px;
  }
  
  .field-content-box {
    width: 100%;
  }
  
  /* field-group-vertical 내부의 field-group은 가로 배치 */
  .field-group {
    display: flex;
    flex-direction: row;
    margin-bottom: 10px;
    align-items: center;
    
    .field-title-box {
      font-size: 13px;
      color: #6b7280;
      margin-right: 10px;
      min-width: 120px;
      flex-shrink: 0;
    }
    
    .field-content-box {
      flex: 1;
      width: 100%;
    }
  }
}

.migration-list-box {
  display: flex;
  flex-direction: column;
  width: 100%;
  
  .migration-array-item {
    margin-bottom: 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 8px;
    background-color: #f8fafc;
    width: 100%;
    display: flex;
    flex-direction: column;
    
    .field-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 5px;
      
      .field-title-box {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 2px;
      }
      
      .field-content-box {
        width: 100%;
      }
    }
  }
}

/* migration_list 내부의 field-group은 세로 배치 */
.array-item .field-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
  
  .field-title-box {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 2px;
  }
  
  .field-content-box {
    width: 100%;
  }
}
</style>
