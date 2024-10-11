import { IRecommendedModel } from '@/entities/recommendedModel/model/types';

export interface ISourceModel {
  id: string;
  name: string;
  description: string;
  migrationType: string;
  custom: string;
  createdDateTime: string | Date;
  updatedDateTime: string | Date;
  modelType: 'Source';
  customAndViewJSON: any;
  recommendModel: IRecommendedModel[];
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
