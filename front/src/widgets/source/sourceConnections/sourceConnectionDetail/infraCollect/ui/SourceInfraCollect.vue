<script setup lang="ts">
import { PDefinitionTable } from '@cloudforet-test/mirinae';
import { onBeforeMount, onMounted } from 'vue';
import { useSourceInfraCollectModel } from '@/widgets/source/sourceConnections/sourceConnectionDetail/infraCollect/model/sourceInfraCollectModel.ts';

interface IProps {
  connectionId: string | null;
}
const props = defineProps<IProps>();
const { sourceConnectionStore, setConnectionId, defineTableModel, initTable } =
  useSourceInfraCollectModel();

onBeforeMount(() => {
  initTable();
});

onMounted(() => {
  setConnectionId(props.connectionId);
});
</script>

<template>
  <div>
    <p-definition-table
      :fields="defineTableModel.tableState.fields"
      :data="defineTableModel.tableState.data"
      :loading="defineTableModel.tableState.loading"
    >
      <template #data-collectInfra="{ data }"> </template>
      <template #data-viewInfra="{ data }"> </template>
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss"></style>
