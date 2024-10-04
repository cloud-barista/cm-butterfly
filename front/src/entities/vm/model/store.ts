import { defineStore } from 'pinia';
import { IVm } from './types.ts';
import { ref, Ref } from 'vue';

const NAMESPACE = 'vm';

interface IVmStore {
  vms: Ref<IVm[]>;
  setVm: (val: IVm[]) => void;
  addVm: (val: IVm) => void;
  loadVmById: (vmId: string) => IVm | null;
  loadVmSubGroupById: (vmId: string) => IVm | null;
}

//TODO ns, mci정보도 추가 저장해야함.
export const useVmStore = defineStore(NAMESPACE, (): IVmStore => {
  const vms = ref<IVm[]>([]);

  function setVm(_vms: IVm[]) {
    vms.value = _vms;
  }

  function addVm(_vms: IVm) {
    vms.value.push({ ..._vms });
  }

  function loadVmById(vmId: string) {
    return (
      vms.value.find(vm => {
        return vm.id === vmId;
      }) || null
    );
  }

  function loadVmSubGroupById(vmSubGrupId: string) {
    return (
      vms.value.find(vm => {
        return vm.subGroupId === vmSubGrupId;
      }) || null
    );
  }

  return { vms, setVm, loadVmById, addVm, loadVmSubGroupById };
});
