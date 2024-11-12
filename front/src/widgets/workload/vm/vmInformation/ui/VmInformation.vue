<script setup lang="ts">
import { useVmInformationModel } from '@/widgets/workload/vm/vmInformation/model';
import { PButton, PDefinitionTable } from '@cloudforet-test/mirinae';
import { onBeforeMount, onMounted, reactive, watch } from 'vue';
import LoadConfig from '@/features/workload/loadConfig/ui/LoadConfig.vue';

interface IProps {
  nsId: string;
  mciId: string;
  vmId: string;
}

const props = defineProps<IProps>();
console.log(props);
const { initTable, setVmId, detailTableModel, targetVm, setMci } =
  useVmInformationModel();
const resLoadStatus: any = {};

const modalState = reactive({
  open: false,
  context: {},
});

onBeforeMount(() => {
  initTable();
});

watch(
  props,
  nv => {
    setMci(nv.mciId);
    setVmId(nv.vmId);
  },
  { immediate: true, deep: true },
);

function handleLoadStatus(e) {
  modalState.open = true;
  console.log(modalState.open);
}

function handleClose() {
  modalState.open = false;
}
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
    <LoadConfig
      v-if="targetVm"
      :isOpen="modalState.open"
      :mciId="mciId"
      :nsId="nsId"
      :vmId="vmId"
      :ip="targetVm?.publicIP ?? ''"
      @close="handleClose"
    ></LoadConfig>
  </div>
</template>

<style scoped lang="postcss"></style>
