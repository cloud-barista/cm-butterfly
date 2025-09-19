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

---

이 가이드는 TaskEditor의 핵심 구현 방법을 설명합니다. 추가 질문이나 개선사항이 있으면 언제든 문의하세요.
