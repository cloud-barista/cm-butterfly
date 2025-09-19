<script setup lang="ts">
import { PTextInput, PIconButton } from '@cloudforet-test/mirinae';
import { onBeforeMount, onBeforeUnmount, ref, watch, computed } from 'vue';
import { useGrasshopperTaskEditorModel } from '@/features/sequential/designer/editor/model/grasshopperTaskEditorModel';
import SequentialShortCut from '@/features/sequential/designer/shortcut/ui/SequentialShortCut.vue';
import JsonDataTree from '@/shared/ui/Tree/JsonDataTree.vue';
import JsonDataFormTree from '@/shared/ui/Tree/JsonDataFormTree.vue';
import { Step } from '@/features/workflow/workflowEditor/model/types';

interface IProps {
  step: Step;
}

const props = defineProps<IProps>();
const emit = defineEmits([
  'saveComponentName',
  'saveContext',
  'saveFixedModel',
]);

const taskEditorModel = useGrasshopperTaskEditorModel();
const shortCutModel = ref({
  open: false,
  xPos: 0,
  yPos: 0,
  delete: {
    label: 'Delete',
    callback: function () {},
  },
});
const editorFormElement = ref(null);
const jsonDataFormTreeRef = ref(null);

onBeforeMount(() => {
  // softwareModel 데이터 설정
  if (props.step.properties.model) {
    console.log('SoftwareModelEditor - Model 설정:', props.step.properties.model);
    taskEditorModel.setGrasshopperBodyParamsContext(props.step.properties.model);
  }
  
  if (props.step.properties.fixedModel) {
    taskEditorModel.setParamsContext(props.step.properties.fixedModel);
  }

  taskEditorModel.setComponentName(props.step.name);

  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

watch(
  taskEditorModel.componentNameModel,
  nv => {
    if (nv.context.model.value !== '') {
      emit('saveComponentName', nv.context.model.value);
    }
  },
  { deep: true },
);

watch(
  taskEditorModel.formContext,
  nv => {
    if (nv) {
      const convertedData = taskEditorModel.convertGrasshopperFormModelToStepProperties();
      emit('saveContext', convertedData);
    }
  },
  { deep: true },
);

watch(
  taskEditorModel.paramsContext,
  () => {
    emit(
      'saveFixedModel',
      taskEditorModel.convertParamsModelToStepProperties(),
    );
  },
  { deep: true },
);

function openShortCut(e) {
  shortCutModel.value.open = true;
  shortCutModel.value.xPos = e.offsetX + e.target.offsetLeft;
  shortCutModel.value.yPos = e.offsetY + e.target.offsetTop;
}

function closeShortCut() {
  shortCutModel.value.open = false;
}

function deleteEntity(e, index) {
  e.preventDefault();
  shortCutModel.value.delete.callback = () =>
    taskEditorModel.deleteEntity(index);
  openShortCut(e);
}

function deleteArrayElement(
  e: MouseEvent,
  targetArr: Array<any>,
  targetIndex: number,
) {
  e.preventDefault();
  shortCutModel.value.delete.callback = () =>
    taskEditorModel.deleteArrayElement(targetArr, targetIndex);
  openShortCut(e);
}

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


// Vue 2 호환 헬퍼 함수들
function getFieldTitle(field: any) {
  try {
    if (field && field.context) {
      return field.context.title || field.context.subject || 'Field';
    }
    return 'Field';
  } catch (error) {
    console.error('getFieldTitle error:', error);
    return 'Field';
  }
}

function hasFieldModel(field: any) {
  try {
    return field && field.context && field.context.model;
  } catch (error) {
    console.error('hasFieldModel error:', error);
    return false;
  }
}

function getFieldModel(field: any) {
  try {
    if (field && field.context && field.context.model) {
      return field.context.model;
    }
    return { value: '', isValid: true, onBlur: () => {} };
  } catch (error) {
    console.error('getFieldModel error:', error);
    return { value: '', isValid: true, onBlur: () => {} };
  }
}

// string[] 패턴을 저장할 변수
const foundStringArrayPatterns = ref<string[]>([]);

// string[] 패턴 확인 함수
const checkStringArrayPatterns = () => {
  console.log('checkStringArrayPatterns called');
  console.log('Found string[] patterns:', foundStringArrayPatterns.value);
  alert(`Found string[] patterns: ${foundStringArrayPatterns.value.join(', ')}`);
  return foundStringArrayPatterns.value;
};

// JsonDataFormTree에서 패턴을 받는 함수
const handleStringArrayPatternsFound = (patterns: string[]) => {
  foundStringArrayPatterns.value = patterns;
  console.log('Received string[] patterns from JsonDataFormTree:', patterns);
};

// JsonDataTree 노드 클릭 처리
function handleNodeClick(node: any) {
  try {
    console.log('클릭된 노드:', node);
    // 필요시 추가 로직 구현
  } catch (error) {
    console.error('handleNodeClick error:', error);
  }
}

// JsonDataFormTree 필드 업데이트 처리
function handleFieldUpdate(event: any) {
  try {
    console.log('필드 업데이트:', event);
    // 필요시 추가 로직 구현
  } catch (error) {
    console.error('handleFieldUpdate error:', error);
  }
}

// JsonDataFormTree 배열 아이템 추가 처리
function handleArrayItemAdd(node: any) {
  try {
    console.log('배열 아이템 추가:', node);
    // 필요시 추가 로직 구현
  } catch (error) {
    console.error('handleArrayItemAdd error:', error);
  }
}

// JsonDataFormTree 필드 삭제 처리
function handleFieldDelete(node: any) {
  try {
    console.log('필드 삭제:', node);
    // 필요시 추가 로직 구현
  } catch (error) {
    console.error('handleFieldDelete error:', error);
  }
}


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
    <!-- Component Name -->
    <div class="step-name-box w-full">
      <div class="subject-title border-bottom">Component Name</div>
      <div class="field-group flex border-bottom">
        <div class="field-title-box">
          {{ taskEditorModel.componentNameModel.value.context.title }}
        </div>
        <div class="field-content-box">
          <p-text-input
            v-model="
              taskEditorModel.componentNameModel.value.context.model.value
            "
            :size="'md'"
            block
            readonly
          ></p-text-input>
        </div>
      </div>
    </div>

    <!-- Params Context -->
    <div
      v-for="(currentParams, index) of taskEditorModel.paramsContext.value"
      :key="index"
    >
      <div class="params-box w-full h-full">
        <div v-if="currentParams.type === 'params'">
          <div v-if="currentParams.context.values.length > 0">
            <div class="subject-title border-bottom">
              {{ currentParams.context.subject }}
            </div>
            <div
              v-for="(entity, j) of currentParams.context.values"
              :key="j"
              class="field-group flex border-bottom"
            >
              <div v-if="entity.type === 'input'" class="field-title-box">
                {{ entity.context.title }}
              </div>
              <div class="field-content-box">
                <p-text-input
                  v-model="entity.context.model.value"
                  :size="'md'"
                  block
                  :invalid="!entity.context.model.isValid"
                  :readonly="entity.context.title === 'nsId'"
                  @blur="entity.context.model.onBlur"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Target Software Model 최상위 -->
    <div
      v-for="(currentContext, index) of taskEditorModel.formContext.value"
      :key="index"
    >
      <!-- targetSoftwareModel 표시 -->
      <div
        v-if="currentContext.type === 'targetSoftwareModel'"
        class="params-box w-full h-full"
      >
        <div class="subject-title border-bottom">
          {{ currentContext.context.subject }}
          <button 
            @click="checkStringArrayPatterns" 
            style="margin-left: 10px; padding: 4px 8px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            Check String[] Patterns
          </button>
        </div>
        
        <!-- targetSoftwareModel은 JsonDataFormTree로 표시 -->
        <JsonDataFormTree
          ref="jsonDataFormTreeRef"
          :json-data="currentContext.context"
          :show-values="true"
          :max-depth="20"
          @node-click="handleNodeClick"
          @field-update="handleFieldUpdate"
          @array-item-add="handleArrayItemAdd"
          @field-delete="handleFieldDelete"
          @string-array-patterns-found="handleStringArrayPatternsFound"
        />
      </div>
    </div>

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
    .field-title-box {
      display: flex;
      align-items: center;
      width: 200px;
      height: 44px;
      font-size: 14px;
      font-weight: 700;
      padding: 6px 16px 6px 16px;
    }

    .field-content-box {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 310px;
      height: 44px;
      padding: 6px 16px 6px 16px;
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

/* Target Software Model 전용 스타일 */
.target-software-model-box {
  margin: 8px 0;
  padding: 8px;
  background-color: #f0f9ff;
  border-left: 3px solid #0ea5e9;
  border-radius: 4px;
}

/* Migration List Accordion 전용 스타일 */
.migration-list-accordion {
  margin: 8px 0;
  padding: 8px;
  background-color: #f8fafc;
  border-left: 3px solid #3b82f6;
  border-radius: 4px;
}

/* Binaries Accordion 전용 스타일 */
.binaries-accordion {
  margin: 8px 0;
  padding: 8px;
  background-color: #f0fdf4;
  border-left: 3px solid #10b981;
  border-radius: 4px;
}

/* Binary Sub Item 스타일 */
.binary-sub-item {
  margin: 8px 0;
  padding: 8px;
  background-color: #f9fafb;
  border-left: 2px solid #6b7280;
  border-radius: 4px;
}

.binary-array-content {
  margin-top: 8px;
}

/* Servers List 전용 스타일 */
.servers-list-section {
  margin: 8px 0;
  padding: 8px;
  background-color: #f0f9ff;
  border-left: 3px solid #0ea5e9;
  border-radius: 4px;
}

.server-item {
  margin: 8px 0;
  padding: 8px;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

:deep(.accordion-item) {
  border-color: transparent;
}

:deep(.accordion-content) {
  padding-left: 0;
}

:deep(.accordion-header) {
  border-color: transparent;
}

.accordion-box {
  .item-content.field-group {
    border-color: transparent;

    .field-title-box {
      padding-left: 40px;
    }
  }

  .field-content-box {
    padding-left: 10px;
  }

  .item-content.field-group:last-child {
    border-color: inherit;
  }
}
</style>
