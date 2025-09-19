# CommonTaskEditor 사용법

## 개요
CommonTaskEditor는 어떤 객체를 넣어도 표시되도록 구현된 범용 태스크 에디터 컴포넌트입니다. RecursiveFieldRenderer를 사용하여 재귀적으로 모든 타입의 필드를 렌더링하며, input, array, nestedObject, entity 타입을 모두 처리합니다.

## 구조
- **CommonTaskEditor**: 메인 컴포넌트로 componentName, pathParams, queryParams, formData를 처리
- **RecursiveFieldRenderer**: 재귀적으로 필드를 렌더링하는 핵심 컴포넌트
- **FieldGroup**: 기본 필드 입력 패턴을 담당하는 컴포넌트

## Props

### formData (required)
- **타입**: `Field[]`
- **설명**: 렌더링할 폼 데이터 배열
- **구조**:
```typescript
interface Field {
  type: 'input' | 'array' | 'nestedObject' | 'entity';
  context: {
    title?: string;
    subject?: string;
    model?: {
      value: string;
      isValid?: boolean;
      onBlur?: () => void;
    };
    values?: Field[];
  };
}
```

### componentName (optional)
- **타입**: `{ title: string; modelValue: string; readonly?: boolean; }`
- **설명**: 컴포넌트 이름 필드 설정

### pathParams (optional)
- **타입**: `{ subject: string; values: Field[]; }`
- **설명**: 경로 파라미터 설정

### queryParams (optional)
- **타입**: `{ subject: string; values: Field[]; }`
- **설명**: 쿼리 파라미터 설정

## 사용 예시

### 기본 사용법
```vue
<template>
  <CommonTaskEditor
    :form-data="formContext"
    :component-name="componentNameData"
    :path-params="pathParamsData"
    :query-params="queryParamsData"
  />
</template>

<script setup lang="ts">
import { CommonTaskEditor } from '@/shared/ui/Input';

const formContext = ref([
  {
    type: 'entity',
    context: {
      subject: 'Server Configuration',
      values: [
        {
          type: 'input',
          context: {
            title: 'Server Name',
            model: {
              value: 'my-server',
              isValid: true
            }
          }
        }
      ]
    }
  }
]);

const componentNameData = {
  title: 'Component Name',
  modelValue: 'MyComponent',
  readonly: true
};
</script>
```

### GrasshopperTaskEditor에서 사용하는 방법
```vue
<template>
  <CommonTaskEditor
    :form-data="taskEditorModel.formContext.value"
    :component-name="{
      title: taskEditorModel.componentNameModel.value.context.title,
      modelValue: taskEditorModel.componentNameModel.value.context.model.value,
      readonly: true
    }"
    :path-params="taskEditorModel.paramsContext.value?.path_params"
    :query-params="taskEditorModel.paramsContext.value?.query_params"
  />
</template>

<script setup lang="ts">
import { CommonTaskEditor } from '@/shared/ui/Input';
// ... 기존 코드
</script>
```

## 특징

1. **완전한 재귀적 렌더링**: RecursiveFieldRenderer를 통해 무한 깊이의 중첩 구조 처리
2. **타입 안전성**: TypeScript 인터페이스로 타입 보장
3. **재사용성**: 어떤 태스크 타입에도 사용 가능
4. **스타일 일관성**: 기존 GrasshopperTaskEditor와 동일한 스타일 유지
5. **특별 처리**: migration_list는 특별한 스타일로 처리
6. **성능 최적화**: 컴포넌트 분리로 렌더링 성능 향상

## 지원하는 중첩 구조

```
migration_list: {
  containers: [
    {
      envs: [
        { name: string, value: string }
      ],
      custom_configs: [
        { key: string, value: string }
      ]
    }
  ],
  binaries: [
    {
      custom_data_paths: [
        { path: string }
      ]
    }
  ]
}
```

이런 복잡한 중첩 구조도 자동으로 처리됩니다.

## 제외사항
- migration_list 관련 로직 (GrasshopperTaskEditor 전용)
- binaries, containers, kubernetes 특화 로직
- Task별 특수한 비즈니스 로직
