/**
 * Composite Pattern 기반 Schema 분석기
 * 각 타입을 분석하여 적절한 Composite Component 타입을 결정
 */

import type { SchemaAnalysisResult } from '../types/schemaComponent';

export class SchemaAnalyzer {
  /**
   * Schema를 분석하여 타입을 결정
   */
  static analyzeSchema(schema: any, data: any = {}): SchemaAnalysisResult {
    if (!schema) {
      return {
        type: 'string',
        complexity: 'basic',
        hasNestedStructures: false
      };
    }

    // 기본 타입 분석
    if (this.isBasicType(schema)) {
      return {
        type: schema.type,
        complexity: 'basic',
        hasNestedStructures: false
      };
    }

    // Object 타입 분석
    if (schema.type === 'object' && schema.properties) {
      return this.analyzeObjectType(schema, data);
    }

    // Array 타입 분석
    if (schema.type === 'array' && schema.items) {
      return this.analyzeArrayType(schema, data);
    }

    // 기본값
    return {
      type: 'string',
      complexity: 'basic',
      hasNestedStructures: false
    };
  }

  /**
   * 기본 타입인지 확인
   */
  private static isBasicType(schema: any): boolean {
    return ['string', 'integer', 'boolean'].includes(schema.type);
  }

  /**
   * Object 타입 분석
   */
  private static analyzeObjectType(schema: any, data: any): SchemaAnalysisResult {
    const properties = Object.keys(schema.properties || {});
    let hasNestedStructures = false;
    let hasComplexTypes = false;

    // 각 property 분석
    Object.values(schema.properties || {}).forEach((prop: any) => {
      if (prop.type === 'object' || prop.type === 'array') {
        hasNestedStructures = true;
      }
      
      // 실제 데이터에서 복잡한 구조 확인
      if (data && typeof data === 'object') {
        Object.values(data).forEach((value: any) => {
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            hasComplexTypes = true;
          }
        });
      }
    });

    const type = hasNestedStructures || hasComplexTypes ? 'nestedObject' : 'basicObject';
    const complexity = hasNestedStructures || hasComplexTypes ? 'complex' : 'composite';

    return {
      type,
      complexity,
      hasNestedStructures: hasNestedStructures || hasComplexTypes,
      properties
    };
  }

  /**
   * Array 타입 분석
   */
  private static analyzeArrayType(schema: any, data: any): SchemaAnalysisResult {
    const items = Array.isArray(data) ? data : [];
    let hasNestedStructures = false;
    let hasComplexTypes = false;

    // Array item schema 분석
    if (schema.items) {
      const itemAnalysis = this.analyzeSchema(schema.items, {});
      hasNestedStructures = itemAnalysis.hasNestedStructures;
      hasComplexTypes = itemAnalysis.type === 'nestedObject' || itemAnalysis.type === 'nestedObjectArray';
    }

    // 실제 데이터에서 복잡한 구조 확인
    items.forEach((item: any) => {
      if (typeof item === 'object' && item !== null) {
        Object.values(item).forEach((value: any) => {
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            hasComplexTypes = true;
          }
        });
      }
    });

    // Array 타입 결정
    let type: 'basicArray' | 'basicObjectArray' | 'nestedObjectArray' = 'basicArray';
    
    if (schema.items?.type === 'object') {
      type = hasNestedStructures || hasComplexTypes ? 'nestedObjectArray' : 'basicObjectArray';
    } else if (hasNestedStructures || hasComplexTypes) {
      type = 'nestedObjectArray';
    }

    const complexity = hasNestedStructures || hasComplexTypes ? 'complex' : 'composite';

    return {
      type,
      complexity,
      hasNestedStructures: hasNestedStructures || hasComplexTypes,
      itemCount: items.length
    };
  }

  /**
   * 타입별 색상 반환
   */
  static getTypeColor(type: string): string {
    const colorMap: Record<string, string> = {
      'string': '#059669',
      'integer': '#059669',
      'boolean': '#059669',
      'basicObject': '#3b82f6',
      'nestedObject': '#7c3aed',
      'basicArray': '#059669',
      'basicObjectArray': '#0ea5e9',
      'nestedObjectArray': '#dc2626'
    };
    
    return colorMap[type] || '#6b7280';
  }

  /**
   * 타입별 아이콘 반환
   */
  static getTypeIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'string': '📝',
      'integer': '🔢',
      'boolean': '☑️',
      'basicObject': '📦',
      'nestedObject': '📋',
      'basicArray': '📋',
      'basicObjectArray': '📊',
      'nestedObjectArray': '🗂️'
    };
    
    return iconMap[type] || '❓';
  }

  /**
   * 복잡도별 설명 반환
   */
  static getComplexityDescription(complexity: string): string {
    const descriptions: Record<string, string> = {
      'basic': '기본 타입 - 단순한 값',
      'composite': '복합 타입 - 기본 타입들의 조합',
      'complex': '복잡한 타입 - 중첩된 구조 포함'
    };
    
    return descriptions[complexity] || '알 수 없는 타입';
  }
}
