import { reactive } from 'vue';
import {
  useControlMci,
  useControlMciNode,
  type LifecycleAction,
} from '@/entities/mci/api';
import { toErrorMessage } from '@/shared/utils';

/**
 * Workload lifecycle control — the rules, in one place.
 *
 * Suspend / Resume / Reboot / Terminate all go to cb-tumblebug's control endpoint. What differs
 * between them is *when they are allowed* and *how much damage they do*, and both of those have to
 * be on screen before the user commits. Keeping them here means the infra list and the server list
 * cannot drift into describing the same action two different ways.
 */

/** Whether the action applies to a whole workload or to one server inside it. */
export type LifecycleScope = 'infra' | 'node';

export interface ILifecycleActionMeta {
  name: LifecycleAction;
  label: string;
  /** Typing the target name is required before this can run. */
  destructive: boolean;
  /**
   * Statuses cb-tumblebug will accept this action from (its CheckAllowedTransition).
   *
   * Used only to *warn* — the request is never blocked on it. The server is the authority, and a
   * status we read a moment ago may already be stale.
   */
  allowedFrom: string[];
  /** One line saying what actually happens, shown in the confirm step. */
  describe: (scope: LifecycleScope) => string;
}

export const LIFECYCLE_ACTIONS: Record<LifecycleAction, ILifecycleActionMeta> =
  {
    suspend: {
      name: 'suspend',
      label: 'Suspend',
      destructive: false,
      allowedFrom: ['running'],
      describe: scope =>
        scope === 'infra'
          ? 'Stops every server in the selected workloads. Nothing is deleted, and Resume starts them again.'
          : 'Stops the selected server. Nothing is deleted, and Resume starts it again.',
    },
    resume: {
      name: 'resume',
      label: 'Resume',
      destructive: false,
      allowedFrom: ['suspended'],
      describe: scope =>
        scope === 'infra'
          ? 'Starts every suspended server in the selected workloads again.'
          : 'Starts the selected server again.',
    },
    reboot: {
      name: 'reboot',
      label: 'Reboot',
      destructive: false,
      allowedFrom: ['running'],
      describe: scope =>
        scope === 'infra'
          ? 'Restarts every server in the selected workloads. Anything running on them is interrupted.'
          : 'Restarts the selected server. Anything running on it is interrupted.',
    },
    terminate: {
      name: 'terminate',
      label: 'Terminate',
      destructive: true,
      // Terminating something already terminated is accepted as a no-op, so it belongs here too.
      allowedFrom: ['running', 'suspended', 'terminated'],
      describe: scope =>
        scope === 'infra'
          ? 'Destroys every server in the selected workloads at the cloud provider. They cannot be brought back. The workload entry itself remains until you delete it.'
          : 'Destroys the selected server at the cloud provider. It cannot be brought back.',
    },
  };

/** The order the actions appear in the menu — least to most damaging. */
export const LIFECYCLE_ACTION_ORDER: LifecycleAction[] = [
  'suspend',
  'resume',
  'reboot',
  'terminate',
];

/**
 * The bare status word.
 *
 * A workload's status arrives decorated — `Running:1 (R:1/1)` — while a server's is the plain word.
 * Both reduce to the same first token, which is all the transition rules care about.
 */
export function statusWord(status?: string): string {
  if (!status) return '';
  return (status.split(/[:\s(]/)[0] ?? '').trim().toLowerCase();
}

/**
 * Whether cb-tumblebug is likely to accept this action from the target's current status.
 *
 * An unknown status answers `true` — not knowing is not the same as knowing it is wrong, and a
 * warning shown on every row would soon be ignored on the rows that matter.
 */
export function isTransitionAllowed(
  action: LifecycleAction,
  status?: string,
): boolean {
  const word = statusWord(status);
  if (!word) return true;
  return LIFECYCLE_ACTIONS[action].allowedFrom.includes(word);
}

/** Statuses that mean the target is mid-transition; the list keeps watching while any remain. */
const TRANSITIONAL = [
  'creating',
  'terminating',
  'resuming',
  'suspending',
  'rebooting',
];

export function isTransitioning(
  status?: string,
  targetAction?: string,
): boolean {
  if (TRANSITIONAL.includes(statusWord(status))) return true;
  // cb-tumblebug clears targetAction to `Complete` when it is finished with the infra.
  return !!targetAction && targetAction !== 'Complete';
}

export interface ILifecycleTarget {
  /** The id the API is called with. For workloads this is the infra id, for servers the node id. */
  id: string;
  /** What the user sees, and what a destructive action asks them to type. */
  name: string;
  status?: string;
}

export type LifecycleOutcome = 'pending' | 'accepted' | 'failed';

export interface ILifecycleResult {
  id: string;
  name: string;
  outcome: LifecycleOutcome;
  /** The server's own words — its acknowledgement, or its reason for refusing. */
  message: string;
}

export interface ILifecycleRunOptions {
  scope: LifecycleScope;
  nsId: string;
  /** Required for `node` scope — the workload the servers belong to. */
  infraId?: string;
  action: LifecycleAction;
  force: boolean;
  targets: ILifecycleTarget[];
}

export function useLifecycleControl() {
  const state = reactive({
    results: [] as ILifecycleResult[],
    running: false,
  });

  function reset() {
    state.results = [];
    state.running = false;
  }

  /**
   * Send the action for each target and record what came back, one by one.
   *
   * **Sequential on purpose.** Firing them together is what broke the workload list once already:
   * cb-tumblebug turns away lookups past the second in flight, and a `Promise.all` threw away the
   * successful answers along with the rejected one. A handful of selected workloads costs
   * nothing to walk in order, and each one's outcome lands on screen as it arrives instead of all of
   * them appearing at the end.
   *
   * A failure never stops the rest — one workload refusing the action says nothing about the others.
   */
  async function run(
    options: ILifecycleRunOptions,
  ): Promise<ILifecycleResult[]> {
    const { scope, nsId, infraId, action, force, targets } = options;
    state.running = true;
    state.results = targets.map(t => ({
      id: t.id,
      name: t.name,
      outcome: 'pending' as LifecycleOutcome,
      message: '',
    }));

    for (const [index, target] of targets.entries()) {
      const request =
        scope === 'node'
          ? useControlMciNode({
              nsId,
              infraId: infraId ?? '',
              nodeId: target.id,
              action,
              force,
            })
          : useControlMci({ nsId, infraId: target.id, action, force });

      let outcome: LifecycleOutcome;
      let message: string;
      try {
        const res = await request.execute();
        outcome = 'accepted';
        // cb-tumblebug replies with a line such as "Suspending the Infra". It is an acknowledgement,
        // not a completion, so it is shown as-is rather than rewritten into "Done".
        message = res?.data?.responseData?.message ?? 'Request accepted.';
      } catch (e) {
        outcome = 'failed';
        // Refusals here are usually the server saying the status does not allow it — the exact
        // sentence is the useful part, so it is passed through untouched.
        message = toErrorMessage(
          e,
          'The request was refused and no reason was given.',
        );
      }

      // The modal can be dismissed while this loop is still walking the targets, and closing clears
      // the results. Writing into a row that is no longer there would throw and lose the outcomes
      // of every target after it, so a vanished row is simply skipped.
      const slot = state.results[index];
      if (!slot || slot.id !== target.id) continue;
      slot.outcome = outcome;
      slot.message = message;
    }

    state.running = false;
    return state.results;
  }

  return { state, run, reset };
}
