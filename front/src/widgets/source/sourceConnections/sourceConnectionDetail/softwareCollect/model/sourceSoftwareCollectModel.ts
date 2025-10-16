import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores';
import { SourceConnectionTableTypes } from '@/entities/sourceConnection/model/types';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { ref, watch } from 'vue';

export function useSourceSoftwareCollectModel() {
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
      { label: 'Collect Status', name: 'collectSwStatus', disableCopy: true },
      { label: 'Collect Datetime', name: 'collectSwDatetime' },
      { label: 'View SW', name: 'viewSW', disableCopy: true },
    ];
  }

  function setDefineTableData(connectionId: string) {
    const connection = sourceConnectionStore.getConnectionById(connectionId);
    let data: Partial<Record<SourceConnectionTableTypes, any>> = {};

    if (connection) {
      data = {
        name: connection.name,
        id: connection.id,
        collectSwStatus: setCollectionStatus(connection.collectSwStatus),
        collectSwDatetime: connection.collectSwDateTime,
        viewSW: !!connection.softwareData,
      };
    }

    return data;
  }

  function loadInfraSWTableData(connectionId: string) {
    defineTableModel.tableState.loading = true;
    if (connectionId) {
      defineTableModel.tableState.data = setDefineTableData(connectionId);
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
    if (nv) loadInfraSWTableData(nv);
  });

  return {
    loadInfraSWTableData,
    sourceConnectionStore,
    setConnectionId,
    defineTableModel,
    initTable,
  };
}
