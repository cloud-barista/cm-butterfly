<script lang="ts">
import { PButton, PIconButton, PTextInput, PCheckbox } from '@cloudforet-test/mirinae';
import { onBeforeMount, onBeforeUnmount, ref, watch, defineComponent } from 'vue';
import { useCommonTaskEditorModel, type JsonSchema, type FixedModel } from '@/features/sequential/designer/editor/model/commonTaskEditorModel';
import CommonAccordion from './CommonAccordion.vue';
import SequentialShortCut from '@/features/sequential/designer/shortcut/ui/SequentialShortCut.vue';
import { Step } from '@/features/workflow/workflowEditor/model/types';
import { useWorkflowStore } from '@/entities/workflow/model/stores';

export default defineComponent({
  name: 'CommonTaskEditor',
  components: {
    PButton,
    PIconButton,
    PTextInput,
    PCheckbox,
    CommonAccordion,
    SequentialShortCut
  },
  props: {
    step: {
      type: Object as () => Step,
      required: true
    }
  },
  emits: ['saveComponentName', 'saveContext', 'saveFixedModel'],
  setup(props, { emit }) {
    const taskEditorModel = useCommonTaskEditorModel();
    const shortCutModel = ref({
      open: false,
      xPos: 0,
      yPos: 0,
      delete: {
        label: 'Delete',
        callback: () => {}
      }
    });
    const editorFormElement = ref<HTMLElement>();
    const isInitialized = ref(false);

    // Component Name 관련 메서드들
    const getComponentNameTitle = () => {
      return (taskEditorModel.componentNameModel as any)?.context?.title || '';
    };

    const getComponentNameValue = () => {
      return (taskEditorModel.componentNameModel as any)?.context?.model?.value || '';
    };

    const setComponentNameValue = (value: string) => {
      if ((taskEditorModel.componentNameModel as any)?.context?.model) {
        (taskEditorModel.componentNameModel as any).context.model.value = value;
      }
    };

    const getComponentNameIsValid = () => {
      return (taskEditorModel.componentNameModel as any)?.context?.model?.isValid ?? true;
    };

    const getComponentNameOnBlur = () => {
      return (taskEditorModel.componentNameModel as any)?.context?.model?.onBlur;
    };

    // Path Params 관련 메서드들
    const getPathParamsContext = () => {
      return (taskEditorModel.paramsContext as any)?.pathParams || null;
    };

    // Query Params 관련 메서드들
    const getQueryParamsContext = () => {
      return (taskEditorModel.paramsContext as any)?.queryParams || null;
    };

    // Shortcut 관련 함수들
    const openShortCut = (e: MouseEvent) => {
      shortCutModel.value.xPos = e.clientX;
      shortCutModel.value.yPos = e.clientY;
      shortCutModel.value.open = true;
    };

    const deleteEntity = (e: MouseEvent, index: number) => {
      e.preventDefault();
      shortCutModel.value.delete.callback = () => {
        // 첫 번째 엔티티의 values 배열에서 삭제
        const firstEntity = taskEditorModel.formContext.value[0];
        if (firstEntity && 'context' in firstEntity && 'values' in firstEntity.context) {
          taskEditorModel.deleteEntity((firstEntity.context as any).values, index);
        }
      };
      openShortCut(e);
    }

    const deleteArrayElement = (
      e: MouseEvent,
      targetArr: Array<any>,
      targetIndex: number,
    ) => {
      e.preventDefault();
      shortCutModel.value.delete.callback = () => {
        // 배열에서 해당 인덱스의 요소 삭제
        const arrayIndex = taskEditorModel.formContext.value.findIndex(item => 
          item.type === 'accordion' && item.context.values === targetArr
        );
        if (arrayIndex !== -1) {
          // taskEditorModel에 deleteArrayElement 함수가 없을 수 있으므로 직접 처리
          const accordionItem = taskEditorModel.formContext.value[arrayIndex];
          if (accordionItem.type === 'accordion' && 'values' in accordionItem.context) {
            (accordionItem.context as any).values.splice(targetIndex, 1);
          }
        }
      };
      openShortCut(e);
    };

    function handleClickOutside(event: MouseEvent) {
      const sequentialShortCutElement = document.querySelector(
        '.sequential-shortcut',
      );
      if (
        sequentialShortCutElement &&
        !sequentialShortCutElement.contains(event.target as Node)
      ) {
        closeShortCut();
      }
    }

    // 중첩 배열 요소 추가
    const addNestedArrayElement = (nestedField: any) => {
      console.log('=== addNestedArrayElement START ===');
      console.log('addNestedArrayElement called with:', nestedField);
      console.log('Field type:', nestedField.type);
      console.log('Field subject:', nestedField.context?.subject);
      console.log('Field context values length:', nestedField.context?.values?.length);
      console.log('Field context:', nestedField.context);
      console.log('Field schema:', nestedField.schema);
      
      if (nestedField.context.values && nestedField.schema?.items) {
        console.log('Creating new element...');
        // 스키마 기반의 새로운 요소를 생성
        const newElement = taskEditorModel.createAccordionSlot({}, nestedField.context.values.length, nestedField.schema.items);
        console.log('Created new element:', newElement);
        
        nestedField.context.values.push(newElement);
        
        // 새로 추가된 항목의 인덱스를 저장하여 자동으로 열리도록 함
        const newIndex = nestedField.context.values.length - 1;
        nestedField.context.lastAddedIndex = newIndex;
        
        console.log('Added new element with schema-based content, values length:', nestedField.context.values.length, 'newIndex:', newIndex);
        console.log('New element content:', newElement);
        
        // 모든 중첩 배열 필드에 대한 디버깅
        console.log('=== Nested Array Field Debug ===');
        console.log('Field subject:', nestedField.context?.subject);
        console.log('Field type:', nestedField.type);
        console.log('Field values after add:', nestedField.context.values);
        
        // 모든 중첩 배열 필드에 대한 즉시 DOM 분석
        console.log('=== Immediate DOM Analysis for', nestedField.context?.subject, '===');
        const allNestedElements = document.querySelectorAll('.nested-accordion-field');
        console.log('All nested-accordion-field elements:', allNestedElements.length);
        
        allNestedElements.forEach((element, index) => {
          const rect = element.getBoundingClientRect();
          console.log(`Element ${index}:`, {
            width: rect.width,
            height: rect.height,
            className: element.className,
            textContent: element.textContent?.substring(0, 50) + '...'
          });
        });
        
        // 중첩 배열 필드 디버깅 (범용)
        if (nestedField.context?.subject) {
          console.log(`=== ${nestedField.context.subject} Add Item Debug ===`);
          console.log(`${nestedField.context.subject} field:`, nestedField);
          console.log(`${nestedField.context.subject} context:`, nestedField.context);
          console.log(`${nestedField.context.subject} schema:`, nestedField.schema);
          console.log(`${nestedField.context.subject} values after add:`, nestedField.context.values);
          
          // 즉시 DOM 분석 실행
          console.log(`=== Immediate ${nestedField.context.subject} DOM Analysis ===`);
          const allNestedElements = document.querySelectorAll('.nested-accordion-field');
          console.log('All nested-accordion-field elements (immediate):', allNestedElements.length);
          
          allNestedElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            console.log(`Immediate Element ${index}:`, {
              width: rect.width,
              height: rect.height,
              className: element.className,
              textContent: element.textContent?.substring(0, 50) + '...'
            });
          });
        }
        
        // 중첩 배열 필드 DOM 분석 (범용)
        if (nestedField.context?.subject) {
          setTimeout(() => {
            console.log(`=== ${nestedField.context.subject} DOM Analysis ===`);
            
            // 모든 가능한 중첩 레벨의 요소들을 찾기
            const allNestedElements = document.querySelectorAll('.nested-accordion-field');
            console.log('All nested-accordion-field elements:', allNestedElements.length);
            
            allNestedElements.forEach((element, index) => {
              const rect = element.getBoundingClientRect();
              console.log(`Element ${index}:`, {
                width: rect.width,
                height: rect.height,
                className: element.className,
                textContent: element.textContent?.substring(0, 50) + '...'
              });
            });
            
            // level-2 또는 level-3 클래스를 사용할 수 있음
            const targetElements = document.querySelectorAll('.nested-accordion-field.level-2, .nested-accordion-field.level-3');
            console.log(`Found ${nestedField.context.subject} elements (level-2/3):`, targetElements.length);
            
            // 모든 level 클래스 확인
            const level2Elements = document.querySelectorAll('.nested-accordion-field.level-2');
            const level3Elements = document.querySelectorAll('.nested-accordion-field.level-3');
            console.log('Level-2 elements:', level2Elements.length);
            console.log('Level-3 elements:', level3Elements.length);
            
            targetElements.forEach((element, index) => {
              const rect = element.getBoundingClientRect();
              console.log(`${nestedField.context.subject} element ${index}:`, {
                width: rect.width,
                height: rect.height,
                className: element.className
              });
              
              // 내부 field-group 요소들도 확인
              const fieldGroups = element.querySelectorAll('.field-group');
              console.log(`${nestedField.context.subject} element ${index} field-groups:`, fieldGroups.length);
              fieldGroups.forEach((fg, fgIndex) => {
                const fgRect = fg.getBoundingClientRect();
                console.log(`  field-group ${fgIndex}:`, {
                  width: fgRect.width,
                  height: fgRect.height,
                  className: fg.className
                });
                
                // field-title-box와 field-content-box 폭 확인
                const titleBox = fg.querySelector('.field-title-box');
                const contentBox = fg.querySelector('.field-content-box');
                if (titleBox) {
                  const titleRect = titleBox.getBoundingClientRect();
                  console.log(`    field-title-box:`, {
                    width: titleRect.width,
                    height: titleRect.height
                  });
                }
                if (contentBox) {
                  const contentRect = contentBox.getBoundingClientRect();
                  console.log(`    field-content-box:`, {
                    width: contentRect.width,
                    height: contentRect.height
                  });
                }
              });
            });
          }, 100);
        }
        
        // routingTable DOM 요소의 실제 폭 측정
        if (nestedField.context?.subject === 'routingTable') {
          setTimeout(() => {
            const routingTableElements = document.querySelectorAll('.nested-accordion-field.level-2');
            console.log('Found routingTable elements:', routingTableElements.length);
            routingTableElements.forEach((element, index) => {
              const rect = element.getBoundingClientRect();
              console.log(`routingTable element ${index}:`, {
                width: rect.width,
                height: rect.height,
                className: element.className
              });
              
              // 내부 field-group 요소들도 확인
              const fieldGroups = element.querySelectorAll('.field-group');
              console.log(`routingTable element ${index} field-groups:`, fieldGroups.length);
              fieldGroups.forEach((fg, fgIndex) => {
                const fgRect = fg.getBoundingClientRect();
                console.log(`  field-group ${fgIndex}:`, {
                  width: fgRect.width,
                  height: fgRect.height,
                  className: fg.className
                });
                
                // field-title-box와 field-content-box 폭 확인
                const titleBox = fg.querySelector('.field-title-box');
                const contentBox = fg.querySelector('.field-content-box');
                if (titleBox) {
                  const titleRect = titleBox.getBoundingClientRect();
                  console.log(`    field-title-box:`, {
                    width: titleRect.width,
                    height: titleRect.height
                  });
                }
                if (contentBox) {
                  const contentRect = contentBox.getBoundingClientRect();
                  console.log(`    field-content-box:`, {
                    width: contentRect.width,
                    height: contentRect.height
                  });
                }
              });
            });
          }, 100);
        }
        
        console.log('=== addNestedArrayElement SUCCESS ===');
      } else {
        console.log('=== addNestedArrayElement FAILED ===');
        console.log('No values array or schema found in nestedField');
        console.log('context.values exists:', !!nestedField.context.values);
        console.log('schema.items exists:', !!nestedField.schema?.items);
      }
    };

    // 중첩 배열 요소 삭제
    const deleteNestedArrayElement = (nestedField: any, index: number) => {
      if (nestedField.context.values && nestedField.context.values.length > index) {
        nestedField.context.values.splice(index, 1);
        // 인덱스 재정렬
        nestedField.context.values.forEach((item: any, idx: number) => {
          if (item.header) {
            item.header.title = idx.toString();
          }
        });
      }
    };

    // 필수 필드 스타일 클래스 생성
    function getRequiredClass(isRequired: boolean): string {
      return isRequired ? 'required-field' : '';
    }

    // 필드 설명 표시 (이제 hover tooltip으로 변경)
    function getFieldDescription(description?: string, example?: string): string {
      let desc = description || '';
      if (example) {
        desc += desc ? ` (예: ${example})` : `예: ${example}`;
      }
      return desc;
    }

    // 초기화 로직
    onBeforeMount(async () => {
      console.log('=== CommonTaskEditor Task Loaded ===');
      console.log('Task Name:', props.step.name);
      console.log('Task Type:', props.step.type);
      console.log('Component Type:', props.step.componentType);
      
      // Model 정보 로깅
      const modelInfo = {
        schema: props.step.properties.model || {},
        existingData: props.step.properties.existingData || {},
        originalData: props.step.properties.originalData || {},
        fixedModel: props.step.properties.fixedModel || {},
        fullStep: props.step
      };
      console.log('Model Information:', modelInfo);
      console.log('===============================');

      // Schema 체크
      const hasSchema = !!props.step.properties.model;
      const hasProperties = hasSchema && !!(props.step.properties.model as any).properties;
      const schemaKeys = hasSchema ? Object.keys(props.step.properties.model as any) : [];
      const propertiesKeys = hasProperties ? Object.keys((props.step.properties.model as any).properties) : [];
      
      console.log('Schema check:', {
        schema: props.step.properties.model,
        hasSchema,
        hasProperties,
        schemaKeys,
        propertiesKeys
      });

      if (hasProperties) {
        console.log('Schema properties details:', (props.step.properties.model as any).properties);
        console.log('Schema required fields:', (props.step.properties.model as any).required);
      }

      // 1단계: Task Component Model 설정 (기본 스키마)
      if (props.step.properties.model && Object.keys(props.step.properties.model as any).length > 0) {
        console.log('✅ Using step.properties.model as base schema');
        taskEditorModel.setTaskComponentModel(props.step.properties.model as JsonSchema);
      } else {
        // workflowStore에서 task component 찾기
        const taskComponent = useWorkflowStore().taskComponents.find(
          (tc: any) => tc.name === props.step.name
        );
        
        if (taskComponent && taskComponent.data.body_params && Object.keys(taskComponent.data.body_params).length > 0) {
          console.log('✅ Using taskComponent.body_params as base schema');
          taskEditorModel.setTaskComponentModel(taskComponent.data.body_params as JsonSchema);
        } else {
          console.log('⚠️ No task component model found, using empty schema');
          if (taskComponent && (!taskComponent.data.body_params || Object.keys(taskComponent.data.body_params).length === 0)) {
            console.log('📝 GET Method - body_params is empty');
          }
          taskEditorModel.setTaskComponentModel({} as JsonSchema);
        }
      }

      // 2단계: 실제 Task Data와 매칭
      const taskData = props.step.properties.originalData?.request_body || 
                      props.step.properties.existingData || 
                      {};
      
      console.log('=== Matching Task Data with Model ===');
      console.log('Task Component Model:', taskEditorModel.taskComponentModel);
      console.log('Task Data:', taskData);
      
      taskEditorModel.matchTaskDataWithModel(taskData);
      
      console.log('Matched Form Context:', taskEditorModel.formContext.value);
      console.log('Form Context Length:', taskEditorModel.formContext.value.length);
      console.log('Form Context Types:', taskEditorModel.formContext.value.map(item => item.type));
      console.log('Accordion Items:', taskEditorModel.formContext.value.filter(item => item.type === 'accordion').map(item => item.context.subject));
      console.log('=====================================');

      if (Object.keys(taskData).length > 0) {
        console.log('✅ Task data matched with existing data');
      } else {
        console.log('⚠️ No existing task data found');
      }

      isInitialized.value = true;
    });

    // FormContext 변화 감지
    watch(
      () => taskEditorModel.formContext,
      (newFormContext) => {
        console.log('FormContext changed:', newFormContext.value);
      },
      { deep: true }
    );

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      step: props.step,
      taskEditorModel,
      shortCutModel,
      editorFormElement,
      isInitialized,
      getComponentNameTitle,
      getComponentNameValue,
      setComponentNameValue,
      getComponentNameIsValid,
      getComponentNameOnBlur,
      getPathParamsContext,
      getQueryParamsContext,
      getRequiredClass,
      getFieldDescription,
      handleClickOutside,
      deleteEntity: taskEditorModel.deleteEntity,
      addEntity: taskEditorModel.addEntity,
      deleteArrayElement,
      addArrayElement: taskEditorModel.addArrayElement,
      addNestedArrayElement,
      deleteNestedArrayElement,
      closeShortCut: () => {
        shortCutModel.value.open = false;
      }
    };
  }
});
</script>

<template>
  <div
    ref="editorFormElement"
    class="task-editor-form"
    @click.right="
      e => {
        e.preventDefault();
      }
    "
  >

    <!-- Query Params -->
    <div v-if="isInitialized" class="query-params-box w-full">
      <div class="subject-title border-bottom">Query Params</div>
      <div v-if="getQueryParamsContext() && getQueryParamsContext().values && getQueryParamsContext().values.length > 0">
        <div
          v-for="(param, index) in getQueryParamsContext().values"
          :key="index"
          class="field-group flex border-bottom"
        >
          <div class="field-title-box" :class="getRequiredClass(param.context.isRequired)">
            {{ param.context.title }}
            <span v-if="param.context.isRequired" class="required-asterisk">*</span>
          </div>
          <div class="field-content-box">
            <p-text-input
              :value="param.context.model.value"
              @input="param.context.model.value = $event"
              :size="'md'"
              block
              :invalid="!param.context.model.isValid"
              @blur="param.context.model.onBlur"
            />
          </div>
        </div>
      </div>
      <div v-else class="no-required-message">
        <p class="text-gray-500 text-sm">no required</p>
      </div>
    </div>

    <!-- Path Params -->
    <div v-if="isInitialized" class="path-params-box w-full">
      <div class="subject-title border-bottom">Path Params</div>
      <div v-if="getPathParamsContext() && getPathParamsContext().values && getPathParamsContext().values.length > 0">
        <div
          v-for="(param, index) in getPathParamsContext().values"
          :key="index"
          class="field-group flex border-bottom"
        >
          <div class="field-title-box" :class="getRequiredClass(param.context.isRequired)">
            {{ param.context.title }}
            <span v-if="param.context.isRequired" class="required-asterisk">*</span>
          </div>
          <div class="field-content-box">
            <p-text-input
              :value="param.context.model.value"
              @input="param.context.model.value = $event"
              :size="'md'"
              block
              :invalid="!param.context.model.isValid"
              @blur="param.context.model.onBlur"
            />
          </div>
        </div>
      </div>
      <div v-else class="no-required-message">
        <p class="text-gray-500 text-sm">no required</p>
      </div>
    </div>


    <!-- Body Params Fields -->
    <div v-if="isInitialized && taskEditorModel.formContext.value.length > 0" class="form-context-box w-full">
      <div class="subject-title border-bottom">Body Params</div>
      
      <div
        v-for="(currentContext, index) in taskEditorModel.formContext.value"
        :key="index"
        class="context-item"
      >
        <!-- Input Field -->
        <div
          v-if="currentContext.type === 'input'"
          class="field-group flex border-bottom w-full"
        >
          <div class="field-title-box" :class="getRequiredClass(currentContext.context.isRequired)">
            <span 
              class="field-title"
              :title="getFieldDescription(currentContext.context.description, currentContext.context.example)"
            >
              {{ currentContext.context.title }}
            </span>
            <span v-if="currentContext.context.isRequired" class="required-asterisk">*</span>
            <span v-if="currentContext.context.isJsonField" class="json-field-indicator">(JSON)</span>
            <span v-if="currentContext.context.skipReason" class="skip-reason-inline">{{ currentContext.context.skipReason }}</span>
          </div>
          <div class="field-content-box">
            <p-text-input
              :value="currentContext.context.model.value"
              @input="currentContext.context.model.value = $event"
              :size="'md'"
              block
              :invalid="!currentContext.context.model.isValid"
              :placeholder="currentContext.context.placeholder || ''"
              @blur="currentContext.context.model.onBlur"
            />
            <div v-if="currentContext.context.isJsonField" class="json-field-help">
              <small>Enter a valid JSON object. Example: {"key": "value", "nested": {"prop": "val"}}</small>
            </div>
            <div v-if="currentContext.context.skipReason" class="skip-reason">
              <small><strong>Note:</strong> {{ currentContext.context.skipReason }}</small>
            </div>
          </div>
        </div>

        <!-- Select Field -->
        <div
          v-else-if="currentContext.type === 'select'"
          class="field-group flex border-bottom w-full"
        >
          <div class="field-title-box" :class="getRequiredClass(currentContext.context.isRequired)">
            <span 
              class="field-title"
              :title="getFieldDescription(currentContext.context.description)"
            >
              {{ currentContext.context.title }}
            </span>
            <span v-if="currentContext.context.isRequired" class="required-asterisk">*</span>
            <span v-if="currentContext.context.skipReason" class="skip-reason-inline">{{ currentContext.context.skipReason }}</span>
          </div>
          <div class="field-content-box">
            <!-- Debug info for select field -->
            <div v-if="false" class="debug-select-info">
              <small>Select Debug: {{ JSON.stringify({ 
                value: currentContext.context.model.value, 
                options: currentContext.context.options,
                optionsLength: currentContext.context.options?.length 
              }) }}</small>
            </div>
            <select
              :value="currentContext.context.model.value"
              @change="currentContext.context.model.value = $event.target.value"
              @blur="currentContext.context.model.onBlur"
              class="p-text-input"
              :class="{ 'invalid': !currentContext.context.model.isValid }"
              style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;"
            >
              <option 
                v-for="option in currentContext.context.options" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <div v-if="currentContext.context.skipReason" class="skip-reason">
              <small><strong>Note:</strong> {{ currentContext.context.skipReason }}</small>
            </div>
          </div>
        </div>

        <!-- Checkbox Field -->
        <div
          v-else-if="currentContext.type === 'checkbox'"
          class="field-group flex border-bottom w-full"
        >
          <div class="field-title-box" :class="getRequiredClass(currentContext.context.isRequired)">
            <span 
              class="field-title"
              :title="getFieldDescription(currentContext.context.description)"
            >
              {{ currentContext.context.title }}
            </span>
            <span v-if="currentContext.context.isRequired" class="required-asterisk">*</span>
            <span v-if="currentContext.context.skipReason" class="skip-reason-inline">{{ currentContext.context.skipReason }}</span>
          </div>
          <div class="field-content-box">
            <p-checkbox
              :value="currentContext.context.model.value"
              @input="currentContext.context.model.value = $event"
              @blur="currentContext.context.model.onBlur"
            />
            <div v-if="currentContext.context.skipReason" class="skip-reason">
              <small><strong>Note:</strong> {{ currentContext.context.skipReason }}</small>
            </div>
          </div>
        </div>

        <!-- Nested Object Field -->
        <div
          v-else-if="currentContext.type === 'nestedObject'"
          class="nested-object-part w-full h-full"
        >
          <div class="subject-title border-bottom">
            <span 
              class="field-title"
              :title="getFieldDescription(currentContext.context.description)"
            >
              {{ currentContext.context.subject }}
            </span>
            <span v-if="currentContext.context.isRequired" class="required-asterisk">*</span>
            <span v-if="currentContext.context.skipReason" class="skip-reason-inline">{{ currentContext.context.skipReason }}</span>
          </div>
          <div v-if="currentContext.context.skipReason" class="skip-reason">
            <small><strong>Note:</strong> {{ currentContext.context.skipReason }}</small>
          </div>
          <div class="nested-object-content">
            <!-- Debug: Show nested fields count -->
            <div v-if="true" class="debug-info">
              <small>Nested fields count: {{ currentContext.context.values.length }}</small>
              <div v-for="(field, idx) in currentContext.context.values" :key="idx">
                <small>{{ idx }}: {{ field.type }} - {{ field.context?.subject || field.context?.title }}</small>
                <div v-if="field.type === 'nestedObject'" style="margin-left: 10px;">
                  <small>Nested values: {{ field.context?.values?.length || 0 }}</small>
                  <div v-for="(subField, subIdx) in (field.context?.values || [])" :key="subIdx" style="margin-left: 10px;">
                    <small>{{ subIdx }}: {{ subField.type }} - {{ subField.context?.subject || subField.context?.title }}</small>
                    <div v-if="subField.type === 'nestedObject'" style="margin-left: 10px;">
                      <small>Sub nested values: {{ subField.context?.values?.length || 0 }}</small>
                      <div v-for="(subSubField, subSubIdx) in (subField.context?.values || [])" :key="subSubIdx" style="margin-left: 10px;">
                        <small>{{ subSubIdx }}: {{ subSubField.type }} - {{ subSubField.context?.subject || subSubField.context?.title }}</small>
                        <div v-if="subSubField.type === 'nestedObject'" style="margin-left: 10px;">
                          <small>Sub sub nested values: {{ subSubField.context?.values?.length || 0 }}</small>
                          <div v-for="(subSubSubField, subSubSubIdx) in (subSubField.context?.values || [])" :key="subSubSubIdx" style="margin-left: 10px;">
                            <small>{{ subSubSubIdx }}: {{ subSubSubField.type }} - {{ subSubSubField.context?.subject || subSubSubField.context?.title }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div 
              v-for="(nestedField, nestedIndex) in currentContext.context.values" 
              :key="nestedIndex"
              class="nested-field"
            >
              <!-- Nested Input Field -->
              <div
                v-if="nestedField.type === 'input'"
                class="field-group flex border-bottom"
              >
                <div class="field-title-box">
                  <span 
                    class="field-title"
                    :title="getFieldDescription(nestedField.context.description, nestedField.context.example)"
                  >
                    {{ nestedField.context.title }}
                  </span>
                  <span v-if="nestedField.context.isRequired" class="required-asterisk">*</span>
                </div>
                <div class="field-content-box">
                  <p-text-input
                    :value="nestedField.context.model.value"
                    @input="nestedField.context.model.value = $event"
                    :size="'md'"
                    block
                    :invalid="!nestedField.context.model.isValid"
                    :placeholder="nestedField.context.placeholder"
                    @blur="nestedField.context.model.onBlur"
                  />
                </div>
              </div>

              <!-- Nested Select Field -->
              <div
                v-else-if="nestedField.type === 'select'"
                class="field-group flex border-bottom"
              >
                <div class="field-title-box">
                  <span 
                    class="field-title"
                    :title="getFieldDescription(nestedField.context.description)"
                  >
                    {{ nestedField.context.title }}
                  </span>
                  <span v-if="nestedField.context.isRequired" class="required-asterisk">*</span>
                </div>
                <div class="field-content-box">
                  <select
                    :value="nestedField.context.model.value"
                    @change="nestedField.context.model.value = $event.target.value"
                    class="p-select"
                    :class="{ 'invalid': !nestedField.context.model.isValid }"
                  >
                    <option value="">Select an option</option>
                    <option 
                      v-for="option in nestedField.context.options" 
                      :key="option" 
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Nested Checkbox Field -->
              <div
                v-else-if="nestedField.type === 'checkbox'"
                class="field-group flex border-bottom"
              >
                <div class="field-title-box">
                  <span 
                    class="field-title"
                    :title="getFieldDescription(nestedField.context.description)"
                  >
                    {{ nestedField.context.title }}
                  </span>
                  <span v-if="nestedField.context.isRequired" class="required-asterisk">*</span>
                </div>
                <div class="field-content-box">
                  <p-checkbox
                    :value="nestedField.context.model.value"
                    @input="nestedField.context.model.value = $event"
                    :size="'md'"
                  />
                </div>
              </div>

              <!-- Nested Object Field -->
              <div
                v-else-if="nestedField.type === 'nestedObject'"
                class="nested-object-field"
              >
                <div class="nested-object-title">
                  <span class="field-title">{{ nestedField.context.subject }}</span>
                  <span v-if="nestedField.context.isRequired" class="required-asterisk">*</span>
                </div>
                <div class="nested-object-content">
                  <div 
                    v-for="(subField, subIndex) in nestedField.context.values" 
                    :key="subIndex"
                    class="nested-sub-field"
                  >
                    <!-- Sub Input Field -->
                    <div
                      v-if="subField.type === 'input'"
                      class="field-group flex border-bottom"
                    >
                      <div class="field-title-box">
                        <span 
                          class="field-title"
                          :title="getFieldDescription(subField.context.description, subField.context.example)"
                        >
                          {{ subField.context.title }}
                        </span>
                        <span v-if="subField.context.isRequired" class="required-asterisk">*</span>
                      </div>
                      <div class="field-content-box">
                        <p-text-input
                          :value="subField.context.model.value"
                          @input="subField.context.model.value = $event"
                          :size="'md'"
                          block
                          :invalid="!subField.context.model.isValid"
                          :placeholder="subField.context.placeholder"
                          @blur="subField.context.model.onBlur"
                        />
                      </div>
                    </div>

                    <!-- Sub Select Field -->
                    <div
                      v-else-if="subField.type === 'select'"
                      class="field-group flex border-bottom"
                    >
                      <div class="field-title-box">
                        <span 
                          class="field-title"
                          :title="getFieldDescription(subField.context.description)"
                        >
                          {{ subField.context.title }}
                        </span>
                        <span v-if="subField.context.isRequired" class="required-asterisk">*</span>
                      </div>
                      <div class="field-content-box">
                        <select
                          :value="subField.context.model.value"
                          @change="subField.context.model.value = $event.target.value"
                          class="p-select"
                          :class="{ 'invalid': !subField.context.model.isValid }"
                        >
                          <option value="">Select an option</option>
                          <option 
                            v-for="option in subField.context.options" 
                            :key="option" 
                            :value="option"
                          >
                            {{ option }}
                          </option>
                        </select>
                      </div>
                    </div>

                    <!-- Sub Checkbox Field -->
                    <div
                      v-else-if="subField.type === 'checkbox'"
                      class="field-group flex border-bottom"
                    >
                      <div class="field-title-box">
                        <span 
                          class="field-title"
                          :title="getFieldDescription(subField.context.description)"
                        >
                          {{ subField.context.title }}
                        </span>
                        <span v-if="subField.context.isRequired" class="required-asterisk">*</span>
                      </div>
                      <div class="field-content-box">
                        <p-checkbox
                          :value="subField.context.model.value"
                          @input="subField.context.model.value = $event"
                          :size="'md'"
                        />
                      </div>
                    </div>

                    <!-- Sub Nested Object Field (3rd level) -->
                    <div
                      v-else-if="subField.type === 'nestedObject'"
                      class="nested-object-field level-3"
                    >
                      <div class="nested-object-title">
                        <span class="field-title">{{ subField.context.subject }}</span>
                        <span v-if="subField.context.isRequired" class="required-asterisk">*</span>
                      </div>
                      <div class="nested-object-content">
                        <div 
                          v-for="(subSubField, subSubIndex) in subField.context.values" 
                          :key="subSubIndex"
                          class="nested-sub-sub-field"
                        >
                          <!-- Sub Sub Input Field -->
                          <div
                            v-if="subSubField.type === 'input'"
                            class="field-group flex border-bottom"
                          >
                            <div class="field-title-box">
                              <span 
                                class="field-title"
                                :title="getFieldDescription(subSubField.context.description, subSubField.context.example)"
                              >
                                {{ subSubField.context.title }}
                              </span>
                              <span v-if="subSubField.context.isRequired" class="required-asterisk">*</span>
                            </div>
                            <div class="field-content-box">
                              <p-text-input
                                :value="subSubField.context.model.value"
                                @input="subSubField.context.model.value = $event"
                                :size="'md'"
                                block
                                :invalid="!subSubField.context.model.isValid"
                                :placeholder="subSubField.context.placeholder"
                                @blur="subSubField.context.model.onBlur"
                              />
                            </div>
                          </div>

                          <!-- Sub Sub Select Field -->
                          <div
                            v-else-if="subSubField.type === 'select'"
                            class="field-group flex border-bottom"
                          >
                            <div class="field-title-box">
                              <span 
                                class="field-title"
                                :title="getFieldDescription(subSubField.context.description)"
                              >
                                {{ subSubField.context.title }}
                              </span>
                              <span v-if="subSubField.context.isRequired" class="required-asterisk">*</span>
                            </div>
                            <div class="field-content-box">
                              <select
                                :value="subSubField.context.model.value"
                                @change="subSubField.context.model.value = $event.target.value"
                                class="p-select"
                                :class="{ 'invalid': !subSubField.context.model.isValid }"
                              >
                                <option value="">Select an option</option>
                                <option 
                                  v-for="option in subSubField.context.options" 
                                  :key="option" 
                                  :value="option"
                                >
                                  {{ option }}
                                </option>
                              </select>
                            </div>
                          </div>

                          <!-- Sub Sub Checkbox Field -->
                          <div
                            v-else-if="subSubField.type === 'checkbox'"
                            class="field-group flex border-bottom"
                          >
                            <div class="field-title-box">
                              <span 
                                class="field-title"
                                :title="getFieldDescription(subSubField.context.description)"
                              >
                                {{ subSubField.context.title }}
                              </span>
                              <span v-if="subSubField.context.isRequired" class="required-asterisk">*</span>
                            </div>
                            <div class="field-content-box">
                              <p-checkbox
                                :value="subSubField.context.model.value"
                                @input="subSubField.context.model.value = $event"
                                :size="'md'"
                              />
                            </div>
                          </div>

                          <!-- Sub Sub Array Field (4th level) -->
                          <div
                            v-else-if="subSubField.type === 'accordion'"
                            class="accordion-part level-4"
                          >
                            <div class="subject-title border-bottom">
                              <div class="title-with-asterisk">
                                <span
                                  class="field-title"
                                  :title="getFieldDescription(subSubField.context.description)"
                                >
                                  {{ subSubField.context.subject }}
                                </span>
                                <span v-if="subSubField.context.isRequired" class="required-asterisk">*</span>
                              </div>
                              <div class="accordion-actions">
                                <p-button
                                  :style-type="'secondary'"
                                  icon-left="ic_plus"
                                  :size="'sm'"
                                  @click="addNestedArrayElement(subSubField)"
                                >
                                  Add Item
                                </p-button>
                              </div>
                            </div>
                            <div v-if="subSubField.context.values.length > 0" class="accordion-box">
                              <CommonAccordion 
                                :items="subSubField.context.values"
                                :initial-open-index="subSubField.context.lastAddedIndex"
                              >
                                <template #content="{ content, item, index: k }">
                                  <div class="accordion-item-actions">
                                    <p-button
                                      :style-type="'tertiary'"
                                      icon-left="ic_trashcan"
                                      :size="'sm'"
                                      @click="deleteNestedArrayElement(subSubField, k)"
                                    >
                                      Delete
                                    </p-button>
                                  </div>
                                  <div
                                    v-for="(subSubSubField, subSubSubIndex) in content"
                                    :key="subSubSubIndex"
                                    class="field-group flex border-bottom"
                                  >
                                    <!-- Sub Sub Sub Input Field -->
                                    <div v-if="subSubSubField.type === 'input'" class="field-title-box">
                                      <span 
                                        class="field-title"
                                        :title="getFieldDescription(subSubSubField.context.description, subSubSubField.context.example)"
                                      >
                                        {{ subSubSubField.context.title }}
                                      </span>
                                      <span v-if="subSubSubField.context.isRequired" class="required-asterisk">*</span>
                                    </div>
                                    <div v-if="subSubSubField.type === 'input'" class="field-content-box">
                                      <p-text-input
                                        :value="subSubSubField.context.model.value"
                                        @input="subSubSubField.context.model.value = $event"
                                        :size="'md'"
                                        block
                                        :invalid="!subSubSubField.context.model.isValid"
                                        :placeholder="subSubSubField.context.placeholder"
                                        @blur="subSubSubField.context.model.onBlur"
                                      />
                                    </div>

                                    <!-- Sub Sub Sub Select Field -->
                                    <div v-else-if="subSubSubField.type === 'select'" class="field-title-box">
                                      <span 
                                        class="field-title"
                                        :title="getFieldDescription(subSubSubField.context.description)"
                                      >
                                        {{ subSubSubField.context.title }}
                                      </span>
                                      <span v-if="subSubSubField.context.isRequired" class="required-asterisk">*</span>
                                    </div>
                                    <div v-else-if="subSubSubField.type === 'select'" class="field-content-box">
                                      <select
                                        :value="subSubSubField.context.model.value"
                                        @change="subSubSubField.context.model.value = $event.target.value"
                                        class="p-select"
                                        :class="{ 'invalid': !subSubSubField.context.model.isValid }"
                                      >
                                        <option value="">Select an option</option>
                                        <option 
                                          v-for="option in subSubSubField.context.options" 
                                          :key="option" 
                                          :value="option"
                                        >
                                          {{ option }}
                                        </option>
                                      </select>
                                    </div>

                                    <!-- Sub Sub Sub Checkbox Field -->
                                    <div v-else-if="subSubSubField.type === 'checkbox'" class="field-title-box">
                                      <span 
                                        class="field-title"
                                        :title="getFieldDescription(subSubSubField.context.description)"
                                      >
                                        {{ subSubSubField.context.title }}
                                      </span>
                                      <span v-if="subSubSubField.context.isRequired" class="required-asterisk">*</span>
                                    </div>
                                    <div v-else-if="subSubSubField.type === 'checkbox'" class="field-content-box">
                                      <p-checkbox
                                        :value="subSubSubField.context.model.value"
                                        @input="subSubSubField.context.model.value = $event"
                                        :size="'md'"
                                      />
                                    </div>
                                  </div>
                                </template>
                              </CommonAccordion>
                            </div>
                            <div v-else class="empty-accordion">
                              <p class="text-gray-500 text-sm">No items available. Click + to add.</p>
                            </div>
                          </div>

                          <!-- Sub Sub Array Field (4th level) -->
                          <div
                            v-else-if="subSubField.type === 'accordion'"
                            class="accordion-part level-4"
                          >
                            <div class="subject-title border-bottom">
                              <div class="title-with-asterisk">
                                <span
                                  class="field-title"
                                  :title="getFieldDescription(subSubField.context.description)"
                                >
                                  {{ subSubField.context.subject }}
                                </span>
                                <span v-if="subSubField.context.isRequired" class="required-asterisk">*</span>
                              </div>
                              <div class="accordion-actions">
                                <p-button
                                  :style-type="'secondary'"
                                  icon-left="ic_plus"
                                  :size="'sm'"
                                  @click="addNestedArrayElement(subSubField)"
                                >
                                  Add Item
                                </p-button>
                              </div>
                            </div>
                            <div v-if="subSubField.context.values.length > 0" class="accordion-box">
                              <CommonAccordion 
                                :items="subSubField.context.values"
                                :initial-open-index="subSubField.context.lastAddedIndex"
                              >
                                <template #content="{ content, item, index: k }">
                                  <div class="accordion-item-actions">
                                    <p-button
                                      :style-type="'tertiary'"
                                      icon-left="ic_trashcan"
                                      :size="'sm'"
                                      @click="deleteNestedArrayElement(subSubField, k)"
                                    >
                                      Delete
                                    </p-button>
                                  </div>
                                  <div
                                    v-for="(subSubSubField, subSubSubIndex) in content"
                                    :key="subSubSubIndex"
                                    class="field-group flex border-bottom"
                                  >
                                    <!-- Sub Sub Sub Input Field -->
                                    <div v-if="subSubSubField.type === 'input'" class="field-title-box">
                                      <span 
                                        class="field-title"
                                        :title="getFieldDescription(subSubSubField.context.description, subSubSubField.context.example)"
                                      >
                                        {{ subSubSubField.context.title }}
                                      </span>
                                      <span v-if="subSubSubField.context.isRequired" class="required-asterisk">*</span>
                                    </div>
                                    <div v-if="subSubSubField.type === 'input'" class="field-content-box">
                                      <p-text-input
                                        :value="subSubSubField.context.model.value"
                                        @input="subSubSubField.context.model.value = $event"
                                        :size="'md'"
                                        block
                                        :invalid="!subSubSubField.context.model.isValid"
                                        :placeholder="subSubSubField.context.placeholder"
                                        @blur="subSubSubField.context.model.onBlur"
                                      />
                                    </div>

                                    <!-- Sub Sub Sub Select Field -->
                                    <div v-else-if="subSubSubField.type === 'select'" class="field-title-box">
                                      <span 
                                        class="field-title"
                                        :title="getFieldDescription(subSubSubField.context.description)"
                                      >
                                        {{ subSubSubField.context.title }}
                                      </span>
                                      <span v-if="subSubSubField.context.isRequired" class="required-asterisk">*</span>
                                    </div>
                                    <div v-else-if="subSubSubField.type === 'select'" class="field-content-box">
                                      <select
                                        :value="subSubSubField.context.model.value"
                                        @change="subSubSubField.context.model.value = $event.target.value"
                                        class="p-select"
                                        :class="{ 'invalid': !subSubSubField.context.model.isValid }"
                                      >
                                        <option value="">Select an option</option>
                                        <option 
                                          v-for="option in subSubSubField.context.options" 
                                          :key="option" 
                                          :value="option"
                                        >
                                          {{ option }}
                                        </option>
                                      </select>
                                    </div>

                                    <!-- Sub Sub Sub Checkbox Field -->
                                    <div v-else-if="subSubSubField.type === 'checkbox'" class="field-title-box">
                                      <span 
                                        class="field-title"
                                        :title="getFieldDescription(subSubSubField.context.description)"
                                      >
                                        {{ subSubSubField.context.title }}
                                      </span>
                                      <span v-if="subSubSubField.context.isRequired" class="required-asterisk">*</span>
                                    </div>
                                    <div v-else-if="subSubSubField.type === 'checkbox'" class="field-content-box">
                                      <p-checkbox
                                        :value="subSubSubField.context.model.value"
                                        @input="subSubSubField.context.model.value = $event"
                                        :size="'md'"
                                      />
                                    </div>
                                  </div>
                                </template>
                              </CommonAccordion>
                            </div>
                            <div v-else class="empty-accordion">
                              <p class="text-gray-500 text-sm">No items available. Click + to add.</p>
                            </div>
                          </div>

                          <!-- Sub Sub Unknown Type Field -->
                          <div
                            v-else-if="subSubField.type === 'unknownType'"
                            class="unknown-type-part level-4"
                          >
                            <div class="subject-title border-bottom">
                              <span class="field-title">{{ subSubField.context.subject }}</span>
                              <span v-if="subSubField.context.isRequired" class="required-asterisk">*</span>
                            </div>
                            <div class="unknown-type-content">
                              <div class="unknown-type-line">
                                <strong>type:</strong> Unknown Type
                              </div>
                              <div v-if="subSubField.context.description" class="unknown-type-line">
                                <strong>description:</strong> {{ subSubField.context.description }}
                              </div>
                              <div class="unknown-type-line">
                                <strong>reason:</strong> {{ subSubField.context.reason }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Sub Array Field (3rd level) -->
                    <div
                      v-else-if="subField.type === 'accordion'"
                      class="accordion-part level-3"
                    >
                      <div class="subject-title border-bottom">
                        <div class="title-with-asterisk">
                          <span
                            class="field-title"
                            :title="getFieldDescription(subField.context.description)"
                          >
                            {{ subField.context.subject }}
                          </span>
                          <span v-if="subField.context.isRequired" class="required-asterisk">*</span>
                        </div>
                        <div class="accordion-actions">
                          <p-button
                            :style-type="'secondary'"
                            icon-left="ic_plus"
                            :size="'sm'"
                            @click="addNestedArrayElement(subField)"
                          >
                            Add Item
                          </p-button>
                        </div>
                      </div>
                      <div v-if="subField.context.values.length > 0" class="accordion-box">
                        <CommonAccordion 
                          :items="subField.context.values"
                          :initial-open-index="subField.context.lastAddedIndex"
                        >
                          <template #content="{ content, item, index: k }">
                            <div class="accordion-item-actions">
                              <p-button
                                :style-type="'tertiary'"
                                icon-left="ic_trashcan"
                                :size="'sm'"
                                @click="deleteNestedArrayElement(subField, k)"
                              >
                                Delete
                              </p-button>
                            </div>
                            <div
                              v-for="(subSubField, subSubIndex) in content"
                              :key="subSubIndex"
                              class="field-group flex border-bottom"
                            >
                              <!-- Sub Sub Input Field -->
                              <div v-if="subSubField.type === 'input'" class="field-title-box">
                                <span 
                                  class="field-title"
                                  :title="getFieldDescription(subSubField.context.description, subSubField.context.example)"
                                >
                                  {{ subSubField.context.title }}
                                </span>
                                <span v-if="subSubField.context.isRequired" class="required-asterisk">*</span>
                              </div>
                              <div v-if="subSubField.type === 'input'" class="field-content-box">
                                <p-text-input
                                  :value="subSubField.context.model.value"
                                  @input="subSubField.context.model.value = $event"
                                  :size="'md'"
                                  block
                                  :invalid="!subSubField.context.model.isValid"
                                  :placeholder="subSubField.context.placeholder"
                                  @blur="subSubField.context.model.onBlur"
                                />
                              </div>

                              <!-- Sub Sub Select Field -->
                              <div v-else-if="subSubField.type === 'select'" class="field-title-box">
                                <span 
                                  class="field-title"
                                  :title="getFieldDescription(subSubField.context.description)"
                                >
                                  {{ subSubField.context.title }}
                                </span>
                                <span v-if="subSubField.context.isRequired" class="required-asterisk">*</span>
                              </div>
                              <div v-else-if="subSubField.type === 'select'" class="field-content-box">
                                <select
                                  :value="subSubField.context.model.value"
                                  @change="subSubField.context.model.value = $event.target.value"
                                  class="p-select"
                                  :class="{ 'invalid': !subSubField.context.model.isValid }"
                                >
                                  <option value="">Select an option</option>
                                  <option 
                                    v-for="option in subSubField.context.options" 
                                    :key="option" 
                                    :value="option"
                                  >
                                    {{ option }}
                                  </option>
                                </select>
                              </div>

                              <!-- Sub Sub Checkbox Field -->
                              <div v-else-if="subSubField.type === 'checkbox'" class="field-title-box">
                                <span 
                                  class="field-title"
                                  :title="getFieldDescription(subSubField.context.description)"
                                >
                                  {{ subSubField.context.title }}
                                </span>
                                <span v-if="subSubField.context.isRequired" class="required-asterisk">*</span>
                              </div>
                              <div v-else-if="subSubField.type === 'checkbox'" class="field-content-box">
                                <p-checkbox
                                  :value="subSubField.context.model.value"
                                  @input="subSubField.context.model.value = $event"
                                  :size="'md'"
                                />
                              </div>
                            </div>
                          </template>
                        </CommonAccordion>
                      </div>
                      <div v-else class="empty-accordion">
                        <p class="text-gray-500 text-sm">No items available. Click + to add.</p>
                      </div>
                    </div>

                    <!-- Sub Unknown Type Field -->
                    <div
                      v-else-if="subField.type === 'unknownType'"
                      class="unknown-type-part level-3"
                    >
                      <div class="subject-title border-bottom">
                        <span class="field-title">{{ subField.context.subject }}</span>
                        <span v-if="subField.context.isRequired" class="required-asterisk">*</span>
                      </div>
                      <div class="unknown-type-content">
                        <div class="unknown-type-line">
                          <strong>type:</strong> Unknown Type
                        </div>
                        <div v-if="subField.context.description" class="unknown-type-line">
                          <strong>description:</strong> {{ subField.context.description }}
                        </div>
                        <div class="unknown-type-line">
                          <strong>reason:</strong> {{ subField.context.reason }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Nested Array Field -->
              <div
                v-else-if="nestedField.type === 'accordion'"
                class="accordion-part w-full h-full"
              >
                <div class="subject-title border-bottom">
                  <div class="title-with-asterisk">
                    <span
                      class="field-title"
                      :title="getFieldDescription(nestedField.context.description)"
                    >
                      {{ nestedField.context.subject }}
                    </span>
                    <span v-if="nestedField.context.isRequired" class="required-asterisk">*</span>
                  </div>
                  <div class="accordion-actions">
                    <p-button
                      :style-type="'secondary'"
                      icon-left="ic_plus"
                      :size="'sm'"
                      @click="addNestedArrayElement(nestedField)"
                    >
                      Add Item
                    </p-button>
                  </div>
                </div>
                <div v-if="nestedField.context.skipReason" class="skip-reason">
                  <small><strong>Note:</strong> {{ nestedField.context.skipReason }}</small>
                </div>
                <div v-if="nestedField.context.values.length > 0" class="accordion-box">
                  <CommonAccordion 
                    :items="nestedField.context.values"
                    :initial-open-index="nestedField.context.lastAddedIndex"
                  >
                    <template #content="{ content, item, index: j }">
                      <div class="accordion-item-actions">
                        <p-button
                          :style-type="'tertiary'"
                          icon-left="ic_trashcan"
                          :size="'sm'"
                          @click="deleteNestedArrayElement(nestedField, j)"
                        >
                          Delete
                        </p-button>
                      </div>
                      <div
                        v-for="(field, fieldIndex) in content"
                        :key="fieldIndex"
                        class="field-group flex border-bottom"
                      >
                        <!-- Nested Array Item Input Field -->
                        <div v-if="field.type === 'input'" class="field-title-box">
                          <span 
                            class="field-title"
                            :title="getFieldDescription(field.context.description, field.context.example)"
                          >
                            {{ field.context.title }}
                          </span>
                          <span v-if="field.context.isRequired" class="required-asterisk">*</span>
                        </div>
                        <div v-if="field.type === 'input'" class="field-content-box">
                          <p-text-input
                            :value="field.context.model.value"
                            @input="field.context.model.value = $event"
                            :size="'md'"
                            block
                            :invalid="!field.context.model.isValid"
                            :placeholder="field.context.placeholder"
                            @blur="field.context.model.onBlur"
                          />
                        </div>

                        <!-- Nested Array Item Select Field -->
                        <div v-else-if="field.type === 'select'" class="field-title-box">
                          <span 
                            class="field-title"
                            :title="getFieldDescription(field.context.description)"
                          >
                            {{ field.context.title }}
                          </span>
                          <span v-if="field.context.isRequired" class="required-asterisk">*</span>
                        </div>
                        <div v-else-if="field.type === 'select'" class="field-content-box">
                          <select
                            :value="field.context.model.value"
                            @change="field.context.model.value = $event.target.value"
                            class="p-select"
                            :class="{ 'invalid': !field.context.model.isValid }"
                          >
                            <option value="">Select an option</option>
                            <option 
                              v-for="option in field.context.options" 
                              :key="option" 
                              :value="option"
                            >
                              {{ option }}
                            </option>
                          </select>
                        </div>

                        <!-- Nested Array Item Checkbox Field -->
                        <div v-else-if="field.type === 'checkbox'" class="field-title-box">
                          <span 
                            class="field-title"
                            :title="getFieldDescription(field.context.description)"
                          >
                            {{ field.context.title }}
                          </span>
                          <span v-if="field.context.isRequired" class="required-asterisk">*</span>
                        </div>
                        <div v-else-if="field.type === 'checkbox'" class="field-content-box">
                          <p-checkbox
                            :value="field.context.model.value"
                            @input="field.context.model.value = $event"
                            :size="'md'"
                          />
                        </div>

                        <!-- Nested Array Item Accordion Field (for arrays within server items) -->
                        <div v-else-if="field.type === 'accordion'" class="nested-accordion-field level-2">
                          <div class="subject-title border-bottom">
                            <div class="title-with-asterisk">
                              <span
                                class="field-title"
                                :title="getFieldDescription(field.context.description)"
                              >
                                {{ field.context.subject }}
                              </span>
                              <span v-if="field.context.isRequired" class="required-asterisk">*</span>
                            </div>
                            <div class="accordion-actions">
                              <p-button
                                :style-type="'secondary'"
                                icon-left="ic_plus"
                                :size="'sm'"
                                @click="addNestedArrayElement(field)"
                              >
                                Add Item
                              </p-button>
                            </div>
                          </div>
                          <div v-if="field.context.values.length > 0" class="accordion-box">
                            <CommonAccordion 
                              :items="field.context.values"
                              :initial-open-index="field.context.lastAddedIndex"
                            >
                              <template #content="{ content: subContent, item: subItem, index: k }">
                                <div class="accordion-item-actions">
                                  <p-button
                                    :style-type="'tertiary'"
                                    icon-left="ic_trashcan"
                                    :size="'sm'"
                                    @click="deleteNestedArrayElement(field, k)"
                                  >
                                    Delete
                                  </p-button>
                                </div>
                                <div
                                  v-for="(subField, subFieldIndex) in subContent"
                                  :key="subFieldIndex"
                                  class="field-group flex border-bottom"
                                >
                                  <!-- Sub Array Item Input Field -->
                                  <div v-if="subField.type === 'input'" class="field-title-box">
                                    <span
                                      class="field-title"
                                      :title="getFieldDescription(subField.context.description)"
                                    >
                                      {{ subField.context.title }}
                                    </span>
                                    <span v-if="subField.context.isRequired" class="required-asterisk">*</span>
                                  </div>
                                  <div v-if="subField.type === 'input'" class="field-content-box">
                                    <p-text-input
                                      :value="subField.context.model.value"
                                      @input="subField.context.model.value = $event"
                                      :size="'md'"
                                      block
                                      :invalid="!subField.context.model.isValid"
                                      :placeholder="subField.context.placeholder"
                                      @blur="subField.context.model.onBlur"
                                    />
                                  </div>

                                  <!-- Sub Array Item Select Field -->
                                  <div v-else-if="subField.type === 'select'" class="field-title-box">
                                    <span
                                      class="field-title"
                                      :title="getFieldDescription(subField.context.description)"
                                    >
                                      {{ subField.context.title }}
                                    </span>
                                    <span v-if="subField.context.isRequired" class="required-asterisk">*</span>
                                  </div>
                                  <div v-else-if="subField.type === 'select'" class="field-content-box">
                                    <select
                                      :value="subField.context.value"
                                      @change="subField.context.value = $event.target.value"
                                      class="select-input"
                                    >
                                      <option
                                        v-for="option in subField.context.options"
                                        :key="option"
                                        :value="option"
                                      >
                                        {{ option }}
                                      </option>
                                    </select>
                                  </div>

                                  <!-- Sub Array Item Checkbox Field -->
                                  <div v-else-if="subField.type === 'checkbox'" class="field-title-box">
                                    <span
                                      class="field-title"
                                      :title="getFieldDescription(subField.context.description)"
                                    >
                                      {{ subField.context.title }}
                                    </span>
                                    <span v-if="subField.context.isRequired" class="required-asterisk">*</span>
                                  </div>
                                  <div v-else-if="subField.type === 'checkbox'" class="field-content-box">
                                    <input
                                      type="checkbox"
                                      :checked="subField.context.value"
                                      @change="subField.context.value = $event.target.checked"
                                      class="checkbox-input"
                                    />
                                  </div>

                                  <!-- Sub Array Item Unknown Type Field -->
                                  <div v-else-if="subField.type === 'unknownType'" class="unknown-type-part w-full h-full">
                                    <div class="subject-title border-bottom">
                                      <span class="field-title">{{ subField.context.subject }}</span>
                                      <span v-if="subField.context.isRequired" class="required-asterisk">*</span>
                                    </div>
                                    <div class="unknown-type-content">
                                      <div class="unknown-type-line">
                                        <strong>type:</strong> Unknown Type
                                      </div>
                                      <div v-if="subField.context.description" class="unknown-type-line">
                                        <strong>description:</strong> {{ subField.context.description }}
                                      </div>
                                      <div class="unknown-type-line">
                                        <strong>reason:</strong> {{ subField.context.reason }}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </template>
                            </CommonAccordion>
                          </div>
                        </div>

                        <!-- Nested Array Item Nested Object Field -->
                        <div v-else-if="field.type === 'nestedObject'" class="nested-object-field">
                          <div class="nested-object-title">
                            <span class="field-title">{{ field.context.subject }}</span>
                            <span v-if="field.context.isRequired" class="required-asterisk">*</span>
                          </div>
                          <div class="nested-object-content">
                            <div 
                              v-for="(subField, subIndex) in field.context.values" 
                              :key="subIndex"
                              class="nested-sub-field"
                            >
                              <!-- Sub Input Field -->
                              <div
                                v-if="subField.type === 'input'"
                                class="field-group flex border-bottom"
                              >
                                <div class="field-title-box">
                                  <span 
                                    class="field-title"
                                    :title="getFieldDescription(subField.context.description, subField.context.example)"
                                  >
                                    {{ subField.context.title }}
                                  </span>
                                  <span v-if="subField.context.isRequired" class="required-asterisk">*</span>
                                </div>
                                <div class="field-content-box">
                                  <p-text-input
                                    :value="subField.context.model.value"
                                    @input="subField.context.model.value = $event"
                                    :size="'md'"
                                    block
                                    :invalid="!subField.context.model.isValid"
                                    :placeholder="subField.context.placeholder"
                                    @blur="subField.context.model.onBlur"
                                  />
                                </div>
                              </div>

                              <!-- Sub Select Field -->
                              <div
                                v-else-if="subField.type === 'select'"
                                class="field-group flex border-bottom"
                              >
                                <div class="field-title-box">
                                  <span 
                                    class="field-title"
                                    :title="getFieldDescription(subField.context.description)"
                                  >
                                    {{ subField.context.title }}
                                  </span>
                                  <span v-if="subField.context.isRequired" class="required-asterisk">*</span>
                                </div>
                                <div class="field-content-box">
                                  <select
                                    :value="subField.context.model.value"
                                    @change="subField.context.model.value = $event.target.value"
                                    class="p-select"
                                    :class="{ 'invalid': !subField.context.model.isValid }"
                                  >
                                    <option value="">Select an option</option>
                                    <option 
                                      v-for="option in subField.context.options" 
                                      :key="option" 
                                      :value="option"
                                    >
                                      {{ option }}
                                    </option>
                                  </select>
                                </div>
                              </div>

                              <!-- Sub Checkbox Field -->
                              <div
                                v-else-if="subField.type === 'checkbox'"
                                class="field-group flex border-bottom"
                              >
                                <div class="field-title-box">
                                  <span 
                                    class="field-title"
                                    :title="getFieldDescription(subField.context.description)"
                                  >
                                    {{ subField.context.title }}
                                  </span>
                                  <span v-if="subField.context.isRequired" class="required-asterisk">*</span>
                                </div>
                                <div class="field-content-box">
                                  <p-checkbox
                                    :value="subField.context.model.value"
                                    @input="subField.context.model.value = $event"
                                    :size="'md'"
                                  />
                                </div>
                              </div>

                              <!-- Sub Nested Object Field (3rd level) -->
                              <div
                                v-else-if="subField.type === 'nestedObject'"
                                class="nested-object-field level-3"
                              >
                                <div class="nested-object-title">
                                  <span class="field-title">{{ subField.context.subject }}</span>
                                  <span v-if="subField.context.isRequired" class="required-asterisk">*</span>
                                </div>
                                <div class="nested-object-content">
                                  <div 
                                    v-for="(subSubField, subSubIndex) in subField.context.values" 
                                    :key="subSubIndex"
                                    class="nested-sub-sub-field"
                                  >
                                    <!-- Sub Sub Input Field -->
                                    <div
                                      v-if="subSubField.type === 'input'"
                                      class="field-group flex border-bottom"
                                    >
                                      <div class="field-title-box">
                                        <span 
                                          class="field-title"
                                          :title="getFieldDescription(subSubField.context.description, subSubField.context.example)"
                                        >
                                          {{ subSubField.context.title }}
                                        </span>
                                        <span v-if="subSubField.context.isRequired" class="required-asterisk">*</span>
                                      </div>
                                      <div class="field-content-box">
                                        <p-text-input
                                          :value="subSubField.context.model.value"
                                          @input="subSubField.context.model.value = $event"
                                          :size="'md'"
                                          block
                                          :invalid="!subSubField.context.model.isValid"
                                          :placeholder="subSubField.context.placeholder"
                                          @blur="subSubField.context.model.onBlur"
                                        />
                                      </div>
                                    </div>

                                    <!-- Sub Sub Select Field -->
                                    <div
                                      v-else-if="subSubField.type === 'select'"
                                      class="field-group flex border-bottom"
                                    >
                                      <div class="field-title-box">
                                        <span 
                                          class="field-title"
                                          :title="getFieldDescription(subSubField.context.description)"
                                        >
                                          {{ subSubField.context.title }}
                                        </span>
                                        <span v-if="subSubField.context.isRequired" class="required-asterisk">*</span>
                                      </div>
                                      <div class="field-content-box">
                                        <select
                                          :value="subSubField.context.model.value"
                                          @change="subSubField.context.model.value = $event.target.value"
                                          class="p-select"
                                          :class="{ 'invalid': !subSubField.context.model.isValid }"
                                        >
                                          <option value="">Select an option</option>
                                          <option 
                                            v-for="option in subSubField.context.options" 
                                            :key="option" 
                                            :value="option"
                                          >
                                            {{ option }}
                                          </option>
                                        </select>
                                      </div>
                                    </div>

                                    <!-- Sub Sub Checkbox Field -->
                                    <div
                                      v-else-if="subSubField.type === 'checkbox'"
                                      class="field-group flex border-bottom"
                                    >
                                      <div class="field-title-box">
                                        <span 
                                          class="field-title"
                                          :title="getFieldDescription(subSubField.context.description)"
                                        >
                                          {{ subSubField.context.title }}
                                        </span>
                                        <span v-if="subSubField.context.isRequired" class="required-asterisk">*</span>
                                      </div>
                                      <div class="field-content-box">
                                        <p-checkbox
                                          :value="subSubField.context.model.value"
                                          @input="subSubField.context.model.value = $event"
                                          :size="'md'"
                                        />
                                      </div>
                                    </div>

                                    <!-- Sub Sub Array Field (4th level) -->
                                    <div
                                      v-else-if="subSubField.type === 'accordion'"
                                      class="accordion-part level-4"
                                    >
                                      <div class="subject-title border-bottom">
                                        <div class="title-with-asterisk">
                                          <span
                                            class="field-title"
                                            :title="getFieldDescription(subSubField.context.description)"
                                          >
                                            {{ subSubField.context.subject }}
                                          </span>
                                          <span v-if="subSubField.context.isRequired" class="required-asterisk">*</span>
                                        </div>
                                        <div class="accordion-actions">
                                          <p-button
                                            :style-type="'secondary'"
                                            icon-left="ic_plus"
                                            :size="'sm'"
                                            @click="addNestedArrayElement(subSubField)"
                                          >
                                            Add Item
                                          </p-button>
                                        </div>
                                      </div>
                                      <div v-if="subSubField.context.values.length > 0" class="accordion-box">
                                        <CommonAccordion 
                                :items="subSubField.context.values"
                                :initial-open-index="subSubField.context.lastAddedIndex"
                              >
                                          <template #content="{ content, item, index: k }">
                                            <div class="accordion-item-actions">
                                              <p-button
                                                :style-type="'tertiary'"
                                                icon-left="ic_trashcan"
                                                :size="'sm'"
                                                @click="deleteNestedArrayElement(subSubField, k)"
                                              >
                                                Delete
                                              </p-button>
                                            </div>
                                            <div
                                              v-for="(subSubSubField, subSubSubIndex) in content"
                                              :key="subSubSubIndex"
                                              class="field-group flex border-bottom"
                                            >
                                              <!-- Sub Sub Sub Input Field -->
                                              <div v-if="subSubSubField.type === 'input'" class="field-title-box">
                                                <span 
                                                  class="field-title"
                                                  :title="getFieldDescription(subSubSubField.context.description, subSubSubField.context.example)"
                                                >
                                                  {{ subSubSubField.context.title }}
                                                </span>
                                                <span v-if="subSubSubField.context.isRequired" class="required-asterisk">*</span>
                                              </div>
                                              <div v-if="subSubSubField.type === 'input'" class="field-content-box">
                                                <p-text-input
                                                  :value="subSubSubField.context.model.value"
                                                  @input="subSubSubField.context.model.value = $event"
                                                  :size="'md'"
                                                  block
                                                  :invalid="!subSubSubField.context.model.isValid"
                                                  :placeholder="subSubSubField.context.placeholder"
                                                  @blur="subSubSubField.context.model.onBlur"
                                                />
                                              </div>

                                              <!-- Sub Sub Sub Select Field -->
                                              <div v-else-if="subSubSubField.type === 'select'" class="field-title-box">
                                                <span 
                                                  class="field-title"
                                                  :title="getFieldDescription(subSubSubField.context.description)"
                                                >
                                                  {{ subSubSubField.context.title }}
                                                </span>
                                                <span v-if="subSubSubField.context.isRequired" class="required-asterisk">*</span>
                                              </div>
                                              <div v-else-if="subSubSubField.type === 'select'" class="field-content-box">
                                                <select
                                                  :value="subSubSubField.context.model.value"
                                                  @change="subSubSubField.context.model.value = $event.target.value"
                                                  class="p-select"
                                                  :class="{ 'invalid': !subSubSubField.context.model.isValid }"
                                                >
                                                  <option value="">Select an option</option>
                                                  <option 
                                                    v-for="option in subSubSubField.context.options" 
                                                    :key="option" 
                                                    :value="option"
                                                  >
                                                    {{ option }}
                                                  </option>
                                                </select>
                                              </div>

                                              <!-- Sub Sub Sub Checkbox Field -->
                                              <div v-else-if="subSubSubField.type === 'checkbox'" class="field-title-box">
                                                <span 
                                                  class="field-title"
                                                  :title="getFieldDescription(subSubSubField.context.description)"
                                                >
                                                  {{ subSubSubField.context.title }}
                                                </span>
                                                <span v-if="subSubSubField.context.isRequired" class="required-asterisk">*</span>
                                              </div>
                                              <div v-else-if="subSubSubField.type === 'checkbox'" class="field-content-box">
                                                <p-checkbox
                                                  :value="subSubSubField.context.model.value"
                                                  @input="subSubSubField.context.model.value = $event"
                                                  :size="'md'"
                                                />
                                              </div>
                                            </div>
                                          </template>
                                        </CommonAccordion>
                                      </div>
                                      <div v-else class="empty-accordion">
                                        <p class="text-gray-500 text-sm">No items available. Click + to add.</p>
                                      </div>
                                    </div>

                                    <!-- Sub Sub Unknown Type Field -->
                                    <div
                                      v-else-if="subSubField.type === 'unknownType'"
                                      class="unknown-type-part level-4"
                                    >
                                      <div class="subject-title border-bottom">
                                        <span class="field-title">{{ subSubField.context.subject }}</span>
                                        <span v-if="subSubField.context.isRequired" class="required-asterisk">*</span>
                                      </div>
                                      <div class="unknown-type-content">
                                        <div class="unknown-type-line">
                                          <strong>type:</strong> Unknown Type
                                        </div>
                                        <div v-if="subSubField.context.description" class="unknown-type-line">
                                          <strong>description:</strong> {{ subSubField.context.description }}
                                        </div>
                                        <div class="unknown-type-line">
                                          <strong>reason:</strong> {{ subSubField.context.reason }}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <!-- Sub Array Field (3rd level) -->
                              <div
                                v-else-if="subField.type === 'accordion'"
                                class="accordion-part level-3"
                              >
                                <div class="subject-title border-bottom">
                                  <div class="title-with-asterisk">
                                    <span
                                      class="field-title"
                                      :title="getFieldDescription(subField.context.description)"
                                    >
                                      {{ subField.context.subject }}
                                    </span>
                                    <span v-if="subField.context.isRequired" class="required-asterisk">*</span>
                                  </div>
                                  <div class="accordion-actions">
                                    <p-button
                                      :style-type="'secondary'"
                                      icon-left="ic_plus"
                                      :size="'sm'"
                                      @click="addNestedArrayElement(subField)"
                                    >
                                      Add Item
                                    </p-button>
                                  </div>
                                </div>
                                <div v-if="subField.context.values.length > 0" class="accordion-box">
                                  <CommonAccordion 
                          :items="subField.context.values"
                          :initial-open-index="subField.context.lastAddedIndex"
                        >
                                    <template #content="{ content, item, index: k }">
                                      <div class="accordion-item-actions">
                                        <p-button
                                          :style-type="'tertiary'"
                                          icon-left="ic_trashcan"
                                          :size="'sm'"
                                          @click="deleteNestedArrayElement(subField, k)"
                                        >
                                          Delete
                                        </p-button>
                                      </div>
                                      <div
                                        v-for="(subSubField, subSubIndex) in content"
                                        :key="subSubIndex"
                                        class="field-group flex border-bottom"
                                      >
                                        <!-- Sub Sub Input Field -->
                                        <div v-if="subSubField.type === 'input'" class="field-title-box">
                                          <span 
                                            class="field-title"
                                            :title="getFieldDescription(subSubField.context.description, subSubField.context.example)"
                                          >
                                            {{ subSubField.context.title }}
                                          </span>
                                          <span v-if="subSubField.context.isRequired" class="required-asterisk">*</span>
                                        </div>
                                        <div v-if="subSubField.type === 'input'" class="field-content-box">
                                          <p-text-input
                                            :value="subSubField.context.model.value"
                                            @input="subSubField.context.model.value = $event"
                                            :size="'md'"
                                            block
                                            :invalid="!subSubField.context.model.isValid"
                                            :placeholder="subSubField.context.placeholder"
                                            @blur="subSubField.context.model.onBlur"
                                          />
                                        </div>

                                        <!-- Sub Sub Select Field -->
                                        <div v-else-if="subSubField.type === 'select'" class="field-title-box">
                                          <span 
                                            class="field-title"
                                            :title="getFieldDescription(subSubField.context.description)"
                                          >
                                            {{ subSubField.context.title }}
                                          </span>
                                          <span v-if="subSubField.context.isRequired" class="required-asterisk">*</span>
                                        </div>
                                        <div v-else-if="subSubField.type === 'select'" class="field-content-box">
                                          <select
                                            :value="subSubField.context.model.value"
                                            @change="subSubField.context.model.value = $event.target.value"
                                            class="p-select"
                                            :class="{ 'invalid': !subSubField.context.model.isValid }"
                                          >
                                            <option value="">Select an option</option>
                                            <option 
                                              v-for="option in subSubField.context.options" 
                                              :key="option" 
                                              :value="option"
                                            >
                                              {{ option }}
                                            </option>
                                          </select>
                                        </div>

                                        <!-- Sub Sub Checkbox Field -->
                                        <div v-else-if="subSubField.type === 'checkbox'" class="field-title-box">
                                          <span 
                                            class="field-title"
                                            :title="getFieldDescription(subSubField.context.description)"
                                          >
                                            {{ subSubField.context.title }}
                                          </span>
                                          <span v-if="subSubField.context.isRequired" class="required-asterisk">*</span>
                                        </div>
                                        <div v-else-if="subSubField.type === 'checkbox'" class="field-content-box">
                                          <p-checkbox
                                            :value="subSubField.context.model.value"
                                            @input="subSubField.context.model.value = $event"
                                            :size="'md'"
                                          />
                                        </div>
                                      </div>
                                    </template>
                                  </CommonAccordion>
                                </div>
                                <div v-else class="empty-accordion">
                                  <p class="text-gray-500 text-sm">No items available. Click + to add.</p>
                                </div>
                              </div>

                              <!-- Sub Unknown Type Field -->
                              <div
                                v-else-if="subField.type === 'unknownType'"
                                class="unknown-type-part level-3"
                              >
                                <div class="subject-title border-bottom">
                                  <span class="field-title">{{ subField.context.subject }}</span>
                                  <span v-if="subField.context.isRequired" class="required-asterisk">*</span>
                                </div>
                                <div class="unknown-type-content">
                                  <div class="unknown-type-line">
                                    <strong>type:</strong> Unknown Type
                                  </div>
                                  <div v-if="subField.context.description" class="unknown-type-line">
                                    <strong>description:</strong> {{ subField.context.description }}
                                  </div>
                                  <div class="unknown-type-line">
                                    <strong>reason:</strong> {{ subField.context.reason }}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </CommonAccordion>
                </div>
                <div v-else class="empty-accordion">
                  <p class="text-gray-500 text-sm">No items available. Click + to add.</p>
                </div>
              </div>

              <!-- Nested Unknown Type Field -->
              <div
                v-else-if="nestedField.type === 'unknownType'"
                class="unknown-type-part w-full h-full"
              >
                <div class="subject-title border-bottom">
                  <span class="field-title">{{ nestedField.context.subject }}</span>
                  <span v-if="nestedField.context.isRequired" class="required-asterisk">*</span>
                </div>
                <div class="unknown-type-content">
                  <div class="unknown-type-line">
                    <strong>type:</strong> Unknown Type
                  </div>
                  <div v-if="nestedField.context.description" class="unknown-type-line">
                    <strong>description:</strong> {{ nestedField.context.description }}
                  </div>
                  <div class="unknown-type-line">
                    <strong>reason:</strong> {{ nestedField.context.reason }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Unknown Type Field -->
        <div
          v-else-if="currentContext.type === 'unknownType'"
          class="unknown-type-part w-full h-full"
        >
          <div class="subject-title border-bottom">
            <span 
              class="field-title"
              :title="getFieldDescription(currentContext.context.description)"
            >
              {{ currentContext.context.title }}
            </span>
            <span v-if="currentContext.context.isRequired" class="required-asterisk">*</span>
          </div>
          <div class="unknown-type-content">
            <div class="unknown-type-line">
              <strong>title:</strong> {{ currentContext.context.title }}
            </div>
            <div class="unknown-type-line">
              <strong>type:</strong> Unknown Type
            </div>
            <div v-if="currentContext.context.description" class="unknown-type-line">
              <strong>description:</strong> {{ currentContext.context.description }}
            </div>
            <div class="unknown-type-line">
              <strong>reason:</strong> {{ currentContext.context.reason }}
            </div>
          </div>
        </div>

        <!-- Array (Accordion) -->
        <div
          v-else-if="currentContext.type === 'accordion'"
          class="accordion-part w-full h-full"
        >
          <div class="subject-title border-bottom">
            <div class="title-with-asterisk">
              <span 
                class="field-title"
                :title="getFieldDescription(currentContext.context.description)"
              >
                {{ currentContext.context.subject }}
              </span>
              <span v-if="currentContext.context.isRequired" class="required-asterisk">*</span>
              <span v-if="currentContext.context.skipReason" class="skip-reason-inline">{{ currentContext.context.skipReason }}</span>
            </div>
            <p-button
              :style-type="'secondary'"
              icon-left="ic_plus"
              :size="'sm'"
              @click="taskEditorModel.addArrayElement(index)"
            >
              Add Item
            </p-button>
          </div>
          <!-- Description removed for cleaner UI -->
          <div v-if="currentContext.context.skipReason" class="skip-reason">
            <small><strong>Note:</strong> {{ currentContext.context.skipReason }}</small>
          </div>
          <!-- Debug: Accordion items count -->
          <div v-if="false && currentContext.context.values.length > 0" class="debug-accordion-info">
            <small>Accordion has {{ currentContext.context.values.length }} items</small>
          </div>
          
          <CommonAccordion :items="currentContext.context.values">
            <template #content="{ content, item, index: j }">
              <div class="accordion-item-actions">
                <p-icon-button
                  icon="ic_plus"
                  :size="'sm'"
                  @click="taskEditorModel.addArrayElement(index)"
                />
                <p-icon-button
                  icon="ic_minus"
                  :size="'sm'"
                  @click="deleteArrayElement($event, currentContext.context.values, j)"
                />
              </div>
              
              <div class="accordion-item-content">
                <div
                  v-for="(element, elementIndex) in content"
                  :key="elementIndex"
                  class="flex justify-between align-items-center item-content"
                >
                  <!-- Input in Accordion -->
                  <div
                    v-if="element.type === 'input'"
                    class="field-group flex w-full h-full"
                  >
                    <div class="field-title-box" :class="getRequiredClass(element.context.isRequired)">
                      <span 
                        class="field-title"
                        :title="getFieldDescription(element.context.description, element.context.example)"
                      >
                        {{ element.context.title }}
                      </span>
                      <span v-if="element.context.isRequired" class="required-asterisk">*</span>
                    </div>
                    <div class="field-content-box">
                      <p-text-input
                        :value="element.context.model.value"
                        @input="element.context.model.value = $event"
                        :size="'md'"
                        block
                        :invalid="!element.context.model.isValid"
                        :placeholder="element.context.placeholder || ''"
                        @blur="element.context.model.onBlur"
                      />
                    </div>
                  </div>

                  <!-- Select in Accordion -->
                  <div
                    v-else-if="element.type === 'select'"
                    class="field-group flex w-full h-full"
                  >
                    <div class="field-title-box" :class="getRequiredClass(element.context.isRequired)">
                      <span 
                        class="field-title"
                        :title="getFieldDescription(element.context.description)"
                      >
                        {{ element.context.title }}
                      </span>
                      <span v-if="element.context.isRequired" class="required-asterisk">*</span>
                    </div>
                    <div class="field-content-box">
                      <p-text-input
                        :value="element.context.model.value"
                        @input="element.context.model.value = $event"
                        :size="'md'"
                        block
                        :invalid="!element.context.model.isValid"
                        :placeholder="element.context.placeholder || ''"
                        @blur="element.context.model.onBlur"
                        readonly
                      />
                    </div>
                  </div>

                  <!-- Checkbox in Accordion -->
                  <div
                    v-else-if="element.type === 'checkbox'"
                    class="field-group flex w-full h-full"
                  >
                    <div class="field-title-box" :class="getRequiredClass(element.context.isRequired)">
                      <span 
                        class="field-title"
                        :title="getFieldDescription(element.context.description)"
                      >
                        {{ element.context.title }}
                      </span>
                      <span v-if="element.context.isRequired" class="required-asterisk">*</span>
                    </div>
                    <div class="field-content-box">
                      <p-checkbox
                        :value="element.context.model.value"
                        @input="element.context.model.value = $event"
                        :invalid="!element.context.model.isValid"
                        @blur="element.context.model.onBlur"
                      />
                    </div>
                  </div>

                  <!-- Key-Value Input in Accordion -->
                  <div
                    v-else-if="element.type === 'keyValueInput'"
                    class="field-group flex w-full h-full"
                  >
                    <div class="field-title-box" :class="getRequiredClass(element.context.isRequired)">
                      <span 
                        class="field-title"
                        :title="getFieldDescription(element.context.description)"
                      >
                        {{ element.context.title }}
                      </span>
                      <span v-if="element.context.isRequired" class="required-asterisk">*</span>
                    </div>
                    <div class="field-content-box">
                      <div class="key-value-input-container">
                        <div
                          v-for="(kv, kvIndex) in element.context.model.value"
                          :key="kvIndex"
                          class="key-value-pair"
                        >
                          <p-text-input
                            :value="kv.key"
                            @input="kv.key = $event"
                            placeholder="Key"
                            :size="'sm'"
                            class="key-input"
                          />
                          <p-text-input
                            :value="kv.value"
                            @input="kv.value = $event"
                            placeholder="Value"
                            :size="'sm'"
                            class="value-input"
                          />
                          <p-icon-button
                            icon="ic_minus"
                            :size="'sm'"
                            @click="element.context.model.value.splice(kvIndex, 1)"
                          />
                        </div>
                        <p-button
                          :style-type="'secondary'"
                          icon-left="ic_plus"
                          :size="'sm'"
                          @click="element.context.model.value.push({ key: '', value: '' })"
                        >
                          Add Key-Value
                        </p-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </CommonAccordion>
        </div>
      </div>
    </div>
    <div v-else-if="isInitialized" class="form-context-box w-full">
      <div class="subject-title border-bottom">Body Params</div>
      <div class="no-required-message">
        <p class="text-gray-500 text-sm">no required</p>
      </div>
    </div>

    <!-- Shortcut Menu -->
    <SequentialShortCut
      :open="shortCutModel.open"
      :x-pos="shortCutModel.xPos"
      :y-pos="shortCutModel.yPos"
      :items="[
        {
          label: shortCutModel.delete.label,
          callback: shortCutModel.delete.callback,
        },
      ]"
      @close="closeShortCut"
    />
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
    display: flex;
    width: 100%;
    min-width: 0;
    
    .field-title-box {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;
      height: 44px;
      font-size: 14px;
      font-weight: 700;
      padding: 6px 16px 6px 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      
      &.required-field {
        color: #e53e3e;
      }
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
}

.border-bottom {
  border-bottom: 1px solid;
  @apply border-gray-200;
}

.subject-title {
  @apply pr-[16px] pl-[16px] mt-[16px] h-[44px] flex justify-between items-center text-gray-500;
}

.title-with-asterisk {
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-asterisk {
  color: #e53e3e;
  margin-left: 4px;
}

.json-field-indicator {
  color: #3182ce;
  font-size: 0.75rem;
  margin-left: 8px;
  font-weight: 500;
}

.json-field-help {
  margin-top: 4px;
  color: #6b7280;
  font-style: italic;
}

.skip-reason {
  margin-top: 4px;
  padding: 4px 8px;
  background-color: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 4px;
  color: #92400e;
}

select.invalid {
  border-color: #e53e3e !important;
  box-shadow: 0 0 0 1px #e53e3e;
}

.skip-reason-inline {
  color: #6b7280;
  font-size: 0.75rem;
  margin-left: 8px;
  font-style: italic;
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 3px;
}

.field-description {
  @apply text-xs text-gray-500 px-4 py-2;
  background-color: #f9fafb;  /* Equivalent to bg-gray-50 */
  border-left: 3px solid #e5e7eb;
  margin: 8px 0;
}

/* Field title with hover tooltip */
.field-title {
  cursor: help;
  border-bottom: 1px dotted #9ca3af;
  position: relative;
}

.field-title:hover {
  color: #3b82f6;
}

/* Nested object styling */
.nested-object-content {
  margin-left: 12px;
  border-left: 2px solid #e5e7eb;
  padding-left: 8px;
}

.nested-field {
  margin-bottom: 8px;
  
  .field-group {
    display: flex;
    width: 100%;
    min-width: 0;
    
    .field-title-box {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;
      height: 44px;
      font-size: 14px;
      font-weight: 700;
      padding: 6px 16px 6px 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      
      &.required-field {
        color: #e53e3e;
      }
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
}

.nested-field:last-child {
  margin-bottom: 0;
}

/* Nested array styling */
.nested-object-field {
  margin: 8px 0;
}

.nested-accordion-field {
  margin: 8px 0;
  
  .accordion-box {
    .item-content.field-group {
      border-color: transparent;
      display: flex;
      width: 100%;
      min-width: 0;

      .field-title-box {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        height: 44px;
        font-size: 14px;
        font-weight: 700;
        padding: 6px 16px 6px 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        
        &.required-field {
          color: #e53e3e;
        }
      }

      .field-content-box {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 300px;
        min-width: 300px;
        max-width: 300px;
        height: 44px;
        padding: 6px 16px 6px 10px;
        flex-shrink: 0;
      }
    }

    .item-content.field-group:last-child {
      border-color: inherit;
    }
  }
  
  /* 중첩 배열 필드들에 대한 스타일 */
  .field-group {
    display: flex;
    width: 100%;
    min-width: 0;
    
    .field-title-box {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;
      height: 44px;
      font-size: 14px;
      font-weight: 700;
      padding: 6px 16px 6px 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      
      &.required-field {
        color: #e53e3e;
      }
    }

    .field-content-box {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: 300px;
      min-width: 300px;
      max-width: 300px;
      height: 44px;
      padding: 6px 16px 6px 10px;
      flex-shrink: 0;
    }
  }
  
  /* nested-accordion-field 내부의 accordion-actions 스타일 */
  .accordion-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    width: 100%;
    margin-left: auto;
  }
}

/* nested-accordion-field level-2 스타일 (중첩 배열 필드들) */
.nested-accordion-field.level-2 {
  margin: 8px 0;
  width: 100% !important;
  min-width: 0;
  
  .accordion-box {
    width: 100% !important;
    min-width: 0;
    
    .item-content.field-group {
      border-color: transparent;
      display: flex;
      width: 100% !important;
      min-width: 0;

      .field-title-box {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        height: 44px;
        font-size: 14px;
        font-weight: 700;
        padding: 6px 16px 6px 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        
        &.required-field {
          color: #e53e3e;
        }
      }

      .field-content-box {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 300px !important;
        min-width: 300px !important;
        max-width: 300px !important;
        height: 44px;
        padding: 6px 16px 6px 10px;
        flex-shrink: 0;
      }
    }

    .item-content.field-group:last-child {
      border-color: inherit;
    }
  }
  
  .accordion-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    width: 100%;
    margin-left: auto;
  }
  
  /* field-group에 대한 직접적인 스타일 적용 */
  .field-group {
    display: flex !important;
    width: 100% !important;
    min-width: 0;
    
    .field-title-box {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;
      height: 44px;
      font-size: 14px;
      font-weight: 700;
      padding: 6px 16px 6px 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      
      &.required-field {
        color: #e53e3e;
      }
    }

    .field-content-box {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: 300px !important;
      min-width: 300px !important;
      max-width: 300px !important;
      height: 44px;
      padding: 6px 16px 6px 10px;
      flex-shrink: 0;
    }
  }
}

.nested-object-title {
  font-weight: 600;
  margin-bottom: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.nested-sub-field {
  margin: 4px 0;
}

.nested-sub-field:last-child {
  margin-bottom: 0;
}

.empty-accordion {
  padding: 16px;
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

/* Nested level styling */
.level-3 {
  margin-left: 8px;
  border-left: 2px solid #e5e7eb;
  padding-left: 6px;
}

/* level-3 accordion-part 스타일 */
.accordion-part.level-3 {
  margin: 8px 0;
  
  .accordion-box {
    .item-content.field-group {
      border-color: transparent;
      display: flex;
      width: 100%;
      min-width: 0;

      .field-title-box {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        height: 44px;
        font-size: 14px;
        font-weight: 700;
        padding: 6px 16px 6px 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        
        &.required-field {
          color: #e53e3e;
        }
      }

      .field-content-box {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 300px;
        min-width: 300px;
        max-width: 300px;
        height: 44px;
        padding: 6px 16px 6px 10px;
        flex-shrink: 0;
      }
    }

    .item-content.field-group:last-child {
      border-color: inherit;
    }
  }
  
  .accordion-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    width: 100%;
    margin-left: auto;
  }
}

.level-4 {
  margin-left: 16px;
  border-left: 2px solid #d1d5db;
  padding-left: 6px;
}

.nested-sub-sub-field {
  margin: 4px 0;
}

.nested-sub-sub-field:last-child {
  margin-bottom: 0;
}

/* Accordion styling */
.accordion-part {
  margin: 16px 0;
}

.accordion-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-with-asterisk {
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.accordion-header) {
  border-color: transparent;
}

.accordion-box {
  .item-content.field-group {
    border-color: transparent;
    display: flex !important;
    width: 100% !important;
    min-width: 0;

    .field-title-box {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;
      height: 44px;
      font-size: 14px;
      font-weight: 700;
      padding: 6px 16px 6px 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      
      &.required-field {
        color: #e53e3e;
      }
    }

    .field-content-box {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: 300px !important;
      min-width: 300px !important;
      max-width: 300px !important;
      height: 44px;
      padding: 6px 16px 6px 10px;
      flex-shrink: 0;
    }
  }

  .item-content.field-group:last-child {
    border-color: inherit;
  }
}

/* 중첩 배열 내부의 모든 필드에 대한 강제 스타일 적용 */
.accordion-item-content .field-group {
  display: flex !important;
  width: 100% !important;
  min-width: 0;
  
  .field-title-box {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    height: 44px;
    font-size: 14px;
    font-weight: 700;
    padding: 6px 16px 6px 20px !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    &.required-field {
      color: #e53e3e;
    }
  }

  .field-content-box {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 300px !important;
    min-width: 300px !important;
    max-width: 300px !important;
    height: 44px;
    padding: 6px 16px 6px 10px !important;
    flex-shrink: 0;
  }
}

/* routingTable 등 더 깊은 중첩 레벨의 필드들에 대한 강제 스타일 적용 */
.accordion-item-content .accordion-item-content .field-group {
  display: flex !important;
  width: 100% !important;
  min-width: 0;
  
  .field-title-box {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    height: 44px;
    font-size: 14px;
    font-weight: 700;
    padding: 6px 16px 6px 20px !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    &.required-field {
      color: #e53e3e;
    }
  }

  .field-content-box {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 300px !important;
    min-width: 300px !important;
    max-width: 300px !important;
    height: 44px;
    padding: 6px 16px 6px 10px !important;
    flex-shrink: 0;
  }
}

/* level-3 중첩 레벨의 필드들에 대한 강제 스타일 적용 */
.nested-accordion-field.level-3 .field-group {
  display: flex !important;
  width: 100% !important;
  min-width: 0;
  
  .field-title-box {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    height: 44px;
    font-size: 14px;
    font-weight: 700;
    padding: 6px 16px 6px 20px !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    &.required-field {
      color: #e53e3e;
    }
  }

  .field-content-box {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 300px !important;
    min-width: 300px !important;
    max-width: 300px !important;
    height: 44px;
    padding: 6px 16px 6px 10px !important;
    flex-shrink: 0;
  }
}

/* level-2 중첩 레벨의 필드들에 대한 강제 스타일 적용 */
.nested-accordion-field.level-2 .field-group {
  display: flex !important;
  width: 100% !important;
  min-width: 0;
  
  .field-title-box {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    height: 44px;
    font-size: 14px;
    font-weight: 700;
    padding: 6px 16px 6px 20px !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    &.required-field {
      color: #e53e3e;
    }
  }

  .field-content-box {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 300px !important;
    min-width: 300px !important;
    max-width: 300px !important;
    height: 44px;
    padding: 6px 16px 6px 10px !important;
    flex-shrink: 0;
  }
}

.accordion-item-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.accordion-item-content {
  .item-content.field-group {
    border-color: transparent;
    display: flex;
    width: 100%;
    min-width: 0;

    .field-title-box {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;
      height: 44px;
      font-size: 14px;
      font-weight: 700;
      padding: 6px 16px 6px 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      
      &.required-field {
        color: #e53e3e;
      }
    }

    .field-content-box {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: 300px;
      min-width: 300px;
      max-width: 300px;
      height: 44px;
      padding: 6px 16px 6px 10px;
      flex-shrink: 0;
    }
  }

  .item-content.field-group:last-child {
    border-color: inherit;
  }
}

/* 체크박스 스타일 조정 */
:deep(.p-checkbox) {
  margin-top: 8px;
}

/* Key-Value Input 스타일 */
.key-value-input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.key-value-pair {
  display: flex;
  gap: 8px;
  align-items: center;
}

.key-input {
  flex: 1;
}

.value-input {
  flex: 1;
}

/* Debug info styling */
.debug-info {
  margin-top: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
}

.debug-info pre {
  background-color: #ffffff;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.debug-accordion-info {
  padding: 8px;
  background-color: #e0f2fe;
  border: 1px solid #81d4fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

.debug-accordion-info small {
  color: #0277bd;
  font-weight: 600;
}

/* Unknown Type Field Styling */
.unknown-type-part {
  margin: 16px 0;
}

.unknown-type-indicator {
  color: #dc2626;
  font-size: 0.75rem;
  margin-left: 8px;
  font-weight: 500;
  background-color: #fef2f2;
  padding: 2px 6px;
  border-radius: 3px;
  border: 1px solid #fecaca;
}

.unknown-type-content {
  margin: 16px;
  padding: 12px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #991b1b;
}

.unknown-type-line {
  margin-bottom: 8px;
  font-size: 0.875rem;
}

.no-required-message {
  padding: 16px;
  text-align: center;
}

.component-name-value {
  display: flex;
  align-items: center;
  height: 44px;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.unknown-type-line:last-child {
  margin-bottom: 0;
}
</style>
