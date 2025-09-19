<script setup lang="ts">
import { PTextInput } from '@cloudforet-test/mirinae';

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
  field: Field;
  level?: number;
  isMigrationList?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  level: 0,
  isMigrationList: false,
});

const isMigrationListField = (field: Field) => {
  return field.context.subject === 'migration_list';
};

const shouldRenderField = (field: Field) => {
  return field.context.title !== 'errors' && field.context.subject !== 'errors';
};
</script>

<template>
  <div>
    <!-- Input Field -->
    <div v-if="field.type === 'input'" class="field-group flex">
      <div class="field-row">
        <div class="field-title-box">
          {{ field.context.title }}
        </div>
        <div class="field-content-box">
          <p-text-input 
            v-if="field.context.model && field.context.model.value !== undefined" 
            v-model="field.context.model.value"
          />
          <p-text-input v-else />
        </div>
      </div>
    </div>

    <!-- Array Field (migration_list 제외) -->
    <div v-else-if="field.type === 'array' && !isMigrationListField(field)" class="field-group-vertical">
      <div class="field-title-box">
        {{ field.context.subject }}
      </div>
      <div class="field-content-box">
        <div 
          v-for="(arrayItem, arrayIndex) of field.context.values" 
          :key="arrayIndex"
          class="array-item"
        >
          <RecursiveFieldRenderer
            v-for="(subField, subFieldIndex) of arrayItem.context.values?.filter(shouldRenderField)" 
            :key="subFieldIndex"
            :field="subField"
            :level="level + 1"
          />
        </div>
      </div>
    </div>

    <!-- Nested Object Field -->
    <div v-else-if="field.type === 'nestedObject'" class="nested-object-box">
      <div class="subject-title border-bottom">
        {{ field.context.subject }}
      </div>
      <div 
        v-for="(nestedField, nestedIndex) of field.context.values?.filter(shouldRenderField)" 
        :key="nestedIndex"
        class="field-group-vertical border-bottom"
      >
        <RecursiveFieldRenderer
          :field="nestedField"
          :level="level + 1"
        />
      </div>
    </div>

    <!-- Entity Field -->
    <div v-else-if="field.type === 'entity'" class="entity-box">
      <div class="subject-title border-bottom">
        {{ field.context.subject }}
      </div>
      <div 
        v-for="(entityField, entityIndex) of field.context.values" 
        :key="entityIndex"
        class="field-group flex border-bottom"
      >
        <div class="field-row">
          <div class="field-title-box">
            {{ entityField.context.title }}
          </div>
          <div class="field-content-box">
            <p-text-input 
              v-if="entityField.context.model && entityField.context.model.value !== undefined" 
              v-model="entityField.context.model.value"
            />
            <p-text-input v-else />
          </div>
        </div>
      </div>
    </div>

    <!-- Migration List Field (특별 처리) -->
    <div v-else-if="field.type === 'array' && isMigrationListField(field)" class="field-group-vertical">
      <div class="field-title-box">
        {{ field.context.subject }}
      </div>
      <div class="field-content-box migration-list-box">
        <div 
          v-for="(migrationItem, migrationIndex) of field.context.values" 
          :key="migrationIndex"
          class="migration-array-item"
        >
          <RecursiveFieldRenderer
            v-for="(migrationField, migrationFieldIndex) of migrationItem.context.values?.filter(shouldRenderField)" 
            :key="migrationFieldIndex"
            :field="migrationField"
            :level="level + 1"
            :is-migration-list="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.border-bottom {
  border-bottom: 1px solid;
  @apply border-gray-200;
}

.subject-title {
  @apply pr-[16px] pl-[16px] mt-[16px] h-[44px] text-gray-500;
}

.array-item {
  margin-bottom: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
  background-color: #f9fafb;
  width: 100%;
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

.entity-box {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
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
