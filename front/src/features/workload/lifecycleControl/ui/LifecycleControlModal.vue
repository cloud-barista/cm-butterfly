<script setup lang="ts">
import {
  PButtonModal,
  PButton,
  PFieldGroup,
  PRadio,
  PRadioGroup,
  PTextInput,
} from '@cloudforet-test/mirinae';
import { computed, reactive, watch } from 'vue';
import type { LifecycleAction } from '@/entities/mci/api';
import {
  LIFECYCLE_ACTIONS,
  isTransitionAllowed,
  useLifecycleControl,
  type ILifecycleTarget,
  type LifecycleScope,
} from '@/features/workload/lifecycleControl/model';

interface IProps {
  visible: boolean;
  /** null while the modal is closed — nothing is drawn until an action is chosen. */
  action: LifecycleAction | null;
  scope: LifecycleScope;
  nsId: string;
  /** The workload the servers belong to. Only used for `node` scope. */
  infraId?: string;
  targets: ILifecycleTarget[];
}

interface IEmits {
  (e: 'update:visible', value: boolean): void;
  /** The requests went out. The caller refreshes and follows the status from here. */
  (e: 'requested'): void;
}

const props = defineProps<IProps>();
const emit = defineEmits<IEmits>();

const { state: runState, run, reset: resetRun } = useLifecycleControl();

const state = reactive({
  // confirm  — what it does, which targets, normal or force, and (destructive only) the typed name
  // progress — one row per target: requesting, accepted, or refused with the reason
  phase: 'confirm' as 'confirm' | 'progress',
  method: 'normal' as 'normal' | 'force',
  confirmKeyword: '',
});

const meta = computed(() =>
  props.action ? LIFECYCLE_ACTIONS[props.action] : null,
);

const scopeNoun = computed(() =>
  props.scope === 'infra'
    ? props.targets.length === 1
      ? 'Workload'
      : 'Workloads'
    : props.targets.length === 1
      ? 'Server'
      : 'Servers',
);

const headerTitle = computed(() =>
  meta.value ? `${meta.value.label} ${scopeNoun.value}` : '',
);

/** What a destructive action asks the user to type — the name itself, or a phrase for a batch. */
const checkKeyword = computed(() => {
  if (props.targets.length === 1) return props.targets[0]?.name ?? '';
  return `${meta.value?.label ?? ''} All`;
});

/** Targets whose current status is not one this action normally runs from. */
const blockedTargets = computed(() =>
  props.action
    ? props.targets.filter(t => !isTransitionAllowed(props.action!, t.status))
    : [],
);

/**
 * The warning shown when a target's status is not one this action normally runs from.
 *
 * Worded for how many there are. A single target reads as itself — "1 of 1 are not in a state…"
 * counts something the user can already see, and gets the grammar wrong on the way.
 */
const stateWarning = computed(() => {
  if (!meta.value || !blockedTargets.value.length) return '';
  const noun = props.scope === 'infra' ? 'workload' : 'server';
  const subject =
    props.targets.length === 1
      ? `This ${noun} is`
      : blockedTargets.value.length === props.targets.length
        ? `None of the selected ${noun}s are`
        : `${blockedTargets.value.length} of the ${props.targets.length} selected ${noun}s are`;
  return `${subject} not in a state that normally allows ${meta.value.label}. The request may be refused — Force sends it regardless.`;
});

const isConfirmDisabled = computed(() => {
  if (state.phase === 'progress') return true;
  if (!props.targets.length) return true;
  if (!meta.value?.destructive) return false;
  return state.confirmKeyword !== checkKeyword.value;
});

const anyFailed = computed(() =>
  runState.results.some(r => r.outcome === 'failed'),
);
const allSettled = computed(
  () =>
    runState.results.length > 0 &&
    runState.results.every(r => r.outcome !== 'pending'),
);

/**
 * Offer force only where it would change the answer.
 *
 * Force skips cb-tumblebug's state checks, so it helps when the refusal was a state check and does
 * nothing at all when it was not. Showing it after a run that already used force would just invite
 * pressing the same button twice.
 */
const canRetryWithForce = computed(
  () => allSettled.value && anyFailed.value && state.method !== 'force',
);

async function fire(force: boolean) {
  if (!props.action) return;
  state.phase = 'progress';
  await run({
    scope: props.scope,
    nsId: props.nsId,
    infraId: props.infraId,
    action: props.action,
    force,
    targets: props.targets,
  });
  // Told as soon as the requests are answered, whatever the answers were. Even a partial success
  // has started a transition, and the list is where that transition becomes visible.
  emit('requested');

  // Nothing refused it — the remaining story is the status changing, which the list tells better
  // than a dialog holding an acknowledgement line.
  if (!anyFailed.value) closeAndReset();
}

function handleConfirm() {
  if (state.phase !== 'confirm' || isConfirmDisabled.value) return;
  void fire(state.method === 'force');
}

function handleForceRetry() {
  state.method = 'force';
  void fire(true);
}

function closeAndReset() {
  emit('update:visible', false);
  resetState();
}

function resetState() {
  state.phase = 'confirm';
  state.method = 'normal';
  state.confirmKeyword = '';
  resetRun();
}

// Guarded as well as disabled: mirinae's disabled is a class only, and the click still reaches the
// handler (DESIGN-MIRINAE §1.6). Closing mid-run would drop the outcomes still on their way back.
function handleClose() {
  if (runState.running) return;
  closeAndReset();
}

watch(
  () => props.visible,
  visible => {
    if (!visible) resetState();
  },
);
</script>

<template>
  <p-button-modal
    data-testid="wl-lifecycle-modal"
    :visible="visible"
    :header-title="headerTitle"
    size="sm"
    hide-footer
    @close="handleClose"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #body>
      <div v-if="meta" class="lifecycle-modal-content" :data-action="meta.name">
        <!-- progress step — one row per target, with whatever the server said -->
        <div
          v-if="state.phase === 'progress'"
          data-testid="wl-lifecycle-progress"
        >
          <p class="description">
            {{ meta.label }} requested for the following
            {{ scopeNoun.toLowerCase() }}
          </p>
          <div class="target-list">
            <div
              v-for="result in runState.results"
              :key="result.id"
              class="result-item"
              data-testid="wl-lifecycle-result"
              :data-name="result.name"
              :data-outcome="result.outcome"
            >
              <span class="target-name">{{ result.name }}</span>
              <span
                v-if="result.outcome === 'pending'"
                class="result-status pending"
              >
                <span class="spinner" /> Requesting
              </span>
              <span
                v-else-if="result.outcome === 'failed'"
                class="result-status failed"
                >Refused</span
              >
              <span v-else class="result-status accepted">Accepted</span>
            </div>
          </div>

          <!-- Refusals are usually the server saying the status does not allow it. The sentence is
               the useful part, so it is shown in full rather than summarised away. -->
          <div
            v-if="anyFailed"
            class="reason-box"
            data-testid="wl-lifecycle-error"
          >
            <div
              v-for="result in runState.results.filter(
                r => r.outcome === 'failed',
              )"
              :key="`reason-${result.id}`"
              class="reason-item"
            >
              <span class="target-name">{{ result.name }}</span>
              <span class="reason-text">{{ result.message }}</span>
            </div>
          </div>
          <p v-if="canRetryWithForce" class="hint">
            Force skips the status checks and sends the same action anyway. It
            removes nothing and leaves no cloud resources behind.
          </p>
        </div>

        <!-- confirm step — what it does, on what, and how -->
        <div v-else data-testid="wl-lifecycle-confirm">
          <div
            :class="[
              'action-banner',
              meta.destructive ? 'destructive' : 'neutral',
            ]"
          >
            {{ meta.describe(scope) }}
          </div>

          <p class="description">
            The following {{ scopeNoun.toLowerCase() }} will be affected
          </p>
          <div class="target-list">
            <div
              v-for="target in targets"
              :key="target.id"
              class="target-item"
              data-testid="wl-lifecycle-target"
              :data-name="target.name"
              :data-status="target.status ?? ''"
              :data-allowed="
                String(isTransitionAllowed(meta.name, target.status))
              "
            >
              <span class="target-name">{{ target.name }}</span>
              <span class="target-status">{{
                target.status || 'Unknown'
              }}</span>
            </div>
          </div>

          <!-- Said before the request goes out, not after it comes back refused. The action is not
               blocked on it — the status on screen may already be out of date, and the server is the
               one that decides. -->
          <p
            v-if="blockedTargets.length"
            class="warning-note"
            data-testid="wl-lifecycle-state-warning"
          >
            {{ stateWarning }}
          </p>

          <p-field-group label="Method" required class="mt-8">
            <div v-if="state.method === 'force'" class="force-note">
              Force skips the checks for "another action is already running" and
              "this transition is not allowed from the current status". It
              deletes nothing and leaves no cloud resources behind.
            </div>
            <p-radio-group>
              <p-radio
                v-model="state.method"
                value="normal"
                data-testid="wl-lifecycle-method-normal"
              >
                <span>Normal</span>
              </p-radio>
              <p-radio
                v-model="state.method"
                value="force"
                data-testid="wl-lifecycle-method-force"
              >
                <span>Force</span>
              </p-radio>
            </p-radio-group>
          </p-field-group>

          <p-field-group v-if="meta.destructive" required class="mt-8">
            <template #label>
              <span
                >To continue, please enter
                <span class="keyword-highlight">{{ checkKeyword }}</span></span
              >
              <p-text-input
                v-model="state.confirmKeyword"
                data-testid="wl-lifecycle-confirm-keyword"
                :placeholder="checkKeyword"
              />
            </template>
          </p-field-group>
        </div>

        <!--
          ★ PButtonModal has no `footer` slot — the footer is a fixed area behind `v-if="!hideFooter"`
            and only its close/confirm slots can be replaced. With `hide-footer` set, the buttons are
            drawn at the end of the body instead (DESIGN-MIRINAE §1.1).
        -->
        <div class="modal-footer">
          <template v-if="state.phase === 'progress'">
            <p-button
              style-type="transparent"
              data-testid="wl-lifecycle-close"
              :disabled="runState.running"
              @click="handleClose"
            >
              Close
            </p-button>
            <p-button
              v-if="canRetryWithForce"
              style-type="secondary"
              data-testid="wl-lifecycle-force-retry"
              @click="handleForceRetry"
            >
              Retry with Force
            </p-button>
          </template>
          <template v-else>
            <p-button
              style-type="transparent"
              data-testid="wl-lifecycle-cancel"
              @click="handleClose"
            >
              Cancel
            </p-button>
            <p-button
              :style-type="meta.destructive ? 'negative-primary' : 'primary'"
              data-testid="wl-lifecycle-ok"
              :disabled="isConfirmDisabled"
              @click="handleConfirm"
            >
              {{ meta.label }}
            </p-button>
          </template>
        </div>
      </div>
    </template>
  </p-button-modal>
</template>

<style scoped lang="postcss">
.lifecycle-modal-content {
  .action-banner {
    padding: 12px;
    margin-bottom: 16px;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.5;
  }
  .action-banner.neutral {
    background-color: #eef2ff;
    border: 1px solid #c7d2fe;
    color: #3730a3;
  }
  .action-banner.destructive {
    background-color: #fee;
    border: 1px solid #e53e3e;
    color: #c53030;
  }

  .description {
    font-size: 14px;
    margin-bottom: 4px;
  }

  .target-list {
    padding: 12px;
    background-color: #f7f7f7;
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
  }

  .target-item,
  .result-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 0;
    font-size: 14px;
  }

  .target-name {
    font-family: monospace;
  }

  .target-status {
    font-size: 0.8125rem;
    color: #6b7280;
  }

  .result-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8125rem;
  }
  .result-status.pending {
    color: #6b7280;
  }
  .result-status.accepted {
    color: #2a9d8f;
  }
  .result-status.failed {
    color: #dc2626;
    font-weight: 600;
  }
  .result-status .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid #d1d5db;
    border-top-color: #6b7280;
    border-radius: 50%;
    animation: wl-lifecycle-spin 0.8s linear infinite;
  }

  .warning-note {
    margin-top: 10px;
    padding: 10px 12px;
    background-color: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 4px;
    color: #856404;
    font-size: 13px;
    line-height: 1.5;
  }

  .force-note {
    padding: 12px;
    margin-bottom: 8px;
    background-color: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 4px;
    color: #856404;
    font-size: 14px;
    line-height: 1.5;
  }

  /* A long reason stays in a scroll area so it cannot push the buttons out of reach. */
  .reason-box {
    margin-top: 12px;
    max-height: 180px;
    overflow-y: auto;
    padding: 12px;
    background-color: #fff5f5;
    border: 1px solid #feb2b2;
    border-radius: 4px;
  }
  .reason-item {
    padding: 6px 0;
    font-size: 13px;
  }
  .reason-item + .reason-item {
    border-top: 1px solid #fed7d7;
  }
  .reason-item .target-name {
    display: block;
    font-weight: 600;
    color: #c53030;
  }
  .reason-text {
    display: block;
    margin-top: 2px;
    color: #742a2a;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .hint {
    margin-top: 10px;
    font-size: 12px;
    color: #6b7280;
    line-height: 1.5;
  }

  .keyword-highlight {
    color: #e53e3e;
    font-weight: bold;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  /* Drawn inside the body with the default footer off, so a rule and spacing make it read as one. */
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

@keyframes wl-lifecycle-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
