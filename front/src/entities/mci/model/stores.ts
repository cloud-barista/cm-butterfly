import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { ILastloadtestStateResponse, IMci, IVm } from './types.ts';

const NAMESPACE = 'MCI';

export const useMCIStore = defineStore(NAMESPACE, () => {
  const mcis = ref<IMci[]>([]);

  function setMcis(_mcis: IMci[]) {
    mcis.value = _mcis;
  }

  function getMciById(mciId: string) {
    return (
      mcis.value.find((mci: IMci) => {
        return mci.id === mciId;
      }) || null
    );
  }

  function setMci(_mci: IMci) {
    const targetMci = mcis.value.find(mci => mci.uid === _mci.uid);
    if (targetMci) {
      Object.assign(targetMci, _mci);
    }
  }

  function setVmsInfo(mciID: string, vm: Array<IVm>) {
    const mci = getMciById(mciID);
    if (mci) {
      mci.vm = vm;
    }
  }

  function setVmInfo(mciID: string, vm: IVm) {
    const mci = getMciById(mciID);
    const targetVm = mci?.vm.find(_vm => _vm.uid === vm.uid);
    if (targetVm) {
      Object.assign(targetVm, vm);
    }
  }

  function assignLastLoadTestStateToVm(
    mciID: string,
    vmID: string,
    response: ILastloadtestStateResponse,
  ) {
    const mci = getMciById(mciID);
    if (mci) {
      const vm = mci.vm.find(_vm => _vm.id === vmID);
      if (vm) {
        vm.lastloadtestStateResponse = response;
      }
    }
  }
  return {
    mcis,
    setMci,
    setMcis,
    getMciById,
    setVmsInfo,
    setVmInfo,
    assignLastLoadTestStateToVm,
  };
});
