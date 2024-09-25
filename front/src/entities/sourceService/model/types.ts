export interface ISourceService {
  id: string;
  name: string;
  description: string;
  connectionCount: string;
  connectionIds: string[];
  status: SourceServiceStatus;
}

export interface ISourceAgentAndConnectionStatusResponse {
  status: SourceServiceStatus;
}

export enum SourceServiceStatus {
  installed = 'installed',
  unknown = 'Unknown',
}

export interface ISourceServiceResponse
  extends Array<ISourceServiceResponseElement> {}

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

export type SourceServiceTableType =
  | 'name'
  | 'id'
  | 'description'
  | 'connectionCount'
  | 'status';
