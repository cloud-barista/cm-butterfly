# JSON Data Utilities

JSON 데이터를 표와 트리 형태로 변환하는 유틸리티 함수와 Vue 컴포넌트입니다.

## 주요 기능

- JSON 데이터를 깔끔한 표 형태로 변환
- JSON 데이터를 트리 구조로 변환
- 마이그레이션 데이터 구조에 최적화된 표 생성
- 통합 뷰어 (표 + 트리 + JSON)
- Vue 컴포넌트로 쉽게 사용 가능
- TypeScript 지원

## 사용법

### 1. 기본 사용법

```typescript
import { 
  jsonToTable, 
  createMigrationDataTables,
  jsonToTree,
  filterTreeNodes,
  toggleTreeNode
} from '@/shared/utils/jsonToTable';

// 일반 JSON 데이터를 표로 변환
const tables = jsonToTable(jsonData);

// 마이그레이션 데이터를 표로 변환
const migrationTables = createMigrationDataTables(migrationData);

// JSON 데이터를 트리로 변환
const treeNodes = jsonToTree(jsonData);

// 트리 노드 필터링
const filteredNodes = filterTreeNodes(treeNodes, 'search term');

// 트리 노드 토글
const toggledNodes = toggleTreeNode(treeNodes, 'node-id');
```

### 2. Vue 컴포넌트 사용

#### 표 컴포넌트
```vue
<template>
  <JsonDataTable 
    :json-data="jsonData" 
    :use-migration-format="true"
    :table-titles="['서버 정보', '바이너리', '컨테이너']"
  />
</template>

<script>
import JsonDataTable from '@/shared/ui/Table/JsonDataTable.vue';

export default {
  components: {
    JsonDataTable
  },
  data() {
    return {
      jsonData: { /* JSON 데이터 */ }
    };
  }
};
</script>
```

#### 트리 컴포넌트
```vue
<template>
  <JsonDataTree
    :json-data="jsonData"
    :show-search="true"
    :show-values="true"
    :max-depth="5"
    @node-click="handleNodeClick"
  />
</template>

<script>
import JsonDataTree from '@/shared/ui/Tree/JsonDataTree.vue';

export default {
  components: {
    JsonDataTree
  },
  methods: {
    handleNodeClick(node) {
      console.log('클릭된 노드:', node);
    }
  }
};
</script>
```

#### 통합 뷰어 컴포넌트
```vue
<template>
  <JsonDataViewer
    :json-data="jsonData"
    :use-migration-format="true"
    :available-views="['table', 'tree', 'raw']"
    :table-titles="['서버 정보', '바이너리', '컨테이너']"
  />
</template>

<script>
import JsonDataViewer from '@/shared/ui/JsonDataViewer/JsonDataViewer.vue';

export default {
  components: {
    JsonDataViewer
  }
};
</script>
```

## API

### Table 관련 함수

#### `jsonToTable(jsonData, options?)`
일반적인 JSON 데이터를 표로 변환합니다.

**Parameters:**
- `jsonData`: 변환할 JSON 데이터
- `options`: 변환 옵션
  - `maxDepth`: 최대 깊이 (기본값: 3)
  - `showNestedObjects`: 중첩 객체 표시 여부 (기본값: true)
  - `arrayItemLimit`: 배열 항목 제한 (기본값: 10)

#### `createMigrationDataTables(jsonData)`
마이그레이션 데이터 구조에 최적화된 표를 생성합니다.

**Parameters:**
- `jsonData`: 마이그레이션 JSON 데이터 (문자열 또는 객체)

### Tree 관련 함수

#### `jsonToTree(jsonData, options?)`
JSON 데이터를 트리 구조로 변환합니다.

**Parameters:**
- `jsonData`: 변환할 JSON 데이터
- `options`: 변환 옵션
  - `maxDepth`: 최대 깊이 (기본값: 10)
  - `showArrayIndices`: 배열 인덱스 표시 여부 (기본값: true)
  - `showPrimitiveValues`: 원시 값 표시 여부 (기본값: true)
  - `rootLabel`: 루트 라벨 (기본값: 'Root')

#### `flattenTreeNodes(treeNodes)`
트리 노드를 평면화하여 배열로 변환합니다.

**Parameters:**
- `treeNodes`: 트리 노드 배열

#### `findTreeNodeByPath(treeNodes, path)`
특정 경로의 노드를 찾습니다.

**Parameters:**
- `treeNodes`: 트리 노드 배열
- `path`: 찾을 경로

#### `toggleTreeNode(treeNodes, nodeId)`
트리 노드의 확장 상태를 토글합니다.

**Parameters:**
- `treeNodes`: 트리 노드 배열
- `nodeId`: 토글할 노드 ID

#### `filterTreeNodes(treeNodes, searchTerm)`
트리 노드를 필터링합니다.

**Parameters:**
- `treeNodes`: 트리 노드 배열
- `searchTerm`: 검색어

## 컴포넌트 Props

### `JsonDataTable`
- `jsonData` (required): 표시할 JSON 데이터
- `useMigrationFormat` (optional): 마이그레이션 형식 사용 여부 (기본값: false)
- `tableTitles` (optional): 표 제목 배열

### `JsonDataTree`
- `jsonData` (required): 표시할 JSON 데이터 또는 TreeNode 배열
- `showSearch` (optional): 검색 기능 표시 여부 (기본값: true)
- `showValues` (optional): 값 표시 여부 (기본값: true)
- `maxDepth` (optional): 최대 깊이 (기본값: 10)
- `currentDepth` (optional): 현재 깊이 (기본값: 0)
- `searchTerm` (optional): 검색어

### `JsonDataViewer`
- `jsonData` (required): 표시할 JSON 데이터
- `useMigrationFormat` (optional): 마이그레이션 형식 사용 여부 (기본값: false)
- `tableTitles` (optional): 표 제목 배열
- `maxDepth` (optional): 최대 깊이 (기본값: 10)
- `availableViews` (optional): 사용 가능한 뷰 배열 (기본값: ['table', 'tree', 'raw'])

## 예시 데이터 구조

### 마이그레이션 데이터
```json
{
  "targetSoftwareModel": {
    "servers": [
      {
        "errors": ["No critical errors found"],
        "migration_list": {
          "binaries": [...],
          "containers": [...],
          "kubernetes": [...],
          "packages": [...]
        }
      }
    ]
  },
  "softwareModel": {
    "id": "7b_COtxNSSeJgu8",
    "name": "nfs-web-sw1-tg01",
    "description": ""
  }
}
```

## 스타일링

컴포넌트는 Tailwind CSS를 사용하여 스타일링되어 있습니다. 필요에 따라 CSS 클래스를 수정하여 스타일을 변경할 수 있습니다.

## 타입 정의

```typescript
interface TableColumn {
  key: string;
  label: string;
  width?: string;
}

interface TableData {
  columns: TableColumn[];
  rows: Record<string, any>[];
}

interface JsonToTableOptions {
  maxDepth?: number;
  showNestedObjects?: boolean;
  arrayItemLimit?: number;
}

interface TreeNode {
  id: string;
  label: string;
  value?: any;
  type: 'object' | 'array' | 'primitive';
  children?: TreeNode[];
  expanded?: boolean;
  level: number;
  path: string;
}

interface JsonToTreeOptions {
  maxDepth?: number;
  showArrayIndices?: boolean;
  showPrimitiveValues?: boolean;
  rootLabel?: string;
}
```
