import { ref, watch } from 'vue';
import { IMci, IVm, useMCIStore } from '@/entities/mci/model';
import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';

export function useVmListModel() {
  const mciStore = useMCIStore();
  const targetMci = ref<IMci | null>(null);

  const vmListTableModel = useToolboxTableModel<Record<'name', any>>();

  function setMci(mciId: string) {
    targetMci.value = mciStore.getMciById(mciId);
  }

  function getVmList() {
    return targetMci.value?.vm ?? [];
  }

  function organizeVMTableData(vm: IVm) {
    const organizedDatum: Record<'name' | 'label' | 'originalData', any> = {
      name: vm.name,
      label: vm.label,
      originalData: vm,
    };
    return organizedDatum;
  }

  function initToolBoxTableModel() {
    vmListTableModel.tableState.fields = [{ name: 'name', label: 'Name' }];

    vmListTableModel.querySearchState.keyItemSet = [
      {
        title: 'columns',
        items: [{ name: 'name', label: 'Name' }],
      },
    ];
  }

  watch(
    targetMci,
    () => {
      vmListTableModel.tableState.items =
        targetMci.value?.vm.map(vm => organizeVMTableData(vm)) || [];
    },
    { immediate: true },
  );

  return {
    mciStore,
    vmListTableModel,
    getVmList,
    initToolBoxTableModel,
    setMci,
  };
}
