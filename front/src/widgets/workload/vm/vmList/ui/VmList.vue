<script setup lang="ts">
import {
  PButton,
  PSelectCard,
  PToolbox,
  PDataLoader,
  PButtonTab,
} from '@cloudforet-test/mirinae';
import { useVmListModel } from '@/widgets/workload/vm/vmList/model';
import { onMounted, reactive, ref, watch } from 'vue';
import SuccessfullyLoadConfigModal from '@/features/workload/successfullyModal/ui/SuccessfullyLoadConfigModal.vue';
import LoadConfig from '@/features/workload/actionLoadConfig/ui/LoadConfig.vue';
import { showErrorMessage } from '@/shared/utils';
import { IVm } from '@/entities/mci/model';
import VmInformation from '@/widgets/workload/vm/vmInformation/ui/VmInformation.vue';
import VmEvaluatePerf from '@/widgets/workload/vm/vmEvaluatePerf/ui/VmEvaluatePerf.vue';
import { useGetLastLoadTestState } from '@/entities/vm/api/api';
import { useGetMciInfo } from '@/entities/mci/api';

interface IProps {
  nsId: string;
  mciId: string;
  selectedVmId?: string;
}

const props = defineProps<IProps>();
const emit = defineEmits(['selectCard']);
const resLoadStatus = useGetLastLoadTestState(null);
const resGetMci = useGetMciInfo(null);
const selectedVm = ref<IVm | null>(null);
const { mciStore, initToolBoxTableModel, vmListTableModel, setMci } =
  useVmListModel();

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
const vmDetailTabState = reactive({
  activeTab: 'information',
  tabs: [
    {
      name: 'information',
      label: 'Information',
    },
    {
      name: 'connection',
      label: 'Connection',
    },
    {
      name: 'monitoring',
      label: 'Monitoring',
    },
    {
      name: 'evaluatePref',
      label: 'Evaluate Pref',
    },
    {
      name: 'estimateCost',
      label: 'Estimate Cost',
    },
  ],
});

watch(
  () => props.mciId,
  async () => {
    await handleMciIdChange();
  },
  { immediate: true },
);

watch(
  () => props.selectedVmId,
  (newVmId) => {
    if (newVmId && mciStore.getMciById(props.mciId)) {
      const vm = mciStore.getMciById(props.mciId)?.vm.find(vm => vm.id === newVmId);
      if (vm) {
        selectedVm.value = vm;
        // Update selectIndex to match the selected VM
        const vmIndex = vmListTableModel.tableState.displayItems.findIndex(
          item => item.originalData.id === newVmId
        );
        if (vmIndex !== -1) {
          vmListTableModel.tableState.selectIndex = [vmIndex];
        }
        setVmLoadTestResult();
      }
    } else {
      selectedVm.value = null;
      vmListTableModel.tableState.selectIndex = [];
    }
  },
  { immediate: true },
);

onMounted(() => {
  initToolBoxTableModel();
});

async function getMciInfo() {
  return resGetMci
    .execute({
      pathParams: {
        nsId: props.nsId,
        mciId: props.mciId,
      },
    })
    .then(res => {
      if (res.data.responseData) {
        mciStore.setMci(res.data.responseData);
      }
    })
    .catch(e => {
      showErrorMessage(e, e.errorMsg.value);
    });
}

async function handleMciIdChange() {
  vmListTableModel.tableState.loading = true;
  await getMciInfo();
  setMci(props.mciId);
  vmListTableModel.tableState.selectIndex = [];
  selectedVm.value = null;
  vmListTableModel.tableState.loading = false;
}

function setVmLoadTestResult() {
  if (selectedVm.value === null) return;

  resLoadStatus
    .execute({
      request: {
        nsId: props.nsId,
        mciId: props.mciId,
        vmId: selectedVm.value.id,
      },
    })
    .then(res => {
      if (res.data.responseData) {
        mciStore.assignLastLoadTestStateToVm(
          props.mciId,
          selectedVm.value!.id,
          res.data.responseData.result,
        );
        console.log(mciStore.getMciById(props.mciId));
      }
    })
    .catch(e => {
      showErrorMessage(e, e.errorMsg.value);
    });
}

function handleCardClick(value: any) {
  if (value && value.name) {
    emit('selectCard', value.originalData.id);
    selectedVm.value = value.originalData;
    setVmLoadTestResult();
  } else {
    selectedVm.value = null;
  }
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
  setVmLoadTestResult();
}
</script>

<template>
  <div class="p-4">
    <section class="vmList-container">
      <p-toolbox
        :pageSizeChangeable="false"
        :key-item-sets="vmListTableModel.querySearchState.keyItemSet"
        :value-handler-map="vmListTableModel.querySearchState.valueHandlerMap"
        :query-tag="vmListTableModel.querySearchState.queryTag"
        :total-count="vmListTableModel.tableState.tableCount"
        :page-size="vmListTableModel.tableOptions.pageSize"
        :search-type="vmListTableModel.tableOptions.searchType"
        :loading="
          vmListTableModel.tableState.loading || resLoadStatus.isLoading.value
        "
        @change="vmListTableModel.handleChange"
        @refresh="handleMciIdChange"
      >
        <template #left-area>
          <p-button
            style-type="tertiary"
            icon-left="ic_plus_bold"
            :disabled="true"
          >
            Add Server
          </p-button>
        </template>
      </p-toolbox>
      <div class="vmList-content">
        <p-data-loader
          v-if="vmListTableModel.tableState.displayItems.length === 0"
          :data="false"
          :loading="false"
        >
        </p-data-loader>
        <p-select-card
          v-else
          v-for="(value, index) in vmListTableModel.tableState.displayItems"
          :key="value.name"
          v-model="vmListTableModel.tableState.selectIndex"
          :value="value.name"
          :multi-selectable="false"
          @click="() => handleCardClick(value)"
          style="
            width: 205.5px;
            height: 56px;
            margin: 0.2rem;
            padding: 10px 16px 10px 16px;
            border-radius: 12px;
          "
        >
          <template #default="scope">
            {{ value.name }}
          </template>
        </p-select-card>
      </div>
    </section>
    <section>
      <p-button-tab
        v-model="vmDetailTabState.activeTab"
        :tabs="vmDetailTabState.tabs"
        v-if="selectedVm?.id"
      >
        <template #information>
          <VmInformation
            :mciId="props.mciId"
            :nsId="props.nsId"
            :vmId="selectedVm.id"
            :loading="resLoadStatus.isLoading"
            :lastloadtest-state-response="
              resLoadStatus.data.value?.responseData?.result
            "
            @openLoadconfig="handleLoadStatus"
          >
          </VmInformation>
        </template>
        <template #connection>
          <p>to be..</p>
        </template>
        <template #monitoring>
          <p>to be..</p>
        </template>
        <template #evaluatePref>
          <VmEvaluatePerf
            :loading="resLoadStatus.isLoading"
            :mciId="props.mciId"
            :nsId="props.nsId"
            :vmId="selectedVm.id"
            @openLoadconfig="handleLoadStatus"
          ></VmEvaluatePerf>
        </template>
        <template #estimateCost>
          <p>to be..</p>
        </template>
      </p-button-tab>
    </section>

    <LoadConfig
      v-if="selectedVm"
      :isOpen="modalState.loadConfigRequest.open"
      :mciId="props.mciId"
      :nsId="props.nsId"
      :vmId="selectedVm?.id ?? ''"
      :ip="selectedVm?.publicIP ?? ''"
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

<style scoped lang="postcss">
.vmList-container {
  @apply border-b border-gray-300;
}
.vmList-content {
  @apply w-full flex flex-wrap;
  max-height: 208px;
  padding-top: 10px;
  padding-bottom: 10px;
  overflow-y: auto;
}
</style>
