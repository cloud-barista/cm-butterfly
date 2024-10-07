import { ref, Ref } from 'vue';
import { IVmGroup } from './types.ts';
import { defineStore } from 'pinia';

const NAMESPACE = 'vmgroups';

export interface IVmGroupsStore {
  vmGroups: Ref<IVmGroup[]>;
  setVmGroups: (val: IVmGroup[]) => void;
  loadVmGroupById: (id: string) => IVmGroup | null;
}

export const useVmGroupStore = defineStore(NAMESPACE, (): IVmGroupsStore => {
  const vmGroups = ref<IVmGroup[]>([]);

  function setVmGroups(_vmGroups: IVmGroup[]) {
    vmGroups.value = _vmGroups;
  }

  function loadVmGroupById(id: string) {
    return (
      vmGroups.value.find((vmGroup: IVmGroup): boolean => {
        return vmGroup.id === id;
      }) || null
    );
  }

  return {
    setVmGroups,
    loadVmGroupById,
    vmGroups,
  };
});
