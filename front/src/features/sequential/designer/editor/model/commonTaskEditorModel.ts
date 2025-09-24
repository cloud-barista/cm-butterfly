import { useInputModel } from '@/shared/hooks/input/useInputModel';
import { ref, UnwrapRef } from 'vue';
import { isArray } from 'lodash';
import { DEFAULT_NAMESPACE } from '@/shared/constants/namespace';

export interface FixedModel {
  path_params: Record<string, string>;
  query_params: Record<string, string>;
}

// JSON Schema 타입 정의
export interface JsonSchema {
  type: 'string' | 'integer' | 'number' | 'boolean' | 'object' | 'array';
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  enum?: string[];
  required?: string[];
  default?: any;
  description?: string;
  example?: any;
}

// 공통 컨텍스트 속성
interface BaseContext {
  title?: string;
  subject?: string;
  isRequired: boolean;
  description?: string;
  skipReason?: string;
}

// UI 컨텍스트 타입들
type InputContext = {
  type: 'input';
  context: {
    title: string;
    model: ReturnType<typeof useInputModel<string>>;
    isRequired: boolean;
    description?: string;
    example?: string;
    placeholder?: string;
    isJsonField?: boolean;
    skipReason?: string;
  };
};

type SelectContext = {
  type: 'select';
  context: {
    title: string;
    model: ReturnType<typeof useInputModel<string>>;
    options: Array<{label: string, value: string}>;
    isRequired: boolean;
    description?: string;
    placeholder?: string;
    skipReason?: string;
  };
};

type CheckboxContext = {
  type: 'checkbox';
  context: {
    title: string;
    model: ReturnType<typeof useInputModel<boolean>>;
    isRequired: boolean;
    description?: string;
    skipReason?: string;
  };
};

type KeyValueInputContext = {
  type: 'keyValueInput';
  context: {
    title: ReturnType<typeof useInputModel<string>>;
    model: ReturnType<typeof useInputModel<string>>;
    isRequired: boolean;
  };
};

type AccordionSlotContext = {
  header: {
    icon: string;
    title: string;
  };
  content: Array<InputContext | SelectContext | CheckboxContext | KeyValueInputContext | NestedObjectContext | ArrayContext | UnknownTypeContext>;
};

type AccordionContext = {
  type: 'accordion';
  context: {
    subject: string;
    values: Array<AccordionSlotContext>;
    isRequired?: boolean;
    description?: string;
    skipReason?: string;
  };
  index: number;
  originalData: Array<any>;
  schema: JsonSchema;
};

type NestedObjectContext = {
  type: 'nestedObject';
  context: {
    subject: string;
    values: Array<InputContext | SelectContext | CheckboxContext | KeyValueInputContext | NestedObjectContext | ArrayContext | UnknownTypeContext>;
    isRequired: boolean;
    description?: string;
    skipReason?: string;
  };
  schema: JsonSchema;
  path: string;
};

type ArrayContext = {
  type: 'array';
  context: {
    subject: string;
    values: Array<InputContext | SelectContext | CheckboxContext | KeyValueInputContext | NestedObjectContext | ArrayContext | UnknownTypeContext>;
    isRequired: boolean;
    description?: string;
    skipReason?: string;
  };
  schema: JsonSchema;
  path: string;
  originalData: Array<any>;
};

type UnknownTypeContext = {
  type: 'unknownType';
  context: {
    title: string;
    subject: string;
    isRequired: boolean;
    description?: string;
    reason: string;
    skipReason?: string;
  };
};

type ParamsModel = {
  type: 'params';
  context: {
    subject: string;
    values: Array<InputContext>;
  };
};

type ConvertedData = 
  | InputContext 
  | SelectContext 
  | CheckboxContext 
  | KeyValueInputContext 
  | AccordionContext 
  | NestedObjectContext 
  | ArrayContext
  | UnknownTypeContext;

export function useCommonTaskEditorModel() {
  const formContext = ref<any[]>([]);
  const paramsContext = ref<any>();
  const componentNameModel = ref<any>();
  
  let originalObject: any = null;
  let originalSchema: JsonSchema | null = null;
  let taskComponentModel: JsonSchema | null = null; // task component의 기본 모델 저장

  // 타입 안전한 접근을 위한 헬퍼 메서드들 (커서 룰에 따라 as any 사용)
  function getContextSubject(item: any): string {
    return item.context?.subject || item.context?.title || '';
  }

  function getContextValues(item: any): any[] {
    return item.context?.values || [];
  }

  function setContextValues(item: any, values: any[]): void {
    if (item.context) {
      item.context.values = values;
    }
  }

  function getModelValue(item: any): any {
    return item.context?.model?.value;
  }

  function setModelValue(item: any, value: any): void {
    if (item.context?.model) {
      item.context.model.value = value;
    }
  }
  
  // 안전한 초기화를 위한 기본값 설정
  const initializeDefaults = () => {
    if (!formContext.value) {
      formContext.value = [];
    }
    if (!componentNameModel.value) {
      componentNameModel.value = {
        type: 'input',
        context: {
          title: 'name',
          model: useInputModel(''),
          isRequired: false,
        },
      };
    }
  };

  // JSON Schema를 UI 컨텍스트로 변환하는 메인 함수
  function parseJsonSchema(schema: JsonSchema, path: string = '', isRequired: boolean = false): any[] {
    console.log('parseJsonSchema called with:', { schema, path, isRequired });
    const result: any[] = [];
    
    // schema.type이 없거나 'object'인 경우, properties가 있으면 처리
    if ((!schema.type || schema.type === 'object') && schema.properties) {
      console.log('Processing object schema with properties:', Object.keys(schema.properties));
      Object.entries(schema.properties).forEach(([key, value]) => {
        console.log(`Processing property: ${key}`, value);
        const fieldPath = path ? `${path}.${key}` : key;
        const fieldRequired = schema.required?.includes(key) || isRequired;
        
        console.log(`Field ${key} - type: ${value.type}, required: ${fieldRequired}`);
        console.log(`Field ${key} - has properties: ${!!value.properties}, properties count: ${value.properties ? Object.keys(value.properties).length : 0}`);
        
        if (value.type === 'object') {
          // properties가 있는 경우에만 nested object로 처리
          if (value.properties && Object.keys(value.properties).length > 0) {
            const nestedContext = createNestedObjectContext(key, value, fieldPath, fieldRequired);
            console.log(`Created nested object context for ${key}:`, nestedContext);
            result.push(nestedContext as any);
          } else {
            // properties가 없는 빈 객체는 모두 Unknown Type으로 처리
            console.log(`Creating unknown type context for ${key} - empty object without properties`);
            const unknownContext = createUnknownTypeContext(key, value, fieldPath, fieldRequired, 'Empty object without properties');
            console.log(`Created unknown type context for ${key}:`, unknownContext);
            result.push(unknownContext as any);
          }
        } else if (value.type === 'array') {
          console.log(`Processing array field ${key}:`, { 
            schema: value, 
            hasItems: !!value.items, 
            itemsType: value.items?.type,
            itemsProperties: value.items?.properties ? Object.keys(value.items.properties) : 'none'
          });
          const arrayContext = createArrayContext(key, value, fieldPath, fieldRequired);
          console.log(`Created array context for ${key}:`, arrayContext);
          result.push(arrayContext as any);
        } else {
          // type이 정의되지 않았거나 특수한 경우 처리
          if (!value.type) {
            console.log(`Field ${key} has no type defined, creating input with skip reason`);
            const noTypeContext = {
              type: 'input',
              context: {
                title: key,
                model: useInputModel(''),
                isRequired: fieldRequired,
                description: value.description || 'No type defined in schema',
                placeholder: 'Enter value',
                skipReason: 'No type defined in schema',
              },
            } as any;
            result.push(noTypeContext);
          } else {
            const fieldContext = createFieldContext(key, value, fieldPath, fieldRequired);
            console.log(`Created field context for ${key}:`, fieldContext);
            result.push(fieldContext as any);
          }
        }
      });
    } else {
      console.log('Schema is not an object or has no properties:', { 
        type: schema.type, 
        hasProperties: !!schema.properties,
        schemaKeys: Object.keys(schema)
      });
    }
    
    console.log('parseJsonSchema result:', result);
    return result;
  }

  // 개별 필드 컨텍스트 생성 (커서 룰에 따라 any 사용)
  function createFieldContext(
    key: string, 
    schema: JsonSchema, 
    path: string, 
    isRequired: boolean
  ): any {
    console.log(`createFieldContext called for ${key}:`, { schema, path, isRequired });
    
    const baseContext = {
      title: key,
      isRequired,
      description: schema.description,
      example: schema.example,
    };

    if (schema.enum) {
      // default 값이 enum에 있으면 해당 값을 사용, 없으면 첫 번째 값 사용
      const defaultValue = schema.default && schema.enum.includes(schema.default) 
        ? schema.default 
        : schema.enum[0] || '';
        
      const options = schema.enum.map(option => ({
        label: String(option),
        value: String(option)
      }));
        
      const selectContext = {
        type: 'select',
        context: {
          ...baseContext,
          model: useInputModel(defaultValue),
          options: options,
          placeholder: '', // select 타입은 placeholder 없음
        },
      } as SelectContext;
      console.log(`Created select context for ${key}:`, {
        defaultValue,
        options,
        enum: schema.enum,
        default: schema.default
      });
      return selectContext;
    }

    if (schema.type === 'boolean') {
      const checkboxContext = {
        type: 'checkbox',
        context: {
          ...baseContext,
          model: useInputModel(schema.default || false),
        },
      } as CheckboxContext;
      console.log(`Created checkbox context for ${key}:`, checkboxContext);
      return checkboxContext;
    }

    if (schema.type === 'integer' || schema.type === 'number') {
      const inputContext = {
        type: 'input',
        context: {
          ...baseContext,
          model: useInputModel(String(schema.default || '')),
        },
      } as InputContext;
      console.log(`Created number input context for ${key}:`, inputContext);
      return inputContext;
    }

    // 기본적으로 string 타입
    const defaultInputContext = {
      type: 'input',
      context: {
        ...baseContext,
        model: useInputModel(schema.default || ''),
        placeholder: schema.example || '',
      },
    } as InputContext;
    console.log(`Created default input context for ${key} with placeholder:`, schema.example, defaultInputContext);
    return defaultInputContext;
  }

  // 중첩 객체 컨텍스트 생성 (커서 룰에 따라 any 사용)
  function createNestedObjectContext(
    key: string, 
    schema: JsonSchema, 
    path: string, 
    isRequired: boolean
  ): any {
    const values = parseJsonSchema(schema, path, isRequired);
    
    return {
      type: 'nestedObject',
      context: {
        subject: key,
        values: values as any, // 타입 호환성을 위한 안전한 캐스팅
        isRequired,
        description: schema.description,
      },
      schema,
      path,
    };
  }

  // JSON 입력 컨텍스트 생성 (빈 객체 필드용)
  function createJsonInputContext(
    key: string, 
    schema: JsonSchema, 
    path: string, 
    isRequired: boolean
  ): InputContext {
    console.log(`createJsonInputContext called for ${key}:`, { schema, path, isRequired });
    return {
      type: 'input',
      context: {
        title: key,
        model: useInputModel('{}'),
        isRequired,
        description: schema.description || 'JSON object input (no properties defined)',
        placeholder: 'Enter JSON object (e.g., {"key": "value"})',
        isJsonField: true,
        skipReason: 'Object type but no properties defined - using JSON input',
      },
    };
  }

  // Unknown Type 컨텍스트 생성 (처리할 수 없는 필드용)
  function createUnknownTypeContext(
    key: string, 
    schema: JsonSchema, 
    path: string, 
    isRequired: boolean,
    reason: string
  ): UnknownTypeContext {
    console.log(`createUnknownTypeContext called for ${key}:`, { schema, path, isRequired, reason });
    return {
      type: 'unknownType',
      context: {
        title: key,
        subject: key,
        isRequired,
        description: schema.description,
        reason: reason,
        skipReason: `Cannot process this field: ${reason}`,
      },
    };
  }

  // 배열 컨텍스트 생성 (커서 룰에 따라 any 사용)
  function createArrayContext(
    key: string, 
    schema: JsonSchema, 
    path: string, 
    isRequired: boolean
  ): any {
    console.log(`createArrayContext called for ${key}:`, { 
      schema, 
      path, 
      isRequired,
      itemsType: schema.items?.type,
      hasItemsProperties: !!schema.items?.properties
    });
    
    if (schema.items?.type === 'object') {
      // 객체 배열인 경우 Accordion으로 표시
      console.log(`Creating AccordionContext for object array ${key}`);
      return {
        type: 'accordion',
        context: {
          subject: key,
          values: [],
          isRequired,
          description: schema.description,
        },
        index: 0,
        originalData: [],
        schema,
      } as AccordionContext;
    } else {
      // 기본 타입 배열인 경우
      return {
        type: 'array',
        context: {
          subject: key,
          values: [],
          isRequired,
          description: schema.description,
        },
        schema,
        path,
        originalData: [],
      } as ArrayContext;
    }
  }

  // 기존 값 로드
  function loadExistingValues(schema: JsonSchema, existingData: any) {
    console.log('loadExistingValues called with:', { 
      schema, 
      existingData,
      schemaType: schema.type,
      hasProperties: !!schema.properties,
      propertiesKeys: schema.properties ? Object.keys(schema.properties) : []
    });
    originalObject = existingData;
    
    // schema.type이 없거나 'object'인 경우, properties가 있으면 처리
    if ((!schema.type || schema.type === 'object') && schema.properties && Object.keys(schema.properties).length > 0) {
      console.log('Schema is object with properties, calling parseJsonSchema and populateFormWithExistingData');
      formContext.value = parseJsonSchema(schema) as any;
      populateFormWithExistingData(existingData, '');
    } else if (schema.properties && Object.keys(schema.properties).length > 0) {
      // type이 없어도 properties가 있으면 처리 (JSON Schema에서 type이 생략될 수 있음)
      console.log('Schema has properties but no type field, treating as object and calling parseJsonSchema and populateFormWithExistingData');
      formContext.value = parseJsonSchema(schema) as any;
      populateFormWithExistingData(existingData, '');
    } else {
      console.log('Schema is not object or has no properties, skipping populateFormWithExistingData');
      console.log('Schema details:', {
        type: schema.type,
        hasProperties: !!schema.properties,
        propertiesCount: schema.properties ? Object.keys(schema.properties).length : 0
      });
    }
  }

  // 기존 데이터로 폼 채우기
  function populateFormWithExistingData(data: any, path: string) {
    if (!data || typeof data !== 'object') return;

    console.log('populateFormWithExistingData called with:', { data, path });
    console.log('formContext.value items:', formContext.value.map(item => ({
      type: item.type,
      subject: getContextSubject(item),
      hasValues: !!getContextValues(item).length
    })));

    formContext.value.forEach(item => {
      const subject = getContextSubject(item);
      
      if (item.type === 'nestedObject') {
        const nestedData = data[subject];
        if (nestedData) {
          populateNestedObject(item as any, nestedData, `${path}.${subject}`);
        }
      } else if (item.type === 'accordion') {
        console.log(`Processing accordion field ${subject}:`, {
          subject,
          dataKeys: Object.keys(data),
          hasArrayData: Array.isArray(data[subject]),
          arrayData: data[subject],
          arrayLength: Array.isArray(data[subject]) ? data[subject].length : 'not array'
        });
        
        const arrayData = data[subject];
        if (Array.isArray(arrayData)) {
          console.log(`Populating accordion ${subject} with ${arrayData.length} items`);
          (item as any).originalData = arrayData;
          setContextValues(item, arrayData.map((itemData: any, index: number) => 
            createAccordionSlot(itemData, index, (item as any).schema.items!) as any
          ) as any);
          console.log(`Accordion ${subject} populated:`, getContextValues(item));
        } else {
          console.log(`No array data found for accordion ${subject}`);
        }
      } else if (item.type === 'array') {
        const arrayData = data[subject];
        if (Array.isArray(arrayData)) {
          (item as any).originalData = arrayData;
          setContextValues(item, arrayData.map((itemData: any, index: number) => 
            createFieldContext(`${subject}[${index}]`, (item as any).schema.items!, `${path}.${subject}[${index}]`, false) as any
          ) as any);
        }
      } else {
        // 기본 필드
        const fieldValue = data[subject];
        if (fieldValue !== undefined) {
          if (item.type === 'checkbox') {
            setModelValue(item, Boolean(fieldValue));
          } else {
            setModelValue(item, String(fieldValue));
          }
        }
      }
    });
  }

  // 중첩 객체 데이터 채우기
  function populateNestedObject(nestedObject: NestedObjectContext, data: any, path: string) {
    nestedObject.context.values.forEach(item => {
      const subject = getContextSubject(item);
      
      if (item.type === 'nestedObject') {
        const nestedData = data[subject];
        if (nestedData) {
          populateNestedObject(item as any, nestedData, `${path}.${subject}`);
        }
      } else if (item.type === 'array') {
        const arrayData = data[subject];
        if (Array.isArray(arrayData)) {
          (item as any).originalData = arrayData;
          setContextValues(item, arrayData.map((itemData: any, index: number) => 
            createFieldContext(`${subject}[${index}]`, (item as any).schema.items!, `${path}.${subject}[${index}]`, false) as any
          ) as any);
        }
      } else {
        const fieldValue = data[subject];
        if (fieldValue !== undefined) {
          if (item.type === 'checkbox') {
            setModelValue(item, Boolean(fieldValue));
          } else {
            setModelValue(item, String(fieldValue));
          }
        }
      }
    });
  }

  // Accordion 슬롯 생성 (커서 룰에 따라 any 사용)
  function createAccordionSlot(data: any, index: number, schema: JsonSchema): any {
    console.log(`createAccordionSlot called for index ${index}:`, { data, schema });
    
    const content: any[] = [];
    
    if (schema.type === 'object' && schema.properties) {
      console.log(`Processing accordion slot with properties:`, Object.keys(schema.properties));
      Object.entries(schema.properties).forEach(([key, value]) => {
        const fieldRequired = schema.required?.includes(key) || false;
        const fieldValue = data[key];
        
        console.log(`Creating field ${key} for accordion slot:`, { value, fieldValue, fieldRequired });
        
        if (value.type === 'object') {
          content.push(createNestedObjectContext(key, value, `${key}`, fieldRequired) as any);
        } else if (value.type === 'array') {
          content.push(createArrayContext(key, value, `${key}`, fieldRequired) as any);
        } else {
          const fieldContext = createFieldContext(key, value, `${key}`, fieldRequired);
          if (fieldValue !== undefined) {
            if (fieldContext.type === 'checkbox') {
              setModelValue(fieldContext, Boolean(fieldValue));
            } else {
              setModelValue(fieldContext, String(fieldValue));
            }
          }
          content.push(fieldContext as any);
        }
      });
    }
    
    return {
      header: {
        icon: 'ic_chevron-down',
        title: index.toString(),
      },
      content,
    };
  }

  // 폼 데이터를 원본 객체로 변환
  function convertFormToObject(): any {
    const result: any = {};
    
    formContext.value.forEach(item => {
      const subject = getContextSubject(item);
      
      if (item.type === 'nestedObject') {
        result[subject] = convertNestedObjectToData(item as any);
      } else if (item.type === 'accordion') {
        result[subject] = getContextValues(item).map((slot: any) => 
          convertAccordionSlotToData(slot)
        ) as any;
      } else if (item.type === 'array') {
        result[subject] = getContextValues(item).map((value: any) => {
          if (value.type === 'input' || value.type === 'select') {
            return getModelValue(value);
          }
          return value;
        });
      } else {
        // 기본 필드
        if (item.type === 'checkbox') {
          result[subject] = getModelValue(item);
        } else {
          result[subject] = getModelValue(item);
        }
      }
    });
    
    return result;
  }

  // 중첩 객체를 데이터로 변환
  function convertNestedObjectToData(nestedObject: NestedObjectContext): any {
    const result: any = {};
    
    nestedObject.context.values.forEach(item => {
      const subject = getContextSubject(item);
      
      if (item.type === 'nestedObject') {
        result[subject] = convertNestedObjectToData(item as any);
      } else if (item.type === 'array') {
        result[subject] = getContextValues(item).map((value: any) => {
          if (value.type === 'input' || value.type === 'select') {
            return getModelValue(value);
          }
          return value;
        });
      } else {
        if (item.type === 'checkbox') {
          result[subject] = getModelValue(item);
        } else {
          result[subject] = getModelValue(item);
        }
      }
    });
    
    return result;
  }

  // Accordion 슬롯을 데이터로 변환
  function convertAccordionSlotToData(slot: AccordionSlotContext): any {
    const result: any = {};
    
    slot.content.forEach(item => {
      const subject = getContextSubject(item);
      
      if (item.type === 'nestedObject') {
        result[subject] = convertNestedObjectToData(item as any);
      } else if (item.type === 'array') {
        result[subject] = getContextValues(item).map((value: any) => {
          if (value.type === 'input' || value.type === 'select') {
            return getModelValue(value);
          }
          return value;
        });
      } else {
        if (item.type === 'checkbox') {
          result[subject] = getModelValue(item);
        } else {
          result[subject] = getModelValue(item);
        }
      }
    });
    
    return result;
  }

  // 컴포넌트 이름 설정
  function setComponentName(name: string) {
    try {
      componentNameModel.value = {
        type: 'input',
        context: {
          title: 'name',
          model: useInputModel(name || ''),
          isRequired: true,
        },
      };
    } catch (error) {
      console.error('setComponentName error:', error);
      // 에러 발생 시 기본값으로 설정
      componentNameModel.value = {
        type: 'input',
        context: {
          title: 'name',
          model: useInputModel(''),
          isRequired: true,
        },
      };
    }
  }

  // 파라미터 컨텍스트 설정
  function setParamsContext(fixedModel: FixedModel) {
    const processedPathParams = { ...fixedModel.path_params };
    if ('nsId' in processedPathParams) {
      processedPathParams.nsId = DEFAULT_NAMESPACE;
    }

    const processedQueryParams = { ...fixedModel.query_params };
    if ('nsId' in processedQueryParams) {
      processedQueryParams.nsId = DEFAULT_NAMESPACE;
    }

    paramsContext.value = {
      path_params: {
        type: 'params',
        context: {
          subject: 'Path_Params',
          values: Object.entries(processedPathParams).map(([key, value]) => ({
            type: 'input',
            context: {
              title: key,
              model: useInputModel(value),
              isRequired: true,
            },
          })),
        },
      },
      query_params: {
        type: 'params',
        context: {
          subject: 'Query_Params',
          values: Object.entries(processedQueryParams).map(([key, value]) => ({
            type: 'input',
            context: {
              title: key,
              model: useInputModel(value),
              isRequired: true,
            },
          })),
        },
      },
    };
  }

  // Task component의 기본 모델 설정 (list-task-component에서 받은 모델)
  function setTaskComponentModel(schema: JsonSchema) {
    try {
      taskComponentModel = schema;
      console.log('=== Task Component Model Set ===');
      console.log('Task Component Model:', schema);
      console.log('Schema Properties:', schema.properties);
      console.log('Schema Required:', schema.required);
      console.log('===============================');
      
      // 기본 모델로 폼 컨텍스트 초기화
      initializeDefaults();
      
      // parseJsonSchema 함수 호출 전후 로그
      console.log('Before parseJsonSchema call');
      const parsedContext = parseJsonSchema(schema);
      console.log('After parseJsonSchema call');
      console.log('Parsed Form Context:', parsedContext);
      
      formContext.value = parsedContext;
      
      console.log('Final Form Context Value:', formContext.value);
    } catch (error) {
      console.error('setTaskComponentModel error:', error);
      console.error('Error details:', error);
      formContext.value = [];
    }
  }

  // Task 데이터와 모델 매칭하여 폼에 설정
  function matchTaskDataWithModel(taskData: any) {
    try {
      if (!taskComponentModel) {
        console.warn('Task component model not set. Please call setTaskComponentModel first.');
        return;
      }
      
      console.log('=== Matching Task Data with Model ===');
      console.log('Task Component Model:', taskComponentModel);
      console.log('Task Data:', taskData);
      
      // 기존 모델에 task 데이터 매칭
      loadExistingValues(taskComponentModel, taskData);
      
      console.log('Matched Form Context:', formContext.value);
      console.log('=====================================');
    } catch (error) {
      console.error('matchTaskDataWithModel error:', error);
    }
  }

  // 폼 컨텍스트 설정 (기존 함수 - 호환성 유지)
  function setFormContext(schema: JsonSchema, existingData?: any) {
    try {
      // 기본값 초기화
      initializeDefaults();
      
      originalSchema = schema;
      
      // JSON Schema가 비어있거나 properties가 없는 경우, 기존 데이터를 기반으로 스키마 생성
      if (!schema.properties || Object.keys(schema.properties).length === 0) {
        if (existingData && typeof existingData === 'object') {
          schema = generateSchemaFromData(existingData);
        }
      }
      
      if (existingData) {
        loadExistingValues(schema, existingData);
      } else {
        formContext.value = parseJsonSchema(schema) as any;
      }
    } catch (error) {
      console.error('setFormContext error:', error);
      // 에러 발생 시 기본값으로 설정
      formContext.value = [];
    }
  }

  // 기존 데이터를 기반으로 JSON Schema 생성
  function generateSchemaFromData(data: any): JsonSchema {
    if (Array.isArray(data)) {
      return {
        type: 'array',
        items: data.length > 0 ? generateSchemaFromData(data[0]) : { type: 'string' }
      };
    }
    
    if (data && typeof data === 'object') {
      const properties: Record<string, JsonSchema> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          properties[key] = {
            type: 'array',
            items: value.length > 0 ? generateSchemaFromData(value[0]) : { type: 'string' }
          };
        } else if (value && typeof value === 'object') {
          properties[key] = generateSchemaFromData(value);
        } else {
          properties[key] = {
            type: typeof value === 'number' ? 'integer' : 'string'
          };
        }
      });
      
      return {
        type: 'object',
        properties
      };
    }
    
    return {
      type: typeof data === 'number' ? 'integer' : 'string'
    };
  }

  // 배열 요소 추가
  function addArrayElement(arrayIndex: number) {
    const arrayItem = formContext.value[arrayIndex];
    if (arrayItem.type === 'accordion' && (arrayItem as any).schema.items) {
      const newSlot = createAccordionSlot({}, getContextValues(arrayItem).length, (arrayItem as any).schema.items);
      const currentValues = getContextValues(arrayItem);
      setContextValues(arrayItem, [...currentValues, newSlot]);
    }
  }

  // 배열 요소 삭제
  function deleteArrayElement(arrayIndex: number, slotIndex: number) {
    const arrayItem = formContext.value[arrayIndex];
    if (arrayItem.type === 'accordion') {
      const currentValues = getContextValues(arrayItem);
      currentValues.splice(slotIndex, 1);
      setContextValues(arrayItem, currentValues);
    }
  }

  // 엔티티 추가 (커서 룰에 따라 any 사용)
  function addEntity(target: any) {
    target.push({
      type: 'keyValueInput',
      context: {
        title: useInputModel('') as any,
        model: useInputModel('') as any,
        isRequired: false,
      },
    } as any);
  }

  // 엔티티 삭제 (커서 룰에 따라 any 사용)
  function deleteEntity(target: any, index: number) {
    target.splice(index, 1);
  }

  // 폼 모델을 Step Properties로 변환
  function convertFormModelToStepProperties(): object {
    return convertFormToObject();
  }

  // 파라미터 모델을 Step Properties로 변환
  function convertParamsModelToStepProperties(): FixedModel {
    const fixedModel: FixedModel = {
      path_params: {},
      query_params: {},
    };

    if (paramsContext.value) {
      Object.assign(
        fixedModel.path_params,
        paramsContext.value.path_params.context.values.reduce((acc, value) => {
          acc[getContextSubject(value)] = getModelValue(value);
          return acc;
        }, {} as Record<string, string>)
      );
      
      Object.assign(
        fixedModel.query_params,
        paramsContext.value.query_params.context.values.reduce((acc, value) => {
          acc[getContextSubject(value)] = getModelValue(value);
          return acc;
        }, {} as Record<string, string>)
      );
    }

    return fixedModel;
  }

  return {
    componentNameModel,
    formContext,
    paramsContext,
    setComponentName,
    setParamsContext,
    setFormContext,
    setTaskComponentModel,
    matchTaskDataWithModel,
    convertFormModelToStepProperties,
    convertParamsModelToStepProperties,
    addArrayElement,
    deleteArrayElement,
    addEntity,
    deleteEntity,
    createAccordionSlot,
  };
}
