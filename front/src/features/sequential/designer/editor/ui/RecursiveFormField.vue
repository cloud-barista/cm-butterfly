<template>
  <div class="form-field" :class="`depth-${depth}`">
    <!-- String, Number, Boolean - Simple Input -->
    <div v-if="isSimpleType" class="simple-field">
      <label 
        class="field-label" 
        :class="{ 'has-tooltip': fieldSchema.description }"
        :title="fieldSchema.description || ''"
      >
        {{ fieldName }}<span v-if="isRequired" class="required-mark">*</span>
      </label>
      <textarea
        v-if="fieldSchema.type === 'string' && shouldUseTextarea"
        :value="fieldValue || ''"
        @input="handleInput($event)"
        class="field-textarea"
        :placeholder="`Enter ${fieldName}`"
        rows="6"
      ></textarea>
      <input
        v-else-if="fieldSchema.type === 'string'"
        type="text"
        :value="fieldValue || ''"
        @input="handleInput($event)"
        class="field-input"
        :placeholder="`Enter ${fieldName}`"
      />
      <input
        v-else-if="fieldSchema.type === 'number' || fieldSchema.type === 'integer'"
        type="number"
        :value="fieldValue || 0"
        @input="handleInput($event)"
        class="field-input"
        :placeholder="`Enter ${fieldName}`"
      />
      <input
        v-else-if="fieldSchema.type === 'boolean'"
        type="checkbox"
        :checked="!!fieldValue"
        @change="handleInput($event)"
        class="field-checkbox"
      />
    </div>

    <!-- Array Type -->
    <div v-else-if="fieldSchema.type === 'array'" class="array-field">
      <div class="array-header">
        <div class="header-left">
          <button @click="toggleArrayCollapse" class="btn-collapse">
            {{ isArrayCollapsed ? '▶' : '▼' }}
          </button>
          <label 
            class="field-label" 
            :class="{ 'has-tooltip': fieldSchema.description }"
            :title="fieldSchema.description || ''"
          >
            {{ fieldName }}<span v-if="isRequired" class="required-mark">*</span>
            <span class="field-type">({{ arrayValue.length }} items)</span>
          </label>
        </div>
        <div class="header-actions">
          <button @click="addArrayItem" class="btn-add-item">+ Add entity</button>
        </div>
      </div>
      
      <div v-if="!isArrayCollapsed" class="array-items">
        <!-- String Array -->
        <div v-if="isStringArray" class="string-array">
          <div v-for="(item, index) in arrayValue" :key="index" class="array-item">
            <input
              type="text"
              :value="item"
              @input="updateArrayItem(index, $event)"
              class="field-input"
              :placeholder="`Item ${index + 1}`"
            />
            <button @click="removeArrayItem(index)" class="btn-remove-item">×</button>
          </div>
        </div>
        
        <!-- Object Array -->
        <div v-else-if="fieldSchema.items && fieldSchema.items.type === 'object'" class="object-array">
          <div v-for="(item, index) in arrayValue" :key="index" class="array-item-object">
            <div class="item-header" @click="toggleItemCollapse(index)" style="cursor: pointer;">
              <div class="item-header-left">
                <button @click.stop="toggleItemCollapse(index)" class="btn-item-collapse">
                  {{ isItemCollapsed(index) ? '▶' : '▼' }}
                </button>
                <span class="item-title">Item {{ index + 1 }}</span>
                <span v-if="isItemCollapsed(index)" class="item-prop-count">
                  ({{ Object.keys(fieldSchema.items.properties || {}).length }} properties)
                </span>
              </div>
              <button @click.stop="removeArrayItem(index)" class="btn-remove-item">× Remove</button>
            </div>
            <div v-if="!isItemCollapsed(index)" class="item-properties">
              <recursive-form-field
                v-for="propName in sortedArrayItemPropertyNames"
                :key="`${index}-${propName}`"
                :field-name="String(propName)"
                :field-schema="fieldSchema.items.properties[propName]"
                :field-value="item[propName]"
                :step-properties="stepProperties"
                :max-auto-expand-depth="maxAutoExpandDepth"
                :parent-required="fieldSchema.items?.required || []"
                :task-name="taskName"
                :current-path="`${currentPath}[]`"
                @update="updateObjectArrayItemProperty(index, String(propName), $event)"
                :depth="depth + 1"
              />
            </div>
            <div v-else class="item-collapsed-indicator">
              <span class="item-collapsed-text">
                {{ Object.keys(fieldSchema.items.properties || {}).length }} properties (collapsed)
              </span>
            </div>
          </div>
        </div>
        
        <div v-if="!arrayValue || arrayValue.length === 0" class="empty-array">
          No items. Click "Add Item" to add.
        </div>
      </div>
      
      <div v-else class="collapsed-indicator">
        <span class="collapsed-text">{{ arrayValue.length }} items (collapsed)</span>
      </div>
    </div>

    <!-- Object Type -->
    <div v-else-if="fieldSchema.type === 'object'" class="object-field">
      <div class="object-header">
        <div class="header-left">
          <button @click="toggleObjectCollapse" class="btn-collapse">
            {{ isObjectCollapsed ? '▶' : '▼' }}
          </button>
          <label 
            class="field-label" 
            :class="{ 'has-tooltip': fieldSchema.description }"
            :title="fieldSchema.description || ''"
          >
            {{ fieldName }}<span v-if="isRequired" class="required-mark">*</span>
            <span class="field-type">({{ Object.keys(fieldSchema.properties || {}).length }} properties)</span>
          </label>
        </div>
      </div>
      <div v-if="!isObjectCollapsed" class="object-properties" :class="{ 'depth-0-object': depth === 0 }">
        <recursive-form-field
          v-for="propName in sortedPropertyNames"
          :key="propName"
          :field-name="String(propName)"
          :field-schema="fieldSchema.properties[propName]"
          :field-value="objectValue[propName]"
          :step-properties="stepProperties"
          :max-auto-expand-depth="maxAutoExpandDepth"
          :parent-required="fieldSchema.required || []"
          :task-name="taskName"
          :current-path="computedChildPath(propName)"
          @update="updateObjectProperty(String(propName), $event)"
          :depth="depth + 1"
        />
      </div>
      <div v-else class="collapsed-indicator">
        <span class="collapsed-text">{{ Object.keys(fieldSchema.properties || {}).length }} properties (collapsed)</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { getPropertyOrder, sortPropertiesByOrder } from '../config/taskPropertyOrderConfig';

export default defineComponent({
  name: 'RecursiveFormField',
  props: {
    fieldName: {
      type: String,
      required: true
    },
    fieldSchema: {
      type: Object,
      required: true
    },
    fieldValue: {
      type: [String, Number, Boolean, Object, Array],
      default: null
    },
    stepProperties: {
      type: Object,
      default: () => ({})
    },
    depth: {
      type: Number,
      default: 0
    },
    maxAutoExpandDepth: {
      type: Number,
      default: 2  // 기본값: depth 2까지만 자동 펼침
    },
    parentRequired: {
      type: Array,
      default: () => []
    },
    taskName: {
      type: String,
      default: ''
    },
    currentPath: {
      type: String,
      default: ''
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    // Required 여부 확인
    const isRequired = computed(() => {
      return props.parentRequired.includes(props.fieldName);
    });
    // 🔥 깊이 기반 자동 접기 로직
    const shouldAutoCollapse = computed(() => {
      return props.depth >= props.maxAutoExpandDepth;
    });

    // textarea 사용 여부 판단
    const shouldUseTextarea = computed(() => {
      const taskComponent = props.stepProperties?.originalData?.task_component;
      // cicada_task_script 또는 cicada_task_run_script 둘 다 지원
      const isCicadaScriptTask = taskComponent === 'cicada_task_script' || 
                                 taskComponent === 'cicada_task_run_script';
      const result = isCicadaScriptTask && props.fieldName === 'content';
      
      // 디버깅 로그
      if (props.fieldName === 'content') {
        console.log('🔍 shouldUseTextarea check for content field:');
        console.log('   taskComponent:', taskComponent);
        console.log('   fieldName:', props.fieldName);
        console.log('   isCicadaScriptTask:', isCicadaScriptTask);
        console.log('   result:', result);
        console.log('   stepProperties:', props.stepProperties);
      }
      
      return result;
    });
    
    // Collapse states
    const isArrayCollapsed = ref(shouldAutoCollapse.value);
    const isObjectCollapsed = ref(shouldAutoCollapse.value);
    const itemCollapsedStates = ref<Record<number, boolean>>({}); // Array item별 접기/펼치기 상태
    
    const isSimpleType = computed(() => {
      return ['string', 'number', 'integer', 'boolean'].includes(props.fieldSchema.type);
    });

    const isStringArray = computed(() => {
      return props.fieldSchema.items?.type === 'string';
    });

    const arrayValue = computed(() => {
      if (!props.fieldValue) return [];
      if (Array.isArray(props.fieldValue)) return props.fieldValue;
      return [];
    });

    const objectValue = computed(() => {
      if (!props.fieldValue) return {};
      if (typeof props.fieldValue === 'object' && !Array.isArray(props.fieldValue)) {
        return props.fieldValue;
      }
      return {};
    });

    // Property 순서 정렬 - Object properties
    const sortedPropertyNames = computed(() => {
      if (!props.fieldSchema.properties) return [];
      const keys = Object.keys(props.fieldSchema.properties);
      
      if (!props.taskName || !props.currentPath) return keys;
      
      const order = getPropertyOrder(props.taskName, props.currentPath);
      return order ? sortPropertiesByOrder(keys, order) : keys;
    });

    // Property 순서 정렬 - Array item properties
    const sortedArrayItemPropertyNames = computed(() => {
      if (!props.fieldSchema.items?.properties) return [];
      const keys = Object.keys(props.fieldSchema.items.properties);
      
      if (!props.taskName || !props.currentPath) return keys;
      
      const arrayItemPath = `${props.currentPath}[]`;
      const order = getPropertyOrder(props.taskName, arrayItemPath);
      return order ? sortPropertiesByOrder(keys, order) : keys;
    });

    // 자식 경로 계산
    const computedChildPath = (propName: string): string => {
      if (!props.currentPath) return propName;
      return `${props.currentPath}.${propName}`;
    };

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      let value: any;
      
      if (props.fieldSchema.type === 'boolean') {
        value = target.checked;
      } else if (props.fieldSchema.type === 'number' || props.fieldSchema.type === 'integer') {
        value = parseFloat(target.value) || 0;
      } else {
        value = target.value;
      }
      
      emit('update', value);
    };

    /**
     * Find data in stepProperties by matching field structure
     * step.properties 구조에서 현재 필드 경로에 해당하는 실제 데이터를 찾습니다
     */
    const findDataInStepProperties = (fieldPath: string): any => {
      console.log('🔍 Finding data in stepProperties for path:', fieldPath);
      console.log('   stepProperties:', props.stepProperties);
      
      if (!props.stepProperties) return null;
      
      // step.properties.model 또는 step.properties.originalData.request_body에서 찾기
      const searchPaths = [
        props.stepProperties,
        (props.stepProperties as any)?.model,
        (props.stepProperties as any)?.originalData?.request_body,
        (props.stepProperties as any)?.targetSoftwareModel
      ];
      
      for (const searchRoot of searchPaths) {
        if (!searchRoot) continue;
        
        // 현재 fieldName으로 직접 찾기
        if (searchRoot[props.fieldName] !== undefined) {
          console.log('✅ Found data in stepProperties:', props.fieldName, '=', searchRoot[props.fieldName]);
          return searchRoot[props.fieldName];
        }
      }
      
      console.log('⚠️ No data found in stepProperties for:', props.fieldName);
      return null;
    };

    const addArrayItem = () => {
      const newArray = [...arrayValue.value];
      
      console.log('=== Add Array Item ===');
      console.log('Field name:', props.fieldName);
      console.log('Current array length:', newArray.length);
      
      if (isStringArray.value) {
        // String array - default value from schema or empty string
        const defaultValue = props.fieldSchema.items?.default || '';
        newArray.push(defaultValue);
      } else if (props.fieldSchema.items?.type === 'object') {
        // Object array - create object from schema with default values
        const newItem: any = {};
        
        // 1. stepProperties에서 실제 데이터 찾기
        const actualDataArray = findDataInStepProperties(props.fieldName);
        console.log('📊 Actual data from stepProperties:', actualDataArray);
        
        if (props.fieldSchema.items.properties) {
          Object.keys(props.fieldSchema.items.properties).forEach(key => {
            const propSchema = props.fieldSchema.items.properties[key];
            
            // Priority 1: 실제 stepProperties 데이터에서 첫 번째 item의 값 사용
            if (Array.isArray(actualDataArray) && actualDataArray.length > 0 && 
                actualDataArray[0][key] !== undefined) {
              if (propSchema.type === 'array') {
                newItem[key] = Array.isArray(actualDataArray[0][key]) ? 
                  JSON.parse(JSON.stringify(actualDataArray[0][key])) : [];
                console.log(`   📋 Property "${key}" from stepProperties (array):`, newItem[key]);
              } else if (propSchema.type === 'object') {
                newItem[key] = typeof actualDataArray[0][key] === 'object' ? 
                  JSON.parse(JSON.stringify(actualDataArray[0][key])) : {};
                console.log(`   📋 Property "${key}" from stepProperties (object):`, newItem[key]);
              } else {
                newItem[key] = actualDataArray[0][key];
                console.log(`   📋 Property "${key}" from stepProperties (value):`, newItem[key]);
              }
            }
            // Priority 2: Schema default value
            else if (propSchema.default !== undefined) {
              newItem[key] = propSchema.default;
              console.log(`   🔧 Property "${key}" from schema default:`, newItem[key]);
            }
            // Priority 3: 현재 배열의 첫 번째 item에서 복사
            else if (arrayValue.value.length > 0 && arrayValue.value[0][key] !== undefined) {
              if (propSchema.type === 'array') {
                newItem[key] = Array.isArray(arrayValue.value[0][key]) ? 
                  JSON.parse(JSON.stringify(arrayValue.value[0][key])) : [];
              } else if (propSchema.type === 'object') {
                newItem[key] = typeof arrayValue.value[0][key] === 'object' ? 
                  JSON.parse(JSON.stringify(arrayValue.value[0][key])) : {};
              } else {
                newItem[key] = arrayValue.value[0][key];
              }
              console.log(`   📝 Property "${key}" from current array[0]:`, newItem[key]);
            }
            // Priority 4: Type-based default
            else if (propSchema.type === 'array') {
              newItem[key] = [];
            } else if (propSchema.type === 'object') {
              newItem[key] = {};
            } else if (propSchema.type === 'number' || propSchema.type === 'integer') {
              newItem[key] = 0;
            } else if (propSchema.type === 'boolean') {
              newItem[key] = false;
            } else {
              newItem[key] = '';
            }
          });
        }
        newArray.push(newItem);
        
        console.log('✅ Added new array item:', newItem);
        console.log('   Based on schema properties:', Object.keys(props.fieldSchema.items.properties || {}));
      }
      
      emit('update', newArray);
    };

    const duplicateLastArrayItem = () => {
      const newArray = [...arrayValue.value];
      
      if (newArray.length > 0) {
        const lastItem = newArray[newArray.length - 1];
        
        // Deep clone the last item
        let duplicatedItem;
        if (typeof lastItem === 'object') {
          duplicatedItem = JSON.parse(JSON.stringify(lastItem));
        } else {
          duplicatedItem = lastItem;
        }
        
        newArray.push(duplicatedItem);
        
        console.log('✅ Duplicated last array item');
        console.log('   Original item:', lastItem);
        console.log('   Duplicated item:', duplicatedItem);
      }
      
      emit('update', newArray);
    };

    const removeArrayItem = (index: number) => {
      const newArray = [...arrayValue.value];
      newArray.splice(index, 1);
      emit('update', newArray);
    };

    const updateArrayItem = (index: number, event: Event) => {
      const target = event.target as HTMLInputElement;
      const newArray = [...arrayValue.value];
      newArray[index] = target.value;
      emit('update', newArray);
    };

    const updateObjectArrayItemProperty = (index: number, propName: string, value: any) => {
      const newArray = [...arrayValue.value];
      if (!newArray[index]) {
        newArray[index] = {};
      }
      newArray[index] = {
        ...newArray[index],
        [propName]: value
      };
      emit('update', newArray);
    };

    const updateObjectProperty = (propName: string, value: any) => {
      let baseObject = objectValue.value;
      
      // 🔍 CRITICAL FIX: Check if baseObject is a schema (not actual data)
      if (baseObject && 
          baseObject.type === 'object' && 
          baseObject.properties && 
          typeof baseObject.properties === 'object') {
        // This is a JSON schema, not actual data!
        // Start with empty object to avoid including schema properties in the result
        console.warn(`⚠️ updateObjectProperty: objectValue is schema for field "${props.fieldName}", starting with empty object`);
        console.warn('   Schema properties:', Object.keys(baseObject.properties));
        baseObject = {};
      }
      
      const newObject = {
        ...baseObject,
        [propName]: value
      };
      
      console.log(`🔄 updateObjectProperty: ${props.fieldName}.${propName}`);
      console.log('   Base object keys:', Object.keys(baseObject));
      console.log('   New value type:', typeof value);
      console.log('   Result object keys:', Object.keys(newObject));
      
      emit('update', newObject);
    };

    // Toggle functions
    const toggleArrayCollapse = () => {
      isArrayCollapsed.value = !isArrayCollapsed.value;
    };

    const toggleObjectCollapse = () => {
      isObjectCollapsed.value = !isObjectCollapsed.value;
    };

    const toggleItemCollapse = (index: number) => {
      const currentState = isItemCollapsed(index);
      console.log(`🔄 Toggle Item ${index}: ${currentState} → ${!currentState}`);
      
      // Vue 3 reactivity를 위해 새 객체 생성
      itemCollapsedStates.value = {
        ...itemCollapsedStates.value,
        [index]: !currentState
      };
      
      console.log(`   Updated state:`, itemCollapsedStates.value[index]);
    };

    const isItemCollapsed = (index: number): boolean => {
      // 초기 상태가 없으면 깊이에 따라 결정
      if (itemCollapsedStates.value[index] === undefined) {
        // depth가 maxAutoExpandDepth - 1 이상이면 item도 접기
        const initialState = props.depth >= props.maxAutoExpandDepth - 1;
        itemCollapsedStates.value = {
          ...itemCollapsedStates.value,
          [index]: initialState
        };
      }
      return itemCollapsedStates.value[index];
    };

    return {
      isSimpleType,
      isStringArray,
      arrayValue,
      objectValue,
      isArrayCollapsed,
      isObjectCollapsed,
      itemCollapsedStates,
      shouldAutoCollapse,
      shouldUseTextarea,
      isRequired,
      sortedPropertyNames,
      sortedArrayItemPropertyNames,
      computedChildPath,
      handleInput,
      addArrayItem,
      duplicateLastArrayItem,
      removeArrayItem,
      updateArrayItem,
      updateObjectArrayItemProperty,
      updateObjectProperty,
      toggleArrayCollapse,
      toggleObjectCollapse,
      toggleItemCollapse,
      isItemCollapsed
    };
  }
});
</script>

<style scoped lang="postcss">
.form-field {
  margin-bottom: 1rem;
  position: relative;
  padding-left: 1.5rem;
}

/* Depth indicators - absolute positioning */
.depth-0::before,
.depth-1::before,
.depth-2::before,
.depth-3::before,
.depth-4::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}

.depth-0 {
  padding-left: 0;
  background-color: #ffffff;
}

.depth-0::before {
  display: none;
}

.depth-1 {
  padding-left: 0.75rem;
  margin-left: 0;
}

.depth-1::before {
  background-color: #10b981;
  left: 0.25rem;
}

.depth-2 {
  padding-left: 0.75rem;
  margin-left: 0;
}

.depth-2::before {
  background-color: #f59e0b;
  left: 0.5rem;
}

.depth-3 {
  padding-left: 0.75rem;
  margin-left: 0;
}

.depth-3::before {
  background-color: #ef4444;
  left: 0.75rem;
}

.depth-4 {
  padding-left: 0.75rem;
  margin-left: 0;
}

.depth-4::before {
  background-color: #8b5cf6;
  left: 1rem;
}

.simple-field {
  display: grid;
  grid-template-columns: minmax(100px, 20%) 1fr;
  gap: 0.5rem;
  align-items: center;
}

.field-label {
  display: block;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
  text-align: right;
  padding-right: 0.5rem;
  word-break: break-word;
  overflow-wrap: break-word;
}

.field-label.has-tooltip {
  cursor: help;
}

.field-label.has-tooltip:hover {
  color: #1f2937;
  text-decoration: underline dotted;
}

.required-mark {
  color: #dc2626;
  margin-left: 0.125rem;
  font-weight: bold;
}

.field-type {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 400;
  margin-left: 0.25rem;
}

.field-description {
  display: block;
  font-size: 0.75rem;
  color: #4b5563;
  font-weight: 400;
  margin-top: 0.25rem;
}

.field-input {
  width: 100%;
  max-width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  box-sizing: border-box;
}

.field-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-textarea {
  width: 100%;
  max-width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  box-sizing: border-box;
  font-family: monospace;
  resize: vertical;
  min-height: 120px;
}

.field-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-checkbox {
  height: 1rem;
  width: 1rem;
}

/* Array Field Styles */
.array-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-right: 0;
}

.array-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-right: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
}

.btn-collapse {
  padding: 0.25rem 0.5rem;
  background-color: #e5e7eb;
  color: #374151;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  min-width: 2rem;
  transition: background-color 0.2s;
}

.btn-collapse:hover {
  background-color: #d1d5db;
}

.btn-add-item {
  padding: 0.25rem 0.75rem;
  background-color: #3b82f6;
  color: #ffffff;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn-add-item:hover {
  background-color: #2563eb;
}

.btn-duplicate-item {
  padding: 0.25rem 0.75rem;
  background-color: #10b981;
  color: #ffffff;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn-duplicate-item:hover {
  background-color: #059669;
}

.array-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.string-array {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.array-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-remove-item {
  padding: 0.25rem 0.5rem;
  background-color: #ef4444;
  color: #ffffff;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}

.btn-remove-item:hover {
  background-color: #dc2626;
}

.object-array {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.array-item-object {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
  background-color: #f9fafb;
  margin-right: 0;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #d1d5db;
  transition: background-color 0.2s;
  padding: 0.5rem;
  margin: -0.5rem;
  margin-bottom: 0.75rem;
  border-radius: 0.375rem;
}

.item-header:hover {
  background-color: #e5e7eb;
}

.item-header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-item-collapse {
  padding: 0.25rem 0.5rem;
  background-color: #e5e7eb;
  color: #374151;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  min-width: 2rem;
  transition: background-color 0.2s;
}

.btn-item-collapse:hover {
  background-color: #d1d5db;
}

.item-title {
  font-weight: 600;
  color: #374151;
}

.item-prop-count {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: normal;
}

.item-collapsed-indicator {
  padding: 0.5rem;
  background-color: #f9fafb;
  border-radius: 0.25rem;
  text-align: center;
}

.item-collapsed-text {
  color: #6b7280;
  font-size: 0.875rem;
  font-style: italic;
}

.item-properties {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-left: 0;
  margin-right: 0;
}

.empty-array {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
  padding: 0.75rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
}

.collapsed-indicator {
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  text-align: center;
}

.collapsed-text {
  color: #6b7280;
  font-size: 0.875rem;
  font-style: italic;
}

/* Object Field Styles */
.object-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-right: 0;
}

.object-header {
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 0;
}

.object-properties {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-left: 0;
  border-left: none;
  margin-right: 0;
}

.depth-0-object {
  padding-left: 0;
  margin-left: 0;
}

/* Responsive adjustments for deep nesting */
.depth-3 .field-label,
.depth-4 .field-label {
  font-size: 0.813rem;
}

.depth-3 .field-input,
.depth-4 .field-input {
  font-size: 0.813rem;
  padding: 0.375rem 0.5rem;
}
</style>

