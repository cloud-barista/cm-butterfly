import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import { IMci, McisTableType, useMCIStore } from '@/entities/mci/model';
import { useGetMciList } from '@/entities/mci/api';
import { getCloudProvidersInVms } from '@/shared/hooks/vm';
import { showErrorMessage, toErrorMessage } from '@/shared/utils';
import { isTransitioning } from '@/features/workload/lifecycleControl/model';
import { isDeleteInProgress } from '@/entities/mci/lib/deleteTracker';
import { registerPoller } from '@/shared/libs/polling';
import { isRefusedForNow, withRefusalRetry } from '@/shared/libs';

interface IProps {
  nsId: string;
}

export function useMciListModel(props: IProps) {
  const mciTableModel =
    useToolboxTableModel<Partial<Record<McisTableType, any>>>();

  const mciStore = useMCIStore();
  const { mcis } = storeToRefs(mciStore);

  // tb-0.12.9 update: the MCI list goes through cm-beetle ListInfra. Only "" (all) or "id" are
  // valid options; the old tumblebug 'normal' is rejected (400 "invalid option") → '' (fetch all).
  const resMciList = useGetMciList(props.nsId, '');
  const loading = ref<boolean>(true);

  /**
   * Set while the lookup is waiting to go out again after being turned away.
   *
   * The lookup shares a per-second allowance with everything else that reaches cb-tumblebug
   * through cm-beetle — including cm-beetle's own work while a delete or a migration runs. So
   * being turned away is ordinary, and the screen says it is waiting rather than showing an
   * error for something that is about to succeed.
   */
  const retryNotice = ref<{
    attempt: number;
    maxRetries: number;
    seconds: number;
  } | null>(null);

  function initToolBoxTableModel() {
    mciTableModel.tableState.fields = [
      { name: 'name', label: 'Name' },
      { name: 'id', label: 'ID' },
      { name: 'status', label: 'Status' },
      { name: 'provider', label: 'Provider' },
      { name: 'countTotal', label: 'Total Servers' },
      { name: 'countRunning', label: 'Running' },
      { name: 'countSuspended', label: 'Suspended' },
      { name: 'countTerminated', label: 'Terminated' },
    ];

    mciTableModel.querySearchState.keyItemSet = [
      {
        title: 'columns',
        items: [
          { name: 'id', label: 'Id' },
          {
            name: 'name',
            label: 'Name',
          },
        ],
      },
    ];
  }

  function organizeResponseMciList(mciRes: IMci) {
    // An infra with no nodes omits node/statusCount entirely. Absent means zero, not broken,
    // so render it as empty rather than throwing.
    const statusCount = mciRes.statusCount ?? ({} as IMci['statusCount']);
    const organizedDatum: Partial<Record<McisTableType | 'originalData', any>> =
      {
        name: mciRes.name,
        description: mciRes.description,
        id: mciRes.id,
        // Key for delete tracking. id is effectively the name, so deleting and recreating with
        // the same name collides; uid is needed to point to a row uniquely.
        uid: mciRes.uid,
        status: mciRes.status,
        provider: getCloudProvidersInVms(mciRes.vm),
        countTotal: statusCount.countTotal ?? '',
        countRunning: statusCount.countRunning ?? '',
        countSuspended: statusCount.countSuspended ?? '',
        countTerminated: statusCount.countTerminated ?? '',
        originalData: mciRes,
      };

    return organizedDatum;
  }

  /**
   * Fetch the list.
   *
   * `quiet` leaves the loading flag alone. The flag swaps the table for a spinner, which is right
   * for the first load and wrong for a background re-check — the table would blink away every few
   * seconds while a workload is suspending.
   */
  function fetchMciList(options?: { quiet?: boolean }) {
    if (!options?.quiet) loading.value = true;
    return withRefusalRetry(() => resMciList.execute(), {
      onRetry: (info, remainingMs) => {
        // Say so only when someone is waiting on this lookup. A background re-check that
        // retries is doing the right thing quietly; announcing it would put a banner on
        // screen every few seconds during a bulk delete, which is when it is least wanted.
        if (options?.quiet) return;
        retryNotice.value = {
          attempt: info.attempt,
          maxRetries: info.maxRetries,
          seconds: Math.ceil(remainingMs / 1000),
        };
      },
    })
      .then(res => {
        if (res.data.responseData) {
          // tb-0.12.9 update: the MCI list now goes through cm-beetle ListInfra, so the response
          // arrives in the cm-beetle standard wrapper (responseData.data.infra[]). The old direct
          // tumblebug response (responseData.infra) is also allowed as a fallback to read both
          // safely. (mci→infra key change + data wrapper applied)
          const infraList = res.data.responseData.data?.infra ?? [];

          // The list is all the screen needs — do NOT follow up with a per-infra detail lookup.
          //
          // cb-tumblebug builds the list by walking the infra ids and calling the very same
          // function the single lookup uses, so every field the detail would return is already
          // here. Asking again once per infra therefore adds nothing, and it breaks the screen:
          // the lookup allows only two in-flight requests, so from the third infra on the extra
          // requests come back 429 and the whole list fails with a message about details.
          mciStore.setMcis(infraList);
        } else {
          // Having no infrastructure at all is not an error — leave the list empty.
          mciStore.setMcis([]);
        }
      })
      .catch(e => {
        // A background re-check that fails leaves the previous rows and the status the user is
        // already looking at. Raising a toast for it every few seconds would bury the notifications
        // that matter, so it is logged and the watch below gives up on its own deadline.
        if (options?.quiet) {
          console.warn('background refresh of the infra list failed', e);
          return;
        }
        // The lookup is shared: the rate limit is counted per caller, and to cb-tumblebug the
        // caller is always cm-beetle — so other users and other tabs draw from the same budget.
        // Being turned away is not a broken list, and saying so keeps the user from hunting a
        // problem that is not there.
        //
        // Reaching here after a refusal means the retries ran out. Saying so plainly matters:
        // the list is not broken and nothing needs fixing, it was busy — and the next attempt
        // is now the user's to make.
        showErrorMessage(
          'Error',
          isRefusedForNow(e)
            ? 'The infrastructure list could not be loaded because too many lookups arrived at once. Please try again in a moment.'
            : toErrorMessage(e, 'Failed to load the infrastructure list.'),
        );
      })
      .finally(() => {
        retryNotice.value = null;
        if (!options?.quiet) loading.value = false;
      });
  }

  // ── Following a lifecycle action ───────────────────────────────────────────
  //
  // A control request is answered before the work is done — cb-tumblebug says "Suspending the Infra"
  // while the provider is still stopping the servers. Left alone, the list would keep showing the
  // status from before the action and the screen would look as though nothing had happened.
  //
  // ★ The list, and only the list. Asking each workload for its own detail is exactly the fan-out
  //   that broke this screen once: cb-tumblebug allows two infra lookups at a time, so
  //   from the third workload on the extra calls came back 429 and took the whole list with them.
  //   One list call already carries every status shown here.
  const FOLLOW_INTERVAL_MS = 5_000;
  const FOLLOW_TIMEOUT_MS = 3 * 60_000;
  let followTimer: ReturnType<typeof setTimeout> | null = null;
  let unregisterFollowPoller: (() => void) | null = null;

  function stopFollowing() {
    if (followTimer) {
      clearTimeout(followTimer);
      followTimer = null;
    }
    unregisterFollowPoller?.();
    unregisterFollowPoller = null;
  }

  /** Whether any of the named workloads is still mid-transition, per the list we last received. */
  function anyTransitioning(infraIds: string[]): boolean {
    return mcis.value.some(
      mci =>
        infraIds.includes(mci.id) &&
        isTransitioning(mci.status, mci.targetAction),
    );
  }

  /**
   * Re-read the list until the given workloads have settled, or until the deadline.
   *
   * The deadline is there because a transition can also end by getting stuck; polling for ever would
   * keep calling the API long after anyone stopped watching. Registering with the poller registry is
   * what makes a session ending stop this too — otherwise it keeps calling after logout, gets a 401,
   * and drops the user back onto the "session expired" path.
   */
  function followTransition(infraIds: string[]) {
    if (!infraIds.length) return;
    stopFollowing();
    unregisterFollowPoller = registerPoller(stopFollowing);
    const deadline = Date.now() + FOLLOW_TIMEOUT_MS;

    const tick = async () => {
      await fetchMciList({ quiet: true });
      if (Date.now() > deadline || !anyTransitioning(infraIds)) {
        stopFollowing();
        return;
      }
      followTimer = setTimeout(() => void tick(), FOLLOW_INTERVAL_MS);
    };

    followTimer = setTimeout(() => void tick(), FOLLOW_INTERVAL_MS);
  }

  // ── Following a delete ─────────────────────────────────────────────────────
  //
  // A delete now answers as soon as it has been taken, and the deleting itself runs for minutes
  // afterwards. The dialog says so and invites the user to leave and watch the `Delete Status`
  // column — which only means anything if the list keeps up. Left alone it does not: the list is
  // read once when the screen opens, so a finished delete stays on screen as "In progress"
  // indefinitely, and the workload it removed stays in the table (observed on the development
  // server: gone from the server for ten minutes, still listed).
  //
  // ★ The list, and only the list — the same rule as the lifecycle follow above. One list call
  //   carries every row; asking each workload separately is the fan-out that broke this screen.
  const DELETE_FOLLOW_INTERVAL_MS = 10_000;
  // A stuck delete should not keep this calling for ever. The tracker concludes a delete on its
  // own, so reaching this means something else went wrong.
  const DELETE_FOLLOW_TIMEOUT_MS = 30 * 60_000;
  let deleteTimer: ReturnType<typeof setTimeout> | null = null;
  let unregisterDeletePoller: (() => void) | null = null;

  /** Whether any workload on screen is being deleted, per the records the tracker holds. */
  const anyDeleting = computed(() =>
    mcis.value.some(mci => isDeleteInProgress((mci as any).uid)),
  );

  function stopFollowingDeletes() {
    if (deleteTimer) {
      clearTimeout(deleteTimer);
      deleteTimer = null;
    }
    unregisterDeletePoller?.();
    unregisterDeletePoller = null;
  }

  function followDeletes() {
    if (deleteTimer) return; // already following
    unregisterDeletePoller = registerPoller(stopFollowingDeletes);
    const deadline = Date.now() + DELETE_FOLLOW_TIMEOUT_MS;

    const tick = async () => {
      // Quietly — a background re-read that announces itself would put a notice on screen every
      // few seconds throughout a bulk delete.
      await fetchMciList({ quiet: true });
      if (Date.now() > deadline || !anyDeleting.value) {
        stopFollowingDeletes();
        return;
      }
      deleteTimer = setTimeout(() => void tick(), DELETE_FOLLOW_INTERVAL_MS);
    };

    deleteTimer = setTimeout(() => void tick(), DELETE_FOLLOW_INTERVAL_MS);
  }

  watch(anyDeleting, deleting => {
    if (deleting) followDeletes();
    else stopFollowingDeletes();
  });

  watch(
    mcis,
    nv => {
      mciTableModel.tableState.items = nv.map(value =>
        organizeResponseMciList(value),
      );
      mciTableModel.handleChange(null);
    },
    { deep: true },
  );

  return {
    mciTableModel,
    initToolBoxTableModel,
    mciStore,
    fetchMciList,
    followTransition,
    stopFollowing,
    followDeletes,
    stopFollowingDeletes,
    resMciList,
    loading,
    retryNotice,
  };
}
