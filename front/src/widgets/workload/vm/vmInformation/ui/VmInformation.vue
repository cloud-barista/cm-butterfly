<script setup lang="ts">
import { useVmInformationModel } from '@/widgets/workload/vm/vmInformation/model';
import { PBadge, PButton, PDefinitionTable } from '@cloudforet-test/mirinae';
import { onBeforeMount, onMounted, reactive, watch } from 'vue';
import LoadConfig from '@/features/workload/loadConfig/ui/LoadConfig.vue';
import SuccessfullyLoadConfigModal from '@/features/workload/successfullyModal/ui/SuccessfullyLoadConfigModal.vue';
import { useGetLastLoadTestState } from '@/entities/mci/api';
import { showErrorMessage } from '@/shared/utils';

interface IProps {
  nsId: string;
  mciId: string;
  vmId: string;
}

const props = defineProps<IProps>();
console.log(props);
const { initTable, setVmId, detailTableModel, targetVm, setMci, mciStore } =
  useVmInformationModel();
const resLoadStatus = useGetLastLoadTestState(null);

const modalState = reactive({
  loadConfigRequest: {
    open: false,
    context: {
      scenarioName: '',
    },
  },
  loadConfigSuccess: {
    open: false,
  },
});

onBeforeMount(() => {
  initTable();
});

watch(
  props,
  nv => {
    setDatatableData();
  },
  { immediate: true, deep: true },
);

function setDatatableData() {
  resLoadStatus
    .execute({ request: props })
    .then(res => {
      if (res.data.responseData) {
        mciStore.assignLastLoadTestStateToVm(
          props.mciId,
          props.vmId,
          res.data.responseData.result,
        );
      }
      setMci(props.mciId);
      // setVmId(null);
      setVmId(props.vmId);
    })
    .catch(e => {
      showErrorMessage(e, e.errorMsg.value);
    });
}

function handleLoadStatus(e) {
  modalState.loadConfigRequest.open = true;
  modalState.loadConfigSuccess.open = false;
}

function handleLoadConfigRequestClose() {
  modalState.loadConfigRequest.open = false;
}

function handleLoadConfigRequestSuccess(e: string) {
  modalState.loadConfigRequest.open = false;
  modalState.loadConfigSuccess.open = true;
  modalState.loadConfigRequest.context.scenarioName = e;
}

function handleLoadConfigSuccessClose() {
  modalState.loadConfigSuccess.open = false;
  setDatatableData();
}
</script>

<template>
  <div>
    <p-definition-table
      :fields="detailTableModel.tableState.fields"
      :data="detailTableModel.tableState.data"
      :loading="
        detailTableModel.tableState.loading && resLoadStatus.isLoading.value
      "
      block
    >
      <template #extra="{ name }">
        <div v-if="name === 'loadStatus'">
          <p-button style-type="tertiary" size="sm" @click="handleLoadStatus">
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
    <LoadConfig
      v-if="targetVm"
      :isOpen="modalState.loadConfigRequest.open"
      :mciId="mciId"
      :nsId="nsId"
      :vmId="vmId"
      :ip="targetVm?.publicIP ?? ''"
      @success="handleLoadConfigRequestSuccess"
      @close="handleLoadConfigRequestClose"
    ></LoadConfig>
    <SuccessfullyLoadConfigModal
      :isOpen="modalState.loadConfigSuccess.open"
      :scenarioName="modalState.loadConfigRequest.context.scenarioName"
      @close="handleLoadConfigSuccessClose"
    ></SuccessfullyLoadConfigModal>
  </div>
</template>

<style scoped lang="postcss"></style>
