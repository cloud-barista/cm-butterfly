import { defineStore } from 'pinia';
import {
  ISourceConnection,
  ISourceConnectionResponse,
  ISourceInfraInfoResponse,
  ISourceSoftwareCollectResponse,
} from '@/entities/sourceConnection/model/types.ts';
import { ref } from 'vue';
import { formatDate } from '@/shared/utils';

const NAMESPACE = 'SOURCECONNECTION';

export const useSourceConnectionStore = defineStore(NAMESPACE, () => {
  const connections = ref<ISourceConnection[]>([]);

  function getConnectionById(connectId: string) {
    return (
      connections.value.find((connection: ISourceConnection) => {
        return connection.id === connectId;
      }) || null
    );
  }

  function setConnections(res: ISourceConnectionResponse[]) {
    const initAdditionalConnectionInfo = {
      collectSwStatus: '',
      collectSwDateTime: '',
      collectInfraStatus: '',
      collectInfraDateTime: '',
      infraData: '',
      type: '',
      viewSW: false,
      viewInfra: false,
      softwareData: '',
    };

    connections.value = res.map(el => ({
      ...el,
      ...initAdditionalConnectionInfo,
    }));
  }

  function mapSourceConnectionCollectInfraResponse(
    item: ISourceInfraInfoResponse,
  ) {
    const sourceConnection = getConnectionById(item.connection_id);
    if (sourceConnection) {
      sourceConnection.collectInfraStatus = item.status;
      sourceConnection.infraData = item.infra_data;
      sourceConnection.collectInfraDateTime = formatDate(item.saved_time);
    }
  }

  function mapSourceConnectionCollectSWResponse(
    item: ISourceSoftwareCollectResponse,
  ) {
    const sourceConnection = getConnectionById(item.connection_id);
    if (sourceConnection) {
      sourceConnection.collectSwStatus = item.status;
      sourceConnection.softwareData = item.software_data;
      sourceConnection.collectSwDateTime = formatDate(item.saved_time);
    }
  }

  return {
    connections,
    getConnectionById,
    setConnections,
    mapSourceConnectionCollectSWResponse,
    mapSourceConnectionCollectInfraResponse,
  };
});
