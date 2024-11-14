export interface MciResponseData {
  mci: IMci[];
}

export type McisTableType =
  | 'name'
  | 'id'
  | 'status'
  | 'provider'
  | 'countTotal'
  | 'countRunning'
  | 'countTerminated'
  | 'countSuspended'
  | 'description'
  | 'deploymentAlgorithm'
  | 'type'
  | 'action';

interface Location {
  display: string;
  latitude: number;
  longitude: number;
}

interface RegionZoneInfo {
  assignedRegion: string;
  assignedZone: string;
}

interface RegionDetail {
  regionId: string;
  regionName: string;
  description: string;
  location: Location;
  zones: string[];
}

interface ConnectionConfig {
  configName: string;
  providerName: string;
  driverName: string;
  credentialName: string;
  credentialHolder: string;
  regionZoneInfoName: string;
  regionZoneInfo: RegionZoneInfo;
  regionDetail: RegionDetail;
  regionRepresentative: boolean;
  verified: boolean;
}

export interface IVm {
  resourceType: string;
  id: string;
  uid: string;
  name: string;
  subGroupId: string;
  location: Location;
  status: string;
  targetStatus: string;
  targetAction: string;
  monAgentStatus: string;
  networkAgentStatus: string;
  systemMessage: string;
  createdTime: string;
  label: any; // Assuming label can be any type
  description: string;
  region: {
    Region: string;
    Zone: string;
  };
  publicIP: string;
  sshPort: string;
  publicDNS: string;
  privateIP: string;
  privateDNS: string;
  rootDiskType: string;
  rootDiskSize: string;
  rootDeviceName: string;
  connectionName: string;
  connectionConfig: ConnectionConfig;
  specId: string;
  cspSpecName: string;
  imageId: string;
  cspImageName: string;
  vNetId: string;
  cspVNetId: string;
  subnetId: string;
  cspSubnetId: string;
  networkInterface: string;
  securityGroupIds: string[];
  dataDiskIds: any; // Assuming dataDiskIds can be any type
  sshKeyId: string;
  cspSshKeyId: string;
  lastloadtestStateResponse?: ILastloadtestStateResponse;
}

interface StatusCount {
  countTotal: number;
  countCreating: number;
  countRunning: number;
  countFailed: number;
  countSuspended: number;
  countRebooting: number;
  countTerminated: number;
  countSuspending: number;
  countResuming: number;
  countTerminating: number;
  countUndefined: number;
}

interface Label {
  'sys.description': string;
  'sys.id': string;
  'sys.labelType': string;
  'sys.manager': string;
  'sys.name': string;
  'sys.namespace': string;
  'sys.uid': string;
}

export interface IMci {
  resourceType: string;
  id: string;
  uid: string;
  name: string;
  status: string;
  statusCount: StatusCount;
  targetStatus: string;
  targetAction: string;
  installMonAgent: string;
  configureCloudAdaptiveNetwork: string;
  label: Label;
  systemLabel: string;
  systemMessage: string;
  description: string;
  vm: IVm[];
  newVmList: any; // Assuming newVmList can be any type
}

export interface IRunLoadTestRequest {
  agentHostname: string;
  collectAdditionalSystemMetrics: boolean;
  httpReqs: Array<{
    bodyData: string;
    hostname: string;
    method: 'get' | 'post' | 'put' | 'delete';
    path: string;
    port: string;
    protocol: 'http' | 'https';
  }>;
  installLoadGenerator: {
    installLocation: 'local' | 'remote';
  };
  nsId: string;
  mciId: string;
  vmId: string;
  testName: string;
  virtualUsers: string;
  duration: string;
  rampUpTime: string;
  rampUpSteps: string;
}

interface LoadGeneratorServer {
  additionalVmKey: string;
  createdAt: string;
  csp: string;
  id: number;
  label: string;
  lat: string;
  lon: string;
  machineType: string;
  privateIp: string;
  publicIp: string;
  region: string;
  sshPort: string;
  startTime: string;
  status: string;
  updatedAt: string;
  username: string;
  vmId: string;
  zone: string;
}

interface LoadGeneratorInstallInfo {
  createdAt: string;
  id: number;
  installLocation: string;
  installPath: string;
  installType: string;
  installVersion: string;
  loadGeneratorServers: LoadGeneratorServer[];
  privateKeyName: string;
  publicKeyName: string;
  status: string;
  updatedAt: string;
}

export interface ILastloadtestStateResponse {
  compileDuration: string;
  createdAt: string;
  executionDuration: string;
  executionStatus: string;
  id: number;
  loadGeneratorInstallInfo: LoadGeneratorInstallInfo;
  loadTestKey: string;
  startAt: string;
  totalExpectedExecutionSecond: number;
  updatedAt: string;
}
