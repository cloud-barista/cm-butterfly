/**
 * Composite Pattern 기반 데이터 매핑 유틸리티
 * Schema와 데이터를 매핑하여 Composite Component 구조 생성
 */

import { SchemaAnalyzer } from './schemaAnalyzer';
import type { SchemaComponent, SchemaAnalysisResult } from '../types/schemaComponent';

export class DataMapper {
  /**
   * Schema와 데이터를 매핑하여 SchemaComponent 생성
   */
  static mapSchemaToComponent(
    schema: any,
    data: any = {},
    name: string = 'field',
    path: string = ''
  ): SchemaComponent {
    const analysis = SchemaAnalyzer.analyzeSchema(schema, data);
    
    switch (analysis.type) {
      case 'string':
      case 'integer':
      case 'boolean':
        return this.createBasicTypeComponent(schema, data, name, analysis);
        
      case 'basicObject':
      case 'nestedObject':
        return this.createObjectComponent(schema, data, name, analysis, path);
        
      case 'basicArray':
      case 'basicObjectArray':
      case 'nestedObjectArray':
        return this.createArrayComponent(schema, data, name, analysis, path);
        
      default:
        return this.createBasicTypeComponent(schema, data, name, analysis);
    }
  }

  /**
   * 기본 타입 컴포넌트 생성
   */
  private static createBasicTypeComponent(
    schema: any,
    data: any,
    name: string,
    analysis: SchemaAnalysisResult
  ): SchemaComponent {
    return {
      type: analysis.type as 'string' | 'integer' | 'boolean',
      name,
      value: data !== undefined ? data : schema.default || '',
      isRequired: schema.required || false,
      description: schema.description,
      schema
    };
  }

  /**
   * Object 타입 컴포넌트 생성
   */
  private static createObjectComponent(
    schema: any,
    data: any,
    name: string,
    analysis: SchemaAnalysisResult,
    path: string
  ): SchemaComponent {
    const properties: Record<string, SchemaComponent> = {};
    
    // Schema properties 순회
    Object.entries(schema.properties || {}).forEach(([key, propSchema]: [string, any]) => {
      const propData = data && data[key] !== undefined ? data[key] : undefined;
      const propPath = path ? `${path}.${key}` : key;
      
      properties[key] = this.mapSchemaToComponent(propSchema, propData, key, propPath);
    });

    return {
      type: analysis.type as 'basicObject' | 'nestedObject',
      name,
      value: data,
      children: properties,
      schema,
      isRequired: schema.required || false,
      description: schema.description
    };
  }

  /**
   * Array 타입 컴포넌트 생성
   */
  private static createArrayComponent(
    schema: any,
    data: any,
    name: string,
    analysis: SchemaAnalysisResult,
    path: string
  ): SchemaComponent {
    const items: SchemaComponent[] = [];
    
    if (Array.isArray(data) && data.length > 0) {
      // 실제 데이터가 있는 경우
      data.forEach((item, index) => {
        const itemName = `item_${index}`;
        const itemPath = path ? `${path}[${index}]` : `[${index}]`;
        
        items.push(this.mapSchemaToComponent(schema.items, item, itemName, itemPath));
      });
    } else {
      // 템플릿 아이템 생성
      const templateItem = this.mapSchemaToComponent(schema.items, {}, 'template_item', path);
      items.push(templateItem);
    }

    return {
      type: analysis.type as 'basicArray' | 'basicObjectArray' | 'nestedObjectArray',
      name,
      value: data,
      children: items,
      schema,
      isRequired: schema.required || false,
      description: schema.description
    };
  }

  /**
   * 빈 Object 템플릿 생성
   */
  static createEmptyObjectTemplate(
    schema: any,
    name: string = 'object'
  ): SchemaComponent {
    const properties: Record<string, SchemaComponent> = {};
    
    Object.entries(schema.properties || {}).forEach(([key, propSchema]: [string, any]) => {
      properties[key] = this.mapSchemaToComponent(propSchema, undefined, key, key);
    });

    return {
      type: 'basicObject',
      name,
      value: {},
      children: properties,
      schema,
      isRequired: schema.required || false,
      description: schema.description
    };
  }

  /**
   * 빈 Array 템플릿 생성
   */
  static createEmptyArrayTemplate(
    schema: any,
    name: string = 'array'
  ): SchemaComponent {
    const analysis = SchemaAnalyzer.analyzeSchema(schema, []);
    
    return {
      type: analysis.type as 'basicArray' | 'basicObjectArray' | 'nestedObjectArray',
      name,
      value: [],
      children: [],
      schema,
      isRequired: schema.required || false,
      description: schema.description
    };
  }

  /**
   * 데이터 검증
   */
  static validateData(schema: any, data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!schema) {
      return { isValid: true, errors: [] };
    }

    // 필수 필드 검증
    if (schema.required && Array.isArray(schema.required)) {
      schema.required.forEach((field: string) => {
        if (data === undefined || data === null || data[field] === undefined) {
          errors.push(`필수 필드 '${field}'가 누락되었습니다.`);
        }
      });
    }

    // 타입 검증
    if (schema.type === 'string' && typeof data !== 'string') {
      errors.push(`문자열 타입이어야 합니다.`);
    } else if (schema.type === 'integer' && typeof data !== 'number') {
      errors.push(`정수 타입이어야 합니다.`);
    } else if (schema.type === 'boolean' && typeof data !== 'boolean') {
      errors.push(`불린 타입이어야 합니다.`);
    } else if (schema.type === 'object' && typeof data !== 'object') {
      errors.push(`객체 타입이어야 합니다.`);
    } else if (schema.type === 'array' && !Array.isArray(data)) {
      errors.push(`배열 타입이어야 합니다.`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 데이터 변환 (문자열을 적절한 타입으로)
   */
  static convertData(schema: any, data: any): any {
    if (!schema || data === undefined || data === null) {
      return data;
    }

    switch (schema.type) {
      case 'string':
        return String(data);
      case 'integer':
        return parseInt(data, 10);
      case 'boolean':
        return Boolean(data);
      case 'object':
        return typeof data === 'object' ? data : {};
      case 'array':
        return Array.isArray(data) ? data : [];
      default:
        return data;
    }
  }
}
