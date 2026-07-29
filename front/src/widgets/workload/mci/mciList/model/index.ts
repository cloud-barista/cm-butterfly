import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import { IMci, McisTableType, useMCIStore } from '@/entities/mci/model';
import { useGetMciList } from '@/entities/mci/api';
import { getCloudProvidersInVms } from '@/shared/hooks/vm';
import { showErrorMessage, toErrorMessage } from '@/shared/utils';
import { isTransitioning } from '@/features/workload/lifecycleControl/model';
import { registerPoller } from '@/shared/libs/polling';

interface IProps {
  nsId: string;
}

/**
 * Whether the lookup was turned away because too many arrived at once.
 *
 * cb-tumblebug caps the infra lookup at two in-flight requests and answers 429 beyond that.
 * cm-beetle relays that as a 500 whose message still carries the original status, so the status
 * code alone never says "rate limited" — the text is the only signal. Worth telling apart because
 * the fix is simply to try again, which a generic failure message gives no hint of.
 */
function isRateLimited(e: any): boolean {
  if (e?.error?.value?.response?.status === 429) return true;
  const msg = toErrorMessage(e, '').toLowerCase();
  return msg.includes('rate limit') || msg.includes('status: 429');
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
    return resMciList
      .execute()
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
        showErrorMessage(
          'Error',
          isRateLimited(e)
            ? 'The infrastructure list could not be loaded because too many lookups arrived at once. Please try again in a moment.'
            : toErrorMessage(e, 'Failed to load the infrastructure list.'),
        );
      })
      .finally(() => {
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
    resMciList,
    loading,
  };
}
