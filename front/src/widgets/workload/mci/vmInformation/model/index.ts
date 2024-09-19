import { IVm, useVmStore, vmDetailTableType } from '../../../../../entities/vm/model';
import { useDefinitionTableModel } from '../../../../../shared/hooks/table/definitionTable/useDefinitionTableModel.ts';
import { ref, watch } from 'vue';
import { useGetVmInfo } from '../../../../../entities/vm/api';

interface IProps {
  nsId: string;
  mciId: string;
  vmGroupId: string;
}

export function useVmInformationModel(props: IProps) {
  const targetVmId = ref<string | null>();
  const vmStore = useVmStore();
  const resVmInfo = useGetVmInfo(null);

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
      { label: 'Status', name: 'status' },
      { label: 'Provider', name: 'provider' },
      { label: 'VM Spec', name: 'vmSpec' },
      { label: 'Server Spec', name: 'serverSpec' },
      { label: 'Region', name: 'region' },
      { label: 'Zone', name: 'zone' },
      { label: 'Security Group', name: 'securityGroup' },
      { label: 'VPC ID', name: 'vpcId' },
      { label: 'Subnet ID', name: 'subnetId' },
      { label: 'StartTime', name: 'startTime' },
      { label: 'Network Interface', name: 'networkInterface' },
      { label: 'Root Device', name: 'rootDevice' },
      { label: 'Root Device Type', name: 'rootDeviceType' },
      { label: 'Keypair Name', name: 'keypairName' },
      { label: 'Block Device', name: 'blockDevice' },
      { label: 'ConfigName', name: 'configName' },
      { label: 'VMID', name: 'vmId' },
      { label: 'User ID / Pwd', name: 'userIdPwd' },
      { label: 'Access ID / Pwd', name: 'accessIdPwd' },
      { label: 'Operating System', name: 'operatingSystem' },
      { label: 'Image ID', name: 'imageId' },
      { label: 'Architecture', name: 'architecture' },
      { label: 'Platform', name: 'platform' },
    ];
  }

  function setVmId(_vmId: string | null) {
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
            vmStore.addVm(res.data.responseData);
          }
          resolve(res);
        })
        .catch(e => {
          reject(e);
        }),
    );
  }

  function organizeVmDefineTableData(vm: IVm) {
    const data: Partial<Record<vmDetailTableType, any>> = {
      serverId: vm.id,
      description: vm.description,
      publicIP: vm.publicIP,
      publicDNS: vm.publicDNS,
      privateIP: vm.privateIP,
      privateDNS: vm.privateDNS,
      status: vm.status,
      provider: vm.connectionConfig.providerName,
      vmSpec: vm.cspViewVmDetail.VMSpecName,
      serverSpec: vm.cspViewVmDetail.VMSpecName,
      region: vm.region.assignedRegion,
      zone: vm.region.assignedZone,
      securityGroup: vm.securityGroupIds?.join(', '),
      vpcId: vm.vNetId,
      subnetId: vm.subnetId,
      startTime: vm.cspViewVmDetail.StartTime,
      networkInterface: vm.cspViewVmDetail.NetworkInterface,
      rootDevice: vm.cspViewVmDetail.RootDeviceName,
      rootDeviceType: vm.cspViewVmDetail.RootDiskType,
      keypairName: vm.cspViewVmDetail.KeyPairName,
      blockDevice: vm.cspViewVmDetail.DataDiskNames?.join(', ') || null,
      configName: vm.connectionConfig.configName,
      vmId: vm.idByCSP,
      userIdPwd: `${vm.cspViewVmDetail.VMUserId} / ${vm.cspViewVmDetail.VMUserPasswd}`,
      accessIdPwd: `${vm.connectionConfig.credentialHolder} / ${vm.connectionConfig.credentialName}`,
      operatingSystem: vm.cspViewVmDetail.ImageType,
      imageId: vm.imageId,
      architecture: vm.cspViewVmDetail.ImageType,
      platform: vm.cspViewVmDetail.ImageName,
    };

    return data;
  }

  async function setDefineTableData(vmId: string) {
    const vm = vmStore.loadVmById(vmId);
    let data: Partial<Record<vmDetailTableType, any>> = {};

    if (vm) {
      data = organizeVmDefineTableData(vm);
    } else {
      await fetchVmInfo(vmId);
      const vm = vmStore.loadVmSubGroupById(vmId);
      if (vm) {
        data = organizeVmDefineTableData(vm);
      }
    }
    return data;
  }
  watch(targetVmId, async nv => {
    if (nv) {
      detailTableModel.tableState.data = await setDefineTableData(nv);
      console.log(detailTableModel.tableState.data);
    } else {
      detailTableModel.initState();
    }
    detailTableModel.tableState.loading = false;
  });

  return { initTable, setVmId, detailTableModel, resVmInfo };
}
