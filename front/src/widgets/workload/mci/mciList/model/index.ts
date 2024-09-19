import { useToolboxTableModel } from '../../../../../shared/hooks/table/toolboxTable/useToolboxTableModel.ts';
import {
  IMci,
  McisTableType,
  useMCIStore,
} from '../../../../../entities/mci/model';
import { watch } from 'vue';
import { useGetMciList } from '../../../../../entities/mci/api';
import { showErrorMessage } from '../../../../../shared/utils';
import { storeToRefs } from 'pinia';
import { getCloudProvidersInVms } from '../../../../../shared/hooks/vm';

interface IProps {
  nsId: string;
}

export function useMciListModel(props: IProps) {
  const mciTableModel =
    useToolboxTableModel<Partial<Record<McisTableType, any>>>();

  const mciStore = useMCIStore();
  const { mcis } = storeToRefs(mciStore);

  const resMciList = useGetMciList(props.nsId);

  function initToolBoxTableModel() {
    mciTableModel.tableState.fields = [
      { name: 'name', label: 'Name' },
      { name: 'alias', label: 'Alias' },
      { name: 'status', label: 'Status' },
      { name: 'provider', label: 'Provider' },
      { name: 'countTotal', label: 'Total Servers' },
      { name: 'countRunning', label: 'Running' },
      { name: 'countSuspended', label: 'Suspended' },
      { name: 'countTerminated', label: 'Terminated' },
    ];

    mciTableModel.querySearchState.keyItemSet = [
      {
        title: 'columns',
        items: [
          { name: 'userid', label: 'User Id' },
          {
            name: 'name',
            label: 'Name',
          },
          { name: 'description', label: 'Description' },
          { name: 'company', label: 'Company' },
          { name: 'department', label: 'Department' },
        ],
      },
    ];
  }

  function organizeResponseMciList(mciRes: IMci) {
    const organizedDatum: Partial<Record<McisTableType | 'originalData', any>> =
      {
        name: mciRes.name,
        description: mciRes.description,
        alias: mciRes.alias || '',
        status: mciRes.status || '',
        provider: getCloudProvidersInVms(mciRes.vm),
        countTotal: mciRes.statusCount.countTotal ?? '',
        countRunning: mciRes.statusCount.countRunning ?? '',
        countSuspended: mciRes.statusCount.countSuspended ?? '',
        countTerminated: mciRes.statusCount.countTerminated ?? '',
        originalData: mciRes,
      };

    return organizedDatum;
  }

  //여기는 modelView에서 해야함.
  function fetchMciList() {
    resMciList
      .execute()
      .then(res => {
        if (res.data.responseData) {
          mciStore.setMcis(res.data.responseData);
        }
      })
      .catch(e => {
        showErrorMessage('Error', e.errorMsg.value);
      });
  }

  watch(mcis, nv => {
    mciTableModel.tableState.items = nv.map(value =>
      organizeResponseMciList(value),
    );
    mciTableModel.handleChange(null);
    console.log(mciTableModel.tableState.displayItems);
  });

  return {
    mciTableModel,
    initToolBoxTableModel,
    mciStore,
    fetchMciList,
    resMciList,
  };
}
