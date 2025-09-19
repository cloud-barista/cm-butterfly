<script setup lang="ts">
import { PTextInput } from '@cloudforet-test/mirinae';
import { FieldGroup } from '../FieldGroup';
import RecursiveFieldRenderer from './RecursiveFieldRenderer.vue';

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

interface IProps {
  formData: Field[];
  componentName?: {
    title: string;
    modelValue: string;
    readonly?: boolean;
  };
  pathParams?: {
    subject: string;
    values: Field[];
  };
  queryParams?: {
    subject: string;
    values: Field[];
  };
}

const props = defineProps<IProps>();

// 디버깅을 위한 로그
console.log('=== CommonTaskEditor Props ===');
console.log('props:', props);
console.log('formData:', props.formData);
console.log('componentName:', props.componentName);
console.log('pathParams:', props.pathParams);
console.log('queryParams:', props.queryParams);
</script>

<template>
  <div class="task-editor-form">
    <!-- Component Name -->
    <div v-if="componentName" class="step-name-box w-full">
      <div class="subject-title border-bottom">Component Name</div>
      <FieldGroup
        :title="componentName.title"
        :model-value="componentName.modelValue"
        :readonly="componentName.readonly"
        size="md"
      />
    </div>

    <!-- Path Params -->
    <div v-if="pathParams && pathParams.values.length > 0">
      <div class="subject-title border-bottom">
        {{ pathParams.subject }}
      </div>
      <FieldGroup
        v-for="(param, paramIndex) of pathParams.values"
        :key="paramIndex"
        :title="param.context.title || ''"
        :model-value="param.context.model?.value || ''"
        :invalid="!param.context.model?.isValid"
        :readonly="param.context.title === 'nsId'"
        :on-blur="param.context.model?.onBlur"
        size="md"
      />
    </div>
    
    <!-- Query Params -->
    <div v-if="queryParams && queryParams.values.length > 0">
      <div class="subject-title border-bottom">
        {{ queryParams.subject }}
      </div>
      <FieldGroup
        v-for="(param, paramIndex) of queryParams.values"
        :key="paramIndex"
        :title="param.context.title || ''"
        :model-value="param.context.model?.value || ''"
        :invalid="!param.context.model?.isValid"
        :readonly="param.context.title === 'nsId'"
        :on-blur="param.context.model?.onBlur"
        size="md"
      />
    </div>

    <!-- Form Context - 재귀적 렌더링 -->
    <div v-for="(formData, index) of formData" :key="index">
      <RecursiveFieldRenderer :field="formData" />
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
      align-items: flex-start;
      width: 310px;
      min-height: 44px;
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
