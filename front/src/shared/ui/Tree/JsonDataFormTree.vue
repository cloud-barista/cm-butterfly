<template>
  <!-- Form Tree 구조 -->
  <div class="form-tree-container">
    <div
      v-for="node in flattenedNodes"
      :key="node.id"
      class="form-tree-node"
      :class="{ 'hierarchical': node.type === 'object' || node.type === 'array' }"
      :style="getNodeStyle(node)"
      v-show="isNodeVisible(node)"
    >
      <!-- Subject Row -->
      <DataRow
        v-if="getFieldLabel(node) === 'subject'"
        row-type="subject"
        :label="getFieldLabel(node)"
        :value="formatValue(node.value)"
        @update="updateFieldValue(node, $event)"
      />

      <!-- String Array Field (needed_packages pattern) -->
      <StringArrayField
        v-else-if="node.type === 'array' && isNestedObjectStringArrayType(node)"
        :subject="getStringArraySubject(node)"
        :items="getNestedObjectStringArrayItems(node)"
        @update-items="handleStringArrayUpdate(node, $event)"
        @add-item="handleStringArrayAddItem(node, $event)"
        @delete-item="handleStringArrayDeleteItem(node, $event)"
      />

      <!-- Values Row (Array) -->
      <DataRow
        v-else-if="node.type === 'array'"
        row-type="values"
        :label="node.label"
        :item-count="getItemCountNumber(node)"
        :expanded="node.expanded"
        :show-add-button="true"
        @toggle="toggleNode(node)"
        @add-item="addArrayItem(node)"
      />

      <!-- Input Field (Object with type=input and context with 2 properties) -->
      <InputField
        v-else-if="node.type === 'object' && isInputType(node)"
        :title="getInputFieldData(node).title"
        :model-value="getInputFieldData(node).modelValue"
        :is-valid="getInputFieldData(node).isValid"
        @update:model-value="updateInputField(node, $event)"
        @blur="handleInputBlur(node, $event)"
      />

      <!-- Properties Row (Object) -->
      <DataRow
        v-else-if="node.type === 'object'"
        row-type="values"
        :label="node.label"
        :item-count="getItemCountNumber(node)"
        :expanded="node.expanded"
        :show-add-button="false"
        @toggle="toggleNode(node)"
      />

      <!-- Primitive 필드 -->
      <DataRow
        v-else-if="node.type === 'primitive'"
        row-type="properties"
        :label="getFieldLabel(node)"
        :value="formatValue(node.value)"
        :deletable="isDeletable(node)"
        @update="updateFieldValue(node, $event)"
        @delete="deleteField(node)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch } from 'vue';
import { TreeNode, jsonToTree, filterTreeNodes, toggleTreeNode, flattenTreeNodes } from '@/shared/utils/jsonToTable';
import DataRow from './components/DataRow.vue';
import InputField from './components/InputField.vue';
import StringArrayField from './components/StringArrayField.vue';

export default defineComponent({
  name: 'JsonDataFormTree',
  components: {
    DataRow,
    InputField,
    StringArrayField
  },
  props: {
    jsonData: {
      type: [Object, Array, String] as PropType<any>,
      required: true
    },
    showValues: {
      type: Boolean,
      default: true
    },
    maxDepth: {
      type: Number,
      default: 20
    },
    currentDepth: {
      type: Number,
      default: 0
    },
  },
  emits: ['node-click', 'field-update', 'array-item-add', 'field-delete', 'string-array-patterns-found'],
  setup(props, { emit }) {
    const treeNodes = ref<TreeNode[]>([]);

    // JSON 데이터를 Tree로 변환
    const initializeTree = () => {
      if (Array.isArray(props.jsonData) && props.jsonData.length > 0 && 'id' in props.jsonData[0]) {
        // 이미 TreeNode 배열인 경우
        treeNodes.value = props.jsonData as TreeNode[];
      } else {
        // JSON 데이터를 Tree로 변환
        const data = typeof props.jsonData === 'string' ? JSON.parse(props.jsonData) : props.jsonData;
        treeNodes.value = jsonToTree(data, {
          maxDepth: props.maxDepth + 1,
          showArrayIndices: true,
          showPrimitiveValues: props.showValues,
          rootLabel: 'Root'
        });
      }
    };

    // 모든 노드를 평면화
    const flattenedNodes = computed(() => {
      return flattenTreeNodes(treeNodes.value);
    });

    // 노드가 표시되어야 하는지 확인 (부모가 확장되어 있는지)
    const isNodeVisible = (node: TreeNode): boolean => {
      // 루트 노드는 항상 표시
      if (node.level === 0) return true;
      
      // 부모 노드들을 찾아서 모두 확장되어 있는지 확인
      const pathParts = node.path.split('.');
      let currentPath = '';
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}.${pathParts[i]}` : pathParts[i];
        const parentNode = findNodeByPath(treeNodes.value, currentPath);
        if (!parentNode || !parentNode.expanded) {
          return false;
        }
      }
      
      return true;
    };

    // 경로로 노드 찾기
    const findNodeByPath = (nodes: TreeNode[], path: string): TreeNode | null => {
      for (const node of nodes) {
        if (node.path === path) return node;
        if (node.children) {
          const found = findNodeByPath(node.children, path);
          if (found) return found;
        }
      }
      return null;
    };

    // 노드 토글
    const toggleNode = (node: TreeNode) => {
      treeNodes.value = toggleTreeNode(treeNodes.value, node.id);
    };

    // 노드 클릭 처리
    const handleNodeClick = (node: TreeNode) => {
      emit('node-click', node);
    };

    // 필드 라벨 가져오기
    const getFieldLabel = (node: TreeNode): string => {
      const pathParts = node.path.split('.');
      return pathParts[pathParts.length - 1];
    };

    // 아이템 개수 가져오기
    const getItemCount = (node: TreeNode): string => {
      if (node.type === 'array') {
        return `${node.children?.length || 0} items`;
      } else if (node.type === 'object') {
        return `${node.children?.length || 0} properties`;
      }
      return '';
    };

    // 아이템 개수 숫자로 가져오기
    const getItemCountNumber = (node: TreeNode): number => {
      return node.children?.length || 0;
    };

    // 값 포맷팅
    const formatValue = (value: any): string => {
      if (value === null) return '';
      if (value === undefined) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'boolean') return value.toString();
      if (typeof value === 'number') return value.toString();
      return JSON.stringify(value);
    };

    // 필드 값 업데이트
    const updateFieldValue = (node: TreeNode, event: Event) => {
      emit('field-update', { node, event });
    };

    // Input 필드 model.value 업데이트
    const updateInputField = (node: TreeNode, value: any) => {
      if (node.type === 'object' && node.children) {
        const contextNode = node.children.find(child => getFieldLabel(child) === 'context');
        if (contextNode && contextNode.children) {
          const modelNode = contextNode.children.find(child => getFieldLabel(child) === 'model');
          if (modelNode && modelNode.children) {
            const valueNode = modelNode.children.find(child => getFieldLabel(child) === 'value');
            if (valueNode) {
              emit('field-update', { node: valueNode, value });
            }
          }
        }
      }
    };

    // Input 필드 blur 처리
    const handleInputBlur = (node: TreeNode, event: Event) => {
      if (node.type === 'object' && node.children) {
        const contextNode = node.children.find(child => getFieldLabel(child) === 'context');
        if (contextNode && contextNode.children) {
          const modelNode = contextNode.children.find(child => getFieldLabel(child) === 'model');
          if (modelNode && modelNode.children) {
            const valueNode = modelNode.children.find(child => getFieldLabel(child) === 'value');
            if (valueNode) {
              emit('field-update', { node: valueNode, event });
            }
          }
        }
      }
    };

    // nestedObject string array 항목 업데이트
    const updateNestedObjectStringArrayItem = (node: TreeNode, index: number, value: string) => {
      if (node.type === 'array' && node.children && node.children[index]) {
        const itemNode = node.children[index];
        
        // nestedObject인 경우 values를 분리해서 업데이트
        if (itemNode.type === 'object' && itemNode.children) {
          const typeNode = itemNode.children.find(c => getFieldLabel(c) === 'type');
          if (typeNode && formatValue(typeNode.value) === 'nestedObject') {
            const contextNode = itemNode.children.find(c => getFieldLabel(c) === 'context');
            if (contextNode && contextNode.children) {
              const valuesNode = contextNode.children.find(c => getFieldLabel(c) === 'values');
              if (valuesNode && valuesNode.children) {
                // 문자열을 각 문자로 분리해서 values 업데이트
                const characters = value.split('');
                valuesNode.children.forEach((charNode, charIndex) => {
                  if (charIndex < characters.length) {
                    // input 타입 객체인 경우 model.value 업데이트
                    if (charNode.type === 'object' && charNode.children) {
                      const inputTypeNode = charNode.children.find(c => getFieldLabel(c) === 'type');
                      if (inputTypeNode && formatValue(inputTypeNode.value) === 'input') {
                        const inputContextNode = charNode.children.find(c => getFieldLabel(c) === 'context');
                        if (inputContextNode && inputContextNode.children) {
                          const modelNode = inputContextNode.children.find(c => getFieldLabel(c) === 'model');
                          if (modelNode && modelNode.children) {
                            const valueNode = modelNode.children.find(c => getFieldLabel(c) === 'value');
                            if (valueNode) {
                              emit('field-update', { node: valueNode, value: characters[charIndex] });
                            }
                          }
                        }
                      }
                    } else {
                      // 일반적인 경우
                      emit('field-update', { node: charNode, value: characters[charIndex] });
                    }
                  }
                });
                return;
              }
            }
          }
        }
        
        // 일반적인 경우
        emit('field-update', { node: itemNode, value });
      }
    };

    // nestedObject string array 입력 처리
    const handleNestedObjectStringArrayInput = (node: TreeNode, index: number, event: Event) => {
      const target = event.target as HTMLInputElement;
      updateNestedObjectStringArrayItem(node, index, target.value);
    };

    // StringArrayField 이벤트 핸들러들
    const handleStringArrayUpdate = (node: TreeNode, items: Array<{ index: number; value: string }>) => {
      // 각 아이템을 업데이트
      items.forEach(item => {
        updateNestedObjectStringArrayItem(node, item.index, item.value);
      });
    };

    const handleStringArrayAddItem = (node: TreeNode, newItem: { index: number; value: string }) => {
      // 새 아이템을 배열에 추가하는 로직
      emit('array-item-add', node);
    };

    const handleStringArrayDeleteItem = (node: TreeNode, index: number) => {
      // 아이템을 삭제하는 로직
      if (node.type === 'array' && node.children && node.children[index]) {
        const itemNode = node.children[index];
        emit('field-delete', itemNode);
      }
    };

    // Array 아이템 추가
    const addArrayItem = (node: TreeNode) => {
      emit('array-item-add', node);
    };

    // 필드 삭제 가능 여부
    const isDeletable = (node: TreeNode): boolean => {
      // 루트 레벨이 아니고, 배열 인덱스이거나 객체 프로퍼티인 경우
      return node.level > 0 && (node.path.includes('[') || node.path.includes('.'));
    };

    // string[] 패턴을 찾는 함수 - 모든 배열에서 string[] 형태의 패턴을 찾아서 subject 목록 반환
    const findStringArrayPatterns = (node: TreeNode): string[] => {
      const patterns: string[] = [];
      
      function traverse(currentNode: TreeNode) {
        if (currentNode.type === 'array' && currentNode.children) {
          // 배열의 첫 번째 아이템이 nestedObject인지 확인
          const firstItem = currentNode.children[0];
          if (firstItem && firstItem.type === 'object' && firstItem.children) {
            const typeNode = firstItem.children.find(c => getFieldLabel(c) === 'type');
            if (typeNode && formatValue(typeNode.value) === 'nestedObject') {
              const contextNode = firstItem.children.find(c => getFieldLabel(c) === 'context');
              if (contextNode && contextNode.children) {
                const subjectNode = contextNode.children.find(c => getFieldLabel(c) === 'subject');
                const valuesNode = contextNode.children.find(c => getFieldLabel(c) === 'values');
                
                if (subjectNode && valuesNode && valuesNode.type === 'array' && valuesNode.children) {
                  // values의 첫 번째 항목이 input 타입인지 확인
                  const firstValueItem = valuesNode.children[0];
                  if (firstValueItem && firstValueItem.type === 'object' && firstValueItem.children) {
                    const inputTypeNode = firstValueItem.children.find(c => getFieldLabel(c) === 'type');
                    if (inputTypeNode && formatValue(inputTypeNode.value) === 'input') {
                      // string[] 패턴 발견
                      const subject = formatValue(subjectNode.value);
                      if (subject && !patterns.includes(subject)) {
                        patterns.push(subject);
                      }
                    }
                  }
                }
              }
            }
          }
        }
        
        // 자식 노드들도 재귀적으로 탐색
        if (currentNode.children) {
          currentNode.children.forEach(child => traverse(child));
        }
      }
      
      traverse(node);
      return patterns;
    };

    // nestedObject string array 타입인지 확인 (array 내 item이 nestedObject이고 values가 input 타입 배열인 경우)
    const isNestedObjectStringArrayType = (node: TreeNode): boolean => {
      if (node.type === 'array' && node.children) {
        // 첫 번째 아이템이 nestedObject인지 확인
        const firstItem = node.children[0];
        if (firstItem && firstItem.type === 'object' && firstItem.children) {
          const typeNode = firstItem.children.find(c => getFieldLabel(c) === 'type');
          if (typeNode && formatValue(typeNode.value) === 'nestedObject') {
            const contextNode = firstItem.children.find(c => getFieldLabel(c) === 'context');
            if (contextNode && contextNode.children) {
              const valuesNode = contextNode.children.find(c => getFieldLabel(c) === 'values');
              if (valuesNode && valuesNode.type === 'array' && valuesNode.children) {
                // values의 첫 번째 항목이 input 타입인지 확인
                const firstValueItem = valuesNode.children[0];
                if (firstValueItem && firstValueItem.type === 'object' && firstValueItem.children) {
                  const inputTypeNode = firstValueItem.children.find(c => getFieldLabel(c) === 'type');
                  if (inputTypeNode && formatValue(inputTypeNode.value) === 'input') {
                    return true;
                  }
                }
              }
            }
          }
        }
      }
      return false;
    };

    // Input 타입인지 확인 (context가 2개 properties를 가진 경우)
    const isInputType = (node: TreeNode): boolean => {
      if (node.type === 'object' && node.children) {
        const typeNode = node.children.find(child => getFieldLabel(child) === 'type');
        if (typeNode && formatValue(typeNode.value) === 'input') {
          // context가 2개 properties (title, model)를 가진지 확인
          const contextNode = node.children.find(child => getFieldLabel(child) === 'context');
          if (contextNode && contextNode.children && contextNode.children.length === 2) {
            const hasTitle = contextNode.children.some(child => getFieldLabel(child) === 'title');
            const hasModel = contextNode.children.some(child => getFieldLabel(child) === 'model');
            return hasTitle && hasModel;
          }
        }
      }
      return false;
    };

    // string array의 subject를 가져오는 함수
    const getStringArraySubject = (node: TreeNode): string => {
      if (node.type === 'array' && node.children && node.children.length > 0) {
        const firstItem = node.children[0];
        if (firstItem && firstItem.type === 'object' && firstItem.children) {
          const typeNode = firstItem.children.find(c => getFieldLabel(c) === 'type');
          if (typeNode && formatValue(typeNode.value) === 'nestedObject') {
            const contextNode = firstItem.children.find(c => getFieldLabel(c) === 'context');
            if (contextNode && contextNode.children) {
              const subjectNode = contextNode.children.find(c => getFieldLabel(c) === 'subject');
              if (subjectNode) {
                return formatValue(subjectNode.value);
              }
            }
          }
        }
      }
      return 'Array';
    };

    // nestedObject string array의 각 항목을 처리하는 함수
    const getNestedObjectStringArrayItems = (node: TreeNode): Array<{ index: number; value: string }> => {
      if (node.type === 'array' && node.children) {
        return node.children.map((child, index) => {
          // nestedObject인 경우 values를 합쳐서 처리
          if (child.type === 'object' && child.children) {
            const typeNode = child.children.find(c => getFieldLabel(c) === 'type');
            if (typeNode && formatValue(typeNode.value) === 'nestedObject') {
              const contextNode = child.children.find(c => getFieldLabel(c) === 'context');
              if (contextNode && contextNode.children) {
                const valuesNode = contextNode.children.find(c => getFieldLabel(c) === 'values');
                if (valuesNode && valuesNode.children) {
                  // values의 각 항목에서 model.value를 추출해서 합치기
                  const combinedValue = valuesNode.children
                    .map(v => {
                      // input 타입 객체인 경우 model.value 추출
                      if (v.type === 'object' && v.children) {
                        const inputTypeNode = v.children.find(c => getFieldLabel(c) === 'type');
                        if (inputTypeNode && formatValue(inputTypeNode.value) === 'input') {
                          const inputContextNode = v.children.find(c => getFieldLabel(c) === 'context');
                          if (inputContextNode && inputContextNode.children) {
                            const modelNode = inputContextNode.children.find(c => getFieldLabel(c) === 'model');
                            if (modelNode && modelNode.children) {
                              const valueNode = modelNode.children.find(c => getFieldLabel(c) === 'value');
                              if (valueNode) {
                                return formatValue(valueNode.value);
                              }
                            }
                          }
                        }
                      }
                      // 일반적인 경우
                      return formatValue(v.value);
                    })
                    .join('');
                  return { index, value: combinedValue };
                }
              }
            }
          }
          // 일반적인 경우
          return {
            index,
            value: formatValue(child.value)
          };
        });
      }
      return [];
    };

    // Input 필드의 title과 model.value 가져오기
    const getInputFieldData = (node: TreeNode): { title: string; modelValue: string; isValid: boolean } => {
      if (node.type === 'object' && node.children) {
        const contextNode = node.children.find(child => getFieldLabel(child) === 'context');
        if (contextNode && contextNode.children) {
          const titleNode = contextNode.children.find(child => getFieldLabel(child) === 'title');
          const modelNode = contextNode.children.find(child => getFieldLabel(child) === 'model');
          
          let modelValue = '';
          let isValid = true;
          
          if (modelNode && modelNode.children) {
            const valueNode = modelNode.children.find(child => getFieldLabel(child) === 'value');
            const isValidNode = modelNode.children.find(child => getFieldLabel(child) === 'isValid');
            
            if (valueNode) {
              modelValue = formatValue(valueNode.value);
            }
            if (isValidNode) {
              isValid = formatValue(isValidNode.value) === 'true';
            }
          }
          
          return {
            title: titleNode ? formatValue(titleNode.value) : '',
            modelValue,
            isValid
          };
        }
      }
      return { title: '', modelValue: '', isValid: true };
    };

    // 필드 삭제
    const deleteField = (node: TreeNode) => {
      emit('field-delete', node);
    };

    // 노드 스타일 계산
    const getNodeStyle = (node: TreeNode) => {
      // 모든 노드가 동일한 너비 사용 (들여쓰기 제거)
      return {};
    };

    // 초기화
    initializeTree();

    // props 변경 감지
    watch(() => props.jsonData, initializeTree, { deep: true });

    // treeNodes가 변경될 때마다 패턴을 찾아서 부모에게 전달
    watch(treeNodes, (newTreeNodes) => {
      if (newTreeNodes && newTreeNodes.length > 0) {
        const patterns = findStringArrayPatterns(newTreeNodes[0]);
        emit('string-array-patterns-found', patterns);
      }
    }, { immediate: true });

    return {
      flattenedNodes,
      isNodeVisible,
      getNodeStyle,
      toggleNode,
      handleNodeClick,
      getFieldLabel,
      getItemCount,
      getItemCountNumber,
      formatValue,
      updateFieldValue,
      updateInputField,
      handleInputBlur,
      updateNestedObjectStringArrayItem,
      handleNestedObjectStringArrayInput,
      addArrayItem,
      isDeletable,
      deleteField,
      findStringArrayPatterns,
      isNestedObjectStringArrayType,
      getStringArraySubject,
      getNestedObjectStringArrayItems,
      handleStringArrayUpdate,
      handleStringArrayAddItem,
      handleStringArrayDeleteItem,
      isInputType,
      getInputFieldData
    };
  }
});

</script>

<style scoped lang="postcss">
.form-tree-container {
  @apply w-full;
  overflow-y: auto;
  max-height: 500px;
}

.form-tree-node {
  @apply w-full;
}

.nested-object-string-array-container {
  @apply w-full;
}

.field-group {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.field-title-box {
  display: flex;
  align-items: center;
  width: 200px;
  height: 44px;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 16px 6px 16px;
  flex-shrink: 0;
}

.field-content-box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 310px;
  height: 44px;
  padding: 6px 16px 6px 16px;
  flex-shrink: 0;
}

.field-input {
  @apply w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500;
  border-radius: 4px;
}
</style>