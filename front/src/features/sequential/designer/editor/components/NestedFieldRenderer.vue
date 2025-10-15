<template>
  <div class="nested-field-renderer">
    <div
      v-for="(nestedContext, nestedIndex) in contexts"
      :key="nestedIndex"
      class="nested-object-item"
    >
      <!-- Input 필드 -->
      <div v-if="nestedContext.type === 'input'" class="nested-field-group flex border-bottom">
        <div class="nested-field-title-box">
          {{ nestedContext.context.title }}{{ nestedContext.context.isRequired ? '*' : '' }}
        </div>
        <div class="nested-field-content-box">
          <p-text-input
            :value="formatValue(nestedContext.context.model.value)"
            @input="nestedContext.context.model.value = $event.target.value"
            :size="'md'"
            block
          />
        </div>
      </div>
      
      <!-- Nested Object 필드 -->
      <div v-else-if="nestedContext.type === 'nestedObject'" class="nested-object-property">
        <div class="nested-object-title">
          {{ nestedContext.context.title }}{{ nestedContext.context.isRequired ? '*' : '' }}
        </div>
        <div class="nested-object-fields">
          <NestedFieldRenderer
            :contexts="nestedContext.context.values"
            @update="handleNestedUpdate"
          />
        </div>
      </div>
      
      <!-- Accordion 필드 -->
      <div v-else-if="nestedContext.type === 'accordion'" class="nested-accordion-content">
        <div class="nested-accordion-header">
          <span class="nested-accordion-title">{{ nestedContext.context.title }}</span>
          <span v-if="nestedContext.context.isRequired" class="required-asterisk">*</span>
          <button 
            @click="$emit('add-array-item', nestedContext)"
            class="add-item-btn"
            type="button"
          >
            Add Item
          </button>
        </div>
        <div v-if="nestedContext.context.values && nestedContext.context.values.length > 0" class="nested-accordion-items">
          <div
            v-for="(item, itemIndex) in nestedContext.context.values"
            :key="itemIndex"
            class="nested-accordion-item"
          >
            <div class="nested-accordion-item-header">
              <span class="nested-accordion-item-title">Item {{ itemIndex + 1 }}</span>
              <button 
                @click="$emit('remove-array-item', nestedContext, itemIndex)"
                class="remove-item-btn"
                type="button"
              >
                Remove
              </button>
            </div>
            <div class="nested-accordion-item-content">
              <!-- Array item이 properties를 가진 경우 -->
              <div v-if="item._contexts && item._contexts.length > 0" class="array-item-with-properties">
                <div
                  v-for="(itemContext, contextIndex) in item._contexts"
                  :key="contextIndex"
                  class="array-item-property"
                >
                  <!-- Input 필드 -->
                  <div v-if="itemContext.type === 'input'" class="property-field">
                    <div class="property-label">
                      {{ itemContext.context.title }}{{ itemContext.context.isRequired ? '*' : '' }}
                    </div>
                    <div class="property-input">
                      <p-text-input
                        :value="formatValue(itemContext.context.model.value)"
                        @input="itemContext.context.model.value = $event.target.value"
                        :size="'md'"
                        block
                      />
                    </div>
                  </div>
                  <!-- Nested Object 필드 -->
                  <div v-else-if="itemContext.type === 'nestedObject'" class="nested-object-property">
                    <div class="nested-object-title">
                      {{ itemContext.context.title }}{{ itemContext.context.isRequired ? '*' : '' }}
                    </div>
                    <div class="nested-object-fields">
                      <NestedFieldRenderer
                        :contexts="itemContext.context.values"
                        @update="handleNestedUpdate"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <!-- Array item이 단순 객체인 경우 -->
              <div v-else-if="typeof item === 'object' && item !== null && !item._contexts" class="object-item">
                <div
                  v-for="(value, propKey) in item"
                  :key="propKey"
                  class="object-property"
                >
                  <div class="property-title">{{ propKey }}</div>
                  <div class="property-value">
                    <p-text-input
                      :value="formatValue(value)"
                      @input="$emit('update-array-item-property', nestedContext, itemIndex, String(propKey), $event.target.value)"
                      :size="'md'"
                      block
                    />
                  </div>
                </div>
              </div>
              <!-- Array item이 primitive 타입인 경우 -->
              <div v-else class="simple-item">
                <p-text-input
                  :value="formatValue(item)"
                  @input="$emit('update-array-item-value', nestedContext, itemIndex, $event.target.value)"
                  :size="'md'"
                  block
                />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-items">
          <p class="text-gray-500 text-sm">No items available</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PTextInput } from '@cloudforet-test/mirinae';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'NestedFieldRenderer',
  components: {
    PTextInput
  },
  props: {
    contexts: {
      type: Array,
      required: true
    }
  },
  emits: ['update', 'add-array-item', 'remove-array-item', 'update-array-item-property', 'update-array-item-value'],
  setup(props, { emit }) {
    const formatValue = (value: any) => {
      if (Array.isArray(value)) return `[${value.length} items]`;
      if (typeof value === 'object' && value !== null) return '[Object]';
      return value;
    };

    const handleNestedUpdate = (data: any) => {
      emit('update', data);
    };

    return {
      formatValue,
      handleNestedUpdate
    };
  }
});
</script>

<style scoped lang="postcss">
.nested-field-renderer {
  width: 100%;
}

.nested-field-group {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-left: 16px;
  
  .nested-field-title-box {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex: 1;
    min-width: 0;
    height: 44px;
    font-size: 14px;
    font-weight: 500;
    padding: 6px 16px 6px 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #6b7280;
  }

  .nested-field-content-box {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 300px;
    min-width: 300px;
    max-width: 300px;
    height: 44px;
    padding: 6px 16px 6px 16px;
    flex-shrink: 0;
  }
}

.nested-object-property {
  margin-bottom: 16px;
  
  .nested-object-title {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
  }
  
  .nested-object-fields {
    margin-left: 16px;
  }
}

.nested-accordion-content {
  width: 100%;
  
  .nested-accordion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #f8f9fa;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    margin-bottom: 8px;
    
    .nested-accordion-title {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }
    
    .required-asterisk {
      color: #ef4444;
      font-weight: 600;
    }
    
    .add-item-btn {
      background-color: #3b82f6;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      
      &:hover {
        background-color: #2563eb;
      }
    }
  }
  
  .nested-accordion-items {
    margin-top: 8px;
  }
  
  .nested-accordion-item {
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    margin-bottom: 8px;
    
    .nested-accordion-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      
      .nested-accordion-item-title {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }
      
      .remove-item-btn {
        background-color: #ef4444;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        
        &:hover {
          background-color: #dc2626;
        }
      }
    }
    
    .nested-accordion-item-content {
      padding: 16px;
    }
  }
  
  .no-items {
    padding: 16px;
    text-align: center;
    color: #6b7280;
  }
}

.array-item-with-properties {
  .array-item-property {
    margin-bottom: 16px;
    
    .property-field {
      display: flex;
      border-bottom: 1px solid #e5e7eb;
      
      .property-label {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex: 1;
        min-width: 0;
        height: 44px;
        font-size: 14px;
        font-weight: 500;
        padding: 6px 16px 6px 16px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #6b7280;
      }
      
      .property-input {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 300px;
        min-width: 300px;
        max-width: 300px;
        height: 44px;
        padding: 6px 16px 6px 16px;
        flex-shrink: 0;
      }
    }
  }
}

.object-item {
  .object-property {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    
    .property-title {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex: 1;
      min-width: 0;
      height: 44px;
      font-size: 14px;
      font-weight: 500;
      padding: 6px 16px 6px 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #6b7280;
    }
    
    .property-value {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: 300px;
      min-width: 300px;
      max-width: 300px;
      height: 44px;
      padding: 6px 16px 6px 16px;
      flex-shrink: 0;
    }
  }
}

.simple-item {
  width: 100%;
}
</style>
