<template>
  <div class="form-field">
    <!-- Input 필드 -->
    <div v-if="type === 'input'" class="field-group flex border-bottom">
      <div class="field-title-box">
        {{ title }}{{ isRequired ? '*' : '' }}
      </div>
      <div class="field-content-box">
        <p-text-input
          :value="formattedValue"
          @input="handleInput"
          :size="'md'"
          block
        />
      </div>
    </div>
    
    <!-- Nested Object 필드 -->
    <div v-else-if="type === 'nestedObject'" class="nested-object-content">
      <div class="nested-object-header">
        <span class="nested-object-title">{{ title }}</span>
        <span v-if="isRequired" class="required-asterisk">*</span>
      </div>
      <div class="nested-object-body">
        <slot name="nested-content"></slot>
      </div>
    </div>
    
    <!-- Accordion 필드 -->
    <div v-else-if="type === 'accordion'" class="accordion-content">
      <div class="accordion-header">
        <span class="accordion-title">{{ title }}</span>
        <span v-if="isRequired" class="required-asterisk">*</span>
        <button 
          @click="$emit('add-item')"
          class="add-item-btn"
          type="button"
        >
          + Add Item
        </button>
      </div>
      <div v-if="items && items.length > 0" class="accordion-items">
        <slot name="accordion-items"></slot>
      </div>
      <div v-else class="no-items-message">
        <p class="text-gray-500 text-sm">No items available</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PTextInput } from '@cloudforet-test/mirinae';
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'FormField',
  components: {
    PTextInput
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: (value: string) => ['input', 'nestedObject', 'accordion'].includes(value)
    },
    title: {
      type: String,
      required: true
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    value: {
      type: [String, Number, Array, Object],
      default: ''
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  emits: ['input', 'add-item'],
  setup(props, { emit }) {
    const formattedValue = computed(() => {
      if (Array.isArray(props.value)) return `[${props.value.length} items]`;
      if (typeof props.value === 'object' && props.value !== null) return '[Object]';
      return props.value;
    });

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      emit('input', target.value);
    };

    return {
      formattedValue,
      handleInput
    };
  }
});
</script>

<style scoped lang="postcss">
.form-field {
  width: 100%;
}

.field-group {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  
  .field-title-box {
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

  .field-content-box {
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

.nested-object-content {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 16px;
  background-color: #f9fafb;
  
  .nested-object-header {
    background-color: #f3f4f6;
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    border-radius: 6px 6px 0 0;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .nested-object-title {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }
    
    .required-asterisk {
      color: #ef4444;
      font-weight: 600;
    }
  }
  
  .nested-object-body {
    padding: 16px;
  }
}

.accordion-content {
  width: 100%;
  
  .accordion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #f8f9fa;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    margin-bottom: 8px;
    
    .accordion-title {
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
  
  .accordion-items {
    margin-top: 8px;
  }
  
  .no-items-message {
    padding: 16px;
    text-align: center;
    color: #6b7280;
  }
}
</style>
