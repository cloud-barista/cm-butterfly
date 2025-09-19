<script setup lang="ts">
import {
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
import { useGrasshopperTaskEditorModel } from '@/features/sequential/designer/editor/model/grasshopperTaskEditorModel';
import DepthField from '@/features/sequential/designer/editor/components/DepthField.vue';
import SequentialShortCut from '@/features/sequential/designer/shortcut/ui/SequentialShortCut.vue';
import ObjectArray from '@/shared/ui/Input/ObjectArray/ObjectArray.vue';
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

// depth 0에서 array 타입인지 확인하는 함수
function isDepthZeroArray(formData: any): boolean {
  console.log('=== isDepthZeroArray 확인 ===');
  console.log('formData.type:', formData.type);
  console.log('formData.context.subject:', formData.context.subject);
  
  // subject에서 depth 정보를 확인 (예: "[d-sub-0-array] key" 형태)
  const isArray = formData.type === 'array';
  const hasDepthZero = formData.context.subject.includes('[d-sub-0-array]');
  
  console.log('isArray:', isArray);
  console.log('hasDepthZero:', hasDepthZero);
  console.log('최종 결과:', isArray && hasDepthZero);
  
  return isArray && hasDepthZero;
}

// ArrayContext를 ObjectArrayContext로 변환하는 함수 (depth 4까지 처리)
function convertToObjectArrayContext(formData: any) {
  console.log('=== convertToObjectArrayContext 시작 ===');
  console.log('formData:', formData);
  console.log('formData.context.values:', formData.context.values);
  
  const subject = formData.context.subject.replace(/^\[d-sub-\d+-array\] /, '') + ' [depth-0-array]';
  
  // depth 4까지만 표시하기 위해 values를 ObjectContext로 변환
  const items = formData.context.values.map((item: any, index: number) => {
    console.log(`=== 아이템 ${index} 처리 시작 ===`);
    console.log('item:', item);
    console.log('item.type:', item.type);
    console.log('item.context:', item.context);
    
    if (item.type === 'nestedObject') {
      // nestedObject를 ObjectContext로 변환 (depth 3까지 처리)
      const fields = item.context.values.map((field: any) => {
        if (field.type === 'input') {
          return {
            type: 'keyValue',
            key: field.context.title.replace(/^\[d-tit-\d+-\w+\] /, ''),
            value: field.context.model
          };
        } else if (field.type === 'keyValueInput') {
          // KeyValueInputContext 처리
          return {
            type: 'keyValue',
            key: (field.context.title.value || 'key'),
            value: field.context.model
          };
        } else if (field.type === 'nestedObject') {
          // depth 2의 nestedObject 처리
          console.log('=== depth 2 nestedObject 처리 시작 ===');
          console.log('field:', field);
          console.log('field.context.values:', field.context.values);
          
          const nestedFields = field.context.values.map((nestedField: any) => {
            console.log('nestedField 처리:', nestedField.type, nestedField);
            
            if (nestedField.type === 'input') {
              return {
                type: 'keyValue',
                key: nestedField.context.title.replace(/^\[d-tit-\d+-\w+\] /, ''),
                value: nestedField.context.model
              };
            } else if (nestedField.type === 'keyValueInput') {
              // KeyValueInputContext 처리 (depth 2)
              return {
                type: 'keyValue',
                key: (nestedField.context.title.value || 'key'),
                value: nestedField.context.model
              };
            } else if (nestedField.type === 'array') {
              console.log('=== depth 2 nestedObject 내부 array 처리 시작 ===');
              console.log('nestedField (array):', nestedField);
              console.log('nestedField.context.values:', nestedField.context.values);
              
              // depth 2의 array 처리 - ObjectArray로 변환
              const arrayItems = nestedField.context.values.map((arrayItem: any, arrayIndex: number) => {
                console.log(`depth 2 arrayItem ${arrayIndex}:`, arrayItem);
                
                if (arrayItem.type === 'input') {
                  return {
                    type: 'object',
                    subject: `Item ${arrayIndex + 1} [depth-2-array-nestedObject]`,
                    fields: [{
                      type: 'keyValue',
                      key: arrayItem.context.title.replace(/^\[d-tit-\d+-\w+\] /, ''),
                      value: arrayItem.context.model
                    }]
                  };
                } else if (arrayItem.type === 'keyValueInput') {
                  return {
                    type: 'object',
                    subject: `Item ${arrayIndex + 1} [depth-2-array-nestedObject]`,
                    fields: [{
                      type: 'keyValue',
                      key: (arrayItem.context.title.value || 'key'),
                      value: arrayItem.context.model
                    }]
                  };
                } else if (arrayItem.type === 'nestedObject') {
                  const arrayItemFields = arrayItem.context.values.map((arrayField: any) => {
                    if (arrayField.type === 'input') {
                      return {
                        type: 'keyValue',
                        key: arrayField.context.title.replace(/^\[d-tit-\d+-\w+\] /, ''),
                        value: arrayField.context.model
                      };
                    }
                    return arrayField;
                  });
                  
                  return {
                    type: 'object',
                    subject: `Item ${arrayIndex + 1} [depth-2-array-nestedObject]`,
                    fields: arrayItemFields
                  };
                }
                console.log(`처리되지 않은 depth 2 arrayItem 타입: ${arrayItem.type}`, arrayItem);
                return arrayItem;
              });
              
              console.log('depth 2 arrayItems 결과:', arrayItems);
              
              return {
                type: 'objectArray',
                subject: nestedField.context.subject.replace(/^\[d-sub-\d+-array\] /, '') + ' [depth-2-array]',
                items: arrayItems
              };
            } else if (nestedField.type === 'nestedObject') {
              // depth 3의 nestedObject 처리
              const depth3Fields = nestedField.context.values.map((depth3Field: any) => {
                if (depth3Field.type === 'input') {
                  return {
                    type: 'keyValue',
                    key: depth3Field.context.title.replace(/^\[d-tit-\d+-\w+\] /, '') + ' [depth-3-input]',
                    value: depth3Field.context.model
                  };
                } else if (depth3Field.type === 'keyValueInput') {
                  // KeyValueInputContext 처리 (depth 3)
                  return {
                    type: 'keyValue',
                    key: (depth3Field.context.title.value || 'key') + ' [depth-3-keyValueInput]',
                    value: depth3Field.context.model
                  };
                } else if (depth3Field.type === 'nestedObject') {
                  // depth 4의 nestedObject 처리
                  const depth4Fields = depth3Field.context.values.map((depth4Field: any) => {
                    if (depth4Field.type === 'input') {
                      return {
                        type: 'keyValue',
                        key: depth4Field.context.title.replace(/^\[d-tit-\d+-\w+\] /, '') + ' [depth-4-input]',
                        value: depth4Field.context.model
                      };
                    } else if (depth4Field.type === 'keyValueInput') {
                      // KeyValueInputContext 처리 (depth 4)
                      return {
                        type: 'keyValue',
                        key: (depth4Field.context.title.value || 'key') + ' [depth-4-keyValueInput]',
                        value: depth4Field.context.model
                      };
                    }
                    // depth 4에서는 더 깊은 중첩은 표시하지 않음
                    return depth4Field;
                  });
                  
                  return {
                    type: 'object',
                    subject: depth3Field.context.subject.replace(/^\[d-sub-\d+-\w+\] /, ''),
                    fields: depth4Fields
                  };
                } else if (depth3Field.type === 'array') {
                  // depth 3의 array 처리
                  const depth3ArrayItems = depth3Field.context.values.map((depth3ArrayItem: any, depth3ArrayIndex: number) => {
                    if (depth3ArrayItem.type === 'input') {
                      return {
                        type: 'object',
                        subject: `Item ${depth3ArrayIndex + 1}`,
                        fields: [{
                          type: 'keyValue',
                          key: depth3ArrayItem.context.title.replace(/^\[d-tit-\d+-\w+\] /, ''),
                          value: depth3ArrayItem.context.model
                        }]
                      };
                    } else if (depth3ArrayItem.type === 'keyValueInput') {
                      return {
                        type: 'object',
                        subject: `Item ${depth3ArrayIndex + 1}`,
                        fields: [{
                          type: 'keyValue',
                          key: depth3ArrayItem.context.title.value || 'key',
                          value: depth3ArrayItem.context.model
                        }]
                      };
                    } else if (depth3ArrayItem.type === 'nestedObject') {
                      const depth3ArrayItemFields = depth3ArrayItem.context.values.map((depth3ArrayField: any) => {
                        if (depth3ArrayField.type === 'input') {
                          return {
                            type: 'keyValue',
                            key: depth3ArrayField.context.title.replace(/^\[d-tit-\d+-\w+\] /, ''),
                            value: depth3ArrayField.context.model
                          };
                        }
                        return depth3ArrayField;
                      });
                      
                      return {
                        type: 'object',
                        subject: `Item ${depth3ArrayIndex + 1}`,
                        fields: depth3ArrayItemFields
                      };
                    }
                    return depth3ArrayItem;
                  });
                  
                  return {
                    type: 'objectArray',
                    subject: depth3Field.context.subject.replace(/^\[d-sub-\d+-array\] /, ''),
                    items: depth3ArrayItems
                  };
                }
                return depth3Field;
              });
              
              return {
                type: 'object',
                subject: nestedField.context.subject.replace(/^\[d-sub-\d+-\w+\] /, ''),
                fields: depth3Fields
              };
            } else if (nestedField.type === 'array') {
              // depth 2의 array 처리 - ObjectArray로 변환
              console.log('=== depth 2 array 처리 시작 ===');
              console.log('nestedField:', nestedField);
              console.log('nestedField.context.values:', nestedField.context.values);
              
              const arrayItems = nestedField.context.values.map((arrayItem: any, arrayIndex: number) => {
                console.log(`depth 2 arrayItem ${arrayIndex}:`, arrayItem);
                
                if (arrayItem.type === 'input') {
                  return {
                    type: 'object',
                    subject: `Item ${arrayIndex + 1} [depth-2-array-nestedObject]`,
                    fields: [{
                      type: 'keyValue',
                      key: arrayItem.context.title.replace(/^\[d-tit-\d+-\w+\] /, ''),
                      value: arrayItem.context.model
                    }]
                  };
                } else if (arrayItem.type === 'keyValueInput') {
                  return {
                    type: 'object',
                    subject: `Item ${arrayIndex + 1} [depth-2-array-nestedObject]`,
                    fields: [{
                      type: 'keyValue',
                      key: (arrayItem.context.title.value || 'key'),
                      value: arrayItem.context.model
                    }]
                  };
                } else if (arrayItem.type === 'nestedObject') {
                  const arrayItemFields = arrayItem.context.values.map((arrayField: any) => {
                    if (arrayField.type === 'input') {
                      return {
                        type: 'keyValue',
                        key: arrayField.context.title.replace(/^\[d-tit-\d+-\w+\] /, ''),
                        value: arrayField.context.model
                      };
                    }
                    return arrayField;
                  });
                  
                  return {
                    type: 'object',
                    subject: `Item ${arrayIndex + 1} [depth-2-array-nestedObject]`,
                    fields: arrayItemFields
                  };
                }
                console.log(`처리되지 않은 depth 2 arrayItem 타입: ${arrayItem.type}`, arrayItem);
                return arrayItem;
              });
              
              console.log('depth 2 arrayItems 결과:', arrayItems);
              
              const result = {
                type: 'objectArray',
                subject: nestedField.context.subject.replace(/^\[d-sub-\d+-array\] /, '') + ' [depth-2-array]',
                items: arrayItems
              };
              
              console.log('depth 2 ObjectArray 결과:', result);
              return result;
            }
            return nestedField;
          });
          
          return {
            type: 'object',
            subject: field.context.subject.replace(/^\[d-sub-\d+-\w+\] /, ''),
            fields: nestedFields
          };
        } else if (field.type === 'array') {
          // depth 1의 array 처리 - ObjectArray로 변환
          console.log('=== depth 1 array 처리 시작 ===');
          console.log('field:', field);
          console.log('field.context.values:', field.context.values);
          
          const arrayItems = field.context.values.map((arrayItem: any, arrayIndex: number) => {
            console.log(`arrayItem ${arrayIndex}:`, arrayItem);
            
            if (arrayItem.type === 'input') {
              return {
                type: 'object',
                subject: `Item ${arrayIndex + 1} [depth-1-array-input]`,
                fields: [{
                  type: 'keyValue',
                  key: arrayItem.context.title.replace(/^\[d-tit-\d+-\w+\] /, ''),
                  value: arrayItem.context.model
                }]
              };
            } else if (arrayItem.type === 'keyValueInput') {
              return {
                type: 'object',
                subject: `Item ${arrayIndex + 1} [depth-1-array-keyValueInput]`,
                fields: [{
                  type: 'keyValue',
                  key: (arrayItem.context.title.value || 'key'),
                  value: arrayItem.context.model
                }]
              };
            } else if (arrayItem.type === 'nestedObject') {
              const arrayItemFields = arrayItem.context.values.map((arrayField: any) => {
                if (arrayField.type === 'input') {
                  return {
                    type: 'keyValue',
                    key: arrayField.context.title.replace(/^\[d-tit-\d+-\w+\] /, ''),
                    value: arrayField.context.model
                  };
                } else if (arrayField.type === 'array') {
                  // depth 2의 array 처리 - ObjectArray로 변환
                  const nestedArrayItems = arrayField.context.values.map((nestedArrayItem: any, nestedArrayIndex: number) => {
                    if (nestedArrayItem.type === 'input') {
                      return {
                        type: 'object',
                        subject: `Item ${nestedArrayIndex + 1} [depth-2-array-input]`,
                        fields: [{
                          type: 'keyValue',
                          key: nestedArrayItem.context.title.replace(/^\[d-tit-\d+-\w+\] /, ''),
                          value: nestedArrayItem.context.model
                        }]
                      };
                    }
                    return nestedArrayItem;
                  });
                  
                  return {
                    type: 'objectArray',
                    subject: arrayField.context.subject.replace(/^\[d-sub-\d+-array\] /, '') + ' [depth-2-array]',
                    items: nestedArrayItems
                  };
                }
                return arrayField;
              });
              
              return {
                type: 'object',
                subject: `Item ${arrayIndex + 1} [depth-1-array-nestedObject]`,
                fields: arrayItemFields
              };
            }
            console.log(`처리되지 않은 arrayItem 타입: ${arrayItem.type}`, arrayItem);
            return arrayItem;
          });
          
          console.log('arrayItems 결과:', arrayItems);
          
          return {
            type: 'objectArray',
                subject: field.context.subject.replace(/^\[d-sub-\d+-array\] /, '') + ' [depth-1-array]',
            items: arrayItems
          };
        }
        return field;
      });
      
      return {
        type: 'object',
        subject: `Object ${index + 1} [depth-1-${item.type}]`,
        fields: fields
      };
    } else if (item.type === 'input') {
      // 단순 input을 keyValue로 변환
      return {
        type: 'object',
        subject: `Object ${index + 1} [depth-1-${item.type}]`,
        fields: [{
          type: 'keyValue',
          key: item.context.title.replace(/^\[d-tit-\d+-\w+\] /, ''),
          value: item.context.model
        }]
      };
    } else if (item.type === 'keyValueInput') {
      // KeyValueInputContext 처리 (depth 0)
      return {
        type: 'object',
        subject: `Object ${index + 1} [depth-1-${item.type}]`,
        fields: [{
          type: 'keyValue',
          key: item.context.title.value || 'key',
          value: item.context.model
        }]
      };
    } else if (item.type === 'accordion') {
      // AccordionContext 처리 - AccordionSlotContext들을 ObjectContext로 변환
      const accordionItems = item.context.values.map((slot: any, slotIndex: number) => {
        const slotFields = slot.content.map((contentItem: any) => {
          if (contentItem.type === 'input') {
            return {
              type: 'keyValue',
              key: contentItem.context.title.replace(/^\[d-tit-\d+-\w+\] /, ''),
              value: contentItem.context.model
            };
          }
          return contentItem;
        });
        
        return {
          type: 'object',
          subject: slot.header.title,
          fields: slotFields
        };
      });
      
      return {
        type: 'objectArray',
        subject: item.context.subject,
        items: accordionItems
      };
    } else if (item.type === 'softwareModel') {
      // SoftwareModelContext 처리
      const softwareFields = item.context.values.map((softwareField: any) => {
        if (softwareField.type === 'input') {
          return {
            type: 'keyValue',
            key: softwareField.context.title.replace(/^\[d-tit-\d+-\w+\] /, ''),
            value: softwareField.context.model
          };
        }
        return softwareField;
      });
      
      return {
        type: 'object',
        subject: item.context.subject,
        fields: softwareFields
      };
    }
    
    return item;
  });
  
  const result = {
    type: 'objectArray' as const,
    subject: subject,
    items: items
  };
  
  console.log('변환 결과:', result);
  return result;
}

// ObjectArrayContext 업데이트 함수 (depth 4까지 처리)
function updateObjectArrayContext(index: number, updatedContext: any) {
  console.log('=== updateObjectArrayContext 시작 ===');
  console.log('index:', index);
  console.log('updatedContext:', updatedContext);
  
  // ObjectArrayContext를 다시 ArrayContext로 변환하여 formContext 업데이트
  const originalFormData = taskEditorModel.formContext.value[index];
  if (originalFormData.type === 'array') {
    // ObjectArrayContext의 items를 다시 ArrayContext의 values로 변환 (depth 4까지 처리)
    const updatedValues = updatedContext.items.map((item: any) => {
      // ObjectContext를 nestedObject로 변환 (depth 3까지 처리)
      const nestedValues = item.fields.map((field: any) => {
        if (field.type === 'keyValue') {
          return {
            type: 'input',
            context: {
              title: `[d-tit-1-string] ${field.key}`,
              model: field.value
            }
          };
        } else if (field.type === 'object') {
          // depth 2의 object 처리
          const nestedObjectValues = field.fields.map((nestedField: any) => {
            if (nestedField.type === 'keyValue') {
              return {
                type: 'input',
                context: {
                  title: `[d-tit-2-string] ${nestedField.key}`,
                  model: nestedField.value
                }
              };
            } else if (nestedField.type === 'object') {
              // depth 3의 object 처리
              const depth3ObjectValues = nestedField.fields.map((depth3Field: any) => {
                if (depth3Field.type === 'keyValue') {
                  return {
                    type: 'input',
                    context: {
                      title: `[d-tit-3-string] ${depth3Field.key}`,
                      model: depth3Field.value
                    }
                  };
                } else if (depth3Field.type === 'object') {
                  // depth 4의 object 처리
                  const depth4ObjectValues = depth3Field.fields.map((depth4Field: any) => {
                    if (depth4Field.type === 'keyValue') {
                      return {
                        type: 'input',
                        context: {
                          title: `[d-tit-4-string] ${depth4Field.key}`,
                          model: depth4Field.value
                        }
                      };
                    }
                    return depth4Field;
                  });
                  
                  return {
                    type: 'nestedObject',
                    context: {
                      subject: `[d-sub-4-object] ${depth3Field.subject}`,
                      values: depth4ObjectValues
                    }
                  };
                }
                return depth3Field;
              });
              
              return {
                type: 'nestedObject',
                context: {
                  subject: `[d-sub-3-object] ${nestedField.subject}`,
                  values: depth3ObjectValues
                }
              };
            } else if (nestedField.type === 'objectArray') {
              // depth 3의 objectArray 처리
              const depth3ArrayValues = nestedField.items.map((depth3ArrayItem: any) => {
                const depth3ArrayItemValues = depth3ArrayItem.fields.map((depth3ArrayField: any) => {
                  if (depth3ArrayField.type === 'keyValue') {
                    return {
                      type: 'input',
                      context: {
                        title: `[d-tit-3-string] ${depth3ArrayField.key}`,
                        model: depth3ArrayField.value
                      }
                    };
                  }
                  return depth3ArrayField;
                });
                
                return {
                  type: 'nestedObject',
                  context: {
                    subject: `[d-sub-3-object] ${depth3ArrayItem.subject}`,
                    values: depth3ArrayItemValues
                  }
                };
              });
              
              return {
                type: 'array',
                context: {
                  subject: `[d-sub-3-array] ${nestedField.subject}`,
                  values: depth3ArrayValues
                },
                originalData: []
              };
            }
            return nestedField;
          });
          
          return {
            type: 'nestedObject',
            context: {
              subject: `[d-sub-2-object] ${field.subject}`,
              values: nestedObjectValues
            }
          };
        } else if (field.type === 'objectArray') {
          // depth 1의 objectArray 처리
          const arrayValues = field.items.map((arrayItem: any) => {
            const arrayItemValues = arrayItem.fields.map((arrayField: any) => {
              if (arrayField.type === 'keyValue') {
                return {
                  type: 'input',
                  context: {
                    title: `[d-tit-2-string] ${arrayField.key}`,
                    model: arrayField.value
                  }
                };
              }
              return arrayField;
            });
            
            return {
              type: 'nestedObject',
              context: {
                subject: `[d-sub-2-object] ${arrayItem.subject}`,
                values: arrayItemValues
              }
            };
          });
          
          return {
            type: 'array',
            context: {
              subject: `[d-sub-1-array] ${field.subject}`,
              values: arrayValues
            },
            originalData: []
          };
        }
        return field;
      });
      
      return {
        type: 'nestedObject',
        context: {
          subject: `[d-sub-1-object] ${item.subject}`,
          values: nestedValues
        }
      };
    });
    
    // formContext 업데이트
    originalFormData.context.values = updatedValues;
    console.log('업데이트된 formData:', originalFormData);
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

      <!-- Array Context - depth 0에서 array 타입인 경우 ObjectArray.vue 사용 -->
      <div v-else-if="formData.type === 'array'" class="array-box w-full h-full">
        <div class="subject-title border-bottom">
          {{ formData.context.subject }}
        </div>
        <!-- depth 0에서 array인 경우 ObjectArray.vue 사용 (depth 1까지만 표시) -->
        <ObjectArray
          v-if="isDepthZeroArray(formData)"
          :context="convertToObjectArrayContext(formData)"
          :readonly="false"
          @update:context="updateObjectArrayContext(index, $event)"
        />
        <!-- 기존 방식 (DepthField 사용) -->
        <div v-else>
          <div 
            v-for="(item, itemIndex) of formData.context.values" 
            :key="itemIndex"
            class="array-item"
          >
            <DepthField :field="item" :current-depth="0" :max-depth="5" />
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
    margin-right: 0;
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
