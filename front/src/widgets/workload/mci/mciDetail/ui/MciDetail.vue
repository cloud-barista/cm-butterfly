<script setup lang="ts">
import { useMciDetailModel } from '@/widgets/workload/mci/mciDetail/model';
import { onBeforeMount, onMounted, watch, PropType } from 'vue';
import { PDefinitionTable } from '@cloudforet-test/mirinae';

interface IProps {
  selectedMciId: string;
}

const props = defineProps<IProps>();
const mciDetailModel = useMciDetailModel();

watch(props, nv => {
  mciDetailModel.setMciId(nv.selectedMciId);
});

onBeforeMount(() => {
  mciDetailModel.initTable();
  mciDetailModel.tableModel.tableState.loading = false;
});

onMounted(() => {
  mciDetailModel.setMciId(props.selectedMciId);
});
</script>

<template>
  <div>
    <p-definition-table
      :fields="mciDetailModel.tableModel.tableState.fields"
      :data="mciDetailModel.tableModel.tableState.data"
      :loading="mciDetailModel.tableModel.tableState.loading"
    >
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss"></style>
