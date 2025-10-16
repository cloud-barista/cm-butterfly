<script setup lang="ts">
import { PTextInput } from '@cloudforet-test/mirinae';

interface Field {
  type: 'input' | 'array' | 'nestedObject';
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
  subject: string;
  fields: Field[];
}

const props = defineProps<IProps>();
</script>

<template>
  <div class="nested-object-box">
    <div class="subject-title border-bottom">
      {{ subject }}
    </div>
    <div 
      v-for="(field, fieldIndex) of fields.filter(f => f.context.title !== 'errors' && f.context.subject !== 'errors')" 
      :key="fieldIndex"
      class="field-group-vertical border-bottom"
    >
      <!-- InputContext인 경우 -->
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
      
      <!-- ArrayContext인 경우 -->
      <div v-else-if="field.type === 'array'" class="field-group-vertical">
        <div class="field-title-box">
          {{ field.context.subject }}
        </div>
        <div class="field-content-box">
          <div 
            v-for="(arrayItem, arrayIndex) of field.context.values" 
            :key="arrayIndex"
            class="array-item"
          >
            <div class="subject-title border-bottom">
              {{ arrayItem.context.subject }}
            </div>
            <div 
              v-for="(subField, subFieldIndex) of arrayItem.context.values?.filter(f => f.context.title !== 'errors' && f.context.subject !== 'errors')" 
              :key="subFieldIndex"
              class="field-group-vertical border-bottom"
            >
              <!-- InputContext인 경우 -->
              <div v-if="subField.type === 'input'" class="field-group flex">
                <div class="field-row">
                  <div class="field-title-box">
                    {{ subField.context.title }}
                  </div>
                  <div class="field-content-box">
                    <p-text-input 
                      v-if="subField.context.model && subField.context.model.value !== undefined" 
                      v-model="subField.context.model.value"
                    />
                    <p-text-input v-else />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- NestedObjectContext인 경우 -->
      <div v-else-if="field.type === 'nestedObject'" class="field-group-vertical">
        <div class="field-title-box">
          {{ field.context.subject }}
        </div>
        <div class="field-content-box">
          <div 
            v-for="(nestedField, nestedIndex) of field.context.values" 
            :key="nestedIndex"
            class="nested-object-box"
          >
            <div class="subject-title border-bottom">
              {{ nestedField.context.subject }}
            </div>
            <div 
              v-for="(subNestedField, subNestedIndex) of nestedField.context.values?.filter(f => f.context.title !== 'errors' && f.context.subject !== 'errors')" 
              :key="subNestedIndex"
              class="field-group-vertical border-bottom"
            >
              <!-- InputContext인 경우 -->
              <div v-if="subNestedField.type === 'input'" class="field-group flex">
                <div class="field-row">
                  <div class="field-title-box">
                    {{ subNestedField.context.title }}
                  </div>
                  <div class="field-content-box">
                    <p-text-input 
                      v-if="subNestedField.context.model && subNestedField.context.model.value !== undefined" 
                      v-model="subNestedField.context.model.value"
                    />
                    <p-text-input v-else />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
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

.array-item {
  margin-bottom: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
  background-color: #f9fafb;
  width: 100%;
}

.subject-title {
  @apply pr-[16px] pl-[16px] mt-[16px] h-[44px] text-gray-500;
}

.border-bottom {
  border-bottom: 1px solid;
  @apply border-gray-200;
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
</style>
