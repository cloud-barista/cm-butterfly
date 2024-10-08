export interface ISourceConnectionResponse {
  connection_info: Array<ISourceConnectionInfo>;
}

export interface ISourceConnectionInfo {
  description: string;
  failed_message: string;
  id: string;
  ip_address: string;
  name: string;
  password: string;
  private_key: string;
  public_key: string;
  source_group_id: string;
  ssh_port: number;
  status: string;
  user: string;
}

export interface ISourceInfraInfoResponse {
  connection_id: string;
  infra_data: string;
  saved_time: string;
  status: string;
}

export interface ISourceSoftwareCollectResponse {
  connection_id: string;
  software_data: string;
  saved_time: string;
  status: string;
}

export interface ISourceInfraInfo {
  collectInfraStatus: string;
  collectInfraDateTime: string;
  infraData: string;
  viewInfra: boolean;
}

export interface ISourceSoftwareCollect {
  collectSwStatus: string;
  collectSwDateTime: string;
  softwareData: string;
  viewSW: boolean;
}

export interface ISourceConnection
  extends ISourceConnectionInfo,
    ISourceInfraInfo,
    ISourceSoftwareCollect {
  type: string;
}

export type SourceConnectionTableTypes =
  | 'name'
  | 'id'
  | 'description'
  | 'type'
  | 'ip'
  | 'port'
  | 'user'
  | 'password'
  | 'privateKey'
  | 'publicKey'
  | SourceInfraCollectTableTypes
  | SourceSoftWareCollectTableTypes;

type SourceInfraCollectTableTypes =
  | 'collectInfraStatus'
  | 'collectInfraDateTime'
  | 'viewInfra';

type SourceSoftWareCollectTableTypes =
  | 'collectSwStatus'
  | 'collectSwDatetime'
  | 'viewSW';
