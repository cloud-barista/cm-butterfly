<template>
  <div class="schema-component" :class="componentClass">
    <!-- 기본 타입들 (string, integer, boolean) -->
    <div v-if="isBasicType" class="basic-type-component">
      <div class="field-header">
        <label class="field-label" :class="{ required: component.isRequired }">
          {{ component.name }}
        </label>
        <span class="field-type">{{ component.type }}</span>
        <span v-if="component.description" class="field-description">{{ component.description }}</span>
      </div>
      <div class="field-input">
        <input
          v-if="component.type === 'string'"
          type="text"
          :value="component.value || ''"
          :placeholder="`Enter ${component.name}`"
          class="text-input"
        />
        <input
          v-else-if="component.type === 'integer'"
          type="number"
          :value="component.value || ''"
          :placeholder="`Enter ${component.name}`"
          class="number-input"
        />
        <input
          v-else-if="component.type === 'boolean'"
          type="checkbox"
          :checked="component.value || false"
          class="checkbox-input"
        />
      </div>
    </div>

    <!-- Object 타입들 (basicObject, nestedObject) -->
    <div v-else-if="isObjectType" class="object-type-component">
      <div class="object-header">
        <div class="object-title">
          <h4>{{ component.name }}</h4>
          <span class="object-type">{{ component.type }}</span>
          <span v-if="component.isRequired" class="required-badge">Required</span>
        </div>
        <p v-if="component.description" class="object-description">{{ component.description }}</p>
      </div>
      
      <div class="object-properties">
        <SchemaComponent
          v-for="(child, key) in component.children"
          :key="key"
          :component="child"
          :path="`${path}.${key}`"
          :depth="depth + 1"
        />
      </div>
    </div>

    <!-- Array 타입들 (basicArray, basicObjectArray, nestedObjectArray) -->
    <div v-else-if="isArrayType" class="array-type-component">
      <div class="array-header">
        <div class="array-title">
          <h4>{{ component.name }}</h4>
          <span class="array-type">{{ component.type }}</span>
          <span class="array-count">({{ arrayLength }} items)</span>
          <span v-if="component.isRequired" class="required-badge">Required</span>
        </div>
        <p v-if="component.description" class="array-description">{{ component.description }}</p>
      </div>
      
      <div class="array-items">
        <div
          v-for="(item, index) in component.children"
          :key="index"
          class="array-item"
        >
          <div class="array-item-header">
            <span class="item-index">Item {{ index + 1 }}</span>
            <span class="item-type">{{ item.type }}</span>
          </div>
          
          <div class="array-item-content">
            <SchemaComponent
              :component="item"
              :path="`${path}[${index}]`"
              :depth="depth + 1"
            />
          </div>
        </div>
        
        <!-- 빈 배열인 경우 -->
        <div v-if="arrayLength === 0" class="empty-array">
          <div class="empty-icon">📝</div>
          <div class="empty-message">Array is empty</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { SchemaComponent as SchemaComponentType } from '../../types/schemaComponent';

interface Props {
  component: SchemaComponentType;
  path: string;
  depth: number;
}

export default defineComponent({
  name: 'SchemaComponent',
  props: {
    component: {
      type: Object as () => SchemaComponentType,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    depth: {
      type: Number,
      required: true
    }
  },
  setup(props: Props) {
    // 기본 타입인지 확인
    const isBasicType = computed(() => {
      return ['string', 'integer', 'boolean'].includes(props.component.type);
    });

    // Object 타입인지 확인
    const isObjectType = computed(() => {
      return ['basicObject', 'nestedObject'].includes(props.component.type);
    });

    // Array 타입인지 확인
    const isArrayType = computed(() => {
      return ['basicArray', 'basicObjectArray', 'nestedObjectArray'].includes(props.component.type);
    });

    // Array 길이
    const arrayLength = computed(() => {
      return Array.isArray(props.component.children) ? props.component.children.length : 0;
    });

    // 컴포넌트 클래스
    const componentClass = computed(() => {
      const classes = [`depth-${props.depth}`];
      
      if (isBasicType.value) {
        classes.push('basic-type');
      } else if (isObjectType.value) {
        classes.push('object-type', props.component.type);
      } else if (isArrayType.value) {
        classes.push('array-type', props.component.type);
      }
      
      return classes;
    });

    return {
      isBasicType,
      isObjectType,
      isArrayType,
      arrayLength,
      componentClass
    };
  }
});
</script>

<style scoped>
.schema-component {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.schema-component:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Depth별 들여쓰기 */
.depth-0 { margin: 0; }
.depth-1 { margin-left: 16px; }
.depth-2 { margin-left: 32px; }
.depth-3 { margin-left: 48px; }
.depth-4 { margin-left: 64px; }

/* 기본 타입 스타일 */
.basic-type-component {
  padding: 12px 16px;
}

.field-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.field-label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.field-label.required::after {
  content: ' *';
  color: #ef4444;
}

.field-type {
  background-color: #d1fae5;
  color: #059669;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.field-description {
  color: #6b7280;
  font-size: 12px;
  font-style: italic;
}

.field-input input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.field-input input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Object 타입 스타일 */
.object-type-component {
  border-left: 4px solid #7c3aed;
}

.object-header {
  padding: 16px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.object-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.object-title h4 {
  margin: 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
}

.object-type {
  background-color: #ede9fe;
  color: #7c3aed;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.required-badge {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.object-description {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.object-properties {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Array 타입 스타일 */
.array-type-component {
  border-left: 4px solid #059669;
}

.array-header {
  padding: 16px;
  background-color: #f0fdf4;
  border-bottom: 1px solid #e2e8f0;
}

.array-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.array-title h4 {
  margin: 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
}

.array-type {
  background-color: #d1fae5;
  color: #059669;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.array-count {
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}

.array-description {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.array-items {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.array-item {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: #fafafa;
}

.array-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  font-size: 12px;
}

.item-index {
  font-weight: 600;
  color: #374151;
}

.item-type {
  background-color: #e0e7ff;
  color: #3730a3;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
}

.array-item-content {
  padding: 12px;
}

/* 빈 배열 스타일 */
.empty-array {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  color: #6b7280;
}

.empty-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.empty-message {
  font-size: 14px;
  font-weight: 500;
}

/* 타입별 색상 구분 */
.basicObject {
  border-left-color: #3b82f6;
}

.basicObject .object-header {
  background-color: #eff6ff;
}

.nestedObject {
  border-left-color: #7c3aed;
}

.nestedObject .object-header {
  background-color: #f8fafc;
}

.basicArray {
  border-left-color: #059669;
}

.basicArray .array-header {
  background-color: #f0fdf4;
}

.basicObjectArray {
  border-left-color: #0ea5e9;
}

.basicObjectArray .array-header {
  background-color: #f0f9ff;
}

.nestedObjectArray {
  border-left-color: #dc2626;
}

.nestedObjectArray .array-header {
  background-color: #fef2f2;
}
</style>
