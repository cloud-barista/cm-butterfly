export interface ITargetModel {
  id: string;
  name: string;
  description: string;
  migrationType: string;
  custom: string;
  createdDateTime: string;
  updatedDateTime: string;
  modelType: 'Source';
  customAndViewJSON: any;
  workflowTool: any;
}

export type TargetModelTableType =
  | 'name'
  | 'id'
  | 'description'
  | 'migrationType'
  | 'custom'
  | 'createdDateTime'
  | 'updatedDateTime'
  | 'modelType'
  | 'customAndViewJSON'
  | 'workflowTool';
