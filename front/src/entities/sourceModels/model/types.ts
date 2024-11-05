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

export interface ISourceModelResponse {
  createTime: string;
  description: string;
  id: string;
  isCloudModel: boolean;
  isInitUserModel: boolean;
  isTargetModel: boolean;
  onpremModelVersion: string;
  onpremiseInfraModel: OnPremiseInfraModel;
  updateTime: string;
  userId: string;
  userModelName: string;
  userModelVersion: string;
}

interface OnPremiseInfraModel {
  network: Network;
  servers: Server[];
}

interface Network {}

interface Server {
  cpu: CPU;
  hostname: string;
  interfaces: NetworkInterface[];
  memory: Memory;
  os: OperatingSystem;
  rootDisk: Disk;
  routingTable: RoutingTableEntry[];
}

interface CPU {
  architecture: string;
  cores: number;
  cpus: number;
  maxSpeed: number;
  model: string;
  threads: number;
  vendor: string;
}

interface NetworkInterface {
  ipv4CidrBlocks?: string[];
  ipv6CidrBlocks?: string[];
  macAddress?: string;
  mtu: number;
  name: string;
  state?: 'up' | 'down';
}

interface Memory {
  available: number;
  totalSize: number;
  type: string;
  used: number;
}

interface OperatingSystem {
  id: string;
  idLike: string;
  name: string;
  prettyName: string;
  version: string;
  versionCodename: string;
  versionId: string;
}

interface Disk {
  available: number;
  label: string;
  totalSize: number;
  type: string;
  used: number;
}

interface RoutingTableEntry {
  destination: string;
  gateway?: string;
  interface: string;
  linkState: 'up' | 'down';
  protocol: string;
  scope: string;
  source?: string;
}
