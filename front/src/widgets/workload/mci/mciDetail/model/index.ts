import { McisTableType, useMCIStore } from '../../../../../entities/mci/model';
import { ref, watch } from 'vue';
import { useDefinitionTableModel } from '../../../../../shared/hooks/table/definitionTable/useDefinitionTableModel.ts';
import { getCloudProvidersInVms } from '../../../../../shared/hooks/vm';

export function useMciDetailModel() {
  const mciStore = useMCIStore();
  const mciId = ref<string | null>();
  const tableModel = useDefinitionTableModel<Record<McisTableType, any>>();

  function initTable() {
    tableModel.initState();

    tableModel.tableState.fields = [
      { label: 'Name', name: 'name' },
      { label: 'Description', name: 'description' },
      { label: 'Type', name: 'type' },
      { label: 'Status', name: 'status' },
      { label: 'Action', name: 'action' },
      { label: 'Provider', name: 'provider' },
      { label: 'Deployment Algorithm', name: 'deploymentAlgorithm' },
    ];
  }

  function setMciId(_mciId: string | null) {
    mciId.value = _mciId;
  }

  function setDefineTableData(mciId: string) {
    const mci = mciStore.loadMciById(mciId);
    let data: Partial<Record<McisTableType, any>> = {};

    if (mci) {
      data = {
        name: mci.name || '',
        description: mci.description || '',
        status: mci.status || '',
        type: mci.type || '',
        action: mci.action || '',
        provider: getCloudProvidersInVms(mci.vm) || '',
        deploymentAlgorithm: mci.deploymentAlgorithm || '',
      };
    }
    return data;
  }

  watch(mciId, nv => {
    if (nv) {
      tableModel.tableState.data = setDefineTableData(nv);
    } else {
      tableModel.initState();
    }
    tableModel.tableState.loading = false;
  });

  return { tableModel, initTable, setMciId };
}
