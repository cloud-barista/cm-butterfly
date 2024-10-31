<script setup lang="ts">
import { useVmInformationModel } from '@/widgets/workload/mci/vmInformation/model';
import { PDefinitionTable } from '@cloudforet-test/mirinae';
import { onBeforeMount, onMounted, watch } from 'vue';

interface IProps {
  nsId: string;
  mciId: string;
  vmGroupId: string;
}

const props = defineProps<IProps>();
const { initTable, setVmId, detailTableModel, resVmInfo } =
  useVmInformationModel(props);

watch(props, nv => {
  setVmId(nv.vmGroupId);
});

onBeforeMount(() => {
  initTable();
  console.log(detailTableModel.tableState.fields);
});

onMounted(() => {
  setVmId(props.vmGroupId);
});
</script>

<template>
  <div>
    <p-definition-table
      :fields="detailTableModel.tableState.fields"
      :data="detailTableModel.tableState.data"
      :loading="
        detailTableModel.tableState.loading && resVmInfo.isLoading.value
      "
    />
  </div>
</template>

<style scoped lang="postcss"></style>
