export interface ISourceModel {
  id: string;
  name: string;
  description: string;
  migrationType: string;
  custom: string;
  createdDateTime: string;
  updatedDateTime: string;
  modelType: 'Source';
  customAndViewJSON: any;
  recommendModel: string;
}

export type SourceModelTableType =
  | 'name'
  | 'id'
  | 'description'
  | 'migrationType'
  | 'custom'
  | 'createdDateTime'
  | 'updatedDateTime'
  | 'modelType'
  | 'customAndViewJSON'
  | 'recommendModel';

// export type SourceModelDetailTableType =
//   | SourceModelTableType
