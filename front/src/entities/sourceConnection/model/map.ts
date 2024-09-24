import {
  ISourceConnection,
  ISourceInfraInfoResponse,
} from '@/entities/sourceConnection/model/types.ts';
import { formatDate } from '@/shared/utils';

export function mapSourceConnectionCollectInfraResponse(
  sourceConnection: ISourceConnection,
  item: ISourceInfraInfoResponse,
) {
  if (sourceConnection.id === item.connection_id) {
    sourceConnection.collectStatus = item.status;
    sourceConnection.infraData = item.infra_data;
    sourceConnection.collectInfraDateTime = formatDate(item.saved_time);
  }
}
