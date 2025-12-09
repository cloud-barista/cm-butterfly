import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import { useSourceServiceStore } from '@/entities/sourceService/model/stores';
import { storeToRefs } from 'pinia';
import { useGetSourceServiceList } from '@/entities/sourceService/api';
import {
  ISourceService,
  SourceServiceTableType,
} from '@/entities/sourceService/model/types';
import { watch } from 'vue';

export function useSourceServiceListModel() {
  const tableModel =
    useToolboxTableModel<Partial<Record<SourceServiceTableType, any>>>();
  const sourceServicesStore = useSourceServiceStore();
  const { services } = storeToRefs(sourceServicesStore);

  const resSourceServiceList = useGetSourceServiceList();

  function initToolBoxTableModel() {
    tableModel.tableState.fields = [
      { name: 'name', label: 'Name' },
      { name: 'id', label: 'id' },
      { name: 'description', label: 'Description' },
      { name: 'connectionCount', label: 'Connection #' },
    ];

    tableModel.querySearchState.keyItemSet = [
      {
        title: 'columns',
        items: [
          { name: 'id', label: 'Id' },
          {
            name: 'name',
            label: 'Name',
          },
          { name: 'description', label: 'Description' },
          { name: 'connection', label: 'Connection' },
        ],
      },
    ];
  }

  function organizeSourceServiceTableItem(sourceService: ISourceService) {
    const organizedDatum: Partial<
      Record<SourceServiceTableType | 'originalData', any>
    > = {
      name: sourceService.name,
      description: sourceService.description || '-',
      connectionCount: sourceService.connectionCount ?? '',
      id: sourceService.id,
      originalData: sourceService,
    };
    return organizedDatum;
  }

  watch(services, nv => {
    tableModel.tableState.items = nv.map(value =>
      organizeSourceServiceTableItem(value),
    );
  });

  return {
    tableModel,
    services,
    sourceServicesStore,
    resSourceServiceList,
    initToolBoxTableModel,
  };
}
