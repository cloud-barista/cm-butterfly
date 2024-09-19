export interface ISourceService {
  id: string;
  name: string;
  description: string;
  connection: string;
  status: ISourceServiceStatus;
}

export interface ISourceServiceStatus {}

export interface ISourceServiceResponse {}

export type SourceServiceTableType =
  | 'name'
  | 'id'
  | 'description'
  | 'connection'
  | 'status';
