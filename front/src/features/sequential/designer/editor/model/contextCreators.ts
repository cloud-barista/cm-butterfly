import { JsonSchema } from '@/shared/schema/types/jsonSchema';

export interface AccordionContext {
  type: 'accordion';
  context: {
    subject: string;
    values: any[];
    isRequired: boolean;
    description?: string;
  };
  index: number;
  originalData: any[];
  schema: JsonSchema;
}

export interface ArrayContext {
  type: 'array';
  context: {
    subject: string;
    values: any[];
    isRequired: boolean;
    description?: string;
  };
  schema: JsonSchema;
  path: string;
  originalData: any[];
}

export interface InputContext {
  type: 'input';
  context: {
    subject: string;
    model: {
      value: string;
      isValid: boolean;
      onBlur: () => void;
    };
    isRequired: boolean;
    description?: string;
  };
  schema: JsonSchema;
  path: string;
}

export interface SelectContext {
  type: 'select';
  context: {
    subject: string;
    model: {
      value: string;
      isValid: boolean;
      onBlur: () => void;
    };
    isRequired: boolean;
    description?: string;
  };
  schema: JsonSchema;
  path: string;
}

export interface NestedObjectContext {
  type: 'nestedObject';
  context: {
    subject: string;
    values: any[];
    isRequired: boolean;
    description?: string;
  };
  schema: JsonSchema;
  path: string;
}

/**
 * 컨텍스트 팩토리 함수
 */
export function createContextFactory(
  key: string,
  schema: JsonSchema,
  path: string,
  isRequired: boolean,
  data?: any
): AccordionContext | ArrayContext | InputContext | SelectContext | NestedObjectContext {
  console.log(`createContextFactory called for ${key}:`, {
    schema,
    path,
    isRequired,
    data
  });

  if (schema.type === 'array') {
    return createArrayContext(key, schema, path, isRequired);
  } else if (schema.type === 'object') {
    return createNestedObjectContext(key, schema, path, isRequired, data);
  } else if (schema.type === 'boolean') {
    return createSelectContext(key, schema, path, isRequired);
  } else {
    return createInputContext(key, schema, path, isRequired);
  }
}

/**
 * 배열 컨텍스트 생성
 */
export function createArrayContext(
  key: string,
  schema: JsonSchema,
  path: string,
  isRequired: boolean
): AccordionContext | ArrayContext {
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

/**
 * 중첩 객체 컨텍스트 생성
 */
export function createNestedObjectContext(
  key: string,
  schema: JsonSchema,
  path: string,
  isRequired: boolean,
  data?: any
): NestedObjectContext {
  console.log(`createNestedObjectContext called for ${key}:`, {
    schema,
    path,
    isRequired,
    data
  });

  return {
    type: 'nestedObject',
    context: {
      subject: key,
      values: [],
      isRequired,
      description: schema.description,
    },
    schema,
    path,
  };
}

/**
 * 입력 컨텍스트 생성
 */
export function createInputContext(
  key: string,
  schema: JsonSchema,
  path: string,
  isRequired: boolean
): InputContext {
  console.log(`createInputContext called for ${key}:`, {
    schema,
    path,
    isRequired
  });

  return {
    type: 'input',
    context: {
      subject: key,
      model: {
        value: '',
        isValid: true,
        onBlur: () => {},
      },
      isRequired,
      description: schema.description,
    },
    schema,
    path,
  };
}

/**
 * 선택 컨텍스트 생성
 */
export function createSelectContext(
  key: string,
  schema: JsonSchema,
  path: string,
  isRequired: boolean
): SelectContext {
  console.log(`createSelectContext called for ${key}:`, {
    schema,
    path,
    isRequired
  });

  return {
    type: 'select',
    context: {
      subject: key,
      model: {
        value: 'false',
        isValid: true,
        onBlur: () => {},
      },
      isRequired,
      description: schema.description,
    },
    schema,
    path,
  };
}

/**
 * migration_list 컨텍스트 생성
 */
export function createMigrationListContext(
  key: string,
  schema: JsonSchema,
  path: string,
  isRequired: boolean,
  data?: any
): NestedObjectContext {
  console.log(`createMigrationListContext called for ${key}:`, {
    schema,
    path,
    isRequired,
    data
  });

  const context = createNestedObjectContext(key, schema, path, isRequired, data);
  
  // migration_list 내부 필드들 생성
  if (schema.properties) {
    Object.keys(schema.properties).forEach(propertyName => {
      const propertySchema = schema.properties[propertyName];
      const propertyData = data?.[propertyName];
      
      console.log(`Creating migration_list property ${propertyName}:`, {
        propertySchema,
        propertyData
      });
      
      if (propertySchema.type === 'array') {
        const arrayContext = createArrayContext(propertyName, propertySchema, `${path}.${propertyName}`, false);
        context.context.values.push(arrayContext);
      } else if (propertySchema.type === 'object') {
        const objectContext = createNestedObjectContext(propertyName, propertySchema, `${path}.${propertyName}`, false, propertyData);
        context.context.values.push(objectContext);
      } else {
        const inputContext = createInputContext(propertyName, propertySchema, `${path}.${propertyName}`, false);
        context.context.values.push(inputContext);
      }
    });
  }
  
  return context;
}

/**
 * containers 배열 컨텍스트 생성
 */
export function createContainersArrayContext(
  key: string,
  schema: JsonSchema,
  path: string,
  isRequired: boolean,
  data?: any[]
): AccordionContext {
  console.log(`createContainersArrayContext called for ${key}:`, {
    schema,
    path,
    isRequired,
    data
  });

  const context = createArrayContext(key, schema, path, isRequired) as AccordionContext;
  
  // containers 배열 아이템들 생성
  if (data && Array.isArray(data)) {
    data.forEach((item, index) => {
      console.log(`Creating container item ${index}:`, item);
      
      if (schema.items && schema.items.properties) {
        const itemContext = createNestedObjectContext(`${key}[${index}]`, schema.items, `${path}[${index}]`, false, item);
        context.context.values.push(itemContext);
      }
    });
  }
  
  return context;
}
