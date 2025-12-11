# TableLoadingSpinner Component

테이블 데이터 로딩 시 표시되는 공통 스피너 컴포넌트입니다.

## 사용 방법

### 기본 사용 (PToolboxTable과 함께)

```vue
<template>
  <p-horizontal-layout :height="adjustedDynamicHeight">
    <template #container="{ height }">
      <!-- 로딩 중일 때 스피너 표시 -->
      <table-loading-spinner 
        :loading="apiInstance.isLoading.value"
        :height="height"
        message="Loading data..."
      />
      
      <!-- 로딩 완료 후 테이블 표시 -->
      <p-toolbox-table
        v-if="!apiInstance.isLoading.value"
        :items="tableModel.tableState.displayItems"
        @refresh="fetchData"
      />
    </template>
  </p-horizontal-layout>
</template>

<script setup lang="ts">
import TableLoadingSpinner from '@/shared/ui/LoadingSpinner/TableLoadingSpinner.vue';

const apiInstance = useGetData();

function fetchData() {
  apiInstance.execute();
}
</script>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| loading | boolean | Yes | - | 로딩 상태 |
| message | string | No | 'Loading...' | 표시할 메시지 |
| height | string \| number | No | - | 스피너 영역 높이 (px) |

## 적용 완료된 화면 (Phase 1 & 2)

- ✅ Credentials List (`front/src/widgets/credentials/credentialsList/ui/CredentialsList.vue`)
- ✅ MCI List (`front/src/widgets/workload/mci/mciList/ui/MciList.vue`)
- ✅ Server List (VM List) (`front/src/widgets/workload/vm/vmList/ui/VmList.vue`)
- ✅ Source Service List (`front/src/widgets/source/sourceServices/sourceServiceList/ui/SourceServiceList.vue`)
- ✅ Workflow List (`front/src/widgets/workflow/workflows/workflowList/ui/WorkflowList.vue`)
- ✅ User List (`front/src/widgets/user/userlist/ui/UserListTable.vue`)

## 적용 대상 화면 (Phase 3 - 향후 확산)

다음 화면들에도 동일한 패턴을 적용할 수 있습니다:

- [ ] Source Connection List (`front/src/widgets/source/sourceConnections/sourceConnectionList/ui/SourceConnectionList.vue`)
- [ ] Source Model List (`front/src/widgets/models/sourceModels/sourceModelList/ui/SourceModelList.vue`)
- [ ] Target Model List (`front/src/widgets/models/targetModels/targetModelList/ui/TargetModelList.vue`)
- [ ] Workflow Templates List (`front/src/widgets/workflow/workflowTemplates/workflowTemplatesList/ui/WorkflowTemplatesList.vue`)
- [ ] Task Components List (`front/src/widgets/workflow/taskComponents/taskComponentsList/ui/TaskComponentsList.vue`)

## 적용 패턴

### 1. Import 추가

```typescript
import TableLoadingSpinner from '@/shared/ui/LoadingSpinner/TableLoadingSpinner.vue';
```

### 2. PSpinner import 제거 (이미 있는 경우)

```typescript
// 제거
import { PSpinner } from '@cloudforet-test/mirinae';
```

### 3. 템플릿 수정

**기존 코드:**
```vue
<div v-if="loading" class="loading-section" :style="{ height: `${height}px` }">
  <p-spinner size="xl" />
  <p>Loading...</p>
</div>

<p-toolbox-table
  v-else
  ...
/>
```

**변경 후:**
```vue
<table-loading-spinner
  :loading="loading"
  :height="height"
  message="Loading..."
/>

<p-toolbox-table
  v-if="!loading"
  ...
/>
```

### 4. 스타일 제거

기존의 `.loading-section` 스타일을 제거합니다.

## 주요 이점

- **일관된 UX**: 모든 테이블에서 동일한 로딩 경험 제공
- **유지보수성**: 스피너 스타일 변경 시 한 곳만 수정
- **코드 중복 제거**: 각 화면마다 동일한 스피너 코드 반복 제거
- **확장성**: 추후 skeleton loading 등으로 쉽게 업그레이드 가능

## 참고사항

- 컴포넌트 내부에서 `v-if="loading"` 조건을 처리하므로, 부모에서는 별도의 `v-if` 조건이 필요 없습니다.
- PToolboxTable에는 `v-if="!loading"` 조건을 추가하여 로딩 중에는 숨기도록 합니다.
- height prop은 선택사항이며, 제공하지 않으면 기본 `min-height: 300px`가 적용됩니다.

