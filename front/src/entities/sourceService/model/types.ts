export interface ISourceService {
  id: string;
  name: string;
  description: string;
  connectionCount: string;
  connectionIds: string[];
  status: SourceServiceStatusType;
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
  connection: string;
  target_info: {
    mci_id: string;
    ns_id: string;
  };
}
export interface ISourceServiceResponse
  extends Array<ISourceServiceResponseElement> {}

export type SourceServiceTableType =
  | 'name'
  | 'id'
  | 'description'
  | 'connectionCount'
  | 'status';
