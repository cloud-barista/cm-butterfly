import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { IMci, IVm } from './types.ts';

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

  function setVmsInfo(mciID: string, vm: Array<IVm>) {
    const mci = getMciById(mciID);
    if (mci) {
      mci.vm = vm;
    }
  }

  function setVmInfo(mciID: string, vm: IVm) {
    const mci = getMciById(mciID);
    const targetVm = mci?.vm.find(_vm => _vm.id === vm.id);
    if (targetVm) {
      Object.assign(targetVm, vm);
    }
  }
  return {
    mcis,
    setMcis,
    getMciById,
    setVmsInfo,
    setVmInfo,
  };
});
