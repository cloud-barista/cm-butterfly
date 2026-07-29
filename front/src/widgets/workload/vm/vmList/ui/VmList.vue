<script setup lang="ts">
import {
  PButton,
  PSelectCard,
  PSelectDropdown,
  PToolbox,
  PDataLoader,
  PButtonTab,
} from '@cloudforet-test/mirinae';
import { useVmListModel } from '@/widgets/workload/vm/vmList/model';
import TableLoadingSpinner from '@/shared/ui/LoadingSpinner/TableLoadingSpinner.vue';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';
import LoadConfig from '@/features/workload/actionLoadConfig/ui/LoadConfig.vue';
import { trackLoadTest } from '@/entities/vm/lib/loadTestTracker';
import { registerPoller } from '@/shared/libs/polling';
import { showErrorMessage, toErrorMessage } from '@/shared/utils';
import { IVm } from '@/entities/mci/model';
import VmInformation from '@/widgets/workload/vm/vmInformation/ui/VmInformation.vue';
import VmEvaluatePerf from '@/widgets/workload/vm/vmEvaluatePerf/ui/VmEvaluatePerf.vue';
import ScenarioTemplateManagerModal from '@/widgets/workload/vm/scenarioTemplate/ui/ScenarioTemplateManagerModal.vue';
import {
  useGetLastLoadTestState,
  useStopLoadTest,
  useGetLoadTestInfo,
} from '@/entities/vm/api/api';
import { useGetMciInfo } from '@/entities/mci/api';
import type { LifecycleAction } from '@/entities/mci/api';
import { ILoadConfigInitialValues } from '@/features/workload/actionLoadConfig/model';
import LifecycleControlModal from '@/features/workload/lifecycleControl/ui/LifecycleControlModal.vue';
import {
  LIFECYCLE_ACTIONS,
  LIFECYCLE_ACTION_ORDER,
  isTransitioning,
  type ILifecycleTarget,
} from '@/features/workload/lifecycleControl/model';

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

// Polls load test progress. cm-ant states: on_processing → on_fetching → successed/test_failed.
const LOADTEST_TERMINAL_STATUS = ['successed', 'test_failed'];
const LOADTEST_STATUS_LABEL: Record<string, string> = {
  on_processing: 'Running',
  on_fetching: 'Collecting results',
  successed: 'Completed',
  test_failed: 'Failed',
};
/**
 * The load test result this screen should use.
 *
 * Returns `undefined` when the response describes *another VM's* run. Everything on screen —
 * the status label, the result table, the chart, Re-run — goes through this one accessor, so
 * filtering here is what stops a deleted VM's result from surfacing under a new one.
 *
 * Clearing the store alone was not enough: the screen was reading the raw response directly,
 * and **the result table stayed on**.
 */
const currentLoadTestResult = computed<any | undefined>(() => {
  const result = (resLoadStatus as any).data?.value?.responseData?.result;
  if (!result) return undefined;
  return isOtherVmResult(result, selectedVm.value?.id ?? '')
    ? undefined
    : result;
});

// Status label shown in the Evaluate Perf header next to Load Config; refreshed on each poll.
const currentLoadTestStatusLabel = computed(() => {
  const status = currentLoadTestResult.value?.executionStatus as
    | string
    | undefined;
  return status ? (LOADTEST_STATUS_LABEL[status] ?? status) : '';
});
// loadTestKey used for stopping and re-running.
const currentLoadTestKey = computed(
  () => (currentLoadTestResult.value?.loadTestKey as string) ?? '',
);
// Timestamp and failure message for the hover on that status label. The front-end state
// type does not carry them, but the backend returns finishAt and failureMessage.
const currentLoadTestStartAt = computed(
  () => (currentLoadTestResult.value?.startAt as string) ?? '',
);
const currentLoadTestFinishAt = computed(
  () => (currentLoadTestResult.value?.finishAt as string) ?? '',
);
const currentLoadTestFailureMessage = computed(
  () => (currentLoadTestResult.value?.failureMessage as string) ?? '',
);
// Fine-grained step progress from cm-ant steps[]; empty on older cm-ant.
const currentLoadTestSteps = computed(
  () => (currentLoadTestResult.value?.steps as any[]) ?? [],
);
// Expected total duration in seconds, for the progress bar.
const currentLoadTestExpectedSeconds = computed(
  () =>
    (currentLoadTestResult.value?.totalExpectedExecutionSecond as number) ?? 0,
);
const resStopLoadTest = useStopLoadTest(null);
// Re-run: state used to pre-fill Load Config from the last run's parameters.
const resLoadTestInfo = useGetLoadTestInfo(null);
const rerunConfig = ref<ILoadConfigInitialValues | null>(null);
// What was last submitted from this screen, kept so Re-run can pre-fill even when the server
// cannot. A run that fails in pre-check has no execution info, so GetLoadTestExecutionInfo 500s
// and the server route returns nothing — this local copy is what makes Re-run reliable.
const lastSubmittedConfig = ref<ILoadConfigInitialValues | null>(null);
async function handleReRun() {
  // Prefer what was submitted here; it is always the real last configuration and does not
  // depend on the server being able to reconstruct it.
  if (lastSubmittedConfig.value) {
    rerunConfig.value = { ...lastSubmittedConfig.value };
    modalState.loadConfigRequest.open = true;
    return;
  }
  const key = currentLoadTestKey.value;
  if (!key) {
    // With no run history, open an empty Load Config
    handleLoadStatus();
    return;
  }
  try {
    const res = await resLoadTestInfo.execute({
      pathParams: { loadTestKey: key },
    });
    const info = (res as any)?.data?.responseData?.result;
    if (info) {
      const http = info.loadTestExecutionHttpInfos?.[0];
      rerunConfig.value = {
        scenarioName: info.testName,
        virtualUsers: info.virtualUsers,
        testDuration: info.duration,
        rampUpTime: info.rampUpTime,
        rampUpSteps: info.rampUpSteps,
        method: http?.method,
        protocol: http?.protocol,
        port: http?.port,
        path: http?.path,
        bodyData: http?.bodyData,
      };
    } else {
      rerunConfig.value = null;
    }
  } catch (e) {
    // Carry on with an empty Load Config if that lookup fails; do not block on it
    rerunConfig.value = null;
  }
  modalState.loadConfigRequest.open = true;
}
function handleStopLoadTest() {
  const key = currentLoadTestKey.value;
  const nodeId = selectedVm.value?.id;
  if (!key || !nodeId) return;
  // cm-ant needs the node the run belongs to, not just the key — without nsId/infraId/nodeId it
  // rejects the request with 400 before it looks the run up.
  resStopLoadTest
    .execute({
      request: {
        loadTestKey: key,
        nsId: props.nsId,
        infraId: props.mciId,
        nodeId,
      },
    })
    .then(() => setVmLoadTestResult())
    .catch(e => showErrorMessage('error', e.errorMsg?.value ?? 'Stop failed'));
}
let loadStatusPollTimer: ReturnType<typeof setTimeout> | null = null;
// Whether the live status poll is currently running. Reactive so the progress display can
// show it is still updating — a bar stuck at 60% then reads as "still checking" rather than
// "gave up". The timer handle itself is not reactive, hence this flag.
const isLoadTestPolling = ref(false);
// Whether a load test is in progress on the selected VM — drives disabling Load Config so a
// second run cannot be started over a running one.
const isLoadTestRunning = computed(() =>
  ['Running', 'Collecting results'].includes(currentLoadTestStatusLabel.value),
);

function stopLoadStatusPolling() {
  if (loadStatusPollTimer) {
    clearTimeout(loadStatusPollTimer);
    loadStatusPollTimer = null;
  }
  isLoadTestPolling.value = false;
}
const { mciStore, initToolBoxTableModel, vmListTableModel, setMci } =
  useVmListModel();

const modalState = reactive({
  loadConfigRequest: {
    open: false,
    context: {
      scenarioName: '',
    },
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
      // An infra with no nodes has no vm key at all — guard before indexing into it.
      const vm = mciStore
        .getMciById(props.mciId)
        ?.vm?.find(vm => vm.id === newVmId);
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

// Register the load-test status poll so a session end stops it centrally. Without
// this the poll keeps hitting the API after logout and reopens the "session expired" path.
let unregisterPoller: (() => void) | null = null;
onMounted(() => {
  initToolBoxTableModel();
  unregisterPoller = registerPoller(stopLoadStatusPolling);
});

onBeforeUnmount(() => {
  stopLoadStatusPolling();
  stopNodeFollow();
  unregisterPoller?.();
});

async function getMciInfo() {
  return resGetMci
    .execute({
      pathParams: {
        nsId: props.nsId,
        infraId: props.mciId,
      },
    })
    .then(res => {
      if (res.data.responseData) {
        mciStore.setMci(res.data.responseData);
      }
    })
    .catch(e => {
      showErrorMessage(
        'Error',
        toErrorMessage(e, 'Failed to load node information.'),
      );
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

/**
 * Whether the run that came back belongs to *another VM*.
 *
 * The uid is the only thing that can answer this — names are reused and say nothing. True
 * only when both uids are known and differ; if either is missing, decide nothing.
 */
function isOtherVmResult(result: any, targetVmId: string): boolean {
  const resultUid = result?.nodeUid;
  if (!resultUid) return false;

  const vmUid =
    selectedVm.value?.id === targetVmId ? selectedVm.value?.uid : undefined;
  if (!vmUid) return false;

  return resultUid !== vmUid;
}

function setVmLoadTestResult() {
  if (selectedVm.value === null) return;
  // stop the previous poll when switching nodes or re-querying
  stopLoadStatusPolling();
  const targetVmId = selectedVm.value.id;

  resLoadStatus
    .execute({
      request: {
        nsId: props.nsId,
        infraId: props.mciId,
        nodeId: targetVmId,
      },
    })
    .then(res => {
      // ignore if the selected node changed in the meantime
      if (selectedVm.value?.id !== targetVmId) return;
      if (res.data.responseData) {
        const result = res.data.responseData.result;

        // Check that this result belongs to the VM currently on screen.
        //
        // cm-ant finds "the last run on this node" by name (ns/infra/node), and those names
        // are reused — cb-tumblebug builds a node id as `{group}-{index}`, so deleting a VM
        // and recreating it under the same name brings back **the deleted VM's load test
        // result.** Shown as the new VM's, it convinces the user of a test they never ran.
        //
        // A missing uid (older records, or a failed lookup) is not treated as a mismatch.
        // Not knowing is not the same as belonging elsewhere, and blocking here would make
        // every earlier record look as though it had vanished.
        if (isOtherVmResult(result, targetVmId)) {
          mciStore.assignLastLoadTestStateToVm(
            props.mciId,
            targetVmId,
            undefined,
          );
          stopLoadStatusPolling();
          return;
        }

        mciStore.assignLastLoadTestStateToVm(props.mciId, targetVmId, result);

        const status = result?.executionStatus;
        if (status && !LOADTEST_TERMINAL_STATUS.includes(status)) {
          // still running → keep polling for status
          isLoadTestPolling.value = true;
          loadStatusPollTimer = setTimeout(() => setVmLoadTestResult(), 5000);
        } else if (status && LOADTEST_TERMINAL_STATUS.includes(status)) {
          // finished or failed → stop polling. The state change remounts the result
          // component, which fetches on its own, so nothing needs forcing here.
          stopLoadStatusPolling();
        }
      }
    })
    .catch(e => {
      showErrorMessage(
        'Error',
        toErrorMessage(e, 'Failed to load node information.'),
      );
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
  // opening Load Config normally → no pre-fill; only Re-run carries the last parameters
  rerunConfig.value = null;
  modalState.loadConfigRequest.open = true;
}

function handleTemplateManager() {
  modalState.templateManagerRequest.open = true;
}
function handleLoadConfigRequestClose() {
  modalState.loadConfigRequest.open = false;
}

function handleLoadConfigRequestSuccess(
  e: string,
  loadTestKey?: string,
  submitted?: ILoadConfigInitialValues,
) {
  modalState.loadConfigRequest.open = false;
  // Remember exactly what was submitted so Re-run pre-fills from it (see handleReRun).
  if (submitted) lastSubmittedConfig.value = submitted;
  // No success popup: land on the Evaluate Perf tab, where the full progress (phase/sub-step
  // tree, bar, live line) is shown. The popup only duplicated a subset of that and jumped as
  // the step text changed height, so a request from any tab now just moves here (user request).
  vmDetailTabState.activeTab = 'evaluatePerf';
  modalState.loadConfigRequest.context.scenarioName = e;

  // Hand it to the app-wide tracker so the outcome is caught even off this screen.
  //
  // The key is the **execution key**. Tracking by name announces another VM's run once the
  // name is reused, and cannot tell two runs on the same node apart.
  //
  // The label can only be known here — at completion there is just the execution key, which
  // cannot be turned into a sentence saying which VM this was.
  if (loadTestKey && selectedVm.value) {
    void trackLoadTest({
      loadTestKey,
      label: selectedVm.value.name || selectedVm.value.id,
    });
  }

  // The poll below drives *live display on this screen*; the tracking above drives *the
  // notification after leaving it*. They are kept apart because their purposes differ —
  // handing display to the tracker's ten-second interval makes progress crawl, and handing
  // the notification to the screen ends it the moment the screen is left.
  setVmLoadTestResult();
}

// ── Server lifecycle control (Suspend / Resume / Reboot / Terminate) ────────
//
// The same four actions the workload list offers, aimed at one server instead of all of them. The
// action menu is disabled until a server is selected — with nothing selected there is no target, and
// acting on "whichever one is first" is not something a console should decide for the user.

const lifecycleModalState = reactive({
  visible: false,
  action: null as LifecycleAction | null,
});

// Holds which menu entry is highlighted; the work is driven by the select event, not by this.
const nodeActionState = reactive({
  selectedActionItem: '',
});

const isNodeActionDisabled = computed(() => !selectedVm.value);

const nodeActionMenus = computed(() =>
  LIFECYCLE_ACTION_ORDER.map(action => ({
    name: action,
    label: LIFECYCLE_ACTIONS[action].label,
    disabled: isNodeActionDisabled.value,
  })),
);

const nodeLifecycleTargets = computed<ILifecycleTarget[]>(() =>
  selectedVm.value
    ? [
        {
          id: selectedVm.value.id,
          name: selectedVm.value.name || selectedVm.value.id,
          status: selectedVm.value.status,
        },
      ]
    : [],
);

function handleNodeAction(item: string) {
  if (!selectedVm.value) return;
  if (!LIFECYCLE_ACTION_ORDER.includes(item as LifecycleAction)) return;
  lifecycleModalState.action = item as LifecycleAction;
  lifecycleModalState.visible = true;
}

// Bumped to remount the node detail, which reads its values on mount. Without it the detail keeps
// showing the status from before the action even after the infra has been re-read.
const nodeDetailKey = ref(0);

let nodeFollowTimer: ReturnType<typeof setTimeout> | null = null;
let unregisterNodeFollowPoller: (() => void) | null = null;

function stopNodeFollow() {
  if (nodeFollowTimer) {
    clearTimeout(nodeFollowTimer);
    nodeFollowTimer = null;
  }
  unregisterNodeFollowPoller?.();
  unregisterNodeFollowPoller = null;
}

/**
 * Re-read the workload and point the screen at the *fresh* copy of the selected server.
 *
 * Re-reading alone is not enough. The store merges the new workload over the old one, which replaces
 * its server array, so the object this screen is holding is left behind — detached from the store
 * and frozen at the status it had before the action. Looking the server up again by id is what keeps
 * the detail showing the truth.
 */
async function refreshSelectedNode() {
  const nodeId = selectedVm.value?.id;
  if (!nodeId) return;
  await getMciInfo();
  const fresh = mciStore
    .getMciById(props.mciId)
    ?.vm?.find(vm => vm.id === nodeId);
  if (fresh) selectedVm.value = fresh;
  nodeDetailKey.value++;
}

/**
 * Watch the selected server until it settles.
 *
 * cb-tumblebug answers the control call while the provider is still working, so a single refresh
 * would only ever catch `Suspending`. Registering with the poller registry is what stops this when
 * the session ends — a poll left running after logout gets a 401 and throws the user back onto the
 * "session expired" path.
 */
function followNodeTransition() {
  stopNodeFollow();
  unregisterNodeFollowPoller = registerPoller(stopNodeFollow);
  const deadline = Date.now() + 3 * 60_000;

  const tick = async () => {
    await refreshSelectedNode();
    if (
      Date.now() > deadline ||
      !isTransitioning(selectedVm.value?.status, selectedVm.value?.targetAction)
    ) {
      stopNodeFollow();
      return;
    }
    nodeFollowTimer = setTimeout(() => void tick(), 5_000);
  };

  nodeFollowTimer = setTimeout(() => void tick(), 5_000);
}

async function handleNodeLifecycleRequested() {
  await refreshSelectedNode();
  followNodeTransition();
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
          <p-select-dropdown
            data-testid="vm-action-dropdown"
            placeholder="Action"
            :menu="nodeActionMenus"
            :selected.sync="nodeActionState.selectedActionItem"
            reset-selected-on-unmounted
            class="mr-2"
            @select="handleNodeAction"
          >
            <!--
              mirinae's PContextMenu copies only the props it knows from each menu entry, so a
              data-testid put on the entry object is dropped without a word. Drawing the label
              through this slot is the way to attach one, and the slot must always render an
              element (DESIGN-MIRINAE §1.7).
            -->
            <template #menu-item--format="{ item }">
              <span :data-testid="`vm-action-${item.name}`">{{
                item.label
              }}</span>
            </template>
          </p-select-dropdown>
          <p-button
            style-type="tertiary"
            icon-left="ic_plus_bold"
            :disabled="true"
          >
            Add Server
          </p-button>
        </template>
      </p-toolbox>

      <!-- spinner while loading -->
      <table-loading-spinner
        :loading="vmListTableModel.tableState.loading"
        message="Loading servers..."
      />

      <!-- cards once loading has finished -->
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
            :key="nodeDetailKey"
            :mci-id="props.mciId"
            :ns-id="props.nsId"
            :vm-id="selectedVm.id"
            :loading="resLoadStatus.isLoading"
            :lastloadtest-state-response="
              resLoadStatus.data.value?.responseData?.result
            "
            :load-test-status="currentLoadTestStatusLabel"
            :load-test-start-at="currentLoadTestStartAt"
            :load-test-finish-at="currentLoadTestFinishAt"
            :load-test-failure-message="currentLoadTestFailureMessage"
            :load-test-steps="currentLoadTestSteps"
            :load-test-expected-seconds="currentLoadTestExpectedSeconds"
            :is-load-test-running="isLoadTestRunning"
            :is-load-test-polling="isLoadTestPolling"
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
            :load-test-status="currentLoadTestStatusLabel"
            :load-test-start-at="currentLoadTestStartAt"
            :load-test-finish-at="currentLoadTestFinishAt"
            :load-test-failure-message="currentLoadTestFailureMessage"
            :load-test-steps="currentLoadTestSteps"
            :load-test-expected-seconds="currentLoadTestExpectedSeconds"
            :is-load-test-running="isLoadTestRunning"
            :is-load-test-polling="isLoadTestPolling"
            @openLoadconfig="handleLoadStatus"
            @openTemplateManager="handleTemplateManagerOpen"
            @stopLoadTest="handleStopLoadTest"
            @reRun="handleReRun"
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
      :initial-config="rerunConfig"
      @success="handleLoadConfigRequestSuccess"
      @close="handleLoadConfigRequestClose"
    />
    <ScenarioTemplateManagerModal
      :is-open="modalState.templateManagerRequest.open"
      :ns-id="props.nsId"
      :mci-id="props.mciId"
      :vm-id="selectedVm?.id ?? ''"
      :ip="selectedVm?.publicIP ?? ''"
      @close="handleTemplateManagerClose"
    />
    <lifecycle-control-modal
      :visible.sync="lifecycleModalState.visible"
      :action="lifecycleModalState.action"
      scope="node"
      :ns-id="props.nsId"
      :infra-id="props.mciId"
      :targets="nodeLifecycleTargets"
      @requested="handleNodeLifecycleRequested"
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
