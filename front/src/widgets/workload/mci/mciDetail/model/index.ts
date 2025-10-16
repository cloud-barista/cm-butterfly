import { McisTableType, useMCIStore } from '@/entities/mci/model';
import { ref, watch } from 'vue';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { getCloudProvidersInVms } from '@/shared/hooks/vm';

export function useMciDetailModel() {
  const mciStore = useMCIStore();
  const mciId = ref<string | null>();
  const tableModel = useDefinitionTableModel<Record<McisTableType, any>>();

  function initTable() {
    tableModel.initState();

    tableModel.tableState.fields = [
      { label: 'Name', name: 'name', disableCopy: true },
      { label: 'Description', name: 'description', disableCopy: true },
      { label: 'Type', name: 'type', disableCopy: true },
      { label: 'Status', name: 'status', disableCopy: true },
      { label: 'Action', name: 'action', disableCopy: true },
      { label: 'Provider', name: 'provider', disableCopy: true },
      {
        label: 'Deployment Algorithm',
        name: 'deploymentAlgorithm',
        disableCopy: true,
      },
    ];
  }

  function setMciId(_mciId: string | null) {
    mciId.value = _mciId;
  }

  function setDefineTableData(mciId: string) {
    const mci = mciStore.getMciById(mciId);
    let data: Partial<Record<McisTableType, any>> = {};

    if (mci) {
      // @ts-ignore
      data = {
        name: mci.name || '',
        description: mci.description || '',
        status: mci.status || '',
        // @ts-ignore
        type: mci.type || 'MCI',
        // @ts-ignore
        action: mci.action || 'Instance',
        provider: getCloudProvidersInVms(mci.vm) || '',
        // @ts-ignore
        deploymentAlgorithm: mci.deploymentAlgorithm || '-',
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
