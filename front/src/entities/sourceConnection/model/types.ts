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

export interface ISourceConnection extends ISourceConnectionResponse {}

export type SourceConnectionTableTypes =
  | 'name'
  | 'id'
  | 'description'
  | 'type'
  | 'ip'
  | 'port';
