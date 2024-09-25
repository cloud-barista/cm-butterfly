<script setup lang="ts">
import { useSourceInformationModel } from '@/widgets/source/sourceConnections/sourceConnectionDetail/information/model/sourceInformationModel.ts';
import { onBeforeMount, onMounted, watch } from 'vue';
import { PDefinitionTable } from '@cloudforet-test/mirinae';

interface IProps {
  connectionId: string | null;
}

const props = defineProps<IProps>();

const { sourceConnectionStore, setConnectionId, defineTableModel, initTable } =
  useSourceInformationModel();

watch(
  props,
  () => {
    setConnectionId(props.connectionId);
  },
  { immediate: true },
);
onBeforeMount(() => {
  initTable();
});
</script>

<template>
  <div>
    <p-definition-table
      :fields="defineTableModel.tableState.fields"
      :data="defineTableModel.tableState.data"
      :loading="defineTableModel.tableState.loading"
    >
      <template #data-password="{ data }">
        <p>{{ data.replaceAll(/./g, '*') }}</p>
      </template>
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss"></style>
