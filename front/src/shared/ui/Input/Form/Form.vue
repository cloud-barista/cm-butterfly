<script setup lang="ts">
import { FormContext, Context } from '@/features/sequential/designer/editor/model/contextTypes';
import KeyValue from '@/shared/ui/Input/KeyValue/KeyValue.vue';
import Object from '@/shared/ui/Input/Object/Object.vue';
import Array from '@/shared/ui/Input/Array/Array.vue';
import ObjectArray from '@/shared/ui/Input/ObjectArray/ObjectArray.vue';
import Complex from '@/shared/ui/Input/Complex/Complex.vue';

interface IProps {
  context: FormContext;
  readonly?: boolean;
}

const props = defineProps<IProps>();
const emit = defineEmits(['update:context']);

function updateField(fieldIndex: number, field: Context) {
  props.context.fields[fieldIndex] = field;
  emit('update:context', props.context);
}

function addField() {
  // 새로운 KeyValue 필드 추가
  const newField: Context = {
    type: 'keyValue',
    key: 'newField',
    value: {
      value: ref(''),
      errorMessage: ref(null),
      isValid: ref(true),
      validating: ref(false),
      touched: ref(false),
      onBlur: async () => {},
      exeValidation: async () => {},
      debouncedValidate: null,
    },
  };
  props.context.fields.push(newField);
  emit('update:context', props.context);
}

function removeField(fieldIndex: number) {
  props.context.fields.splice(fieldIndex, 1);
  emit('update:context', props.context);
}
</script>

<template>
  <div class="form-field">
    <div class="form-header">
      <h3 class="form-title">{{ context.subject }}</h3>
    </div>
    <div class="form-content">
      <div
        v-for="(field, fieldIndex) of context.fields"
        :key="fieldIndex"
        class="field-group-vertical border-bottom"
      >
        <!-- KeyValueContext인 경우 -->
        <KeyValue
          v-if="field.type === 'keyValue'"
          :context="field"
          :readonly="readonly"
          @update:context="updateField(fieldIndex, $event)"
        />
        
        <!-- ObjectContext인 경우 -->
        <Object
          v-else-if="field.type === 'object'"
          :context="field"
          :readonly="readonly"
          @update:context="updateField(fieldIndex, $event)"
        />
        
        <!-- ArrayContext인 경우 -->
        <Array
          v-else-if="field.type === 'array'"
          :context="field"
          :readonly="readonly"
          @update:context="updateField(fieldIndex, $event)"
        />
        
        <!-- ObjectArrayContext인 경우 -->
        <ObjectArray
          v-else-if="field.type === 'objectArray'"
          :context="field"
          :readonly="readonly"
          @update:context="updateField(fieldIndex, $event)"
        />
        
        <!-- ComplexContext인 경우 -->
        <Complex
          v-else-if="field.type === 'complex'"
          :context="field"
          :readonly="readonly"
          @update:context="updateField(fieldIndex, $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.form-field {
  .form-header {
    @apply mb-4;
    
    .form-title {
      @apply text-lg font-semibold text-gray-800;
    }
  }

  .form-content {
    .field-group-vertical {
      border-bottom: 1px solid;
      @apply border-gray-200;
    }
  }
}

.border-bottom {
  border-bottom: 1px solid;
  @apply border-gray-200;
}
</style>
