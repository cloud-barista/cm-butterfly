import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel.ts';
import { IMci, McisTableType, useMCIStore } from '@/entities/mci/model';
import { useGetMciInfo, useGetMciList } from '@/entities/mci/api';
import { getCloudProvidersInVms } from '@/shared/hooks/vm';
import { showErrorMessage } from '@/shared/utils';
import { AxiosResponse } from 'axios';
import { IAxiosResponse } from '@/shared/libs';
import Uuid from '@/shared/utils/uuid';

interface IProps {
  nsId: string;
}

export function useMciListModel(props: IProps) {
  const mciTableModel =
    useToolboxTableModel<Partial<Record<McisTableType, any>>>();

  const mciStore = useMCIStore();
  const { mcis } = storeToRefs(mciStore);

  const resMciList = useGetMciList(props.nsId, 'normal');
  const loading = ref<boolean>(true);

  function initToolBoxTableModel() {
    mciTableModel.tableState.fields = [
      { name: 'name', label: 'Name' },
      { name: 'id', label: 'ID' },
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
          { name: 'id', label: 'Id' },
          {
            name: 'name',
            label: 'Name',
          },
        ],
      },
    ];
  }

  function organizeResponseMciList(mciRes: IMci) {
    const organizedDatum: Partial<Record<McisTableType | 'originalData', any>> =
      {
        name: mciRes.name,
        description: mciRes.description,
        id: mciRes.id,
        status: mciRes.status,
        provider: getCloudProvidersInVms(mciRes.vm),
        countTotal: mciRes.statusCount.countTotal ?? '',
        countRunning: mciRes.statusCount.countRunning ?? '',
        countSuspended: mciRes.statusCount.countSuspended ?? '',
        countTerminated: mciRes.statusCount.countTerminated ?? '',
        originalData: mciRes,
      };

    return organizedDatum;
  }

  function fetchMciList() {
    resMciList
      .execute()
      .then(res => {
        if (res.data.responseData) {
          mciStore.setMcis(res.data.responseData.mci);

          const PromiseArr: any = [];
          res.data.responseData.mci.forEach(mci => {
            PromiseArr.push(fetchMciById(mci.id)());
          });

          Promise.all<Promise<AxiosResponse<IAxiosResponse<any>>>>(
            PromiseArr,
          ).then(res => {
            console.log(res);
            res.forEach(el => {
              mciStore.setMci(el.data.responseData);
            });
            loading.value = false;
          });
        }
      })
      .catch(e => {
        showErrorMessage('Error', e.errorMsg.value);
      });
  }

  function fetchMciById(mciId: string) {
    const resGetMciById = useGetMciInfo({ nsId: props.nsId, mciId });

    return resGetMciById.execute;
  }

  watch(
    mcis,
    nv => {
      mciTableModel.tableState.items = nv.map(value =>
        organizeResponseMciList(value),
      );
      mciTableModel.handleChange(null);
    },
    { deep: true },
  );

  /*  watch(resGetMciById.status, () => {
    console.log(resGetMciById.status.value);
  });*/
  return {
    mciTableModel,
    initToolBoxTableModel,
    mciStore,
    fetchMciById,
    fetchMciList,
    resMciList,
    loading,
  };
}
