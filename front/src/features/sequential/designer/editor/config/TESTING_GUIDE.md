# Task Property Order 기능 테스트 가이드

## 구현 완료 사항

### 1. 설정 파일
- `taskPropertyOrderConfig.ts` 생성 완료
- `beetle_task_infra_migration`과 `grasshopper_task_software_migration` 순서 규칙 정의 완료

### 2. RecursiveFormField.vue
- `taskName`과 `currentPath` props 추가 완료
- `sortedPropertyNames`, `sortedArrayItemPropertyNames` computed 추가 완료
- Object 및 Array item properties 렌더링 시 정렬 적용 완료

### 3. TaskComponentEditor.vue
- `getCurrentTaskComponentName()` 메서드 추가 완료
- RecursiveFormField에 taskName과 currentPath 전달 완료

## 테스트 시나리오

### 테스트 1: beetle_task_infra_migration

**목적**: Body Parameters의 property 순서가 설정대로 표시되는지 확인

**테스트 단계**:
1. Workflow Editor를 엽니다
2. `beetle_task_infra_migration` task를 생성하거나 기존 task를 엽니다
3. Task Editor가 열리면 Body Parameters 섹션을 확인합니다

**예상 결과**:
Body Parameters의 property들이 다음 순서로 표시되어야 합니다:
1. `targetVmInfra` (첫 번째)
2. `targetSecurityGroupList`
3. `targetSshKey`
4. `targetVNet`
5. `targetVmOsImageList`
6. `targetVmSpecList`
7. (기타 설정에 없는 properties가 있다면 원래 순서대로 마지막에 표시)

**검증 방법**:
- 브라우저 개발자 도구(F12)를 열고 Console 탭 확인
- RecursiveFormField에서 출력되는 로그 확인
- UI에서 실제 필드 순서 육안 확인

### 테스트 2: grasshopper_task_software_migration

**목적**: servers 배열의 각 item 내부 property 순서가 설정대로 표시되는지 확인

**테스트 단계**:
1. Workflow Editor를 엽니다
2. `grasshopper_task_software_migration` task를 생성하거나 기존 task를 엽니다
3. Task Editor가 열리면 Body Parameters 섹션을 확인합니다
4. `servers` 배열이 있다면 펼칩니다
5. 배열의 각 item을 펼쳐서 내부 properties를 확인합니다

**예상 결과**:
servers 배열의 각 item 내부에서 property들이 다음 순서로 표시되어야 합니다:
1. `source_connection_info_id` (첫 번째)
2. `migration_list`
3. `errors`
4. (기타 설정에 없는 properties가 있다면 원래 순서대로 마지막에 표시)

**검증 방법**:
- UI에서 servers 배열의 item을 펼쳤을 때 필드 순서 확인
- 브라우저 개발자 도구에서 sortedArrayItemPropertyNames 결과 확인

### 테스트 3: 다른 Task (설정 없음)

**목적**: 설정이 없는 task는 기존 동작을 유지하는지 확인

**테스트 단계**:
1. Workflow Editor를 엽니다
2. 다른 task component (예: `tumblebug_mci_dynamic`)를 엽니다
3. Task Editor의 Body Parameters를 확인합니다

**예상 결과**:
- Property들이 기존과 동일한 순서로 표시되어야 합니다
- 순서 변경이 없어야 합니다

## 디버깅 팁

### 1. Console 로그 확인

RecursiveFormField.vue에서 다음 로그를 추가하여 확인할 수 있습니다:

```typescript
// sortedPropertyNames computed 내부에 추가
console.log('🔍 Property Sorting:', {
  taskName: props.taskName,
  currentPath: props.currentPath,
  originalKeys: keys,
  order: order,
  sortedKeys: order ? sortPropertiesByOrder(keys, order) : keys
});
```

### 2. 경로(Path) 확인

현재 필드의 경로가 올바른지 확인:
- `body_params` - beetle_task의 최상위 body params
- `body_params.servers[]` - grasshopper_task의 servers 배열 item 내부

### 3. Task Name 확인

getCurrentTaskComponentName()이 올바른 값을 반환하는지 확인:

```typescript
// TaskComponentEditor.vue에서 확인
console.log('Current Task Component:', getCurrentTaskComponentName());
```

## 추가 설정 방법

새로운 task에 순서 규칙을 추가하려면:

1. `taskPropertyOrderConfig.ts` 파일을 엽니다
2. `TASK_PROPERTY_ORDER_CONFIG`에 새로운 task 설정을 추가합니다:

```typescript
export const TASK_PROPERTY_ORDER_CONFIG: Record<string, PropertyOrderRule[]> = {
  // ... 기존 설정 ...
  
  'new_task_name': [
    {
      path: 'body_params',  // 또는 'body_params.someArray[]' 등
      order: [
        'property1',
        'property2',
        'property3'
      ]
    }
  ]
};
```

## 알려진 제한사항

1. **중첩 경로**: 현재는 `body_params`, `body_params.field[]` 형태의 경로만 지원합니다
2. **동적 경로**: 배열 인덱스를 포함한 동적 경로는 `[]`로 표현합니다
3. **순서 유지**: 설정에 없는 properties는 원래 순서를 유지합니다 (알파벳 순 아님)

## 성공 기준

✅ beetle_task_infra_migration의 Body Parameters에서 targetVmInfra가 첫 번째로 표시됨
✅ grasshopper_task_software_migration의 servers[] item에서 source_connection_info_id가 첫 번째로 표시됨
✅ 설정이 없는 다른 task들은 기존 순서 유지됨
✅ Linter 오류 없음
✅ 기존 기능에 영향 없음

