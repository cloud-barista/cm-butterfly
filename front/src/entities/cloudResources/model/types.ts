export type VPCInformationTableType =
  | 'vpcName'
  | 'description'
  | 'cidrBlock'
  | 'provider'
  | 'connection'
  | 'subnetInfoList';

export type SubnetInformationTableType =
  | 'subnetName'
  | 'cidrBlock'
  | 'removeAction';

export interface IAllVPCsInfoResponse {}
