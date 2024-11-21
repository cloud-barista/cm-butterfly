import type { SourceConnection } from '@/shared/libs';

export interface ISourceGroup {
  name: string;
  description: string;
  connections: SourceConnection[];
}

export interface ISourceService {
  id: string;
  name: string;
  description: string;
  connectionCount: string | number;
  connectionIds: string[];
  // status: SourceServiceStatusType;
  status?: string;
  infraModel?: IInfraSourceGroupResponse;
}

export interface ISourceAgentAndConnectionStatusResponse {
  agentConnectionDetails: {
    connectionDescription: string;
    connectionFailedMessage: string;
    connectionId: string;
    connectionName: string;
    agentStatus: SourceServiceStatusType;
    connectionStatus: SourceServiceStatusType;
  };
  agentConnectionStatus: SourceServiceStatusType;
}

export interface ISourceConnectionStatusCountResponse {
  connection_info_total: number;
  count_agent_failed: number;
  count_agent_success: number;
  count_connection_failed: number;
  count_connection_success: number;
}

export const SourceServiceStatus = {
  S0001: 'Success',
  S0002: 'PartialSuccess',
  S0003: 'Failed',
  S0004: 'Unknown',
} as const;

export type SourceServiceStatusType = keyof typeof SourceServiceStatus;

export interface ISourceServiceResponseElement {
  description: string;
  id: string;
  name: string;
  connection_info_status_count: ISourceConnectionStatusCountResponse;
}

export interface ISourceServiceResponse {
  source_group: Array<ISourceServiceResponseElement>;
}

export type IInfraSourceGroupResponse = Array<IInfraConnectionData>;

interface IInfraConnectionData {
  connection_id: string;
  infra_data: string;
  saved_time: string;
  status: string;
}

export type SourceServiceTableType =
  | 'name'
  | 'id'
  | 'description'
  | 'connectionCount'
  | 'status'
  | 'viewInfra';
