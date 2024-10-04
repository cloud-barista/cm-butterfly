import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { IMci } from './types.ts';

// api 요청은 실제 사용하는 page에서 실행.
// list도 여기서
// 다른 store 참조가능
// 각각의 store load는 feature에서 진행.

const NAMESPACE = 'MCI';

export interface IMciStore {
  mcis: Ref<IMci[]>;
  setMcis: (val: IMci[]) => void;
  loadMciById: (id: string) => IMci | null;
}

export const useMCIStore = defineStore(NAMESPACE, (): IMciStore => {
  const mcis = ref<IMci[]>([]);

  function setMcis(_mcis: IMci[]) {
    mcis.value = _mcis;
  }

  function loadMciById(mciId: string) {
    return (
      mcis.value.find((mci: IMci) => {
        return mci.id === mciId;
      }) || null
    );
  }

  return {
    mcis,
    setMcis,
    loadMciById,
  };
});
