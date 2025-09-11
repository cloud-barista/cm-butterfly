<script setup lang="ts">
import { PButton, PIconButton, PTextInput } from '@cloudforet-test/mirinae';
import Vue, {
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  onUpdated,
  reactive,
  ref,
  toRef,
  UnwrapRef,
  watch,
} from 'vue';
import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import { useGrasshopperTaskEditorModel } from '@/features/sequential/designer/editor/model/grasshopperTaskEditorModel';
import BAccordion from '@/shared/ui/Input/Accordian/BAccordion.vue';
import SequentialShortCut from '@/features/sequential/designer/shortcut/ui/SequentialShortCut.vue';
import { Step } from '@/features/workflow/workflowEditor/model/types.ts';

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

// Props에서 받아온 정보 로그
console.log('=== Props 정보 ===');
console.log('props.step:', props.step);
console.log('props.step.properties:', props.step.properties);
console.log('props.step.properties.model:', props.step.properties.model);
console.log('props.step.properties.fixedModel:', props.step.properties.fixedModel);
console.log('props.step.name:', props.step.name);

// taskEditorModel 초기 상태 로그
console.log('=== taskEditorModel 초기 상태 ===');
console.log('taskEditorModel:', taskEditorModel);
console.log('taskEditorModel.componentNameModel:', taskEditorModel.componentNameModel);
console.log('taskEditorModel.formContext:', taskEditorModel.formContext);
console.log('taskEditorModel.paramsContext:', taskEditorModel.paramsContext);
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
let shortCut;

onBeforeMount(() => {
  console.log('=== onBeforeMount 시작 ===');
  
  // Form Context 설정
  console.log('props.step.properties.model 설정 전:', props.step.properties.model);
  taskEditorModel.setFormContext(props.step.properties.model ?? '');
  console.log('Form Context 설정 후:', taskEditorModel.formContext.value);
  
  // Params Context 설정
  if (props.step.properties.fixedModel) {
    console.log('props.step.properties.fixedModel 설정 전:', props.step.properties.fixedModel);
    taskEditorModel.setParamsContext(props.step.properties.fixedModel);
    console.log('Params Context 설정 후:', taskEditorModel.paramsContext.value);
  }

  // Component Name 설정
  console.log('props.step.name 설정 전:', props.step.name);
  taskEditorModel.setComponentName(props.step.name);
  console.log('Component Name 설정 후:', taskEditorModel.componentNameModel.value);

  console.log('=== onBeforeMount 완료 ===');
  console.log('최종 taskEditorModel 상태:', {
    componentNameModel: taskEditorModel.componentNameModel.value,
    formContext: taskEditorModel.formContext.value,
    paramsContext: taskEditorModel.paramsContext.value
  });

  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
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
    emit('saveContext', taskEditorModel.convertFormModelToStepProperties());
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

</script>

<template>
  <div
    class="task-editor-form"
    ref="editorFormElement"
    @click.right="
      e => {
        e.preventDefault();
      }
    "
  >
    <div class="step-name-box w-full">
      <div class="subject-title border-bottom">Component Name</div>
      <div class="field-group flex border-bottom">
        <div class="field-title-box">
          {{ taskEditorModel.componentNameModel.value.context.title }}
        </div>
        <div class="field-content-box">
          <p-text-input
            v-model="taskEditorModel.componentNameModel.value.context.model.value"
            :size="'md'"
            block
            readonly
          ></p-text-input>
        </div>
      </div>
    </div>
    <div>
      <div class="params-box w-full h-full">
        <!-- Path Params -->
        <div v-if="taskEditorModel.paramsContext.value?.path_params && taskEditorModel.paramsContext.value.path_params.context.values.length > 0">
          <div class="subject-title border-bottom">
            {{ taskEditorModel.paramsContext.value.path_params.context.subject }}
          </div>
          <div
            v-for="(param, paramIndex) of taskEditorModel.paramsContext.value.path_params.context.values"
            :key="paramIndex"
            class="field-group flex border-bottom"
          >
            <div class="field-title-box">
              {{ param.context.title }}
            </div>
            <div class="field-content-box">
              <p-text-input
                v-model="param.context.model.value"
                :size="'md'"
                block
                :invalid="!param.context.model.isValid"
                :readonly="param.context.title === 'nsId'"
                @blur="param.context.model.onBlur"
              ></p-text-input>
            </div>
          </div>
        </div>
        
        <!-- Query Params -->
        <div v-if="taskEditorModel.paramsContext.value?.query_params && taskEditorModel.paramsContext.value.query_params.context.values.length > 0">
          <div class="subject-title border-bottom">
            {{ taskEditorModel.paramsContext.value.query_params.context.subject }}
          </div>
          <div
            v-for="(param, paramIndex) of taskEditorModel.paramsContext.value.query_params.context.values"
            :key="paramIndex"
            class="field-group flex border-bottom"
          >
            <div class="field-title-box">
              {{ param.context.title }}
            </div>
            <div class="field-content-box">
              <p-text-input
                v-model="param.context.model.value"
                :size="'md'"
                block
                :invalid="!param.context.model.isValid"
                :readonly="param.context.title === 'nsId'"
                @blur="param.context.model.onBlur"
              ></p-text-input>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Form Context -->
    <div v-for="(formData, index) of taskEditorModel.formContext.value" :key="index">
      <!-- Entity Context -->
      <div v-if="formData.type === 'entity'" class="entity-box w-full h-full">
        <div class="subject-title border-bottom">
          {{ formData.context.subject }}
        </div>
        <div
          v-for="(field, fieldIndex) of formData.context.values" 
          :key="fieldIndex"
          class="field-group flex border-bottom"
        >
          <div class="field-row">
            <div class="field-title-box">
              {{ field.context.title }}
          </div>
          <div class="field-content-box">
              <p-text-input v-if="field.context.model && field.context.model.value !== undefined" v-model="field.context.model.value"></p-text-input>
              <p-text-input v-else></p-text-input>
            </div>
          </div>
        </div>
      </div>

      <!-- Array Context (servers) -->
      <div v-else-if="formData.type === 'array'" class="array-box w-full h-full">
        <div class="subject-title border-bottom">
          {{ formData.context.subject }}
        </div>
        <div 
          v-for="(item, itemIndex) of formData.context.values" 
          :key="itemIndex"
          class="array-item"
        >
          <!-- Nested Object (Server) -->
          <div v-if="item.type === 'nestedObject'" class="nested-object-box">
            <div class="subject-title border-bottom">
              {{ item.context.subject }}
            </div>
            <div 
              v-for="(field, fieldIndex) of item.context.values.filter(f => f.context.title !== 'errors' && f.context.subject !== 'errors')" 
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
                    <p-text-input v-if="field.context.model && field.context.model.value !== undefined" v-model="field.context.model.value"></p-text-input>
                    <p-text-input v-else></p-text-input>
                  </div>
                </div>
              </div>
              <!-- ArrayContext인 경우 (migration_list) -->
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
                    <!-- InputContext인 경우 -->
                    <div v-if="arrayItem.type === 'input'" class="field-group flex">
                      <div class="field-row">
                        <div class="field-title-box">
                          {{ arrayItem.context.title }}
                        </div>
                        <div class="field-content-box">
                          <p-text-input v-if="arrayItem.context.model && arrayItem.context.model.value !== undefined" v-model="arrayItem.context.model.value"></p-text-input>
                          <p-text-input v-else></p-text-input>
                        </div>
                      </div>
                    </div>
                    <!-- NestedObjectContext인 경우 (migration_list의 각 항목) -->
                    <div v-else-if="arrayItem.type === 'nestedObject'">
                      <div class="subject-title border-bottom">
                        {{ arrayItem.context.subject }}
            </div>
                      <div 
                        v-for="(nestedField, nestedIndex) of arrayItem.context.values" 
                        :key="nestedIndex"
                        class="field-group-vertical border-bottom"
                      >
                        <div v-if="nestedField.type === 'input'" class="field-group flex">
                          <div class="field-row">
                            <div class="field-title-box">
                              {{ nestedField.context.title }}
                            </div>
                            <div class="field-content-box">
                              <p-text-input v-if="nestedField.context.model && nestedField.context.model.value !== undefined" v-model="nestedField.context.model.value"></p-text-input>
                              <p-text-input v-else></p-text-input>
                            </div>
                          </div>
                        </div>
                        <!-- ArrayContext인 경우 (binaries, containers, kubernetes) -->
                        <div v-else-if="nestedField.type === 'array'" class="field-group-vertical">
                          <div class="field-title-box">
                            {{ nestedField.context.subject }}
                          </div>
                          <div class="field-content-box">
                            <div 
                              v-for="(subArrayItem, subArrayIndex) of nestedField.context.values" 
                              :key="subArrayIndex"
                              class="array-item"
                            >
                              <div v-if="subArrayItem.type === 'input'">
                  <div class="field-title-box">
                                  {{ subArrayItem.context.title }}
                                </div>
                                <div class="field-content-box">
                                  <p-text-input v-if="subArrayItem.context.model && subArrayItem.context.model.value !== undefined" v-model="subArrayItem.context.model.value"></p-text-input>
                                  <p-text-input v-else></p-text-input>
                                </div>
                              </div>
                            </div>
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
                    class="field-group-vertical border-bottom"
                  >
                    <!-- InputContext인 경우 -->
                    <div v-if="nestedField.type === 'input'" class="field-group flex">
                      <div class="field-row">
                        <div class="field-title-box">
                          {{ nestedField.context.title }}
                        </div>
                        <div class="field-content-box">
                          <p-text-input v-if="nestedField.context.model && nestedField.context.model.value !== undefined" v-model="nestedField.context.model.value"></p-text-input>
                          <p-text-input v-else></p-text-input>
                        </div>
                      </div>
                    </div>
                    <!-- ArrayContext인 경우 (migration_list 내부의 binaries, containers, kubernetes) -->
                    <div v-else-if="nestedField.type === 'array'" class="field-group-vertical">
                      <div class="field-title-box">
                        {{ nestedField.context.subject }}
                      </div>
                      <div class="field-content-box migration-list-box">
                        <!-- migration_list 내부의 모든 배열들을 순차적으로 표시 -->
                        <div 
                          v-for="(arrayItem, arrayIndex) of nestedField.context.values" 
                          :key="arrayIndex"
                          class="migration-array-item"
                        >
                          <!-- InputContext인 경우 -->
                          <div v-if="arrayItem.type === 'input'" class="field-group flex">
                            <div class="field-row">
                              <div class="field-title-box">
                                {{ arrayItem.context.title }}
                              </div>
                              <div class="field-content-box">
                                <p-text-input v-if="arrayItem.context.model && arrayItem.context.model.value !== undefined" v-model="arrayItem.context.model.value"></p-text-input>
                                <p-text-input v-else></p-text-input>
                              </div>
                            </div>
                          </div>
                          <!-- NestedObjectContext인 경우 (binaries, containers, kubernetes의 각 항목) -->
                          <div v-else-if="arrayItem.type === 'nestedObject'">
                            <div class="subject-title border-bottom">
                              {{ arrayItem.context.subject }}
                            </div>
                            <div 
                              v-for="(subNestedField, subNestedIndex) of arrayItem.context.values" 
                              :key="subNestedIndex"
                              class="field-group-vertical border-bottom"
                            >
                              <div v-if="subNestedField.type === 'input'" class="field-group flex">
                                <div class="field-row">
                                  <div class="field-title-box">
                                    {{ subNestedField.context.title }}
                                  </div>
                                  <div class="field-content-box">
                                    <p-text-input v-if="subNestedField.context.model && subNestedField.context.model.value !== undefined" v-model="subNestedField.context.model.value"></p-text-input>
                                    <p-text-input v-else></p-text-input>
                                  </div>
                                </div>
                              </div>
                              <!-- ArrayContext인 경우 (custom_configs, custom_data_paths, needed_libraries) -->
                              <div v-else-if="subNestedField.type === 'array'" class="field-group-vertical">
                                <div class="field-title-box">
                                  {{ subNestedField.context.subject }}
                                </div>
                                <div class="field-content-box">
                                  <div 
                                    v-for="(subArrayItem, subArrayIndex) of subNestedField.context.values" 
                                    :key="subArrayIndex"
                                    class="array-item"
                                  >
                                    <div v-if="subArrayItem.type === 'input'" class="field-group flex">
                                      <div class="field-row">
                                        <div class="field-title-box">
                                          {{ subArrayItem.context.title }}
                                        </div>
                                        <div class="field-content-box">
                                          <p-text-input v-if="subArrayItem.context.model && subArrayItem.context.model.value !== undefined" v-model="subArrayItem.context.model.value"></p-text-input>
                                          <p-text-input v-else></p-text-input>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                </div>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
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
    ></SequentialShortCut>
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
      align-items: flex-start;
      width: 310px;
      min-height: 44px;
      padding: 6px 16px 6px 16px;
    }
    
    .json-textarea {
      width: 100%;
      height: 200px;
      padding: 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      line-height: 1.4;
      resize: vertical;
      background-color: #f9fafb;
    }
    
    .json-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 1px #3b82f6;
    }
  }
}

.border-bottom {
  border-bottom: 1px solid;
  @apply border-gray-200;
}

.subject-title {
  @apply pr-[16px] pl-[16px] mt-[16px] h-[44px] text-gray-500;
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

.software-model-box {
  margin-bottom: 20px;
}

.array-box {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  
  .array-item {
    margin-bottom: 15px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px;
    background-color: #f9fafb;
    width: 100%;
  }
}

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

.migration-list-box {
  display: flex;
  flex-direction: column;
  width: 100%;
  
  .migration-array-item {
    margin-bottom: 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 8px;
    background-color: #f8fafc;
    width: 100%;
    display: flex;
    flex-direction: column;
    
    .field-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 5px;
      
      .field-title-box {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 2px;
      }
      
      .field-content-box {
        width: 100%;
      }
    }
  }
}

/* migration_list 내부의 field-group은 세로 배치 */
.array-item .field-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
  
  .field-title-box {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 2px;
  }
  
  .field-content-box {
    width: 100%;
  }
}
</style>
