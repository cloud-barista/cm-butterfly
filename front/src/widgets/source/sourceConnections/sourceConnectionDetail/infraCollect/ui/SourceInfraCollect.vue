<script setup lang="ts">
import { PButton, PDefinitionTable } from '@cloudforet-test/mirinae';
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
      block
    >
      <template #data-collectInfra="{ data }"></template>
      <template #data-viewInfra="{ data }"></template>
      <template #extra="{ name }">
        <div v-if="name === 'collectInfra'">
          <p-button style-type="tertiary" size="sm">Collect SW</p-button>
        </div>
      </template>
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss"></style>
