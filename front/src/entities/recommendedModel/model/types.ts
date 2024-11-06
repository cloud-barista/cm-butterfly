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

interface Vm {
  commonImage: string;
  commonSpec: string;
  description: string;
  label: string | null;
  name: string;
  subGroupSize: string;
}

interface TargetInfra {
  description: string;
  installMonAgent: string;
  label: string | null;
  name: string;
  systemLabel: string;
  vm: Vm[];
}

export interface IRecommendModelResponse {
  description: string;
  status: string;
  targetInfra: TargetInfra;
}
