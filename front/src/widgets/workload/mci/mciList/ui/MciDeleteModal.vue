<script setup lang="ts">
import {
  PButtonModal,
  PButton,
  PFieldGroup,
  PRadio,
  PRadioGroup,
  PTextInput,
} from '@cloudforet-test/mirinae';
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { useDeleteMci } from '@/entities/mci/api';
import {
  putDeleteRecord,
  markDeleteSucceeded,
  markDeleteFailed,
  noteDeleteRequestError,
  getDeleteRecord,
  isDeleteInProgress,
  statusCodeOf,
  type DeleteRecord,
} from '@/entities/mci/lib/deleteTracker';
import { extractErrorMessage } from '@/shared/libs';

interface IProps {
  visible: boolean;
  selectedMciList: any[];
  nsId: string;
}

interface IEmits {
  (e: 'update:visible', value: boolean): void;
  (e: 'deleted'): void;
}

const props = defineProps<IProps>();
const emit = defineEmits<IEmits>();

// The modal has three steps.
//   confirm  — choose the method (Normal/Force) and type the phrase to confirm
//   progress — shows how the delete is going, from request until it finishes
//   error    — reopened after an earlier delete failed: the reason, and what to do about it
// The delete is *asynchronous*: the request is tracked by reqId (deleteTracker), so
// closing this modal and coming back later still shows the same state in the list.
const state = reactive({
  deleteMethod: 'normal',
  confirmKeyword: '',
  // confirm  — choose the method and type the name
  // progress — deleting, shown until it finishes
  // error    — reopened after an earlier delete failed: reason, plus force delete or cancel
  phase: 'confirm' as 'confirm' | 'progress' | 'error',
  alreadyInProgress: false,
  // Set for a few seconds after the requests go out; see lockClose below.
  closeLocked: false,
});

const trackedIds = ref<string[]>([]);

/**
 * What is about to happen to each selected workload.
 *
 *   new      — nothing has been requested for it yet
 *   retry    — an earlier delete failed; this run asks again
 *   inflight — a delete is already running, so no second request is sent for it
 */
type TargetKind = 'new' | 'retry' | 'inflight';

interface DeleteTarget {
  uid: string;
  name: string;
  kind: TargetKind;
}

/**
 * The targets, worked out once when the modal opens rather than on every render.
 *
 * A record can change under the modal — the tracker polls in the background — and the
 * confirm keyword is derived from this list. Recomputing would move the keyword while it is
 * being typed, so what the user is answering about is fixed at the moment they are asked.
 */
const targets = ref<DeleteTarget[]>([]);

function classifyTargets(mciList: any[]): DeleteTarget[] {
  return mciList
    .map(mci => ({ uid: mci?.uid as string, name: (mci?.name as string) ?? '' }))
    // Without a uid there is nothing to track — a name is reused and cannot be the key.
    .filter(t => !!t.uid)
    .map(t => {
      const status = getDeleteRecord(t.uid)?.status;
      const kind: TargetKind =
        status === 'Handling' ? 'inflight' : status === 'Error' ? 'retry' : 'new';
      return { ...t, kind };
    });
}

// The ones a confirm actually sends a request for — everything except those already running.
const requestTargets = computed(() =>
  targets.value.filter(t => t.kind !== 'inflight'),
);
const inflightTargets = computed(() =>
  targets.value.filter(t => t.kind === 'inflight'),
);
const retryTargets = computed(() => targets.value.filter(t => t.kind === 'retry'));

/**
 * What has to be typed to confirm.
 *
 * It follows how much is being deleted, because that is the thing the user has to be sure
 * of. One target asks for its name; a few ask for all of their names; beyond that the names
 * are too long to type, so the phrase carries the count instead.
 *
 * The count is of what is *about to be requested*, not of what is selected — a workload
 * already being deleted is not part of this delete.
 */
const checkKeyword = computed(() => {
  const names = requestTargets.value.map(t => t.name).filter(Boolean);
  if (names.length === 0) return 'Delete';
  if (names.length === 1) return names[0];
  if (names.length <= 3) return names.join(', ');
  return `Delete ${names.length} Workloads`;
});

// Said before the request goes out: some of what was selected is not part of it.
const exclusionNotice = computed(() => {
  const excluded = inflightTargets.value.length;
  if (!excluded) return '';
  const verb = excluded === 1 ? 'is' : 'are';
  return `${excluded} of the ${targets.value.length} selected workloads ${verb} already being deleted and ${verb} not part of this request.`;
});

const retryNotice = computed(() => {
  const retries = retryTargets.value.length;
  if (!retries) return '';
  const subject = retries === 1 ? 'One workload' : `${retries} workloads`;
  const verb = retries === 1 ? 'has' : 'have';
  return `${subject} ${verb} failed a delete before and will be requested again.`;
});

// In confirm the name must match exactly; in progress the confirm button is blocked so the
// request cannot be sent twice.
const isDeleteDisabled = computed(() => {
  if (state.phase === 'progress') return true;
  return state.confirmKeyword !== checkKeyword.value;
});

const deleteMethodOptions = [
  { label: 'Normal Delete', key: 'normal' },
  { label: 'Force Delete', key: 'force' },
];

// Current delete records for the infras this modal is tracking.
const trackedRecords = computed<DeleteRecord[]>(() =>
  trackedIds.value
    .map(id => getDeleteRecord(id))
    .filter((r): r is DeleteRecord => !!r),
);

const anyHandling = computed(() =>
  trackedRecords.value.some(r => r.status === 'Handling'),
);
const anyError = computed(() =>
  trackedRecords.value.some(r => r.status === 'Error'),
);

// Failed records shown in the error step, for their reasons.
const erroredRecords = computed<DeleteRecord[]>(() =>
  trackedRecords.value.filter(r => r.status === 'Error'),
);

function newReqId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Pulls the failure reason out of what `execute()` rejects with.
 *
 * It does not reject with the axios error — it rejects with `{ error, errorMsg, status }`,
 * where each is a ref and `errorMsg` already holds the message it worked out from the
 * response. Passing that wrapper back into `extractErrorMessage` finds neither `response`
 * nor `request` on it and falls through to the last resort, so a perfectly good server
 * reason was being reported as "Error in setting up request" — a phrase that means the
 * request never went out, which was not what happened.
 *
 * Read the message that was already prepared, and fall back to the raw error only if it is
 * missing.
 */
function reasonFrom(rejected: any): string | null {
  const prepared = rejected?.errorMsg?.value;
  if (prepared) return prepared;
  const raw = rejected?.error?.value ?? rejected;
  return extractErrorMessage(raw);
}

// Issues delete requests for the given infras (terminate|force), recording each for tracking.
function fireDeletes(mciList: any[], option: string): string[] {
  const uids: string[] = [];
  for (const mci of mciList) {
    const uid = mci?.uid as string;
    const infraId = mci?.name as string;
    // Without a uid there is nothing to track — a name is reused and cannot be the key.
    if (!uid) continue;

    // Already running: do not issue another request, just track the existing record.
    if (isDeleteInProgress(uid)) {
      uids.push(uid);
      continue;
    }
    const reqId = newReqId();
    putDeleteRecord({
      uid,
      infraId,
      nsId: props.nsId,
      reqId,
      option,
      status: 'Handling',
    });
    useDeleteMci({ nsId: props.nsId, infraId, option }, reqId)
      .execute()
      // A success keeps no record — the infra leaves the list, so there is nothing to show.
      // Announce the success from here. The tracker cannot: clearing on success would take
      // the record out of what it inspects, so nothing would ever report the completion.
      .then(() => markDeleteSucceeded(uid))
      .catch((rejected: any) => {
        const reason = reasonFrom(rejected) ?? undefined;
        const code = statusCodeOf(rejected);

        // **A timeout is not a failed delete.** This call runs for minutes and the proxy
        // gives up at 504 long before the server does; the delete carries on and usually
        // succeeds. Marking Error here told the user it had failed while the infra was in
        // fact being removed — observed on the dev server, where the infra was gone and the
        // screen said it had failed. Leave it in Handling and let the tracker conclude.
        if (code === undefined || code === 504 || code >= 500) {
          noteDeleteRequestError(uid, reason);
          return;
        }

        // Anything else the server rejected outright (400, 401, 403, …) means the delete
        // never started. Leaving it in Handling would be the worst outcome: that status is
        // what blocks a second attempt, so the workload could never be deleted again even
        // though nothing had happened to it. Close it out as a failure, with the reason.
        markDeleteFailed(uid, reason);
      });
    uids.push(uid);
  }
  return uids;
}

/**
 * Holds the dialog open for a moment after the requests go out.
 *
 * The delete is a synchronous call that runs for minutes, so there is no reply to say the
 * request was accepted. What there is: cm-beetle writes the request down the instant it
 * arrives, before the handler runs. Once that has had time to happen the outcome can be
 * fetched by reqId from anywhere, so leaving is safe — but leaving *before* it means the
 * request may never have landed and nothing is left to look it up with.
 */
const CLOSE_LOCK_MS = 5000;
let closeLockTimer: ReturnType<typeof setTimeout> | undefined;

function lockClose() {
  state.closeLocked = true;
  if (closeLockTimer) clearTimeout(closeLockTimer);
  closeLockTimer = setTimeout(() => {
    state.closeLocked = false;
    closeLockTimer = undefined;
  }, CLOSE_LOCK_MS);
}

function unlockClose() {
  if (closeLockTimer) {
    clearTimeout(closeLockTimer);
    closeLockTimer = undefined;
  }
  state.closeLocked = false;
}

onBeforeUnmount(unlockClose);

// Runs the delete from confirm: issue the request and move to progress rather than closing.
// Everything selected is passed on — fireDeletes skips the ones already running, so they are
// tracked and shown without a second request going out for them.
function handleConfirm() {
  if (state.phase !== 'confirm') return;
  const option = state.deleteMethod === 'force' ? 'force' : 'terminate';
  state.alreadyInProgress = inflightTargets.value.length > 0;
  trackedIds.value = fireDeletes(targets.value, option);
  state.phase = 'progress';
  lockClose();
  emit('deleted'); // refresh so the list brings up the Delete Status column at once
}

// [Force Delete] in the error step: retry the failed targets with force and move to progress.
// Force leaves the CSP resources and removes only the internal records, as the banner says.
// The records are in Error rather than in flight, so fireDeletes issues fresh reqIds.
function handleForceDelete() {
  const forceTargets = erroredRecords.value.map(r => ({
    uid: r.uid,
    name: r.infraId,
  }));
  trackedIds.value = fireDeletes(forceTargets, 'force');
  state.phase = 'progress';
  lockClose();
  emit('deleted');
}

// [Retry] in the error step goes back to confirm. A normal delete sometimes succeeds on a
// second attempt — the earlier failure may have been temporary — and since force leaves CSP
// resources behind, the choice of trying normal first is left to the user.
function handleRetry() {
  state.deleteMethod = 'normal';
  state.confirmKeyword = '';
  targets.value = classifyTargets(props.selectedMciList);
  state.phase = 'confirm';
}

// Close once everything is gone (nothing in flight, no errors); stay open if any failed.
watch([anyHandling, anyError], ([handling, error]) => {
  if (state.phase !== 'progress') return;
  if (!handling && !error) {
    emit('deleted');
    closeAndReset();
  }
});

function closeAndReset() {
  emit('update:visible', false);
  resetState();
}

function resetState() {
  state.deleteMethod = 'normal';
  state.confirmKeyword = '';
  state.phase = 'confirm';
  state.alreadyInProgress = false;
  unlockClose();
  trackedIds.value = [];
  targets.value = [];
}

// Close — the delete carries on and the list keeps showing its state.
// The list is what is behind this modal, so refresh on close to bring up Delete Status.
function handleClose() {
  if (state.closeLocked) return;
  emit('deleted');
  closeAndReset();
}

// The dialog's own close paths (the X, the backdrop) go through here so the hold after a
// request applies to them as well; refusing to emit leaves `visible` as it was.
function handleVisibleUpdate(value: boolean) {
  if (!value && state.closeLocked) return;
  emit('update:visible', value);
}

/**
 * Picks the step from what the selected workloads are currently up to.
 *
 *   anything not yet requested → confirm (choose the method and type the name)
 *   otherwise, some failed     → error (the reasons, and force delete or retry)
 *   otherwise                  → progress (they are all already running)
 *
 * The first line is the important one. Opening on progress whenever *one* of the selection
 * was already running left the rest unrequested — that step has no delete button, so there
 * was no way to ask for them and nothing on screen said they had been left out. Reaching
 * confirm is what gets them sent; the request loop already skips the ones in flight.
 */
watch(
  () => props.visible,
  visible => {
    if (!visible) {
      resetState();
      return;
    }
    targets.value = classifyTargets(props.selectedMciList);
    const pending = targets.value.filter(t => t.kind === 'new');
    const errored = targets.value.filter(t => t.kind === 'retry');
    const inProgress = targets.value.filter(t => t.kind === 'inflight');

    if (pending.length > 0 || targets.value.length === 0) {
      state.phase = 'confirm';
      state.alreadyInProgress = false;
    } else if (errored.length > 0) {
      trackedIds.value = errored.map(t => t.uid);
      state.phase = 'error';
    } else {
      trackedIds.value = inProgress.map(t => t.uid);
      state.phase = 'progress';
      state.alreadyInProgress = true;
    }
  },
);
</script>

<template>
  <p-button-modal
    data-testid="mci-delete-modal"
    :visible="visible"
    header-title="Delete Workloads"
    size="sm"
    hide-footer
    @close="handleClose"
    @update:visible="handleVisibleUpdate"
  >
    <template #body>
      <!-- error step — reopened after a failure: the reason (scrolls if long), force delete or cancel -->
      <div
        v-if="state.phase === 'error'"
        class="delete-modal-content"
        data-testid="mci-delete-error"
      >
        <div class="force-warning-banner">
          A previous delete request failed while it was being processed.
        </div>
        <p class="description">Failed workloads</p>
        <div class="error-reason-box" data-testid="wl-delete-error-dialog">
          <div
            v-for="rec in erroredRecords"
            :key="rec.infraId"
            class="error-reason-item"
          >
            <span class="progress-name">{{ rec.infraId }}</span>
            <span v-if="rec.errorReason" class="error-reason-text">{{
              rec.errorReason
            }}</span>
          </div>
        </div>
        <p class="hint">
          Force delete removes only the internal records and leaves the CSP
          resources in place. Any resources left behind keep billing and must be
          removed by hand.
        </p>
      </div>

      <!-- progress step — shown until it finishes; the list carries the state after closing -->
      <div
        v-else-if="state.phase === 'progress'"
        class="delete-modal-content"
        data-testid="mci-delete-progress"
      >
        <div
          v-if="state.alreadyInProgress"
          class="warning-banner"
          data-testid="mci-delete-already-running"
        >
          Some of these were already being deleted. Their current state is shown
          and no second request was sent for them.
        </div>
        <p class="description">Deleting</p>
        <div class="mci-list">
          <div
            v-for="rec in trackedRecords"
            :key="rec.infraId"
            class="progress-item"
          >
            <span class="progress-name">{{ rec.infraId }}</span>
            <span
              v-if="rec.status === 'Handling'"
              class="progress-status handling"
            >
              <span class="spinner" />
              {{ rec.stage ? `Deleting · ${rec.stage}` : 'Deleting' }}
            </span>
            <span
              v-else-if="rec.status === 'Error'"
              class="progress-status error"
              data-testid="mci-delete-progress-error"
            >
              Error<template v-if="rec.errorReason"
                >: {{ rec.errorReason }}</template
              >
            </span>
            <span v-else class="progress-status done">Deleted</span>
          </div>
        </div>
        <p
          v-if="state.closeLocked"
          class="hint"
          data-testid="mci-delete-accepting"
        >
          Handing the request over. This takes a moment — once it is done you can
          leave and the result will still find its way back.
        </p>
        <p v-else-if="anyHandling" class="hint">
          Closing this dialog does not stop the delete. You can follow it in the
          <b>Delete Status</b> column of the list.
        </p>
      </div>

      <!-- confirm step — choose the method and type the name -->
      <div v-else class="delete-modal-content" data-testid="mci-delete-confirm">
        <div class="warning-banner">
          ⚠️ Deleting workloads will also delete
          <span class="keyword-highlight"
            >all resources included in the workloads</span
          >
          which may take
          <span class="keyword-highlight"
            >from a few minutes to several hours</span
          >
        </div>
        <p class="description" data-testid="mci-delete-target-count">
          {{ requestTargets.length === 1 ? '1 workload' : `${requestTargets.length} workloads` }}
          will be deleted
        </p>
        <div class="mci-list">
          <div
            v-for="target in targets"
            :key="target.uid"
            class="mci-item"
            :class="{ excluded: target.kind === 'inflight' }"
            :data-testid="`mci-delete-target-${target.kind}`"
          >
            <span class="target-name">{{ target.name }}</span>
            <span v-if="target.kind === 'inflight'" class="target-note"
              >already deleting — not included</span
            >
            <span v-else-if="target.kind === 'retry'" class="target-note"
              >failed before — will be requested again</span
            >
            <span v-else />
          </div>
        </div>
        <p
          v-if="exclusionNotice"
          class="warning-note"
          data-testid="mci-delete-excluded-notice"
        >
          {{ exclusionNotice }}
        </p>
        <p v-if="retryNotice" class="hint" data-testid="mci-delete-retry-notice">
          {{ retryNotice }}
        </p>

        <p-field-group label="Delete Method" required class="mt-8">
          <div
            v-if="state.deleteMethod === 'force'"
            class="force-warning-banner"
          >
            🚨 Force delete removes only Tumblebug's internal records and
            <span class="keyword-highlight"
              >leaves the CSP resources running</span
            >. You must delete the remaining CSP resources yourself.
          </div>
          <p-radio-group>
            <p-radio
              v-for="option in deleteMethodOptions"
              :key="option.key"
              v-model="state.deleteMethod"
              :value="option.key"
              :data-testid="
                option.key === 'force' ? 'mci-delete-method-force' : undefined
              "
            >
              <span>{{ option.label }}</span>
            </p-radio>
          </p-radio-group>
        </p-field-group>

        <p-field-group required class="mt-8">
          <template #label>
            <span
              >To continue, please enter
              <span class="keyword-highlight">{{ checkKeyword }}</span></span
            >
            <p-text-input
              v-model="state.confirmKeyword"
              data-testid="mci-delete-confirm-keyword"
              :placeholder="checkKeyword"
            />
          </template>
        </p-field-group>
      </div>

      <!--
        Buttons per step.

        ★ PButtonModal has no `footer` slot. The footer is a fixed area behind
          `v-if="!hideFooter"`, and only its `close-button`/`confirm-button` slots can be
          replaced. Turning the footer off with `hide-footer` and putting buttons in a
          `#footer` slot renders *nothing at all* — which is what happened. The error step
          so the default footer stays off and the button row is drawn at the end of the body.
      -->
      <div class="modal-footer">
        <!-- error: retry (back to the choice) / force delete / close -->
        <template v-if="state.phase === 'error'">
          <p-button
            style-type="transparent"
            data-testid="wl-delete-close"
            @click="handleClose"
          >
            Close
          </p-button>
          <p-button
            style-type="secondary"
            data-testid="wl-delete-retry"
            @click="handleRetry"
          >
            Retry
          </p-button>
          <p-button
            style-type="negative-primary"
            data-testid="wl-delete-force-enter"
            @click="handleForceDelete"
          >
            Force Delete
          </p-button>
        </template>
        <!-- progress: close only; the delete carries on and the list keeps showing it -->
        <template v-else-if="state.phase === 'progress'">
          <p-button
            style-type="transparent"
            data-testid="wl-delete-close"
            :disabled="state.closeLocked"
            @click="handleClose"
          >
            Close
          </p-button>
        </template>
        <!-- confirm: cancel / delete, enabled once the name matches -->
        <template v-else>
          <p-button
            style-type="transparent"
            data-testid="wl-delete-cancel"
            @click="handleClose"
          >
            Cancel
          </p-button>
          <p-button
            style-type="negative-primary"
            data-testid="wl-delete-confirm"
            :disabled="isDeleteDisabled"
            @click="handleConfirm"
          >
            Delete
          </p-button>
        </template>
      </div>
    </template>
  </p-button-modal>
</template>

<style scoped lang="postcss">
.delete-modal-content {
  .warning-banner {
    padding: 12px;
    margin-bottom: 16px;
    background-color: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 4px;
    color: #856404;
    font-size: 14px;
    line-height: 1.5;
  }

  .description {
    font-size: 14px;
    margin-bottom: 4px;
  }

  .mci-list {
    padding: 12px;
    background-color: #f7f7f7;
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;

    .mci-item {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      padding: 4px 0;
      font-size: 14px;
    }
    .mci-item .target-name {
      font-family: monospace;
    }
    /* Struck through so a row left out of this request reads as left out at a glance. */
    .mci-item.excluded .target-name {
      color: #9ca3af;
      text-decoration: line-through;
    }
    .mci-item .target-note {
      font-size: 0.75rem;
      color: #6b7280;
      white-space: nowrap;
    }

    .progress-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 6px 0;
      font-size: 14px;
    }
    .progress-name {
      font-family: monospace;
    }
    .progress-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8125rem;
    }
    .progress-status.handling {
      color: #6b7280;
    }
    .progress-status.error {
      color: #dc2626;
      font-weight: 600;
    }
    .progress-status.done {
      color: #2a9d8f;
    }
    .progress-status .spinner {
      width: 12px;
      height: 12px;
      border: 2px solid #d1d5db;
      border-top-color: #6b7280;
      border-radius: 50%;
      animation: wl-modal-spin 0.8s linear infinite;
    }
  }

  .hint {
    margin-top: 10px;
    font-size: 12px;
    color: #6b7280;
    line-height: 1.5;
  }

  .warning-note {
    margin-top: 10px;
    font-size: 12px;
    color: #92400e;
    line-height: 1.5;
  }

  /* Keep a long reason in a scroll area so it cannot push the buttons out of reach. */
  .error-reason-box {
    max-height: 180px;
    overflow-y: auto;
    padding: 12px;
    background-color: #fff5f5;
    border: 1px solid #feb2b2;
    border-radius: 4px;
  }
  .error-reason-item {
    padding: 6px 0;
    font-size: 13px;
  }
  .error-reason-item + .error-reason-item {
    border-top: 1px solid #fed7d7;
  }
  .error-reason-item .progress-name {
    display: block;
    font-family: monospace;
    font-weight: 600;
    color: #c53030;
  }
  .error-reason-text {
    display: block;
    margin-top: 2px;
    color: #742a2a;
    white-space: pre-wrap;
    word-break: break-word;
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

  .force-warning-banner {
    padding: 12px;
    margin-bottom: 8px;
    background-color: #fee;
    border: 1px solid #e53e3e;
    border-radius: 4px;
    color: #c53030;
    font-size: 14px;
    line-height: 1.5;
  }

  .keyword-highlight {
    color: #e53e3e;
    font-weight: bold;
  }
}
@keyframes wl-modal-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
