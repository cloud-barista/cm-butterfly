import type { SourceConnection } from '@/shared/libs';

export interface ISourceGroup {
  name: string;
  description: string;
  connections: SourceConnection[];
}

export interface ISourceConnection {
  id: string;
  name: string;
  description?: string;
  ip_address: string;
  user: string;
  private_key: string;
  ssh_port: number;
  password: string;
}
