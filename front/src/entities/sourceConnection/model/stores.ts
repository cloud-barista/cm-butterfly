import { defineStore } from 'pinia';
import {
  ISourceConnection,
  ISourceConnectionInfo,
  ISourceConnectionResponse,
  ISourceInfraInfoResponse,
  ISourceSoftwareCollectResponse,
} from '@/entities/sourceConnection/model/types.ts';
import { ref } from 'vue';
import { formatDate } from '@/shared/utils';

const NAMESPACE = 'SOURCECONNECTION';

export const useSourceConnectionStore = defineStore(NAMESPACE, () => {
  //key : sourceConnection Id , value : sourceConnection Info
  const connections = ref<Record<string, ISourceConnection>>({});
  const editConnections: any[] = [];
  const withSourceConnection = ref(false);

  function setEditConnections(value: any) {
    return editConnections.push(value);
  }

  function setWithSourceConnection(value: boolean) {
    withSourceConnection.value = value;
  }

  function getConnectionById(connectId: string): ISourceConnection | null {
    return connections.value[connectId] || null;
  }

  function setConnections(res: ISourceConnectionResponse) {
    res.connection_info.forEach(el => {
      setConnection(el);
    });
  }

  function setConnection(res: ISourceConnectionInfo) {
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

    const existingConnection = connections.value[res.id];
    if (!existingConnection) {
      connections.value[res.id] = {
        ...res,
        ...initAdditionalConnectionInfo,
      };
    }
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

  function clear() {
    connections.value = {};
  }

  return {
    setConnection,
    connections,
    editConnections,
    setEditConnections,
    getConnectionById,
    setConnections,
    mapSourceConnectionCollectSWResponse,
    mapSourceConnectionCollectInfraResponse,
    clear,
    withSourceConnection,
    setWithSourceConnection,
  };
});
