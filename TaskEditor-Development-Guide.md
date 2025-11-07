# TaskEditor 개발 가이드

## 개요

TaskEditor는 계층구조를 가진 데이터를 UI로 렌더링하는 컴포넌트입니다. 이 가이드는 GrasshopperTaskEditor의 구현 방법과 계층적 데이터 처리 로직을 설명합니다.

## 주요 컴포넌트 구조

### 1. GrasshopperTaskEditor.vue
- **역할**: 메인 에디터 컴포넌트
- **기능**: 
  - FormContext 데이터를 계층적으로 렌더링
  - depth 0의 array 타입을 ObjectArray.vue로 처리
  - depth 1-4까지의 중첩 구조 지원

### 2. ObjectArray.vue
- **역할**: 객체 배열을 렌더링하는 컴포넌트
- **기능**:
  - ObjectContext와 FieldGroupContext를 렌더링
  - 아이템 추가/삭제 기능
  - 접기/펼치기 기능

### 3. KeyValue.vue
- **역할**: 키-값 쌍을 렌더링하는 컴포넌트
- **기능**:
  - InputModel 객체의 값을 표시
  - v-model을 통한 양방향 바인딩

### 4. RecursiveFormField.vue
- **역할**: Body Parameters를 재귀적으로 렌더링하는 컴포넌트
- **기능**:
  - Simple Types (string, number, boolean) 입력 필드 렌더링
  - Array 타입 필드 렌더링 (Add entity, Remove 버튼 포함)
  - Object 타입 필드 렌더링 (collapse/expand 기능)
  - 재귀적 중첩 구조 지원
- **특징**:
  - **모든 depth의 object 필드에서 collapse/expand 가능** (2024-11-06 개선)
  - Array는 'Add entity', 'Remove' 버튼으로 항목 관리
  - Object는 collapse 버튼(▶/▼)으로 접기/펼치기만 가능
  - depth 기반 시각적 인디케이터 (색상별 좌측 바)
  - maxAutoExpandDepth 설정으로 자동 펼침 깊이 제어

## 계층적 데이터 처리 로직

### Depth 0 (최상위)
```typescript
// FormContext의 각 항목을 처리
if (formData.type === 'array' && isDepthZeroArray(formData)) {
  // ObjectArray.vue 사용
  <ObjectArray :context="convertToObjectArrayContext(formData)" />
} else {
  // DepthField.vue 사용 (기존 방식)
  <DepthField :field="item" />
}
```

### Depth 1-4 (중첩 구조)
```typescript
// convertToObjectArrayContext 함수에서 처리
const items = formData.context.values.map((item, index) => {
  if (item.type === 'nestedObject') {
    // nestedObject를 ObjectContext로 변환
    const fields = item.context.values.map((field) => {
      if (field.type === 'input') {
        return {
          type: 'keyValue',
          key: field.context.title + ' [depth-1-input]',
          value: field.context.model
        };
      } else if (field.type === 'array') {
        // depth 1의 array를 ObjectArray로 변환
        return {
          type: 'objectArray',
          subject: field.context.subject + ' [depth-1-array]',
          items: convertArrayItems(field.context.values)
        };
      }
      // ... 더 깊은 중첩 처리
    });
    
    return {
      type: 'object',
      subject: `Object ${index + 1} [depth-1-nestedObject]`,
      fields: fields
    };
  }
});
```

## 데이터 변환 로직

### ArrayContext → ObjectArrayContext
```typescript
function convertToObjectArrayContext(formData: any) {
  const items = formData.context.values.map((item, index) => {
    // 각 아이템을 ObjectContext로 변환
    return {
      type: 'object',
      subject: `Object ${index + 1}`,
      fields: convertFields(item)
    };
  });
  
  return {
    type: 'objectArray',
    subject: formData.context.subject + ' [depth-0-array]',
    items: items
  };
}
```

### InputContext → KeyValueContext
```typescript
// input 타입을 keyValue로 변환
{
  type: 'keyValue',
  key: field.context.title + ' [depth-X-input]',
  value: field.context.model  // InputModel 객체
}
```

## 타입 정의

### 주요 Context 타입들
```typescript
// contextTypes.ts
export interface InputModel {
  value: Ref<string>;
  errorMessage: Ref<string | null>;
  isValid: Ref<boolean>;
  validating: Ref<boolean>;
  touched: Ref<boolean>;
  onBlur: () => Promise<void>;
  exeValidation: (newValue: string) => Promise<void>;
  debouncedValidate: any;
}

export interface KeyValueContext {
  type: 'keyValue';
  key: string;
  value: InputModel;
}

export interface ObjectContext {
  type: 'object';
  subject: string;
  fields: Array<KeyValueContext | ObjectContext | ObjectArrayContext>;
}

export interface ObjectArrayContext {
  type: 'objectArray';
  subject: string;
  items: Array<ObjectContext>;
}
```

## 렌더링 규칙

### 1. Depth 0 Array
- **조건**: `formData.type === 'array' && isDepthZeroArray(formData)`
- **컴포넌트**: `ObjectArray.vue`
- **처리**: `convertToObjectArrayContext()` 함수로 변환

### 2. Depth 1-4 Array
- **조건**: `nestedField.type === 'array'`
- **컴포넌트**: `ObjectArray.vue`
- **처리**: 중첩된 array를 ObjectArray로 변환

### 3. Input Fields
- **조건**: `field.type === 'input'`
- **컴포넌트**: `KeyValue.vue`
- **처리**: InputContext를 KeyValueContext로 변환

## 주요 함수들

### 1. isDepthZeroArray()
```typescript
function isDepthZeroArray(formData: any): boolean {
  const isArray = formData.type === 'array';
  const hasDepthZero = formData.context.subject.includes('[d-sub-0-array]');
  return isArray && hasDepthZero;
}
```

### 2. convertToObjectArrayContext()
```typescript
function convertToObjectArrayContext(formData: any) {
  // depth 4까지의 중첩 구조를 ObjectArray로 변환
  const items = formData.context.values.map((item, index) => {
    // 각 depth별 처리 로직
  });
  
  return {
    type: 'objectArray',
    subject: subject,
    items: items
  };
}
```

### 3. updateObjectArrayContext()
```typescript
function updateObjectArrayContext(index: number, updatedContext: any) {
  // ObjectArrayContext를 다시 ArrayContext로 변환
  // formContext 업데이트
}
```

## 디버깅 방법

### 1. 콘솔 로그 활용
```typescript
console.log('=== depth 2 array 처리 시작 ===');
console.log('nestedField:', nestedField);
console.log('nestedField.context.values:', nestedField.context.values);
```

### 2. UI 디버깅 정보
```vue
<!-- KeyValue.vue -->
<div style="font-size: 10px; color: red; margin-bottom: 4px;">
  DEBUG: context.value.value = "{{ context.value.value }}"
</div>
```

### 3. ObjectArray 디버깅
```vue
<!-- ObjectArray.vue -->
<div style="font-size: 10px; color: blue; margin-top: 4px;">
  DEBUG: items.length = {{ context.items.length }}
</div>
```

## 주의사항

### 1. InputModel 바인딩
- `KeyValue.vue`에서 `v-model="context.value.value"` 사용
- `:model-value`와 `@update:model-value` 조합보다 `v-model`이 더 안정적

### 2. 타입 변환
- `InputContext` → `KeyValueContext` 변환 시 `value`는 `InputModel` 객체 그대로 전달
- `context.value.value`로 실제 문자열 값에 접근

### 3. Depth 처리
- 각 depth별로 적절한 라벨 추가 (`[depth-X-type]`)
- 중첩 구조에서 올바른 변환 로직 적용

### 4. RecursiveFormField Object Collapse
- **모든 depth의 object에서 collapse 가능** (기존: depth > 0만 가능)
- Object 필드는 collapse/expand만 가능하며 Add/Remove 버튼 없음
- Array 필드는 'Add entity', 'Remove' 버튼으로 항목 관리 가능
- depth 0의 object는 기본적으로 펼쳐진 상태로 시작 (사용자 편의성)

```vue
<!-- Object Type - 모든 depth에서 collapse 버튼 표시 -->
<div v-else-if="fieldSchema.type === 'object'" class="object-field">
  <div class="object-header">
    <div class="header-left">
      <button @click="toggleObjectCollapse" class="btn-collapse">
        {{ isObjectCollapsed ? '▶' : '▼' }}
      </button>
      <label class="field-label">
        {{ fieldName }}<span v-if="isRequired" class="required-mark">*</span>
        <span class="field-type">({{ Object.keys(fieldSchema.properties || {}).length }} properties)</span>
      </label>
    </div>
  </div>
  <div v-if="!isObjectCollapsed" class="object-properties">
    <!-- nested properties -->
  </div>
</div>
```

## 확장 방법

### 1. 새로운 Depth 추가
```typescript
// depth 5 추가 예시
} else if (depth4Field.type === 'nestedObject') {
  // depth 5의 nestedObject 처리
  const depth5Fields = depth4Field.context.values.map((depth5Field: any) => {
    // depth 5 처리 로직
  });
}
```

### 2. 새로운 타입 추가
```typescript
// 새로운 Context 타입 정의
export interface NewContext {
  type: 'newType';
  // ... 속성들
}

// convertToObjectArrayContext에서 처리
if (field.type === 'newType') {
  return {
    type: 'keyValue',
    key: field.context.title + ' [newType]',
    value: field.context.model
  };
}
```

## 성능 최적화

### 1. 불필요한 리렌더링 방지
- `v-model` 사용으로 반응성 최적화
- 적절한 `key` 속성 사용

### 2. 메모리 관리
- 디버깅 로그는 개발 완료 후 제거
- 큰 데이터셋의 경우 가상화 고려

## 테스트 방법

### 1. 단위 테스트
- 각 변환 함수의 입력/출력 검증
- 타입 변환 정확성 확인

### 2. 통합 테스트
- 전체 계층 구조 렌더링 확인
- 사용자 상호작용 테스트

### 3. 시각적 테스트
- 다양한 depth와 타입의 데이터로 UI 확인
- 반응형 레이아웃 테스트

### 4. RecursiveFormField 테스트
- Object 필드의 collapse/expand 동작 확인 (모든 depth)
- Array 필드의 'Add entity', 'Remove' 버튼 동작 확인
- 중첩된 구조에서 데이터 바인딩 정상 작동 확인
- 예시: BeetleTaskEditor의 Body Parameters (targetSshKey, targetCloud 등)

## Property 순서 정렬 기능

### 개요
Task Editor의 Body Parameters 영역에서 표시되는 property들의 순서를 제어할 수 있는 기능입니다. Task별로 중요한 property를 먼저 표시하거나, 논리적 순서로 정렬하여 사용자 경험을 개선합니다.

### 핵심 특징
- ✅ **Task별 개별 설정**: 각 Task Component마다 다른 정렬 규칙 적용 가능
- ✅ **경로 기반 정렬**: 중첩된 객체/배열 내부 property도 정렬 가능
- ✅ **부분 정렬 지원**: order에 지정된 property만 먼저 정렬, 나머지는 원래 순서 유지
- ✅ **안전한 fallback**: 잘못된 설정이 있어도 모든 property는 반드시 표시됨

### 구현 구조

#### 1. taskPropertyOrderConfig.ts
Property 순서 설정을 관리하는 중앙 설정 파일입니다.

```typescript
// 위치: front/src/features/sequential/designer/editor/config/taskPropertyOrderConfig.ts

export interface PropertyOrderRule {
  path: string;        // 'body_params', 'body_params.targetVmInfra' 등
  order: string[];     // 순서대로 나열할 property 이름들
}

export const TASK_PROPERTY_ORDER_CONFIG: Record<string, PropertyOrderRule[]> = {
  'beetle_task_infra_migration': [
    {
      path: 'body_params',
      order: ['targetVmInfra', 'targetSecurityGroupList', 'targetSshKey']
    },
    {
      path: 'body_params.targetVmInfra',
      order: ['name', 'description', 'subGroups']
    }
  ]
};
```

#### 2. RecursiveFormField.vue
재귀적으로 렌더링되는 모든 필드에 정렬 로직을 적용합니다.

**주요 변경사항:**
- `taskName`, `currentPath` props 추가
- `sortedPropertyNames` computed property: Object 타입 필드의 property 정렬
- `sortedArrayItemPropertyNames` computed property: Array 아이템 내부 property 정렬
- `computedChildPath()`: 중첩된 경로 자동 계산

```vue
<template>
  <!-- Object 타입: sortedPropertyNames 사용 -->
  <recursive-form-field
    v-for="propName in sortedPropertyNames"
    :task-name="taskName"
    :current-path="computedChildPath(propName)"
  />
  
  <!-- Array 타입: sortedArrayItemPropertyNames 사용 -->
  <recursive-form-field
    v-for="propName in sortedArrayItemPropertyNames"
    :task-name="taskName"
    :current-path="`${currentPath}[]`"
  />
</template>
```

#### 3. TaskComponentEditor.vue
최상위 Body Parameters 섹션에 정렬 기능을 통합합니다.

**주요 변경사항:**
- `getCurrentTaskComponentName()`: 현재 task 이름 추출 (step.name 또는 step.type 사용)
- `sortedBodyParamPropertyNames` computed property: 최상위 body params property 정렬
- `hasBodyParams`를 computed property로 변경하여 reactive하게 동작

### 경로(Path) 체계

경로는 점(`.`)으로 구분하며, 배열은 `[]`로 표시합니다:

```typescript
// 기본 경로
'body_params'                                    // 최상위
'body_params.targetVmInfra'                     // 1단계 객체
'body_params.targetVmInfra.subGroups'           // 2단계 객체

// 배열 경로
'body_params.servers[]'                         // 1단계 배열의 각 아이템
'body_params.servers[].migration_list'          // 배열 아이템 내부 객체
'body_params.servers[].packages[]'              // 중첩 배열
```

### 정렬 로직

#### sortPropertiesByOrder() 함수
```typescript
export function sortPropertiesByOrder(
  properties: string[],  // 실제 존재하는 property들
  order: string[]        // 설정된 순서
): string[] {
  // 1. order에 명시된 property들 중 실제 존재하는 것만 추출
  const ordered = order.filter(key => properties.includes(key));
  
  // 2. order에 없는 나머지 property들 (원래 순서 유지)
  const remaining = properties.filter(key => !order.includes(key));
  
  // 3. 순서대로 병합
  return [...ordered, ...remaining];
}
```

**동작 예시:**
```typescript
// 실제 properties
const actual = ['name', 'description', 'label', 'subGroups', 'installMonAgent'];

// 설정된 order
const order = ['name', 'description', 'subGroups'];

// 결과
// → ['name', 'description', 'subGroups', 'label', 'installMonAgent']
//    ✅ name, description, subGroups는 앞에 순서대로
//    ✅ 나머지는 원래 순서로 뒤에 배치
```

### 안전성 보장

#### 1. 잘못된 Property 이름
```typescript
// order에 존재하지 않는 property 포함
order: ['xyz', 'name', 'abc', 'description']

// 결과: xyz, abc는 자동으로 무시됨
// → ['name', 'description', ...나머지]
```

#### 2. 경로 불일치
```typescript
// path가 틀렸거나 매칭되지 않는 경우
const order = getPropertyOrder('task_name', 'wrong_path');
// → null 반환

// sortedPropertyNames에서
return order ? sortPropertiesByOrder(keys, order) : keys;
// → 원래 순서 그대로 표시
```

#### 3. Task 설정 없음
```typescript
// TASK_PROPERTY_ORDER_CONFIG에 없는 task
const rules = TASK_PROPERTY_ORDER_CONFIG['unknown_task'];
// → undefined

// getPropertyOrder에서
if (!rules) return null;
// → 원래 순서 그대로 표시
```

### 사용 예시

#### 예시 1: beetle_task_infra_migration
```typescript
'beetle_task_infra_migration': [
  {
    // 최상위 Body Parameters 정렬
    path: 'body_params',
    order: [
      'targetVmInfra',           // 1순위: VM 인프라 설정
      'targetSecurityGroupList', // 2순위: 보안 그룹
      'targetSshKey',            // 3순위: SSH 키
      'targetVNet'               // 4순위: 가상 네트워크
    ]
  },
  {
    // targetVmInfra 내부 property 정렬
    path: 'body_params.targetVmInfra',
    order: [
      'name',           // 1순위: 이름
      'description',    // 2순위: 설명
      'subGroups',      // 3순위: 서브 그룹
      'installMonAgent' // 4순위: 모니터링 에이전트
    ]
  }
]
```

#### 예시 2: grasshopper_task_software_migration
```typescript
'grasshopper_task_software_migration': [
  {
    // servers 배열의 각 아이템 내부 정렬
    path: 'body_params.targetSoftwareModel.servers[]',
    order: [
      'source_connection_info_id', // 1순위: 소스 연결 정보
      'migration_list',            // 2순위: 마이그레이션 목록
      'errors'                     // 3순위: 에러 정보
    ]
  },
  {
    // 중첩 배열 내부 정렬
    path: 'body_params.targetSoftwareModel.servers[].migration_list.packages[]',
    order: [
      'name',     // 1순위: 패키지 이름
      'version',  // 2순위: 버전
      'repo_url'  // 3순위: 저장소 URL
    ]
  }
]
```

### 새로운 Task 추가 방법

1. **taskPropertyOrderConfig.ts 수정**
```typescript
export const TASK_PROPERTY_ORDER_CONFIG: Record<string, PropertyOrderRule[]> = {
  // ... 기존 설정 ...
  
  'new_task_name': [
    {
      path: 'body_params',
      order: ['important_field1', 'important_field2']
    }
  ]
};
```

2. **브라우저에서 확인**
   - 설정이 없어도 모든 property는 정상 표시됨 (기본 순서)
   - 설정을 추가하면 즉시 정렬이 적용됨

### 디버깅

Property 정렬 과정을 디버깅하려면 브라우저 콘솔에서 다음 로그를 확인하세요:

```javascript
// TaskComponentEditor.vue - 최상위 정렬
🔍 Body Params Property Sorting: {
  taskName: "beetle_task_infra_migration",
  originalKeys: [...],
  order: [...],
  sortedKeys: [...]
}

// RecursiveFormField.vue - 중첩 정렬
⭐ sortedPropertyNames computed called!
   📋 Properties keys: [...]
   📋 Task name: "beetle_task_infra_migration"
   📋 Order from config: [...]
   ✅ Final sorted keys: [...]
```

### 성능 고려사항

- **Computed Properties 사용**: Vue의 반응성 시스템을 활용하여 필요할 때만 재계산
- **경량 알고리즘**: `filter()` 연산만 사용하여 O(n) 시간 복잡도
- **메모리 효율**: 원본 배열 변경 없이 새 배열 반환

### 제약사항 및 주의사항

1. **Path 정확성**: 경로는 대소문자를 구분하며 정확히 일치해야 함
2. **배열 표기**: 배열은 반드시 `[]`로 표시 (예: `servers[]`)
3. **부분 정렬**: order에 없는 property는 자동으로 뒤에 추가됨
4. **Reactive 동작**: `hasBodyParams`는 computed property여야 정상 작동

## 최근 변경 이력

### 2024-11-06: Property 순서 정렬 기능 추가
- **변경 내용**: Task Editor의 Body Parameters 영역에서 property 표시 순서를 제어하는 기능 추가
- **추가된 파일**:
  - `taskPropertyOrderConfig.ts`: 중앙 설정 관리
- **수정된 파일**:
  - `RecursiveFormField.vue`: 정렬 로직 통합, taskName/currentPath props 추가
  - `TaskComponentEditor.vue`: 최상위 정렬 지원, hasBodyParams를 computed로 변경
- **주요 기능**:
  - Task별 개별 정렬 규칙 설정
  - 중첩된 객체/배열 내부 property 정렬 지원
  - 경로 기반 정렬 (`body_params.targetVmInfra`, `servers[]` 등)
  - 안전한 fallback (잘못된 설정이 있어도 모든 property 표시)
- **사용 예시**: 
  - `beetle_task_infra_migration`: targetVmInfra를 최상단에 배치
  - `grasshopper_task_software_migration`: servers 배열 내부 정렬

### 2024-11-06: RecursiveFormField Object Collapse 개선
- **변경 내용**: Object 타입 필드의 collapse 기능을 모든 depth에서 사용 가능하도록 개선
- **이전**: depth > 0에서만 collapse 버튼 표시
- **개선 후**: 모든 depth (depth 0 포함)에서 collapse 버튼 표시
- **영향 범위**:
  - `RecursiveFormField.vue` Line 124: `v-if="depth > 0"` 조건 제거
  - `RecursiveFormField.vue` Line 137: `v-if="depth === 0 || !isObjectCollapsed"` → `v-if="!isObjectCollapsed"`로 변경
- **사용 예시**: Body Parameters의 targetSshKey(9 properties), targetCloud(2 properties) 등의 object 필드에서 collapse/expand 가능

---

이 가이드는 TaskEditor의 핵심 구현 방법을 설명합니다. 추가 질문이나 개선사항이 있으면 언제든 문의하세요.
