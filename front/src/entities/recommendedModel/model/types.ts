export interface IRecommendedModel {
  name: string;
  id: string;
  description: string;
  label: string;
  spec: string;
  image: string;
  rootDiskType: 'default' | string;
  rootDiskSize: 'default' | number;
  userPassword: string;
  connection: string;
  estimateCost: string;
}

export type RecommendedModelTableType =
  | 'name'
  | 'id'
  | 'description'
  | 'label'
  | 'spec'
  | 'image'
  | 'rootDiskType'
  | 'rootDiskSize'
  | 'userPassword'
  | 'connection'
  | 'estimateCost';
