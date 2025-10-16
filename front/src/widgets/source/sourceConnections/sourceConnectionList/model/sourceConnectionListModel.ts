import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import {
  ISourceConnection,
  SourceConnectionTableTypes,
} from '@/entities/sourceConnection/model/types';
import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores';
import { useGetSourceConnectionList } from '@/entities/sourceConnection/api';
import { ref, watch } from 'vue';

export function useSourceConnectionListModel() {
  const tableModel =
    useToolboxTableModel<Partial<Record<SourceConnectionTableTypes, any>>>();
  const sourceConnectionStore = useSourceConnectionStore();
  const resSourceConnectionList = useGetSourceConnectionList(null);
  const targetConnections = ref<ISourceConnection[]>([]);

  function initToolBoxTableModel() {
    tableModel.tableState.fields = [
      { name: 'name', label: 'Name' },
      { name: 'id', label: 'ID' },
      { name: 'description', label: 'Description' },
      { name: 'type', label: 'Type' },
      { name: 'ip', label: 'IP Address' },
      { name: 'port', label: 'Port' },
    ];
  }

  function organizationSourceConnectionTableItem(
    sourceConnection: ISourceConnection,
  ) {
    const organizedDatum: Partial<
      Record<SourceConnectionTableTypes | 'originalData', any>
    > = {
      name: sourceConnection.name,
      description: sourceConnection.description,
      id: sourceConnection.id,
      ip: sourceConnection.ip_address,
      port: sourceConnection.ssh_port,
      originalData: sourceConnection,
    };

    return organizedDatum;
  }

  function setTargetConnections(connectionIds: string[]) {
    targetConnections.value = connectionIds
      .map(id => sourceConnectionStore.getConnectionById(id))
      .filter(connection => !!connection);
  }

  watch(targetConnections, nv => {
    tableModel.tableState.items = nv.map(sourceConnection =>
      organizationSourceConnectionTableItem(sourceConnection),
    );
  });

  return {
    tableModel,
    setTargetConnections,
    sourceConnectionStore,
    resSourceConnectionList,
    initToolBoxTableModel,
  };
}
