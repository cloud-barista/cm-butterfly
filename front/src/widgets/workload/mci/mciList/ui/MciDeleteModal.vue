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
  recordDeleteRejected,
  getDeleteRecord,
  isDeleteInProgress,
  type DeleteRecord,
} from '@/entities/mci/lib/deleteTracker';
import { extractErrorMessage, withRefusalRetry } from '@/shared/libs';
import { McmpRouter } from '@/app/providers/router';

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
  // notice   — a large selection: what the wait is for, before anything is sent
  // dispatch — handing the requests over, one at a time; the screen is held here
  // progress — deleting, shown until it finishes
  // error    — reopened after an earlier delete failed: reason, plus force delete or cancel
  phase: 'confirm' as 'confirm' | 'notice' | 'dispatch' | 'progress' | 'error',
  alreadyInProgress: false,
  // How many requests the server has taken during dispatch. Counted from the 202s, so it is
  // what has actually landed rather than how far the loop has got.
  dispatched: 0,
  // True while the requests are being handed over; see holdScreen below.
  closeLocked: false,
  // Set while a request is waiting to go out again after being turned away. Shown so the
  // pause reads as "waiting its turn" rather than as a screen that has stopped.
  retry: null as {
    attempt: number;
    maxRetries: number;
    seconds: number;
  } | null,
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
  return (
    mciList
      .map(mci => ({
        uid: mci?.uid as string,
        name: (mci?.name as string) ?? '',
      }))
      // Without a uid there is nothing to track — a name is reused and cannot be the key.
      .filter(t => !!t.uid)
      .map(t => {
        const status = getDeleteRecord(t.uid)?.status;
        const kind: TargetKind =
          status === 'Handling'
            ? 'inflight'
            : status === 'Error'
              ? 'retry'
              : 'new';
        return { ...t, kind };
      })
  );
}

// The ones a confirm actually sends a request for — everything except those already running.
const requestTargets = computed(() =>
  targets.value.filter(t => t.kind !== 'inflight'),
);
const inflightTargets = computed(() =>
  targets.value.filter(t => t.kind === 'inflight'),
);
const retryTargets = computed(() =>
  targets.value.filter(t => t.kind === 'retry'),
);

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

// How far the handing over has got, for the bar and the "3 of 8".
const dispatchTotal = computed(() => requestTargets.value.length);
const dispatchPercent = computed(() =>
  dispatchTotal.value === 0
    ? 100
    : Math.round((state.dispatched / dispatchTotal.value) * 100),
);

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

/**
 * Hands one delete over and, once the server has taken it, starts following it.
 *
 * The request asks to be answered on acceptance rather than on completion, so what comes back
 * is a 202 and a request id — in a moment, not in minutes. Two things follow from that.
 *
 * **The record is written after the answer, not before.** Writing it first meant a request the
 * server never received still left the workload marked as deleting, and that mark is what
 * blocks a second attempt — so a workload nothing had happened to could not be deleted again.
 * An acceptance is now something we are told about, so there is no reason to assume it.
 *
 * **Nothing here concludes the delete.** The 202 says taken, not done. The outcome arrives
 * through the request record and the tracker is what reads it.
 *
 * A request turned away because the far side is momentarily full is sent again — see
 * `withRefusalRetry`. Each attempt carries a fresh request id: cm-beetle writes the id down
 * when the request arrives, even for one it then declines, and refuses a repeat of it.
 */
async function fireDelete(target: DeleteTarget, option: string): Promise<void> {
  // Already running: do not issue another request. The existing record is what is shown.
  if (isDeleteInProgress(target.uid)) return;

  let reqId = '';
  try {
    await withRefusalRetry(
      () => {
        reqId = newReqId();
        return useDeleteMci(
          { nsId: props.nsId, infraId: target.name, option },
          reqId,
        ).execute();
      },
      {
        onRetry: (info, remainingMs) => {
          state.retry = {
            attempt: info.attempt,
            maxRetries: info.maxRetries,
            seconds: Math.ceil(remainingMs / 1000),
          };
        },
      },
    );
    state.retry = null;

    await putDeleteRecord({
      uid: target.uid,
      infraId: target.name,
      nsId: props.nsId,
      reqId,
      option,
      status: 'Handling',
    });
    state.dispatched += 1;
  } catch (rejected: any) {
    state.retry = null;
    // Never taken — by outright rejection, or by refusals that outlasted the retries. Either
    // way nothing is running, so it is written down as failed rather than left looking as
    // though it were under way.
    await recordDeleteRejected(
      {
        uid: target.uid,
        infraId: target.name,
        nsId: props.nsId,
        reqId: reqId || newReqId(),
        option,
        status: 'Error',
      },
      reasonFrom(rejected) ?? undefined,
    );
  }
}

/**
 * Above this many targets, say what the wait is for before sending anything.
 *
 * The requests themselves are no longer what takes the time. They used to go out one at a
 * time, 800ms apart, because a delete began with a lookup that was capped at two a second and
 * a lookup turned away failed the whole delete. Both of those are handled where they belong
 * now — the server keeps to the cap itself, and answers as soon as it has taken the request
 * rather than when the deleting is done — so the handing over is a moment.
 *
 * The deleting is still minutes, and that is what a large selection needs to be told.
 */
const NOTICE_THRESHOLD = 5;

/**
 * Holds the screen while the requests are being handed over.
 *
 * Leaving in the middle of it would strand whatever had not been sent — the loop lives here, so
 * it goes when the screen does. Once a request has landed it is written down and can be followed
 * from anywhere, which is why the hold ends where it does rather than lasting the whole delete.
 *
 * Both ways out are covered: the router for anything inside the app (including the back button),
 * and the browser's own prompt for a reload or a closed tab.
 */
let releaseRouterGuard: (() => void) | undefined;

function warnBeforeUnload(event: BeforeUnloadEvent) {
  event.preventDefault();
  event.returnValue = '';
}

function holdScreen() {
  state.closeLocked = true;
  if (!releaseRouterGuard) {
    releaseRouterGuard = McmpRouter.getRouter().beforeEach(
      (_to, _from, next) => {
        next(false);
      },
    );
  }
  window.addEventListener('beforeunload', warnBeforeUnload);
}

function releaseScreen() {
  state.closeLocked = false;
  releaseRouterGuard?.();
  releaseRouterGuard = undefined;
  window.removeEventListener('beforeunload', warnBeforeUnload);
}

onBeforeUnmount(releaseScreen);

/**
 * Runs the delete from confirm.
 *
 * A large selection is told what the wait is for first — the handing over takes a second per
 * workload, and that is worth knowing before it starts rather than while it is happening.
 */
function handleConfirm() {
  if (state.phase !== 'confirm') return;
  if (requestTargets.value.length >= NOTICE_THRESHOLD) {
    state.phase = 'notice';
    return;
  }
  void startDispatch();
}

/**
 * Hands the requests over, one at a time, and holds the screen until they are all in.
 *
 * The requests are not awaited — a delete answers only when it finishes, minutes later, and
 * waiting for that would stall the ones behind it. What is spaced out is the *sending*.
 */
async function startDispatch() {
  const option = state.deleteMethod === 'force' ? 'force' : 'terminate';
  const sending = requestTargets.value;

  state.alreadyInProgress = inflightTargets.value.length > 0;
  state.dispatched = 0;
  state.phase = 'dispatch';
  trackedIds.value = targets.value.map(t => t.uid);
  holdScreen();
  emit('deleted'); // refresh so the list brings up the Delete Status column at once

  // Sent together and waited on together. Each answers as soon as the server has taken it, so
  // there is nothing to gain by going one at a time — and the server, not this screen, is what
  // keeps to the rate the far side allows.
  //
  // The count moves as the answers arrive rather than as the loop advances, which is why it
  // reaches the end only when every request really has been taken. There is no settle to wait
  // out afterwards: an answer *is* the confirmation that used to be guessed at.
  await Promise.all(sending.map(target => fireDelete(target, option)));

  releaseScreen();
  state.phase = 'progress';
}

// [Force Delete] in the error step: retry the failed targets with force and move to progress.
// Force leaves the CSP resources and removes only the internal records, as the banner says.
// The records are in Error rather than in flight, so fresh reqIds go out for them.
function handleForceDelete() {
  const forceTargets: DeleteTarget[] = erroredRecords.value.map(r => ({
    uid: r.uid,
    name: r.infraId,
    kind: 'retry' as const,
  }));
  targets.value = forceTargets;
  state.deleteMethod = 'force';
  void startDispatch();
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
  state.dispatched = 0;
  state.retry = null;
  releaseScreen();
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
    :hide-header-close-button="state.closeLocked"
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

      <!--
        notice step — a large selection, before anything is sent.

        Sentences are left to wrap on their own. The dialog has a fixed width, so breaking the
        lines here would only fight it and leave sentences cut at odd places on other widths.
        Each paragraph carries one idea and that is where the breaks are.
      -->
      <div
        v-else-if="state.phase === 'notice'"
        class="delete-modal-content"
        data-testid="mci-delete-notice"
      >
        <p class="notice-lead">
          <b>{{ dispatchTotal }} workloads selected.</b>
        </p>
        <p class="notice-body">
          Submitting all {{ dispatchTotal }} takes a moment, and you cannot
          leave this screen until it is done. If the server is busy, a request
          waits its turn and is sent again on its own.
        </p>
        <p class="notice-body">
          That is the submitting, not the deleting. Once the requests are in,
          the deletions continue on their own and take considerably longer. You
          can leave this screen at that point and follow them in the
          <b>Delete Status</b> column of the list.
        </p>
      </div>

      <!--
        dispatch step — the requests being handed over. There is no button here: the screen is
        held until every one has been taken, and saying so is the only thing to do.
      -->
      <div
        v-else-if="state.phase === 'dispatch'"
        class="delete-modal-content"
        data-testid="mci-delete-dispatch"
      >
        <p class="description">
          Submitting delete requests
          <span class="dispatch-count" data-testid="mci-delete-dispatch-count"
            >{{ state.dispatched }} of {{ dispatchTotal }}</span
          >
        </p>
        <div class="dispatch-bar">
          <div
            class="dispatch-bar-fill"
            :style="{ width: `${dispatchPercent}%` }"
          />
        </div>
        <!--
          Shown only while a request is waiting to go out again. A pause with nothing on
          screen is indistinguishable from one that has stopped, and this one resolves
          itself — so it says what it is waiting for and for how long, and asks nothing of
          the user.
        -->
        <p
          v-if="state.retry"
          class="retry-notice"
          data-testid="mci-delete-retry-notice"
        >
          The server is handling as many requests as it can.
          <!--
            The count and its unit are held together. Left to wrap on their own they were
            split across the line — the number ending one line and "seconds" beginning the
            next — which reads as two separate things rather than as a time.
          -->
          <span class="retry-wait"
            >Retrying in
            <b data-testid="mci-delete-retry-seconds">{{
              state.retry.seconds
            }}</b>
            {{ state.retry.seconds === 1 ? 'second' : 'seconds' }}</span
          >
          <span class="retry-count" data-testid="mci-delete-retry-count"
            >Retry {{ state.retry.attempt }}/{{ state.retry.maxRetries }}</span
          >
        </p>
        <p class="hint">
          Please stay on this screen until this finishes. Each delete begins
          once its request has been taken and continues in the background
          afterwards.
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
        <p v-if="anyHandling" class="hint">
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
          {{
            requestTargets.length === 1
              ? '1 workload'
              : `${requestTargets.length} workloads`
          }}
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
        <!--
          Named apart from the dispatch step's retry notice. Both said `mci-delete-retry-notice`
          while meaning different things — this one that a target failed before and is being
          asked for again, the other that a request is waiting to go out. They belong to
          different steps so only ever one is drawn, which is precisely why the collision would
          have gone unnoticed until a test picked up the wrong one.
        -->
        <p
          v-if="retryNotice"
          class="hint"
          data-testid="mci-delete-retry-target-notice"
        >
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
        <!-- notice: back out, or go ahead knowing what the wait is -->
        <template v-if="state.phase === 'notice'">
          <p-button
            style-type="transparent"
            data-testid="wl-delete-notice-cancel"
            @click="handleClose"
          >
            Cancel
          </p-button>
          <p-button
            style-type="negative-primary"
            data-testid="wl-delete-notice-continue"
            @click="startDispatch"
          >
            Continue
          </p-button>
        </template>
        <!-- dispatch: nothing to press. The screen is held until the last request lands -->
        <template v-else-if="state.phase === 'dispatch'" />
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

  .notice-lead {
    font-size: 14px;
    margin-bottom: 14px;
  }
  .notice-body {
    font-size: 14px;
    line-height: 1.6;
  }
  .notice-body + .notice-body {
    margin-top: 14px;
  }

  .dispatch-count {
    margin-left: 8px;
    font-family: monospace;
    color: #6b7280;
  }
  .dispatch-bar {
    margin-top: 12px;
    height: 6px;
    border-radius: 3px;
    background-color: #e5e7eb;
    overflow: hidden;
  }
  .dispatch-bar-fill {
    height: 100%;
    background-color: #6b7280;
    transition: width 200ms linear;
  }

  /* Waiting to send again. Amber rather than red: nothing has failed. */
  .retry-notice {
    margin-top: 12px;
    font-size: 13px;
    color: #92400e;
    line-height: 1.5;
  }
  .retry-wait {
    white-space: nowrap;
  }
  .retry-count {
    margin-left: 8px;
    font-family: monospace;
    color: #6b7280;
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
