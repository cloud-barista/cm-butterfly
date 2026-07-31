import { reactive } from 'vue';
import {
  useListDeleteRequests,
  useSaveDeleteRequest,
  useUpdateDeleteRequestStatus,
  useRemoveDeleteRequest,
  type DeleteRequestRecord,
  type DeleteRequestStatus,
} from '@/entities/mci/api/deleteRequest';
import { useGetBeetleRequest } from '@/entities/mci/api';
import { notify } from '@/entities/notification/lib/notificationStore';
import { registerTracker } from '@/shared/libs/tracking/runner';
import { toErrorMessage } from '@/shared/utils';

/**
 * Tracking for workload (infra) deletes.
 *
 * A delete takes minutes and can fail, so issuing the request is not the end of it — the
 * outcome has to be followed. Two things matter here.
 *
 * **It is kept on the server.** With the request id held in the browser alone, neither the
 * failure nor its reason is visible from another machine. On the server, signing in
 * anywhere picks up where the work left off.
 *
 * **It runs independently of the screen.** Polling that lives in the list screen stops the
 * moment another screen is opened, and only resumes — late — on returning. So this module
 * owns the polling rather than a component, and it keeps running while the app is open.
 *
 * The key is the **uid**, not the infra name. In cb-tumblebug an infra id is its name, so
 * deleting and recreating under the same name makes an old record look like the new infra.
 */

export type DeleteStatus = DeleteRequestStatus;

export interface DeleteRecord {
  uid: string;
  nsId: string;
  infraId: string;
  reqId: string;
  option: string; // 'terminate' | 'force'
  status: DeleteStatus;
  errorReason?: string;
}

const state = reactive<{ records: Record<string, DeleteRecord> }>({
  records: {},
});

/** Converts the server response (snake_case) into the shape the screen uses. */
function fromRecord(r: DeleteRequestRecord): DeleteRecord {
  return {
    uid: r.uid,
    nsId: r.ns_id,
    infraId: r.infra_id,
    reqId: r.req_id,
    option: r.option,
    status: r.status,
    errorReason: r.error_reason || undefined,
  };
}

/** Every record currently tracked, for rendering the list. */
export function allDeleteRecords(): DeleteRecord[] {
  return Object.values(state.records);
}

/** Looks up a record by uid. */
export function getDeleteRecord(uid: string): DeleteRecord | undefined {
  return state.records[uid];
}

/** True while a delete is in flight — guards against issuing a duplicate request. */
/**
 * Whether a delete is still running in the background.
 *
 * Used to decide on keeping the session alive: while one is running the session continues
 * even without interaction, because watching a job through is pointless if the person it
 * would be reported to has been signed out.
 */
export function hasPendingDeletes(): boolean {
  return allDeleteRecords().some(r => r.status === 'Handling');
}

export function isDeleteInProgress(uid: string): boolean {
  return state.records[uid]?.status === 'Handling';
}

/** Records a delete request on the server; an earlier record for the same infra is replaced. */
export async function putDeleteRecord(rec: DeleteRecord): Promise<void> {
  state.records[rec.uid] = rec;
  try {
    await useSaveDeleteRequest({
      uid: rec.uid,
      ns_id: rec.nsId,
      infra_id: rec.infraId,
      req_id: rec.reqId,
      option: rec.option,
      status: rec.status,
      error_reason: rec.errorReason ?? '',
    }).execute();
  } catch (e) {
    // Show progress on this screen even if the server write failed. It will not be visible
    // from anywhere else, though, so do not let it pass silently.
    console.error('[deleteTracker] failed to record the delete request', e);
  }
}

/**
 * Announces a delete that finished successfully, then drops its record.
 *
 * The caller that issued the request has to do this, because a request that returns success
 * clears its own record immediately and the tracker only ever inspects records still in
 * `Handling`. Clearing without announcing leaves the success unreported — which is the one
 * thing this feature exists to prevent.
 */
export async function markDeleteSucceeded(uid: string): Promise<void> {
  const rec = state.records[uid];
  if (rec) await notifyDone(rec);
  await clearDeleteRecord(uid);
}

/** Drops the record — the delete succeeded, or the infra is gone from the list. */
export async function clearDeleteRecord(uid: string): Promise<void> {
  delete state.records[uid];
  try {
    await useRemoveDeleteRequest(uid).execute();
  } catch (e) {
    console.error('[deleteTracker] failed to remove the delete record', e);
  }
}

/** Updates the status. Success never comes through here — a success drops the record. */
async function markStatus(
  uid: string,
  status: DeleteStatus,
  errorReason?: string,
): Promise<void> {
  const rec = state.records[uid];
  if (rec) {
    rec.status = status;
    if (errorReason !== undefined) rec.errorReason = errorReason;
  }
  try {
    await useUpdateDeleteRequestStatus(uid, status, errorReason).execute();
  } catch (e) {
    console.error('[deleteTracker] failed to update the delete status', e);
  }
}

/**
 * Notes that the delete *request* errored, without calling the delete itself failed.
 *
 * The request runs for minutes and a proxy will time it out (504) while the server keeps
 * going, so an error here says nothing certain about the outcome. The record stays in
 * `Handling` — which is what the tracker inspects — and the reason is kept in case the
 * tracker does conclude failure and needs something to show.
 */
export async function noteDeleteRequestError(
  uid: string,
  errorReason?: string,
): Promise<void> {
  const rec = state.records[uid];
  if (rec && errorReason !== undefined) rec.errorReason = errorReason;
}

/**
 * Records that a delete failed, with the reason. The list shows this in `Delete Status`.
 *
 * **The notification is raised here too.** The tracker only inspects records still in
 * `Handling`, and a request that fails as it is sent is written straight to `Error`, so it
 * never comes up for inspection. Without this the failure exists only as a status value in
 * the list, and anyone who had left the screen never learns of it.
 */
export async function markDeleteFailed(
  uid: string,
  errorReason?: string,
): Promise<void> {
  await markStatus(uid, 'Error', errorReason);
  const rec = state.records[uid];
  if (rec) await notifyFailed(rec, errorReason);
}

/** Loads the tracking records kept on the server (on app start and on login). */
export async function loadDeleteRecords(): Promise<void> {
  try {
    const res: any = await useListDeleteRequests().execute();
    const list: DeleteRequestRecord[] =
      res?.data?.responseData ?? res?.data?.data ?? res?.data ?? [];
    const next: Record<string, DeleteRecord> = {};
    for (const r of Array.isArray(list) ? list : []) {
      next[r.uid] = fromRecord(r);
    }
    state.records = next;
  } catch (e) {
    console.error('[deleteTracker] failed to load tracking records', e);
  }
}

// ── Runner registration ─────────────────────────────────────────────────────
//
// The runner owns the interval, the overlap guard and the login/logout lifecycle
// ([runner](@/shared/libs/tracking/runner)). This side knows only *what to ask*: a delete is
// judged finished by querying cm-beetle, while a load test and a workflow each look at
// something different. Folding those together would grow a switch, not a shared mechanism.

/**
 * The HTTP status behind a failed lookup, when there is one.
 *
 * The backend proxy passes cm-beetle's status through as-is when cm-beetle answered, and
 * substitutes 500 when it could not reach cm-beetle at all. So the code tells the two apart:
 * 404 means cm-beetle is up and does not know this request id, anything else means the
 * outcome is still unknown.
 */
export function statusCodeOf(e: any): number | undefined {
  // The api wrapper rejects with `{ error, errorMsg, status }`, all of them refs — the axios
  // error sits at `error.value`, and `status` here is the wrapper's own 'error' | 'cancel'
  // string, not an HTTP code. Reading that one first is what silently defeated this: it is
  // never null, so it swallowed the lookup and every rejection came back without a code.
  const fromWrapper = e?.error?.value?.response?.status;
  if (typeof fromWrapper === 'number') return fromWrapper;

  // A plain axios error, for callers that pass one through unwrapped.
  const fromAxios = e?.response?.status;
  if (typeof fromAxios === 'number') return fromAxios;

  return typeof e?.status === 'number' ? e.status : undefined;
}

async function notifyDone(rec: DeleteRecord): Promise<void> {
  // A force delete removes only the internal record and leaves the CSP resources — a
  // success, but one that still needs attention.
  const forced = rec.option === 'force';
  await notify({
    category: 'Workload',
    level: forced ? 'Error' : 'Info',
    message: forced
      ? `Infra "${rec.infraId}" was force-deleted. CSP resources may remain.`
      : `Infra "${rec.infraId}" has been deleted.`,
    detail: forced
      ? 'Force delete removes the record only. Any surviving CSP resources keep billing and must be removed by hand.'
      : '',
    dedupKey: `delete:${rec.reqId}:done`,
  });
}

async function notifyFailed(rec: DeleteRecord, reason?: string): Promise<void> {
  // Carry the reason in the notification. The status cell is narrow and shows only the
  // start of it, and this notification is often where the failure is first noticed. When no
  // reason came back, say where one can be obtained instead.
  await notify({
    category: 'Workload',
    level: 'Error',
    message: `Failed to delete infra "${rec.infraId}".`,
    detail: reason
      ? `${reason}\n\nDeleting it again shows the same reason before it starts.`
      : 'No reason was returned. Deleting it again shows the reason before it starts.',
    dedupKey: `delete:${rec.reqId}:error`,
  });
}

async function notifyUnknown(rec: DeleteRecord): Promise<void> {
  await notify({
    category: 'Workload',
    level: 'Error',
    message: `Could not confirm the deletion of infra "${rec.infraId}".`,
    detail:
      'The request is no longer on record, so the outcome cannot be confirmed. Check the workload list to see whether it is gone.',
    dedupKey: `delete:${rec.reqId}:unknown`,
  });
}

/**
 * Says the status could not be read right now — the work itself is untouched.
 *
 * Holding off on a verdict is right, but staying silent about it is not: with nothing on
 * screen the wait looks normal and nobody learns the server is unreachable. The key is per
 * request rather than per attempt, so this is said once and not on every pass.
 */
async function notifyCheckUnavailable(
  rec: DeleteRecord,
  reason?: string,
): Promise<void> {
  await notify({
    category: 'Workload',
    level: 'Error',
    message: `Cannot check the deletion status of infra "${rec.infraId}".`,
    detail: reason
      ? `${reason}\n\nThe delete itself is unaffected — checking resumes on its own once the server responds.`
      : 'The server did not respond. The delete itself is unaffected — checking resumes on its own once the server responds.',
    dedupKey: `delete:${rec.reqId}:check-unavailable`,
  });
}

/**
 * Checks the outcome of one in-flight delete.
 *
 * Everything here rests on cm-beetle's own request tracking, which has no rate limit. It
 * used to fall back to listing the infras when that lookup failed — a listing that *is*
 * rate limited (2/s), asked once per record, so deleting several at once put the later ones
 * over the limit and their answers came back as failures. The fallback existed because a
 * single `catch` treated "no such request" and "server unreachable" as the same thing; once
 * those are told apart, there is nothing left for it to do.
 */
async function checkOne(rec: DeleteRecord): Promise<void> {
  try {
    const res: any = await useGetBeetleRequest(rec.reqId).execute();
    const details =
      res?.data?.responseData?.data ??
      res?.data?.data ??
      res?.data?.responseData ??
      res?.data ??
      res;
    const status = String(details?.status ?? '').toLowerCase();

    if (status === 'success') {
      await notifyDone(rec);
      // A success leaves nothing to keep — the infra is gone from the list, so there is
      // nothing left to show it against.
      await clearDeleteRecord(rec.uid);
    } else if (status === 'error') {
      const reason = details?.errorResponse || undefined;
      await markStatus(rec.uid, 'Error', reason);
      await notifyFailed(rec, reason);
    }
    // Still Handling: leave it and look again on the next pass.
  } catch (e) {
    if (statusCodeOf(e) === 404) {
      // cm-beetle answered and does not know this request id. Its records are kept for a
      // week and restored on restart, so this is either an old request or one lost to a
      // crash — and in the last case the request may never have reached cm-beetle at all.
      // Either way the outcome can no longer be learned from here.
      //
      // Leaving it in `Handling` would be worse than saying so: that status is what blocks
      // a second delete, so the workload could never be deleted again. Move it out and say
      // the outcome is unknown.
      await markStatus(rec.uid, 'Unknown');
      await notifyUnknown(rec);
      return;
    }

    // Anything else — 500, a network failure — means the answer did not arrive, not that
    // the delete failed. Do not pretend to have one. Say the check is unavailable and look
    // again next pass.
    await notifyCheckUnavailable(rec, toErrorMessage(e, ''));
  }
}

registerTracker({
  id: 'mci-delete',
  check: async () => {
    const handling = allDeleteRecords().filter(r => r.status === 'Handling');
    for (const rec of handling) {
      await checkOne(rec);
    }
  },
  hasWork: hasPendingDeletes,
  resume: loadDeleteRecords,
  reset: () => {
    state.records = {};
  },
});
