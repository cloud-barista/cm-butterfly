import { computed, reactive, ref, watch } from 'vue';
import { useVmStore, vmDetailTableType } from '@/entities/vm/model';
import { useGetVmInfo } from '@/entities/vm/api';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel.ts';
import { IVm, useMCIStore } from '@/entities/mci/model';

interface IProps {
  nsId: string;
  mciId: string;
  vmId: string;
}

export function useVmInformationModel(props: IProps) {
  const targetVmId = ref<string | null>();
  const mciStore = useMCIStore();
  const targetMci = reactive({
    mci: computed(() => mciStore.getMciById(props.mciId)),
  });
  const resVmInfo = useGetVmInfo(null);

  const vmLoadStatus = ref<string>('');

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

  function setVmId(_vmId: string | null) {
    console.log(`setVmId : ${_vmId}`);
    targetVmId.value = _vmId;
  }

  async function fetchVmInfo(vmId: string) {
    return new Promise((resolve, reject) =>
      resVmInfo
        .execute({
          pathParams: { nsId: props.nsId, mciId: props.mciId, vmId },
        })
        .then(res => {
          if (res.data.responseData) {
            mciStore.setVmInfo(props.mciId, res.data.responseData);
          }
          resolve(res);
        })
        .catch(e => {
          reject(e);
        }),
    );
  }

  function organizeVmDefineTableData(vm: IVm) {
    console.log(vmLoadStatus.value);

    const data: Record<vmDetailTableType, any> = {
      serverId: vm.id,
      description: vm.description,
      publicIP: vm.publicIP,
      publicDNS: vm.publicDNS,
      privateIP: vm.privateIP,
      privateDNS: vm.privateDNS,
      serverStatus: vm.status,
      loadStatus: vmLoadStatus.value,
      provider: vm.connectionConfig.providerName,
    };

    return data;
  }

  function mappingLoadStatus(status: string) {
    vmLoadStatus.value = status;
  }

  function setDefineTableData(vmId: string) {
    let data: Partial<Record<vmDetailTableType, any>> = {};

    const targetVm = targetMci.mci?.vm.find(vm => vm.id === vmId);
    console.log(targetVm);

    try {
      if (targetVm) {
        data = organizeVmDefineTableData(targetVm);
      }
    } catch (e) {
      return data;
    }
    console.log(data);
    return data;
  }

  watch(
    () => targetVmId.value,
    nv => {
      detailTableModel.tableState.loading = true;

      console.log(nv);
      if (nv) {
        detailTableModel.tableState.data = setDefineTableData(nv);
        console.log(detailTableModel.tableState.data);
      }
      detailTableModel.tableState.loading = false;
    },
  );

  return { initTable, setVmId, detailTableModel, resVmInfo, mappingLoadStatus };
}
