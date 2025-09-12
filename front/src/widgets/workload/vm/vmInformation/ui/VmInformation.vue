<script setup lang="ts">
import { useVmInformationModel } from '@/widgets/workload/vm/vmInformation/model';
import { PBadge, PButton, PDefinitionTable } from '@cloudforet-test/mirinae';
import { onBeforeMount, watch } from 'vue';
import { ILastloadtestStateResponse } from '@/entities/mci/model';

interface IProps {
  nsId: string;
  mciId: string;
  vmId: string;
  lastloadtestStateResponse?: ILastloadtestStateResponse;
}

const props = defineProps<IProps>();
const emit = defineEmits(['openLoadconfig']);
const {
  initTable,
  setVmId,
  detailTableModel,
  setMci,
  remappingData,
  mappdingLoadConfigStatus,
} = useVmInformationModel();

onBeforeMount(() => {
  initTable();
  setMci(props.mciId);
  setVmId(props.vmId);
});

watch(
  () => props.vmId,
  (newVmId) => {
    setMci(props.mciId); // Refresh MCI data when VM changes
    setVmId(newVmId);
    remappingData();
  },
  { immediate: true },
);

watch(
  () => props.lastloadtestStateResponse?.executionStatus,
  (executionStatus) => {
    if (executionStatus) {
      mappdingLoadConfigStatus(executionStatus);
    }
  },
  { immediate: true },
);
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
          <p-button
            style-type="tertiary"
            size="sm"
            @click="emit('openLoadconfig')"
          >
            Load Config
          </p-button>
        </div>
      </template>
      <template #data-provider="{ data }">
        <p-badge
          v-for="(provider, index) in data"
          :key="index"
          :backgroundColor="provider.color"
          class="mr-1"
        >
          {{ provider.name }}
        </p-badge>
      </template>
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss"></style>
