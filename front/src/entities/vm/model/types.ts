export type vmDetailTableType =
  | 'serverId'
  | 'description'
  | 'publicIP'
  | 'publicDNS'
  | 'privateIP'
  | 'privateDNS'
  | 'serverStatus'
  | 'loadStatus'
  | 'provider';

export type vmConnectionTableType =
  | 'connectionName'
  | 'credential'
  | 'provider'
  | 'driverFileName'
  | 'region'
  | 'availableZone';
