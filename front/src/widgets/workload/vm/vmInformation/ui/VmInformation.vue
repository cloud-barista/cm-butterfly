<script setup lang="ts">
import { useVmInformationModel } from '@/widgets/workload/vm/vmInformation/model';
import { PButton, PDefinitionTable } from '@cloudforet-test/mirinae';
import { onBeforeMount, onMounted, watch } from 'vue';

interface IProps {
  nsId: string;
  mciId: string;
  vmId: string;
}

const props = defineProps<IProps>();
console.log(props);
const { initTable, setVmId, detailTableModel, resVmInfo } =
  useVmInformationModel(props);
const resLoadStatus: any = {};
onBeforeMount(() => {
  initTable();
});

watch(
  props,
  nv => {
    setVmId(nv.vmId);
  },
  { immediate: true, deep: true },
);

watch(
  detailTableModel.tableState.data,
  nv => {
    console.log(nv);
  },
  { deep: true },
);

function handleLoadStatus(e) {}
</script>

<template>
  <div>
    <p-definition-table
      :fields="detailTableModel.tableState.fields"
      :data="detailTableModel.tableState.data"
      :loading="detailTableModel.tableState.loading"
      block
    >
      <template #extra="{ name }">
        <div v-if="name === 'loadStatus'">
          <p-button style-type="tertiary" size="sm" @click="handleLoadStatus">
            Load Config
          </p-button>
        </div>
      </template>
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss"></style>
