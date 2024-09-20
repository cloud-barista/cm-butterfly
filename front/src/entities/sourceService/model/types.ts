export interface ISourceService {
  id: string;
  name: string;
  description: string;
  connection: string;
  status: SourceServiceStatus;
}

export type SourceServiceStatus = 'installed' | 'Unknown';

export interface ISourceServiceResponse {
  description: string;
  id: string;
  name: string;
  target_info: {
    mci_id: string;
    ns_id: string;
  };
}

export type SourceServiceTableType =
  | 'name'
  | 'id'
  | 'description'
  | 'connection'
  | 'status';
