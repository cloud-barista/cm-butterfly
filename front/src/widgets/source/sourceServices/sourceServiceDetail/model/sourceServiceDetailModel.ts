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
      {
        label: 'view Infra',
        name: 'viewInfra',
        disableCopy: true,
      },
    ];
  }

  function setDefineTableData(serviceId: string) {
    const sourceService = sourceServiceStore.getServiceById(serviceId);
    let data: Partial<Record<SourceServiceTableType, any>> = {};

    if (sourceService) {
      data = {
        name: sourceService.name,
        id: sourceService.id,
        description: sourceService.description,
        status: setServiceStatus(sourceService.status),
        viewInfra: {
          isShow: !!sourceService.infraModel,
        },
      };
    }
    return data;
  }

  interface IStatus {
    color: string;
    status: SourceServiceStatusType;
    text: string;
  }

  function setServiceStatus(status: string | undefined): IStatus {
    if (status === 'success') {
      return {
        color: 'green',
        text: status,
        status: 'Success',
      };
    } else if (status === 'partialSuccess') {
      return {
        color: 'yellow',
        text: status,
        status: 'PartialSuccess',
      };
    } else if (status === 'failed') {
      return {
        color: 'red',
        text: status,
        status: 'Failed',
      };
    } else {
      return {
        color: 'gray',
        text: 'Unknown',
        status: 'Unknown',
      };
    }
  }

  function loadSourceServiceData(serviceId: string | null | undefined) {
    tableModel.tableState.loading = true;
    if (serviceId) {
      tableModel.tableState.data = setDefineTableData(serviceId);
    }
    tableModel.tableState.loading = false;
  }

  watch(serviceId, nv => {
    loadSourceServiceData(nv);
  });

  return {
    loadSourceServiceData,
    sourceServiceStore,
    initTable,
    tableModel,
    setServiceId,
  };
}
