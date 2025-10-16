import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores';
import { SourceConnectionTableTypes } from '@/entities/sourceConnection/model/types';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { ref, watch } from 'vue';

export function useSourceInformationModel() {
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
      { label: 'Description', name: 'description' },
      { label: 'Type', name: 'type' },
      { label: 'IP Address', name: 'ip' },
      { label: 'Port', name: 'port' },
      { label: 'User', name: 'user' },
      { label: 'Password', name: 'password' },
      { label: 'Private Key', name: 'privateKey' },
      { label: 'Public Key', name: 'publicKey' },
    ];
  }

  function setDefineTableData(connectionId: string) {
    const connection = sourceConnectionStore.getConnectionById(connectionId);
    let data: Partial<Record<SourceConnectionTableTypes, any>> = {};

    if (connection) {
      data = {
        name: connection.name,
        id: connection.id,
        description: connection.description || '-',
        type: connection.type || '-',
        ip: connection.ip_address,
        port: connection.ssh_port,
        user: connection.user,
        password: connection.password,
        privateKey: connection.private_key,
        publicKey: connection.public_key || '-',
      };
    }

    return data;
  }

  watch(connectionId, nv => {
    defineTableModel.tableState.loading = true;
    if (nv) {
      defineTableModel.tableState.data = setDefineTableData(nv);
    }
    defineTableModel.tableState.loading = false;
  });

  return {
    sourceConnectionStore,
    setConnectionId,
    defineTableModel,
    initTable,
  };
}
