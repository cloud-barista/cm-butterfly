<script setup lang="ts">
import { useVmInformationModel } from '@/widgets/workload/vm/vmInformation/model';
import { PBadge, PButton, PDefinitionTable } from '@cloudforet-test/mirinae';
import { onBeforeMount, onMounted, reactive, Ref, watch } from 'vue';
import LoadConfig from '@/features/workload/loadConfig/ui/LoadConfig.vue';
import SuccessfullyLoadConfigModal from '@/features/workload/successfullyModal/ui/SuccessfullyLoadConfigModal.vue';
import { useGetLastLoadTestState } from '@/entities/mci/api';
import { showErrorMessage } from '@/shared/utils';

interface IProps {
  nsId: string;
  mciId: string;
  vmId: string;
  loading: Ref<boolean>;
}

const props = defineProps<IProps>();
const emit = defineEmits(['openLoadconfig']);
console.log(props);
const { initTable, setVmId, detailTableModel, targetVm, setMci, mciStore } =
  useVmInformationModel();

onBeforeMount(() => {
  initTable();
});

watch(
  props,
  nv => {
    setMci(props.mciId);
    setVmId(props.vmId);
  },
  { immediate: true, deep: true },
);

function handleOpenLoadConfig() {
  emit('openLoadconfig');
}
</script>

<template>
  <div>
    <p-definition-table
      :fields="detailTableModel.tableState.fields"
      :data="detailTableModel.tableState.data"
      :loading="detailTableModel.tableState.loading || loading.value"
      block
    >
      <template #extra="{ name }">
        <div v-if="name === 'loadStatus'">
          <p-button
            style-type="tertiary"
            size="sm"
            @click="handleOpenLoadConfig"
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
