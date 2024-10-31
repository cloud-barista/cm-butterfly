import { reactive, watch } from 'vue';
import { useVmGroupStore } from '../../../../entities/vmgroups/model';
import { storeToRefs } from 'pinia';
import { useGetVmGroup } from '../../../../entities/vmgroups/api';
import { showErrorMessage } from '../../../../shared/utils';

interface IProps {
  nsId: string;
  mciId: string;
}

export function useVmGroupsModel(props: IProps) {
  const cardState = reactive<any>({
    cardData: [],
    selected: [],
  });

  const vmGroupStore = useVmGroupStore();
  const { vmGroups } = storeToRefs(vmGroupStore);
  const resVmGroups = useGetVmGroup(props);

  function getServerGroupById(id: string) {
    return vmGroupStore.loadVmGroupById(id);
  }

  function organizeCardData() {
    return vmGroups.value.map(vmGroup => {
      return {
        name: vmGroup.id,
        label: vmGroup.id,
      };
    });
  }

  function fetchVmGroups(props: IProps) {
    resVmGroups
      .execute({ pathParams: props })
      .then(res => {
        if (res.data.responseData?.output) {
          const organizeVmGroups = res.data.responseData.output.map(id => ({
            id,
          }));
          vmGroupStore.setVmGroups(organizeVmGroups);
        }
      })
      .catch(e => {
        showErrorMessage('Error', e.errorMsg);
      });
  }

  watch(vmGroups, () => {
    cardState.cardData = organizeCardData();
  });

  return {
    cardState,
    vmGroupStore,
    getServerGroupById,
    fetchVmGroups,
    resVmGroups,
  };
}
