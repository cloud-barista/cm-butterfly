import type { SourceConnection } from '@/shared/libs';

export interface ISourceGroup {
  name: string;
  description: string;
  connections: SourceConnection[];
}

/**
 * What the server said about one connection, kept as it said it.
 *
 * A source service that cannot be reached is shown as failed, but "failed" alone does
 * not say whether the machine refused the SSH connection or answered and then failed to
 * take the agent. The server distinguishes the two and explains each in its own message;
 * nothing in the console was reading them.
 */
export interface ISourceConnectionOutcome {
  name: string;
  ipAddress: string;
  connectionStatus: string;
  connectionMessage: string;
  agentStatus: string;
  agentMessage: string;
}

export interface ISourceService {
  id: string;
  name: string;
  description: string;
  connectionCount: string | number;
  connectionIds: string[];
  // status: SourceServiceStatusType;
  status?: string;
  /** Per-connection outcome behind the aggregated status, for the reader who asks why. */
  connectionOutcomes?: ISourceConnectionOutcome[];
  infraModel?: IInfraSourceGroupResponse;
  softwareModel?: any;
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
  Success: 'Success',
  PartialSuccess: 'PartialSuccess',
  Failed: 'Failed',
  Unknown: 'Unknown',
} as const;

export type SourceServiceStatusType = keyof typeof SourceServiceStatus;

export interface ISourceServiceResponseElement {
  description: string;
  id: string;
  name: string;
  connection_info_status_count: ISourceConnectionStatusCountResponse;
}

export interface ISourceServiceResponse {
  // honeybee returns null (not an empty array) when there are no source groups.
  source_group: Array<ISourceServiceResponseElement> | null;
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
  | 'viewInfra'
  | 'viewSoftware';
