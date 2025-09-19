<script lang="ts">
import { PTextInput } from '@cloudforet-test/mirinae';
import ObjectAccordion from '@/shared/ui/Input/Accordian/ObjectAccordion.vue';
import ObjectArrayAccordion from '@/shared/ui/Input/Accordian/ObjectArrayAccordion.vue';
import StringArrayAccordion from '@/shared/ui/Input/Accordian/StringArrayAccordion.vue';

export default {
  name: 'DepthField',
  components: {
    PTextInput,
    ObjectAccordion,
    ObjectArrayAccordion,
    StringArrayAccordion,
  },
  props: {
    field: {
      type: Object,
      required: true,
    },
    maxDepth: {
      type: Number,
      default: 5,
    },
    currentDepth: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    shouldUseAccordion() {
      return this.currentDepth >= 5;
    },
    isObjectArray() {
      return this.field.context?.values?.length > 0 && 
             this.field.context.values[0].content?.[0]?.context?.title !== 'value';
    },
    isStringArray() {
      return this.field.context?.values?.length > 0 && 
             this.field.context.values[0].content?.[0]?.context?.title === 'value';
    },
    // depth 5가 object이고 depth 6이 string인 경우 감지
    isObjectWithStringChildren() {
      return this.currentDepth === 5 && 
             this.field.type === 'nestedObject' &&
             this.field.context?.subject?.includes('[d-sub-5-') &&
             this.field.context?.values?.some(item => 
               item.type === 'input' && 
               item.context?.title?.includes('[d-tit-6-')
             );
    },
  },
};
</script>

<template>
  <div class="field-group-vertical">
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
            :size="'md'"
            block
            :invalid="!field.context.model.isValid"
            @blur="field.context.model.onBlur"
          ></p-text-input>
          <p-text-input v-else></p-text-input>
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
          <DepthField 
            :field="arrayItem" 
            :current-depth="currentDepth + 1"
            :max-depth="maxDepth"
          />
        </div>
      </div>
    </div>
    
    <!-- NestedObjectContext인 경우 -->
    <div v-else-if="field.type === 'nestedObject'" class="field-group-vertical">
      <div class="field-title-box">
        {{ field.context.subject }}
      </div>
      <div class="field-content-box">
        <!-- depth 5가 object이고 depth 6이 string인 경우 Accordion 사용 -->
        <div v-if="isObjectWithStringChildren" class="accordion-container">
          <ObjectAccordion
            :items="[{
              header: {
                icon: 'ic_chevron-down',
                title: field.context.subject
              },
              content: field.context.values
            }]"
            class="accordion-box"
          />
        </div>
        <!-- 일반적인 경우 DepthField 재귀 호출 -->
        <div v-else>
          <div 
            v-for="(nestedField, nestedIndex) of field.context.values" 
            :key="nestedIndex"
            class="field-group-vertical border-bottom"
          >
            <DepthField 
              :field="nestedField" 
              :current-depth="currentDepth + 1"
              :max-depth="maxDepth"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- AccordionContext인 경우 (depth 5 배열) -->
    <div v-else-if="field.type === 'accordion'" class="field-group-vertical">
      <div class="field-title-box">
        {{ field.context.subject }}
      </div>
      <div class="field-content-box">
        <!-- 배열의 첫 번째 요소가 객체인 경우 ObjectArrayAccordion 사용 -->
        <ObjectArrayAccordion
          v-if="isObjectArray"
          :items="field.context.values"
          class="accordion-box"
        />
        <!-- 배열의 첫 번째 요소가 문자열인 경우 StringArrayAccordion 사용 -->
        <StringArrayAccordion
          v-else-if="isStringArray"
          :items="field.context.values"
          class="accordion-box"
        />
        <!-- 기본적으로 ObjectAccordion 사용 -->
        <ObjectAccordion
          v-else
          :items="field.context.values"
          class="accordion-box"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.field-group-vertical {
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
}

.field-group {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.field-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.field-title-box {
  min-width: 120px;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  margin-right: 16px;
}

.field-content-box {
  flex: 1;
}

.array-item {
  margin-bottom: 8px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.border-bottom {
  border-bottom: 1px solid #e5e7eb;
}

.accordion-container {
  margin-top: 8px;
}

.accordion-box {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}
</style>
