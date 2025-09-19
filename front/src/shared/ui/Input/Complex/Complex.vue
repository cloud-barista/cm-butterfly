<script setup lang="ts">
import { ComplexContext, Context } from '@/features/sequential/designer/editor/model/contextTypes';
import KeyValue from '@/shared/ui/Input/KeyValue/KeyValue.vue';
import Object from '@/shared/ui/Input/Object/Object.vue';
import Array from '@/shared/ui/Input/Array/Array.vue';
import ObjectArray from '@/shared/ui/Input/ObjectArray/ObjectArray.vue';

interface IProps {
  context: ComplexContext;
  readonly?: boolean;
}

const props = defineProps<IProps>();
const emit = defineEmits(['update:context']);

function updateField(fieldIndex: number, field: Context) {
  props.context.fields[fieldIndex] = field;
  emit('update:context', props.context);
}

function removeField(fieldIndex: number) {
  props.context.fields.splice(fieldIndex, 1);
  emit('update:context', props.context);
}
</script>

<template>
  <div class="complex-field">
    <div class="complex-container">
      <div class="subject-title border-bottom">
        {{ context.subject }}
      </div>
      <div class="complex-content">
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
      
      <!-- ComplexContext인 경우 (재귀) -->
      <Complex
        v-else-if="field.type === 'complex'"
        :context="field"
        :readonly="readonly"
        @update:context="updateField(fieldIndex, $event)"
      />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.complex-field {
  .complex-container {
    @apply border border-gray-300 rounded-lg;
    margin: 8px 0;
    
    .subject-title {
      @apply pr-[16px] pl-[16px] mt-[16px] h-[44px] flex justify-between items-center text-gray-500 rounded-t-lg;
      background-color: #f9fafb;
    }

    .complex-content {
      .field-group-vertical {
        border-bottom: 1px solid;
        @apply border-gray-200;
        margin: 0 16px;
        
        &:last-child {
          border-bottom: none;
        }
      }
    }
  }
}

.border-bottom {
  border-bottom: 1px solid;
  @apply border-gray-200;
}
</style>
