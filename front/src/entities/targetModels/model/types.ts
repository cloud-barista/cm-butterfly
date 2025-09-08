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

interface Vm {
  imageId: string;
  specId: string;
  description: string;
  label: string | null;
  name: string;
  subGroupSize: string;
}

interface CloudInfraModel {
  description: string;
  installMonAgent: string;
  label: string | null;
  name: string;
  systemLabel: string;
  vm: Vm[] | null;
  // Add new fields for infra model data
  targetVmInfra?: any;
  targetSecurityGroupList?: any[];
  targetSshKey?: any;
  targetVNet?: any;
  targetVmOsImageList?: any[];
  targetVmSpecList?: any[];
}

export interface ITargetModelResponse {
  cloudInfraModel: CloudInfraModel;
  cloudModelVersion: string;
  createTime: string;
  csp: string;
  description: string;
  id: string;
  isCloudModel: boolean;
  isInitUserModel: boolean;
  isTargetModel: boolean;
  migrationType?: string; // Add migrationType field
  region: string;
  updateTime: string;
  userId: string;
  userModelName: string;
  userModelVersion: string;
  zone: string;
}
