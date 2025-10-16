# Task Component Editor

범용 Task Editor로, JSON Schema를 기반으로 다양한 Task Component의 파라미터를 편집할 수 있습니다.

## 🎯 주요 특징

### 1. **범용 Editor**
- 모든 Task Component에 대해 단일 Editor 사용
- JSON Schema 기반 자동 폼 생성
- Path Parameters, Query Parameters, Body Parameters 지원

### 2. **재귀적 렌더링**
- 중첩된 Object 구조 자동 렌더링
- Array 타입 동적 추가/삭제
- 깊이 제한 없는 중첩 구조 지원

### 3. **자동 데이터 관리**
- 변경사항 자동 저장
- Schema와 실제 데이터 분리
- Vue.js Reactivity를 통한 실시간 업데이트

## 🏗️ 구조

```
editor/
├── ui/
│   ├── TaskComponentEditor.vue          # 메인 범용 Editor
│   ├── RecursiveFormField.vue           # 재귀적 폼 필드 렌더링
│   └── components/                      # UI 컴포넌트들
│       ├── FormField.vue
│       ├── ArrayContentRenderer.vue
│       ├── DataStructureRenderer.vue
│       └── ...
├── model/
│   ├── editorProviders.ts               # Editor Provider (모든 task에 TaskComponentEditor 사용)
│   ├── commonTaskEditorModel.ts         # Task Editor 공통 로직
│   └── ...
├── utils/
│   ├── schemaAnalyzer.ts                # Schema 분석 유틸리티
│   └── dataMapper.ts                    # 데이터 매핑 유틸리티
├── composables/
│   └── useTaskSchemaLoader.ts           # Schema 로딩 로직
├── store/
│   └── taskSchemaStore.ts               # Schema 캐시 스토어
└── index.ts                             # Export 파일
```

## 🚀 사용법

### 기본 사용법

TaskComponentEditor는 `editorProviders.ts`에서 자동으로 모든 task에 적용됩니다:

```typescript
// editorProviders.ts
if (step.componentType === 'task') {
  const TaskEditorComponent: any = TaskComponentEditor;
  
  insertDynamicComponent(
    TaskEditorComponent,
    { step },
    {
      saveComponentName: e => {
        step.name = e;
        stepContext.notifyNameChanged();
      },
      saveContext: e => {
        step.properties.model = e;
        stepContext.notifyPropertiesChanged();
      },
      saveFixedModel: e => {
        step.properties.fixedModel = e;
        stepContext.notifyPropertiesChanged();
      },
    },
    editor,
  );
}
```

### Step 구조

```typescript
interface Step {
  id: string;
  name: string;
  type: string;
  componentType: 'task' | 'container' | 'switch';
  properties: {
    fixedModel?: {
      task_component: string;  // Task Component ID
      path_params?: any;
      query_params?: any;
      body_params?: any;
    };
    model?: any;  // 현재 세션의 편집 데이터
    originalData?: {
      path_params?: any;
      query_params?: any;
      request_body?: any;  // 초기 로드 시 body_params 데이터
    };
  };
}
```

## 📊 데이터 흐름

### 1. **데이터 로딩 우선순위**

```
Priority 1: step.properties.model
            ↓ (현재 세션 데이터 - Task Editor를 닫고 다시 열 때 변경사항 유지)
Priority 2: originalData.request_body
            ↓ (초기 로드 시 fallback)
Priority 3: Empty Object {}
```

### 2. **데이터 저장 플로우**

```
User Input
    ↓
RecursiveFormField.vue (emit 'update')
    ↓
TaskComponentEditor.vue (updateBodyParamField)
    ↓
Deep Clone (Vue Reactivity 트리거)
    ↓
watch(bodyParamsModel)
    ↓
saveContext callback
    ↓
step.properties.model 업데이트
    ↓
stepContext.notifyPropertiesChanged()
```

## 🔧 주요 컴포넌트

### 1. TaskComponentEditor.vue

메인 범용 Editor 컴포넌트:
- Task Component Schema 로딩
- Path/Query/Body Parameters 섹션 렌더링
- 자동 저장 로직

### 2. RecursiveFormField.vue

재귀적 폼 필드 렌더러:
- Object, Array, Primitive 타입 처리
- 중첩 구조 재귀 렌더링
- 데이터 변경 이벤트 emit

### 3. editorProviders.ts

Editor Provider 설정:
- 모든 task에 대해 TaskComponentEditor 사용
- saveContext, saveFixedModel 콜백 설정
- step.properties 업데이트

## 💾 데이터 지속성

### 문제: Body Parameters 변경사항 유지

**Issue**: Task Editor를 닫고 다시 열면 변경사항이 사라짐

**Root Cause**:
1. Vue.js가 깊은 중첩 객체 변경을 감지하지 못함
2. `step.properties.model`이 schema로 덮어써짐
3. 데이터 로딩 우선순위 문제

**Solution**:
1. **Deep Cloning**: `updateBodyParamField`에서 객체 전체를 deep clone
2. **Data Loading Priority**: `step.properties.model` 우선 로드
3. **Schema vs Data 구분**: Schema인지 실제 데이터인지 확인

```typescript
// ✅ Deep Clone으로 Vue Reactivity 트리거
const updateBodyParamField = (fieldName: string, value: any) => {
  const newModel = JSON.parse(JSON.stringify({
    ...bodyParamsModel.value,
    [fieldName]: value
  }));
  
  bodyParamsModel.value = newModel;  // 새 객체 참조 → Vue가 감지
};
```

## 🐛 주요 버그 수정 사항

### Bug #1: Body Parameters 변경사항 유실
**원인**: Vue.js Reactivity 한계 (깊은 중첩 객체)
**해결**: Deep cloning으로 객체 참조 변경

### Bug #2: Task Editor 재열람 시 초기값으로 복귀
**원인**: 데이터 로딩 우선순위 오류
**해결**: `step.properties.model` 우선 로드

### Bug #3: Schema가 실제 데이터로 저장됨
**원인**: Schema와 Data 구분 실패
**해결**: Schema 여부 확인 로직 추가

```typescript
// Schema 여부 확인
const isSchema = (obj: any) => {
  return obj && 
         obj.type === 'object' && 
         obj.properties && 
         typeof obj.properties === 'object';
};
```

## 🎨 UI 구조

### Path Parameters
- 고정된 path variable 입력
- 예: `/api/{version}/users/{userId}`

### Query Parameters
- URL query string 파라미터
- 예: `?page=1&limit=10`

### Body Parameters
- POST/PUT 요청 body
- 재귀적 Object/Array 렌더링
- 동적 필드 추가/삭제

## 🔄 마이그레이션 가이드

### 이전 (CompositeTaskEditor, CommonTaskEditor 사용)

```typescript
// editorProviders.ts
if (step.type === 'beetle_task_infra_migration') {
  const TaskEditorComponent = BeetleTaskEditor;
} else if (step.type === 'grasshopper_task_software_migration') {
  const TaskEditorComponent = GrasshopperTaskEditor;
}
```

### 현재 (TaskComponentEditor 사용)

```typescript
// editorProviders.ts
if (step.componentType === 'task') {
  const TaskEditorComponent = TaskComponentEditor;  // 모든 task 통일
}
```

**변경사항**:
- ✅ 모든 task에 대해 단일 Editor 사용
- ✅ Task Component별 개별 Editor 불필요
- ✅ 유지보수성 향상
- ✅ 확장성 향상

## 📝 지원하는 Task Components

- `beetle_task_infra_migration`: Infrastructure 마이그레이션
- `grasshopper_task_software_migration`: Software 마이그레이션
- 기타 모든 Task Components (자동 지원)

**TaskComponentEditor는 JSON Schema만 있으면 모든 Task를 지원합니다!**

## 🧪 테스트

### E2E 테스트

```bash
cd front
npm test
```

테스트 시나리오:
1. Infrastructure Workflow 생성 및 실행
2. Software Workflow 생성
3. Task Editor에서 Query Parameters 수정
4. Workflow 저장 및 실행
5. Workloads에서 인프라 검증

상세 문서: `/front/tests/README.md`

## 🚀 향후 계획

1. **Schema 캐싱 최적화**: API 호출 최소화
2. **유효성 검사 강화**: 실시간 validation
3. **편집 기능 확장**: Drag & Drop, Copy & Paste
4. **테마 지원**: Dark/Light mode
5. **접근성 개선**: Keyboard navigation

## 📚 관련 문서

- [E2E 테스트 가이드](../../../../tests/README.md)
- [Quick Start Guide](../../../../tests/QUICKSTART.md)
- [Playwright 테스트 스크립트](../../../../tests/e2e-workflow-complete.spec.ts)

## 🔗 참고

- Vue 2.7 Composition API
- JSON Schema Specification
- Sequential Workflow Designer
- Pinia State Management
