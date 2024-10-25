import { useSourceServiceStore } from '@/entities/sourceService/model/stores.ts';
import { computed, ref, watch, watchEffect } from 'vue';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel.ts';
import {
  SourceServiceStatus,
  SourceServiceStatusType,
  SourceServiceTableType,
  ISourceConnectionStatusCountResponse,
} from '@/entities/sourceService/model/types.ts';
import { storeToRefs } from 'pinia';

export function useSourceServiceDetailModel() {
  const sourceServiceStore = useSourceServiceStore();
  const serviceId = ref<string | null>();
  const tableModel =
    useDefinitionTableModel<Record<SourceServiceTableType, any>>();

  const { serviceWithStatus } = storeToRefs(sourceServiceStore);

  function setServiceId(_serviceId: string | null) {
    serviceId.value = _serviceId;
  }

  function initTable() {
    tableModel.initState();

    tableModel.tableState.fields = [
      { label: 'Source Service Name', name: 'name' },
      { label: 'ID', name: 'id' },
      { label: 'Description', name: 'description' },
      {
        label: 'Agent Status / Connection Status',
        name: 'status',
        disableCopy: true,
      },
    ];
  }

  function setDefineTableData(serviceId: string) {
    let data = {} as any;
    if (serviceWithStatus.value && serviceWithStatus.value.id === serviceId) {
      data = {
        name: serviceWithStatus.value.name,
        id: serviceWithStatus.value.id,
        description: serviceWithStatus.value.description,
        status: setServiceStatus(
          serviceWithStatus.value.connection_info_status_count,
        ),
      };
    }
    console.log(data);
    return data;
    // const sourceService = sourceServiceStore.getServiceById(serviceId);
    // let data: Partial<Record<SourceServiceTableType, any>> = {};

    // if (sourceService) {
    //   data = {
    //     name: sourceService.name,
    //     id: sourceService.id,
    //     description: sourceService.description,
    //     // status: setServiceStatus(sourceService.status),
    //     status: sourceService.status,
    //   };
    // }
    // return data;
  }

  interface IStatus {
    color: string;
    status: SourceServiceStatusType;
    text: string;
  }

  function setServiceStatus(
    stateCnt: ISourceConnectionStatusCountResponse,
  ): any {
    if (
      stateCnt.connection_info_total === stateCnt.count_agent_success &&
      stateCnt.connection_info_total === stateCnt.count_connection_success &&
      stateCnt.connection_info_total !== 0
    ) {
      return {
        color: 'green',
        text: SourceServiceStatus['S0001'],
        status: 'S0001',
      };
    } else if (
      stateCnt.count_connection_failed > 0 ||
      stateCnt.count_connection_failed > 0
    ) {
      return {
        color: 'red',
        text: SourceServiceStatus['S0003'],
        status: 'S0003',
      };
    } else if (
      stateCnt.count_agent_failed + stateCnt.count_agent_success !==
        stateCnt.connection_info_total ||
      stateCnt.count_connection_failed + stateCnt.count_connection_success !==
        stateCnt.connection_info_total ||
      stateCnt.connection_info_total === 0
    ) {
      return {
        color: 'gray',
        text: 'Unknown',
        status: 'S0004',
      };
    }
    // if (state === 'S0001') {
    //   return {
    //     color: 'green',
    //     text: SourceServiceStatus[state],
    //     status: state,
    //   };
    // } else if (state === 'S0002') {
    //   return {
    //     color: 'yellow',
    //     text: SourceServiceStatus[state],
    //     status: state,
    //   };
    // } else if (state === 'S0003') {
    //   return {
    //     color: 'red',
    //     text: SourceServiceStatus[state],
    //     status: state,
    //   };
    // } else {
    //   return {
    //     color: 'gray',
    //     text: 'Unknown',
    //     status: 'S0004',
    //   };
    // }
  }

  function loadSourceServiceData(serviceId: string | null | undefined) {
    tableModel.tableState.loading = true;
    if (serviceId) {
      tableModel.tableState.data = setDefineTableData(serviceId);
    }
    tableModel.tableState.loading = false;
  }

  watch([serviceId, serviceWithStatus], nv => {
    loadSourceServiceData(nv[0]);
  });

  return {
    loadSourceServiceData,
    sourceServiceStore,
    initTable,
    tableModel,
    setServiceId,
  };
}
