export interface ITargetModel {
  id: string;
  name: string;
  description: string;
  migrationType: string;
  custom: string;
  createdDateTime: string | Date;
  updatedDateTime: string | Date;
  modelType: 'Target';
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
