import {
  ITableField,
  ITableItems,
} from '@/shared/hooks/table/toolboxTable/types';
import { reactive } from 'vue';

type IDefinitionTableState<T> = {
  fields: ITableField<ITableItems<T>>[];
  data: Partial<ITableItems<T>>;
  loading: boolean;
};

export const useDefinitionTableModel = <T>() => {
  const tableState: IDefinitionTableState<T> = reactive({
    fields: [],
    data: {},
    loading: true,
  });

  const initState = () => {
    tableState.loading = true;
    tableState.fields = [];
    tableState.data = {};
  };

  return {
    tableState,
    initState,
  };
};
