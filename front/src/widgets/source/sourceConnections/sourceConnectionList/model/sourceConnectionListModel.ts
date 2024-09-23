import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel.ts';
import {
  ISourceConnection,
  SourceConnectionTableTypes,
} from '@/entities/sourceConnection/model/types.ts';
import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores.ts';
import { storeToRefs } from 'pinia';
import { useGetSourceConnectionList } from '@/entities/sourceConnection/api';
import { watch } from 'vue';

export function useSourceConnectionListModel() {
  const tableModel =
    useToolboxTableModel<Partial<Record<SourceConnectionTableTypes, any>>>();
  const sourceConnectionStore = useSourceConnectionStore();
  const { connections } = storeToRefs(sourceConnectionStore);
  const resSourceConnectionList = useGetSourceConnectionList(null);

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

  watch(connections, nv => {
    tableModel.tableState.items = nv.map(sourceConnection =>
      organizationSourceConnectionTableItem(sourceConnection),
    );
  });

  return {
    tableModel,
    connections,
    sourceConnectionStore,
    resSourceConnectionList,
    initToolBoxTableModel,
  };
}
