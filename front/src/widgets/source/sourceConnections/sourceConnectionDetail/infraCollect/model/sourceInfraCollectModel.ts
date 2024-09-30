import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores.ts';
import { SourceConnectionTableTypes } from '@/entities/sourceConnection/model/types.ts';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel.ts';
import { ref, watch } from 'vue';

export function useSourceInfraCollectModel() {
  const sourceConnectionStore = useSourceConnectionStore();
  const defineTableModel =
    useDefinitionTableModel<Partial<Record<SourceConnectionTableTypes, any>>>();
  const connectionId = ref<string | null>(null);

  function setConnectionId(_connection: string | null) {
    connectionId.value = _connection;
  }

  function initTable() {
    defineTableModel.initState();
    defineTableModel.tableState.fields = [
      { label: 'Source Connection Name', name: 'name' },
      { label: 'Source Connection ID', name: 'id' },
      { label: 'Collect Infra', name: 'collectInfraStatus', disableCopy: true },
      { label: 'Collect Infra Datetime', name: 'collectInfraDateTime' },
      { label: 'View Infra', name: 'viewInfra', disableCopy: true },
    ];
  }

  function setDefineTableData(connectionId: string) {
    const connection = sourceConnectionStore.getConnectionById(connectionId);
    let data: Partial<Record<SourceConnectionTableTypes, any>> = {};

    if (connection) {
      data = {
        name: connection.name,
        id: connection.id,
        collectInfraStatus: setCollectionStatus(connection.collectInfraStatus),
        collectInfraDateTime: connection.collectInfraDateTime,
        viewInfra: !!connection.infraData,
      };
    }

    return data;
  }

  function loadInfraCollectTableData(connId: string) {
    defineTableModel.tableState.loading = true;
    if (connId) {
      defineTableModel.tableState.data = setDefineTableData(connId);
    }
    defineTableModel.tableState.loading = false;
  }

  const collectStatus = {
    unknown: 'Unknown',
    success: 'Success',
  } as const;

  type CollectStatusType = keyof typeof collectStatus;

  interface IStatus {
    color: string;
    status: CollectStatusType;
    text: string;
  }

  function setCollectionStatus(state: string): IStatus {
    if (state === 'success') {
      return {
        color: 'green',
        text: collectStatus[state],
        status: state,
      };
    } else {
      return {
        color: 'gray',
        text: 'Unknown',
        status: 'unknown',
      };
    }
  }

  watch(connectionId, nv => {
    if (nv) loadInfraCollectTableData(nv);
  });

  return {
    sourceConnectionStore,
    setConnectionId,
    defineTableModel,
    initTable,
    loadInfraCollectTableData,
  };
}
