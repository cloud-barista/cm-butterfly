export interface ISourceConnectionResponse {
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
  collectStatus: string;
  collectDateTime: string;
  viewSW: string;
}

export interface ISourceInfraInfo {
  collectInfra: string;
  collectInfraDateTime: string;
  infraData: string;
  viewInfra: boolean;
}

export interface ISourceSoftwareCollect {
  collectStatus: string;
  collectDateTime: string;
  viewSW: string;
}

export interface ISourceConnection
  extends ISourceConnectionResponse,
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
  | 'collectInfra'
  | 'collectInfraDateTime'
  | 'viewInfra';

type SourceSoftWareCollectTableTypes =
  | 'collectStatus'
  | 'collectDatetime'
  | 'viewSW';
