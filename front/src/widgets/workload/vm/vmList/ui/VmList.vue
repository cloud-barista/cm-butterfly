<script setup lang="ts">
import {
  PButton,
  PSelectCard,
  PToolbox,
  PDataLoader,
  PButtonTab,
} from '@cloudforet-test/mirinae';
import { useVmListModel } from '@/widgets/workload/vm/vmList/model';
import TableLoadingSpinner from '@/shared/ui/LoadingSpinner/TableLoadingSpinner.vue';
import { onMounted, reactive, ref, watch } from 'vue';
import SuccessfullyLoadConfigModal from '@/features/workload/successfullyModal/ui/SuccessfullyLoadConfigModal.vue';
import LoadConfig from '@/features/workload/actionLoadConfig/ui/LoadConfig.vue';
import { showErrorMessage } from '@/shared/utils';
import { IVm } from '@/entities/mci/model';
import VmInformation from '@/widgets/workload/vm/vmInformation/ui/VmInformation.vue';
import VmEvaluatePerf from '@/widgets/workload/vm/vmEvaluatePerf/ui/VmEvaluatePerf.vue';
import ScenarioTemplateManagerModal from '@/widgets/workload/vm/scenarioTemplate/ui/ScenarioTemplateManagerModal.vue';
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
const loadConfigRef = ref();
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
  templateManagerRequest: {
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
      name: 'evaluatePerf',
      label: 'Evaluate Perf',
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
  newVmId => {
    if (newVmId && mciStore.getMciById(props.mciId)) {
      const vm = mciStore
        .getMciById(props.mciId)
        ?.vm.find(vm => vm.id === newVmId);
      if (vm) {
        selectedVm.value = vm;
        // Update selectIndex to match the selected VM
        const vmIndex = vmListTableModel.tableState.displayItems.findIndex(
          item => (item as any).originalData.id === newVmId,
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

function handleLoadStatus() {
  modalState.loadConfigRequest.open = true;
  modalState.loadConfigSuccess.open = false;
}

function handleTemplateManager() {
  modalState.templateManagerRequest.open = true;
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

function handleTemplateManagerOpen() {
  modalState.templateManagerRequest.open = true;
}

function handleTemplateManagerClose() {
  modalState.templateManagerRequest.open = false;
}
</script>

<template>
  <div class="p-4">
    <section class="vmList-container">
      <p-toolbox
        :page-size-changeable="false"
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
      
      <!-- 로딩 중일 때 스피너 표시 -->
      <table-loading-spinner
        :loading="vmListTableModel.tableState.loading"
        message="Loading servers..."
      />
      
      <!-- 로딩 완료 후 카드 표시 -->
      <div v-if="!vmListTableModel.tableState.loading" class="vmList-content">
        <p-data-loader
          v-if="vmListTableModel.tableState.displayItems.length === 0"
          :data="false"
          :loading="false"
        />
        <template v-else>
          <p-select-card
            v-for="value in vmListTableModel.tableState.displayItems"
            :key="value.name"
            :value="value.name"
            :selected="selectedVm?.name"
            :multi-selectable="false"
            class="vmList-card"
            @click="() => handleCardClick(value)"
          >
            {{ value.name }}
          </p-select-card>
        </template>
      </div>
    </section>
    <section>
      <p-button-tab
        v-if="selectedVm?.id"
        v-model="vmDetailTabState.activeTab"
        :tabs="vmDetailTabState.tabs"
      >
        <template #information>
          <VmInformation
            :mci-id="props.mciId"
            :ns-id="props.nsId"
            :vm-id="selectedVm.id"
            :loading="resLoadStatus.isLoading"
            :lastloadtest-state-response="
              resLoadStatus.data.value?.responseData?.result
            "
            @openLoadconfig="handleLoadStatus"
            @openTemplateManager="handleTemplateManager"
          />
        </template>
        <template #connection>
          <p>to be..</p>
        </template>
        <template #monitoring>
          <p>to be..</p>
        </template>
        <template #evaluatePerf>
          <VmEvaluatePerf
            :loading="resLoadStatus.isLoading"
            :mci-id="props.mciId"
            :ns-id="props.nsId"
            :vm-id="selectedVm.id"
            :ip="selectedVm.publicIP"
            @openLoadconfig="handleLoadStatus"
            @openTemplateManager="handleTemplateManagerOpen"
          />
        </template>
        <template #estimateCost>
          <p>to be..</p>
        </template>
      </p-button-tab>
    </section>

    <LoadConfig
      v-if="selectedVm"
      ref="loadConfigRef"
      :is-open="modalState.loadConfigRequest.open"
      :mci-id="props.mciId"
      :ns-id="props.nsId"
      :vm-id="selectedVm?.id ?? ''"
      :ip="selectedVm?.publicIP ?? ''"
      @success="handleLoadConfigRequestSuccess"
      @close="handleLoadConfigRequestClose"
    />
    <SuccessfullyLoadConfigModal
      :is-open="modalState.loadConfigSuccess.open"
      :scenario-name="modalState.loadConfigRequest.context.scenarioName"
      @close="handleLoadConfigSuccessClose"
    />
    <ScenarioTemplateManagerModal
      :is-open="modalState.templateManagerRequest.open"
      :ns-id="props.nsId"
      :mci-id="props.mciId"
      :vm-id="selectedVm?.id ?? ''"
      :ip="selectedVm?.publicIP ?? ''"
      @close="handleTemplateManagerClose"
    />
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

.vmList-card {
  width: 18.75rem;
  margin: 0.25rem;
  padding: 0.5rem;
}

/* custom design-system component - p-select-card */
:deep(.p-select-card .marker) {
  display: none;
}
</style>
