import { JsonSchema } from '@/shared/schema/types/jsonSchema';
import { 
  createContextFactory, 
  createArrayContext,
  createNestedObjectContext,
  createInputContext,
  createSelectContext,
  createMigrationListContext,
  createContainersArrayContext
} from './contextCreators';

/**
 * 데이터와 함께 컨텍스트를 생성하는 함수들
 */

/**
 * 배열 데이터를 컨텍스트에 매핑
 */
export function mapArrayDataToContext(
  context: any,
  data: any[],
  schema: JsonSchema,
  createAccordionSlotFn?: any
): void {
  console.log(`mapArrayDataToContext called:`, {
    contextType: context.type,
    dataLength: data.length,
    schemaItems: schema.items
  });

  // 1단계: 배열 데이터 길이만큼 컨텍스트 추가 (Add Item과 동일한 효과)
  console.log(`=== Adding ${data.length} array items (like clicking Add Item) ===`);
  
  const existingLength = context.context.values.length;
  const dataLength = data.length;
  
  if (dataLength > existingLength) {
    // 더 많은 데이터가 있으면 항목 추가
    console.log(`Adding ${dataLength - existingLength} new items to existing ${existingLength} items`);
    for (let i = existingLength; i < dataLength; i++) {
      if (createAccordionSlotFn) {
        const newItem = createAccordionSlotFn({}, i, schema.items);
        if (newItem) {
          context.context.values.push(newItem);
          console.log(`✅ Added array item ${i} (Add Item effect)`);
        }
      }
    }
  } else if (dataLength < existingLength) {
    // 더 적은 데이터가 있으면 항목 제거
    console.log(`Removing ${existingLength - dataLength} excess items`);
    context.context.values.splice(dataLength);
  } else if (existingLength === 0) {
    // 배열이 비어있으면 데이터 길이만큼 추가
    console.log(`Array is empty, adding ${dataLength} items`);
    for (let i = 0; i < dataLength; i++) {
      if (createAccordionSlotFn) {
        const newItem = createAccordionSlotFn({}, i, schema.items);
        if (newItem) {
          context.context.values.push(newItem);
          console.log(`✅ Added array item ${i} (Add Item effect)`);
        }
      }
    }
  }

  // 2단계: 각 배열 아이템에 데이터 매핑
  data.forEach((item, index) => {
    if (context.context.values[index]) {
      console.log(`Mapping data to array item ${index}:`, item);
      
      if (Array.isArray(item)) {
        console.log(`Array item ${index} is also an array, processing nested array`);
        // 중첩 배열 처리 로직 추가 가능
      } else {
        // 단순 값인 경우
        console.log(`Array item ${index} is simple value:`, item);
        if (context.context.values[index].context?.model) {
          context.context.values[index].context.model.value = item?.toString() || '';
        }
      }
    }
  });
}

/**
 * 중첩 객체 데이터를 컨텍스트에 매핑
 */
export function mapNestedObjectDataToContext(
  context: any,
  data: any,
  schema: JsonSchema,
  createAccordionSlotFn?: any
): void {
  console.log(`mapNestedObjectDataToContext called:`, {
    contextType: context.type,
    data,
    schema
  });

  // Properties가 없는 빈 객체인 경우 처리
  if (!schema.properties || Object.keys(schema.properties).length === 0) {
    console.log(`Empty object detected, storing raw data:`, data);
    
    // 빈 객체인 경우 데이터를 직접 저장
    if (data && typeof data === 'object') {
      // context에 rawData 속성으로 저장
      if (!context.context.rawData) {
        context.context.rawData = {};
      }
      Object.assign(context.context.rawData, data);
      console.log(`Stored raw data in context:`, context.context.rawData);
    }
    return;
  }

  if (schema.properties) {
    Object.keys(schema.properties).forEach(propertyName => {
      const propertyData = data[propertyName];
      const propertySchema = schema.properties[propertyName];
      
      console.log(`Processing property: ${propertyName}`, {
        propertyData,
        propertySchema,
        propertyType: propertySchema?.type
      });

      // 해당 속성의 컨텍스트 찾기
      const propertyContext = context.context.values.find((ctx: any) => 
        (ctx.context?.title === propertyName) || (ctx.context?.subject === propertyName)
      );

      if (propertyContext) {
        console.log(`Found context for property ${propertyName}:`, {
          contextType: propertyContext.type,
          contextSubject: propertyContext.context?.subject
        });

        // 속성 타입에 따른 데이터 매핑
        if (propertySchema?.type === 'string' && propertyContext.type === 'input' && propertyContext.context?.model) {
          propertyContext.context.model.value = propertyData || '';
          console.log(`Set string value for ${propertyName}: ${propertyData}`);
        } else if (propertySchema?.type === 'array' && propertyContext.type === 'accordion' && Array.isArray(propertyData)) {
          console.log(`Processing array property ${propertyName} with ${propertyData.length} items`);
          mapArrayDataToContext(propertyContext, propertyData, propertySchema, createAccordionSlotFn);
        } else if (propertySchema?.type === 'object' && propertyContext.type === 'nestedObject' && propertyData && typeof propertyData === 'object') {
          console.log(`Processing nested object property ${propertyName}:`, propertyData);
          mapNestedObjectDataToContext(propertyContext, propertyData, propertySchema, createAccordionSlotFn);
        }
      } else {
        console.warn(`Context not found for property: ${propertyName}`);
        
        // 컨텍스트가 없으면 생성 시도
        if (createAccordionSlotFn) {
          console.log(`🔧 ATTEMPTING TO CREATE CONTEXT FOR PROPERTY: ${propertyName}`);
          const newContext = createAccordionSlotFn(propertyData, 0, propertySchema);
          if (newContext && Array.isArray(context.context.values)) {
            context.context.values.push(newContext);
            console.log(`✅ Created context for property: ${propertyName}`);
            
            // 새로 생성된 컨텍스트로 데이터 매핑
            if (propertySchema?.type === 'array' && Array.isArray(propertyData)) {
              console.log(`🔧 PROCESSING NEWLY CREATED ARRAY PROPERTY ${propertyName} with ${propertyData.length} items`);
              mapArrayDataToContext(newContext, propertyData, propertySchema, createAccordionSlotFn);
            } else if (propertySchema?.type === 'object' && propertyData && typeof propertyData === 'object') {
              console.log(`🔧 PROCESSING NEWLY CREATED OBJECT PROPERTY ${propertyName}`);
              mapNestedObjectDataToContext(newContext, propertyData, propertySchema, createAccordionSlotFn);
            }
          }
        }
      }
    });
  }
}

/**
 * 중첩 배열 필드 데이터 매핑
 */
export function mapNestedArrayFieldData(
  context: any,
  arrayData: any[],
  arraySchema: JsonSchema,
  createAccordionSlotFn?: any
): void {
  console.log(`mapNestedArrayFieldData called:`, {
    contextType: context.type,
    arrayDataLength: arrayData.length,
    arraySchemaItems: arraySchema.items
  });

  // 1단계: 배열 데이터 길이만큼 컨텍스트 추가
  const existingLength = context.context.values.length;
  const dataLength = arrayData.length;
  
  if (dataLength > existingLength) {
    console.log(`Adding ${dataLength - existingLength} new nested array items`);
    for (let i = existingLength; i < dataLength; i++) {
      if (createAccordionSlotFn) {
        const newItem = createAccordionSlotFn(arrayData[i], i, arraySchema.items);
        if (newItem) {
          context.context.values.push(newItem);
          console.log(`✅ Added nested array item ${i} with data:`, arrayData[i]);
        }
      }
    }
  }

  // 2단계: 각 배열 아이템의 데이터 매핑
  arrayData.forEach((item, index) => {
    if (context.context.values[index]) {
      console.log(`Processing nested array item ${index}:`, item);
      
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        if (arraySchema.items && arraySchema.items.properties) {
          Object.keys(arraySchema.items.properties).forEach(fieldName => {
            const fieldData = item[fieldName];
            const fieldSchema = arraySchema.items.properties[fieldName];
            
            console.log(`Processing nested array item field ${fieldName}:`, {
              fieldData,
              fieldSchema,
              fieldType: fieldSchema?.type
            });
            
            // 해당 필드의 컨텍스트 찾기
            const fieldContext = context.context.values[index].context?.values?.find((ctx: any) => 
              (ctx.context?.title === fieldName) || (ctx.context?.subject === fieldName)
            );

            if (fieldContext) {
              console.log(`Found field context for ${fieldName}:`, {
                contextType: fieldContext.type,
                contextSubject: fieldContext.context?.subject
              });

              // 필드 타입에 따른 데이터 매핑
              if (fieldSchema?.type === 'string' && fieldContext.type === 'input' && fieldContext.context?.model) {
                fieldContext.context.model.value = fieldData || '';
                console.log(`Set string value for ${fieldName}: ${fieldData}`);
              } else if (fieldSchema?.type === 'array' && fieldContext.type === 'accordion' && Array.isArray(fieldData)) {
                console.log(`Processing nested array field ${fieldName} with ${fieldData.length} items`);
                mapNestedArrayFieldData(fieldContext, fieldData, fieldSchema, createAccordionSlotFn);
              } else if (fieldSchema?.type === 'object' && fieldContext.type === 'nestedObject' && fieldData && typeof fieldData === 'object') {
                console.log(`Processing nested object field ${fieldName}:`, fieldData);
                mapNestedObjectDataToContext(fieldContext, fieldData, fieldSchema, createAccordionSlotFn);
              }
            } else {
              console.warn(`Field context not found for: ${fieldName}`);
              
              // migration_list 컨텍스트가 없으면 생성
              if (fieldName === 'migration_list' && fieldData && typeof fieldData === 'object' && createAccordionSlotFn) {
                console.log(`🔧 CREATING MIGRATION_LIST CONTEXT FOR ARRAY ITEM ${index}`);
                
                const newMigrationListContext = createMigrationListContext(
                  fieldName, 
                  fieldSchema, 
                  `${fieldName}`, 
                  false, 
                  fieldData
                );
                
                if (newMigrationListContext && context.context.values[index].context?.values) {
                  context.context.values[index].context.values.push(newMigrationListContext);
                  console.log(`✅ Created migration_list context for array item ${index}`);
                  
                  // containers 배열 처리
                  if (fieldData.containers && Array.isArray(fieldData.containers) && fieldData.containers.length > 0) {
                    console.log(`🔧 PROCESSING CONTAINERS IN NEWLY CREATED MIGRATION_LIST: ${fieldData.containers.length} items`);
                    
                    // containers 컨텍스트 찾기
                    const containersContext = newMigrationListContext.context?.values?.find((ctx: any) => 
                      (ctx.context?.title === 'containers') || (ctx.context?.subject === 'containers')
                    );
                    
                    if (containersContext) {
                      console.log(`🔧 FOUND CONTAINERS CONTEXT, PROCESSING IMMEDIATELY`);
                      mapNestedArrayFieldData(containersContext, fieldData.containers, fieldSchema.properties?.containers, createAccordionSlotFn);
                    } else {
                      console.warn(`🔧 CONTAINERS CONTEXT NOT FOUND IN NEWLY CREATED MIGRATION_LIST`);
                    }
                  }
                }
              }
            }
          });
        }
      }
    }
  });
}

/**
 * 단순 필드 데이터 매핑 (재귀 호출 없음)
 */
export function mapSimpleFieldData(
  context: any,
  fieldData: any,
  fieldSchema: JsonSchema,
  createAccordionSlotFn?: any
): void {
  const fieldType = fieldSchema?.type;
  
  console.log(`mapSimpleFieldData called: ${fieldType}`, {
    contextType: context.type,
    fieldData,
    fieldSchema
  });

  switch (fieldType) {
    case 'string':
      if (context.type === 'input' && context.context?.model) {
        context.context.model.value = fieldData || '';
        console.log(`Set string value: ${fieldData}`);
      }
      break;

    case 'integer':
    case 'number':
      if (context.type === 'input' && context.context?.model) {
        context.context.model.value = fieldData?.toString() || '';
        console.log(`Set number value: ${fieldData}`);
      }
      break;

    case 'boolean':
      if (context.type === 'select' && context.context?.model) {
        context.context.model.value = fieldData ? 'true' : 'false';
        console.log(`Set boolean value: ${fieldData}`);
      }
      break;

    case 'array':
      if (context.type === 'accordion' && Array.isArray(fieldData)) {
        console.log(`Processing array field with ${fieldData.length} items`);
        mapArrayDataToContext(context, fieldData, fieldSchema, createAccordionSlotFn);
      }
      break;

    case 'object':
      if (context.type === 'nestedObject' && fieldData && typeof fieldData === 'object') {
        console.log(`Processing object field:`, fieldData);
        mapNestedObjectDataToContext(context, fieldData, fieldSchema, createAccordionSlotFn);
      }
      break;

    default:
      console.warn(`Unknown field type: ${fieldType}`);
  }
}
