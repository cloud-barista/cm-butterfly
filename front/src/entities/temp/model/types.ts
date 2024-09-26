import type { SourceConnection } from '@/shared/libs';

export interface ISourceGroup {
  name: string;
  description: string;
  connections: SourceConnection[];
}
