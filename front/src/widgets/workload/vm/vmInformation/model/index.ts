import { ref, watch } from 'vue';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { IMci, IVm, useMCIStore } from '@/entities/mci/model';
import { getCloudProvidersInVms } from '@/shared/hooks/vm';

export type vmDetailTableType =
  | 'serverId'
  | 'description'
  | 'publicIP'
  | 'publicDNS'
  | 'privateIP'
  | 'privateDNS'
  | 'serverStatus'
  | 'loadStatus'
  | 'provider';

export function useVmInformationModel() {
  const targetVmId = ref<string | null>();
  const mciStore = useMCIStore();
  const targetMci = ref<IMci | null>(null);
  const targetVm = ref<IVm | undefined>(undefined);

  const detailTableModel =
    useDefinitionTableModel<Record<vmDetailTableType, any>>();

  function initTable() {
    detailTableModel.initState();

    detailTableModel.tableState.fields = [
      { label: 'Server ID', name: 'serverId' },
      { label: 'Description', name: 'description' },
      { label: 'Public IP(IPv4)', name: 'publicIP' },
      { label: 'Public DNS(IPv4)', name: 'publicDNS' },
      { label: 'Private IP', name: 'privateIP' },
      { label: 'Private DNS', name: 'privateDNS' },
      { label: 'Server Status', name: 'serverStatus' },
      { label: 'Load Status', name: 'loadStatus' },
      { label: 'Provider', name: 'provider' },
    ];
  }

  function setMci(mciId: string) {
    targetMci.value = mciStore.getMciById(mciId);
  }

  function setVmId(_vmId: string | null) {
    console.log(`setVmId : ${_vmId}`);
    targetVmId.value = _vmId;
  }

  function organizeVmDefineTableData(vm: IVm) {
    console.log(vm);
    const data: Record<vmDetailTableType, any> = {
      serverId: vm.id,
      description: vm.description,
      publicIP: vm.publicIP,
      publicDNS: vm.publicDNS,
      privateIP: vm.privateIP,
      privateDNS: vm.privateDNS,
      serverStatus: vm.status,
      loadStatus: vm.lastloadtestStateResponse?.executionStatus ?? '--',
      provider: getCloudProvidersInVms([vm]),
    };

    return data;
  }

  function setDefineTableData(vmId: string) {
    console.log(vmId);
    let data: Partial<Record<vmDetailTableType, any>> = {};

    targetVm.value = targetMci.value?.vm.find(vm => vm.id === vmId);
    console.log(targetVm);
    try {
      if (targetVm.value) {
        data = organizeVmDefineTableData(targetVm.value);
      }
    } catch (e) {
      return data;
    }
    console.log(data);
    return data;
  }

  function remappingData() {
    if (targetVmId.value) {
      detailTableModel.tableState.loading = true;
      detailTableModel.tableState.data = setDefineTableData(targetVmId.value);
      detailTableModel.tableState.loading = false;
    }
  }

  function mappdingLoadConfigStatus(executionStatus: string) {
    if (targetVmId.value) {
      detailTableModel.tableState.loading = true;
      detailTableModel.tableState.data = setDefineTableData(targetVmId.value);
      detailTableModel.tableState.loading = false;
      detailTableModel.tableState.data.loadStatus = executionStatus;
    }
  }

  watch(targetVmId, nv => {
    detailTableModel.tableState.loading = true;

    if (nv) {
      detailTableModel.tableState.data = setDefineTableData(nv);
    } else {
      initTable();
    }
    detailTableModel.tableState.loading = false;
  });

  return {
    initTable,
    setVmId,
    detailTableModel,
    targetVm,
    setMci,
    mciStore,
    remappingData,
    mappdingLoadConfigStatus,
  };
}
