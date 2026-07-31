<script setup lang="ts">
import {
  PButtonModal,
  PButton,
  PFieldGroup,
  PRadio,
  PRadioGroup,
  PTextInput,
} from '@cloudforet-test/mirinae';
import { computed, reactive, ref, watch } from 'vue';
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

// The modal has two steps.
//   confirm  — choose the method (Normal/Force) and type the name to confirm
//   progress — shows how the delete is going, from request until it finishes.
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
});

const trackedIds = ref<string[]>([]);

const checkKeyword = computed(() => {
  return props.selectedMciList.length === 1
    ? props.selectedMciList[0].name
    : 'Delete All';
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

// Runs the delete from confirm: issue the request and move to progress rather than closing.
function handleConfirm() {
  if (state.phase !== 'confirm') return;
  const option = state.deleteMethod === 'force' ? 'force' : 'terminate';
  trackedIds.value = fireDeletes(props.selectedMciList, option);
  state.phase = 'progress';
  emit('deleted'); // refresh so the list brings up the Delete Status column at once
}

// [Force Delete] in the error step: retry the failed targets with force and move to progress.
// Force leaves the CSP resources and removes only the internal records, as the banner says.
// The records are in Error rather than in flight, so fireDeletes issues fresh reqIds.
function handleForceDelete() {
  const targets = erroredRecords.value.map(r => ({
    uid: r.uid,
    name: r.infraId,
  }));
  trackedIds.value = fireDeletes(targets, 'force');
  state.phase = 'progress';
  emit('deleted');
}

// [Retry] in the error step goes back to confirm. A normal delete sometimes succeeds on a
// second attempt — the earlier failure may have been temporary — and since force leaves CSP
// resources behind, the choice of trying normal first is left to the user.
function handleRetry() {
  state.deleteMethod = 'normal';
  state.confirmKeyword = '';
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
  trackedIds.value = [];
}

// Close — the delete carries on and the list keeps showing its state.
// The list is what is behind this modal, so refresh on close to bring up Delete Status.
function handleClose() {
  emit('deleted');
  closeAndReset();
}

// The step is chosen from the targets' current delete records when the modal opens.
//   Handling → progress (says one is already running, and shows its state)
//   Error    → error (the earlier failure, its reason, and force delete or cancel)
//   none     → confirm (choose the method and type the name)
watch(
  () => props.visible,
  visible => {
    if (!visible) {
      resetState();
      return;
    }
    const uids = props.selectedMciList
      .map(m => m.uid as string)
      .filter(Boolean);
    const inProgress = uids.filter(uid => isDeleteInProgress(uid));
    const errored = uids.filter(
      uid => getDeleteRecord(uid)?.status === 'Error',
    );
    if (inProgress.length > 0) {
      trackedIds.value = inProgress;
      state.phase = 'progress';
      state.alreadyInProgress = true;
    } else if (errored.length > 0) {
      trackedIds.value = errored;
      state.phase = 'error';
    } else {
      state.phase = 'confirm';
      state.alreadyInProgress = false;
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
    @update:visible="$emit('update:visible', $event)"
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
        <div v-if="state.alreadyInProgress" class="warning-banner">
          A delete is already in progress. Showing its current state instead of
          starting a new one.
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
        <p v-if="anyHandling" class="hint">
          Closing this dialog does not stop the delete. You can follow it in the
          <b>Delete Status</b> column of the list.
        </p>
      </div>

      <!-- confirm step — choose the method and type the name -->
      <div v-else class="delete-modal-content">
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
        <p class="description">The following workloads will be deleted</p>
        <div class="mci-list">
          <div v-for="mci in selectedMciList" :key="mci.name" class="mci-item">
            {{ mci.name }}
          </div>
        </div>

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
      padding: 4px 0;
      font-size: 14px;
      font-family: monospace;
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
