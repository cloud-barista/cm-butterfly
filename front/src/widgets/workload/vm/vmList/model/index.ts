import { computed, reactive, watch } from 'vue';
import { IVm, useMCIStore } from '@/entities/mci/model';
import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel.ts';
import {
  ISourceService,
  SourceServiceTableType,
} from '@/entities/sourceService/model/types.ts';

interface IProps {
  nsId: string;
  mciId: string;
}

export function useVmListModel(props: IProps) {
  const mciStore = useMCIStore();
  const targetMci = reactive({
    mci: computed(() => mciStore.getMciById(props.mciId)),
  });

  const vmListTableModel = useToolboxTableModel<Record<'name', any>>();

  function getVmList() {
    console.log(targetMci);
    return targetMci.mci?.vm ?? [];
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
    () => targetMci,
    () => {
      vmListTableModel.tableState.items =
        targetMci.mci?.vm.map(vm => organizeVMTableData(vm)) || [];
    },
    { immediate: true },
  );

  watch(
    () => vmListTableModel,
    () => {
      console.log(vmListTableModel);
    },
    { immediate: true },
  );

  return {
    vmListTableModel,
    getVmList,
    initToolBoxTableModel,
  };
}
