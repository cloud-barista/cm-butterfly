interface Location {
  display: string;
  latitude: number;
  longitude: number;
}

interface Region {
  description: string;
  location: Location;
  regionId: string;
  regionName: string;
  zones: string[];
}

interface RegionZoneInfo {
  assignedRegion: string;
  assignedZone: string;
}

interface ConnectionConfig {
  configName: string;
  credentialHolder: string;
  credentialName: string;
  driverName: string;
  providerName: string;
  regionDetail: Region;
  regionRepresentative: boolean;
  regionZoneInfo: RegionZoneInfo;
  regionZoneInfoName: string;
  verified: boolean;
}

interface KeyValue {
  key: string;
  value: string;
}

interface IId {
  NameId: string;
  SystemId: string;
}

interface CSPViewVmDetail {
  CSPid: string;
  DataDiskIIDs: string[];
  DataDiskNames: string[];
  IId: IId;
  ImageIId: IId;
  ImageName: string;
  ImageType: string;
  KeyPairIId: IId;
  KeyPairName: string;
  KeyValueList: KeyValue[];
  Name: string;
  NetworkInterface: string;
  PrivateDNS: string;
  PrivateIP: string;
  PublicDNS: string;
  PublicIP: string;
  Region: RegionZoneInfo;
  RootDeviceName: string;
  RootDiskSize: string;
  RootDiskType: string;
  SSHAccessPoint: string;
  SecurityGroupIIds: IId[];
  SecurityGroupNames: string[];
  StartTime: string;
  SubnetIID: IId;
  SubnetName: string;
  VMSpecName: string;
  VMUserId: string;
  VMUserPasswd: string;
  VPCName: string;
  VpcIID: IId;
}

export interface IVm {
  connectionConfig: ConnectionConfig;
  connectionName: string;
  createdTime: string;
  cspViewVmDetail: CSPViewVmDetail;
  dataDiskIds: string;
  description: string;
  id: string;
  idByCSP: string;
  imageId: string;
  label: string;
  location: Location;
  monAgentStatus: string;
  name: string;
  networkAgentStatus: string;
  privateDNS: string;
  privateIP: string;
  publicDNS: string;
  publicIP: string;
  region: RegionZoneInfo;
  rootDeviceName: string;
  rootDiskSize: string;
  rootDiskType: string;
  securityGroupIds: string[];
  specId: string;
  sshKeyId: string;
  sshPort: string;
  status: string;
  subGroupId: string;
  subnetId: string;
  systemMessage: string;
  targetAction: string;
  targetStatus: string;
  vNetId: string;
  vmUserAccount: string;
}

export type vmDetailTableType =
  | 'serverId'
  | 'description'
  | 'publicIP'
  | 'publicDNS'
  | 'privateIP'
  | 'privateDNS'
  | 'status'
  | 'provider'
  | 'vmSpec'
  | 'serverSpec'
  | 'region'
  | 'zone'
  | 'securityGroup'
  | 'vpcId'
  | 'subnetId'
  | 'startTime'
  | 'networkInterface'
  | 'rootDevice'
  | 'rootDeviceType'
  | 'keypairName'
  | 'blockDevice'
  | 'configName'
  | 'vmId'
  | 'userIdPwd'
  | 'accessIdPwd'
  | 'operatingSystem'
  | 'imageId'
  | 'architecture'
  | 'platform';

export type vmConnectionTableType =
  | 'connectionName'
  | 'credential'
  | 'provider'
  | 'driverFileName'
  | 'region'
  | 'availableZone';
