/**
 * Schema Component Types
 * Composite Pattern을 적용한 Schema 컴포넌트의 타입 정의
 */

export interface SchemaComponent {
  type: 'string' | 'integer' | 'boolean' | 'basicObject' | 'nestedObject' | 'basicArray' | 'basicObjectArray' | 'nestedObjectArray';
  name: string;
  value?: any;
  children?: Record<string, SchemaComponent> | SchemaComponent[];
  schema?: any;
  isRequired?: boolean;
  description?: string;
}

export interface SchemaAnalysisResult {
  type: 'string' | 'integer' | 'boolean' | 'basicObject' | 'nestedObject' | 'basicArray' | 'basicObjectArray' | 'nestedObjectArray';
  complexity: 'basic' | 'composite' | 'complex';
  hasNestedStructures: boolean;
  properties?: string[];
  itemCount?: number;
}
