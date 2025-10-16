<template>
  <div class="json-data-tree">
    <!-- 검색 입력 -->
    <div v-if="showSearch" class="search-container mb-4">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="검색..."
        class="search-input"
        @input="handleSearch"
      />
    </div>

    <!-- Tree 구조 -->
    <div class="tree-container">
      <div
        v-for="node in flattenedNodes"
        :key="node.id"
        class="tree-node"
        :style="{ paddingLeft: `${node.level * 20 + 8}px` }"
        v-show="isNodeVisible(node)"
      >
        <div class="node-content" @click="toggleNode(node)">
          <!-- 확장/축소 아이콘 -->
          <span
            v-if="node.children && node.children.length > 0"
            class="expand-icon"
            :class="{ expanded: node.expanded }"
          >
            ▶
          </span>
          <span v-else class="expand-icon-placeholder"></span>

          <!-- 노드 타입 아이콘 -->
          <span class="node-type-icon" :class="getNodeTypeClass(node.type)">
            {{ getNodeTypeIcon(node.type) }}
          </span>

          <!-- 노드 라벨 -->
          <span class="node-label" :class="getNodeLabelClass(node)">
            {{ node.label }}
          </span>

          <!-- 노드 값 (primitive 타입인 경우) -->
          <span v-if="node.type === 'primitive' && showValues" class="node-value">
            {{ formatValue(node.value) }}
          </span>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch } from 'vue';
import { TreeNode, jsonToTree, filterTreeNodes, toggleTreeNode, flattenTreeNodes } from '@/shared/utils/jsonToTable';

export default defineComponent({
  name: 'JsonDataTree',
  props: {
    jsonData: {
      type: [String, Object, Array] as PropType<string | object | TreeNode[]>,
      required: true
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    showValues: {
      type: Boolean,
      default: true
    },
    maxDepth: {
      type: Number,
      default: 10
    },
    currentDepth: {
      type: Number,
      default: 0
    },
    searchTerm: {
      type: String,
      default: ''
    }
  },
  emits: ['node-click'],
  setup(props, { emit }) {
    const searchTerm = ref(props.searchTerm);
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
          maxDepth: props.maxDepth + 1, // JsonDataTree의 currentDepth와 맞추기 위해 +1
          showArrayIndices: true,
          showPrimitiveValues: props.showValues,
          rootLabel: 'Root'
        });
      }
    };

    // 모든 노드를 평면화
    const flattenedNodes = computed(() => {
      if (searchTerm.value.trim()) {
        const filteredNodes = filterTreeNodes(treeNodes.value, searchTerm.value);
        return flattenTreeNodes(filteredNodes);
      }
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

    // 검색 처리
    const handleSearch = () => {
      // 검색은 computed에서 자동으로 처리됨
    };

    // 노드 클릭 처리
    const handleNodeClick = (node: TreeNode) => {
      emit('node-click', node);
    };

    // 노드 타입별 CSS 클래스
    const getNodeTypeClass = (type: string) => {
      return `node-type-${type}`;
    };

    // 노드 타입별 아이콘
    const getNodeTypeIcon = (type: string) => {
      switch (type) {
        case 'object': return '📁';
        case 'array': return '📋';
        case 'primitive': return '📄';
        default: return '❓';
      }
    };

    // 노드 라벨 CSS 클래스
    const getNodeLabelClass = (node: TreeNode) => {
      return {
        'node-label-object': node.type === 'object',
        'node-label-array': node.type === 'array',
        'node-label-primitive': node.type === 'primitive'
      };
    };

    // 값 포맷팅
    const formatValue = (value: any) => {
      if (value === null) return 'null';
      if (value === undefined) return 'undefined';
      if (typeof value === 'string') return `"${value}"`;
      if (typeof value === 'boolean') return value.toString();
      if (typeof value === 'number') return value.toString();
      return JSON.stringify(value);
    };

    // 검색어 하이라이트 확인
    const isHighlighted = (label: string): boolean => {
      if (!searchTerm.value.trim()) return false;
      return label.toLowerCase().includes(searchTerm.value.toLowerCase());
    };

    // 초기화
    initializeTree();

    // props 변경 감지
    watch(() => props.jsonData, initializeTree, { deep: true });

    return {
      searchTerm,
      flattenedNodes,
      isNodeVisible,
      isHighlighted,
      toggleNode,
      handleSearch,
      handleNodeClick,
      getNodeTypeClass,
      getNodeTypeIcon,
      getNodeLabelClass,
      formatValue
    };
  }
});
</script>

<style scoped>
.json-data-tree {
  @apply text-sm;
  font-family: 'Inconsolata', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
}

.search-container {
  @apply mb-4;
}

.search-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.tree-container {
  @apply space-y-1 overflow-x-auto overflow-y-auto;
  min-width: 100%;
  max-height: 500px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

/* Webkit 브라우저용 스크롤바 스타일 */
.tree-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.tree-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.tree-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.tree-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.tree-node {
  @apply relative;
}

.node-content {
  @apply flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer transition-colors;
  border-radius: 4px;
  min-width: max-content;
  white-space: nowrap;
}

.expand-icon {
  @apply w-4 h-4 flex items-center justify-center text-gray-500 transition-transform duration-200;
}

.expand-icon.expanded {
  @apply transform rotate-90;
}

.expand-icon-placeholder {
  @apply w-4 h-4;
}

.node-type-icon {
  @apply mr-2 text-sm;
}

.node-type-object {
  @apply text-blue-600;
}

.node-type-array {
  @apply text-green-600;
}

.node-type-primitive {
  @apply text-gray-600;
}

.node-label {
  @apply flex-1 font-medium;
}

.node-label-object {
  @apply text-blue-800;
}

.node-label-array {
  @apply text-green-800;
}

.node-label-primitive {
  @apply text-gray-800;
}

.node-value {
  @apply ml-2 text-gray-600 italic;
}

.children-container {
  @apply ml-4;
}

/* 호버 효과 */
.node-content:hover {
  background-color: #eff6ff;
}

/* 선택된 노드 */
.node-content.selected {
  @apply border-l-4 border-blue-500;
  background-color: #dbeafe;
}

/* 검색 하이라이트 */
.node-label.highlighted {
  background-color: #fef08a;
}
</style>
