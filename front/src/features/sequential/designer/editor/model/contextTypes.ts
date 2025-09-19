/**
 * Context 타입 정의 - Grasshopper Task Editor의 모든 가능한 Context 타입들
 * 
 * 이 파일은 GrasshopperTaskEditor에서 사용되는 모든 Context 타입들을 정의합니다.
 * 계층구조를 가진 데이터를 UI로 렌더링하기 위한 다양한 Context 타입들을 포함합니다.
 */

import { Ref } from 'vue';

// ============================================================================
// 기본 모델 타입들
// ============================================================================

/**
 * 기본 Input 모델 타입
 * useInputModel 훅에서 반환되는 모델의 타입
 */
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

/**
 * 고정 모델 타입 (Path Params, Query Params)
 */
export interface FixedModel {
  path_params: Record<string, string>;
  query_params: Record<string, string>;
}

// ============================================================================
// 기본 Context 타입들 (가장 작은 단위)
// ============================================================================

/**
 * Input Context - 단일 입력 필드
 * 가장 기본적인 Context 타입
 */
export interface InputContext {
  type: 'input';
  context: {
    title: string;
    model: InputModel;
  };
}

/**
 * Key-Value Input Context - 키-값 쌍 입력 필드
 * 동적으로 키와 값을 입력할 수 있는 필드
 */
export interface KeyValueInputContext {
  type: 'keyValueInput';
  context: {
    title: InputModel;
    model: InputModel;
  };
}

/**
 * Key-Value Context - 단순 키-값 쌍
 * ObjectArray에서 사용되는 기본 단위
 */
export interface KeyValueContext {
  type: 'keyValue';
  key: string;
  value: InputModel;
}

// ============================================================================
// Accordion 관련 Context 타입들
// ============================================================================

/**
 * Accordion Slot Context - 아코디언 내부의 각 슬롯
 */
export interface AccordionSlotContext {
  header: {
    icon: string;
    title: string; // index
  };
  content: Array<InputContext>;
}

/**
 * Accordion Context - 아코디언 형태의 Context
 * 배열 데이터를 아코디언으로 표시할 때 사용
 */
export interface AccordionContext {
  type: 'accordion';
  context: {
    subject: string;
    values: Array<AccordionSlotContext>;
  };
  index: number;
  originalData: Array<any>;
}

// ============================================================================
// Params 관련 Context 타입들
// ============================================================================

/**
 * Query Params Model - 쿼리 파라미터
 */
export interface QueryParamsModel {
  type: 'params';
  context: {
    subject: 'Query_Params';
    values: Array<InputContext>;
  };
}

/**
 * Path Params Model - 경로 파라미터
 */
export interface PathParamsModel {
  type: 'params';
  context: {
    subject: 'Path_Params';
    values: Array<InputContext>;
  };
}

/**
 * Params Context - 전체 파라미터 Context
 */
export interface ParamsContext {
  path_params: PathParamsModel;
  query_params: QueryParamsModel;
}

// ============================================================================
// Entity 관련 Context 타입들
// ============================================================================

/**
 * Entity Context - 엔티티 Context
 * 기본적인 키-값 쌍들을 그룹화
 */
export interface EntityContext {
  type: 'entity';
  context: {
    subject: 'Entity';
    values: Array<InputContext | KeyValueInputContext>;
  };
}

// ============================================================================
// 중첩 구조 Context 타입들
// ============================================================================

/**
 * Nested Object Context - 중첩된 객체 Context
 * 객체 안에 다른 객체나 배열이 있는 경우
 */
export interface NestedObjectContext {
  type: 'nestedObject';
  context: {
    subject: string;
    values: Array<InputContext | NestedObjectContext | ArrayContext | ObjectArrayContext>;
  };
}

/**
 * Array Context - 배열 Context
 * 배열 형태의 데이터를 처리
 */
export interface ArrayContext {
  type: 'array';
  context: {
    subject: string;
    values: Array<InputContext | NestedObjectContext | ArrayContext | ObjectArrayContext>;
  };
  originalData: Array<any>;
}

/**
 * Object Array Context - 객체 배열 Context
 * 객체들의 배열을 처리하는 Context
 */
export interface ObjectArrayContext {
  type: 'objectArray';
  subject: string;
  items: Array<ObjectContext>;
}

// ============================================================================
// Software Model 관련 Context 타입들
// ============================================================================

/**
 * Software Model Context - 소프트웨어 모델 Context
 */
export interface SoftwareModelContext {
  type: 'softwareModel';
  context: {
    subject: 'Software Model';
    values: Array<InputContext>;
  };
}

// ============================================================================
// Object 관련 Context 타입들 (ObjectArray.vue에서 사용)
// ============================================================================

/**
 * Object Context - 객체 Context
 * ObjectArray.vue에서 사용되는 객체 단위
 */
export interface ObjectContext {
  type: 'object';
  subject: string;
  fields: Array<KeyValueContext | ObjectContext | ArrayContext | ObjectArrayContext | ComplexContext>;
}

/**
 * Complex Context - 복합 Context
 * 다양한 타입이 섞인 복합 구조
 */
export interface ComplexContext {
  type: 'complex';
  subject: string;
  fields: Array<KeyValueContext | ObjectContext | ArrayContext | ObjectArrayContext | ComplexContext>;
}

// ============================================================================
// Form Context 타입들
// ============================================================================

/**
 * Form Context - 최상위 Form Context
 */
export interface FormContext {
  type: 'form';
  subject: string;
  fields: Array<Context>;
}

/**
 * Converted Data - 변환된 데이터 타입
 * grasshopperTaskEditorModel에서 사용되는 변환된 데이터
 */
export type ConvertedData = 
  | EntityContext 
  | AccordionContext 
  | NestedObjectContext 
  | ArrayContext 
  | ObjectArrayContext 
  | SoftwareModelContext;

// ============================================================================
// Union 타입들
// ============================================================================

/**
 * 모든 Context 타입의 Union
 */
export type Context = 
  | KeyValueContext 
  | ObjectContext 
  | ArrayContext 
  | ObjectArrayContext 
  | ComplexContext
  | InputContext
  | KeyValueInputContext
  | NestedObjectContext
  | EntityContext
  | AccordionContext
  | SoftwareModelContext;

/**
 * 모든 Form Context 타입의 Union
 */
export type FormContextType = 
  | EntityContext
  | ArrayContext
  | NestedObjectContext
  | ObjectArrayContext
  | AccordionContext
  | SoftwareModelContext;

// ============================================================================
// 유틸리티 타입들
// ============================================================================

/**
 * Context 타입 가드 함수들의 타입
 */
export interface ContextTypeGuards {
  isInputContext(context: any): context is InputContext;
  isKeyValueContext(context: any): context is KeyValueContext;
  isObjectContext(context: any): context is ObjectContext;
  isArrayContext(context: any): context is ArrayContext;
  isObjectArrayContext(context: any): context is ObjectArrayContext;
  isNestedObjectContext(context: any): context is NestedObjectContext;
  isEntityContext(context: any): context is EntityContext;
  isAccordionContext(context: any): context is AccordionContext;
  isSoftwareModelContext(context: any): context is SoftwareModelContext;
}

/**
 * Context 생성 함수들의 타입
 */
export interface ContextFactory {
  createInputContext(title: string, value: string, depth?: number, valueType?: string): InputContext;
  createKeyValueContext(key: string, value: string): KeyValueContext;
  createKeyValueInputContext(): KeyValueInputContext;
  createObjectContext(subject: string, fields: Array<Context>): ObjectContext;
  createArrayContext(subject: string, values: Array<Context>, originalData?: Array<any>): ArrayContext;
  createObjectArrayContext(subject: string, values: Array<AccordionSlotContext>, originalData?: Array<any>): ObjectArrayContext;
  createNestedObjectContext(subject: string, values: Array<Context>): NestedObjectContext;
  createEntityContext(values: Array<InputContext | KeyValueInputContext>): EntityContext;
  createAccordionContext(subject: string, values: Array<AccordionSlotContext>, originalData?: Array<any>): AccordionContext;
  createSoftwareModelContext(values: Array<InputContext>): SoftwareModelContext;
  createFormContext(subject: string, fields: Array<Context>): FormContext;
}

/**
 * Context 변환 함수들의 타입
 */
export interface ContextConverter {
  convertToFormContext(data: any): FormContext;
  convertFromFormContext(formContext: FormContext): any;
  convertArrayContextToData(arrayContext: ArrayContext): any[];
  convertObjectArrayContextToData(objectArrayContext: ObjectArrayContext): any[];
  convertNestedObjectContextToData(nestedObjectContext: NestedObjectContext): any;
  convertEntityContextToData(entityContext: EntityContext): any;
  convertAccordionContextToData(accordionContext: AccordionContext): any[];
  convertSoftwareModelContextToData(softwareModelContext: SoftwareModelContext): any;
  validateContext(context: Context): boolean;
}

/**
 * Context 편집 함수들의 타입
 */
export interface ContextEditor {
  addField(context: ObjectContext | ComplexContext | NestedObjectContext, field: Context): void;
  removeField(context: ObjectContext | ComplexContext | NestedObjectContext, fieldIndex: number): void;
  updateField(context: ObjectContext | ComplexContext | NestedObjectContext, fieldIndex: number, field: Context): void;
  addArrayItem(context: ArrayContext | ObjectArrayContext, item: KeyValueContext | ObjectContext): void;
  removeArrayItem(context: ArrayContext | ObjectArrayContext, itemIndex: number): void;
  updateArrayItem(context: ArrayContext | ObjectArrayContext, itemIndex: number, item: KeyValueContext | ObjectContext): void;
  addAccordionSlot(context: AccordionContext, slot: AccordionSlotContext): void;
  removeAccordionSlot(context: AccordionContext, slotIndex: number): void;
  updateAccordionSlot(context: AccordionContext, slotIndex: number, slot: AccordionSlotContext): void;
}

// ============================================================================
// Depth 관련 타입들
// ============================================================================

/**
 * Depth 정보를 포함한 Context
 */
export interface DepthContext {
  depth: number;
  maxDepth: number;
  context: Context;
}

/**
 * Depth별 렌더링 옵션
 */
export interface DepthRenderOptions {
  maxDepth: number;
  showDepthLabels: boolean;
  collapseNestedObjects: boolean;
  useObjectArrayForDepthZero: boolean;
}

// ============================================================================
// Validation 관련 타입들
// ============================================================================

/**
 * Context 유효성 검사 결과
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

/**
 * Context 유효성 검사 규칙
 */
export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

// ============================================================================
// Event 관련 타입들
// ============================================================================

/**
 * Context 변경 이벤트
 */
export interface ContextChangeEvent {
  type: 'add' | 'remove' | 'update' | 'move';
  context: Context;
  index?: number;
  oldValue?: any;
  newValue?: any;
}

/**
 * Context 이벤트 핸들러
 */
export interface ContextEventHandler {
  onChange: (event: ContextChangeEvent) => void;
  onValidate: (context: Context, result: ValidationResult) => void;
  onError: (context: Context, error: Error) => void;
}

// ============================================================================
// 설정 관련 타입들
// ============================================================================

/**
 * Context 렌더링 설정
 */
export interface ContextRenderConfig {
  readonly: boolean;
  showValidation: boolean;
  showDepthLabels: boolean;
  maxDepth: number;
  useObjectArrayForDepthZero: boolean;
  customRenderers?: Record<string, any>;
}

/**
 * Context 편집 설정
 */
export interface ContextEditConfig {
  allowAdd: boolean;
  allowRemove: boolean;
  allowEdit: boolean;
  allowReorder: boolean;
  validationRules: Array<ValidationRule>;
}

// ============================================================================
// 상수 정의
// ============================================================================

/**
 * Context 타입 상수
 */
export const CONTEXT_TYPES = {
  INPUT: 'input',
  KEY_VALUE: 'keyValue',
  KEY_VALUE_INPUT: 'keyValueInput',
  OBJECT: 'object',
  ARRAY: 'array',
  OBJECT_ARRAY: 'objectArray',
  NESTED_OBJECT: 'nestedObject',
  ENTITY: 'entity',
  ACCORDION: 'accordion',
  SOFTWARE_MODEL: 'softwareModel',
  FORM: 'form',
  COMPLEX: 'complex',
  PARAMS: 'params'
} as const;

/**
 * 기본 설정값
 */
export const DEFAULT_CONFIG: ContextRenderConfig = {
  readonly: false,
  showValidation: true,
  showDepthLabels: true,
  maxDepth: 5,
  useObjectArrayForDepthZero: true,
  customRenderers: {}
};

/**
 * 기본 편집 설정값
 */
export const DEFAULT_EDIT_CONFIG: ContextEditConfig = {
  allowAdd: true,
  allowRemove: true,
  allowEdit: true,
  allowReorder: true,
  validationRules: []
};