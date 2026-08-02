<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useIntervalFn } from '@vueuse/core';
import {
  PBadge,
  PButton,
  PSelectDropdown,
  PSpinner,
  PTooltip,
} from '@cloudforet-test/mirinae';
import RunGraph from './RunGraph.vue';
import SoftwareMigrationOverlay from '../../workflowHistory/ui/SoftwareMigrationOverlay.vue';
import { graphPixelWidth } from '@/entities/workflow/lib/runGraph';
import { useWorkflowRunViewerModel } from '../model/workflowRunViewerModel';
import {
  isRunFinished,
  taskStateBadgeType,
  taskStateKind,
  taskStateLabel,
} from '@/entities/workflow/lib/taskState';

interface Props {
  workflowId: string | null;
  /** If empty, open the most recent run */
  runId?: string | null;
  /**
   * Bumped by the page whenever the definition is saved.
   *
   * ★ Reloading used to hang on the id changing, and that is not enough. Editing a clone sets the
   *   id to the clone *before* the editor opens, so by the time it is saved the id is already what
   *   it will be — nothing changes, nothing reloads, and the panel keeps showing the definition it
   *   read before the edit. It says "Values from the current definition" while showing the values
   *   the clone was made from; the saved definition and the machine that gets built use the new
   *   ones. Saving is its own event, so it gets its own trigger.
   */
  reloadToken?: number;
}

const props = defineProps<Props>();

// Opening an editor (workflow tool / JSON) is the page's job (the editor modal lives there).
// - edit-original: open an un-run original in the workflow tool
// - edit-clone   : open a clone of an already-run workflow in the workflow tool
// - edit-json    : open a graph the tool cannot translate as is in the JSON editor (original or clone id)
const emit = defineEmits<{
  (e: 'edit-original', workflowId: string): void;
  (e: 'edit-clone', clonedWorkflowId: string): void;
  (e: 'edit-json', workflowId: string): void;
  // - view-json : show the definition as is (gathered here from the detail screen)
  (e: 'view-json', workflowId: string): void;
}>();

const {
  runs,
  selectedRunId,
  selectedRun,
  instances,
  selectedTaskId,
  selectedInstance,
  selectedNode,
  deletedTaskInstances,
  definitionChangedAfterRun,
  graph,
  workflowReadyState,
  hasRuns,
  canEditInDesigner,
  designerSupport,
  progress,
  isPolling,
  runStarting,
  runStartTimedOut,
  runStartError,
  keepWaitingForRun,
  stopWaitingForRun,
  cloning,
  loadError,
  logText,
  logError,
  logLoading,
  selectedTryNumber,
  failureSummary,
  rerunTargets,
  rerunError,
  rerunPending,
  open,
  selectRun,
  selectTask,
  loadLog,
  previewRerun,
  confirmRerun,
  cancelRerun,
  cloneForEdit,
  runWorkflow,
} = useWorkflowRunViewerModel();

/**
 * When you want to change values and run again, do not edit the original.
 * Make a clone and edit that — the original and its run history stay intact.
 *
 * If the workflow tool cannot translate the graph as is, open the clone in the JSON
 * editor. Opening it in the tool makes the diagram differ from the actual run, and
 * saving in that state silently changes the execution order.
 *
 * You can open it immediately after creating it. There is a brief window (measured
 * ~5s) where the engine cannot read the clone from Airflow, but **the editor does not
 * rely on that read** — it caches the clone response and draws from there. Saving also
 * already works during that window (measured: clone +0.1s, update API 200). So we do
 * not make the user wait.
 */
async function cloneAndEdit() {
  const clonedId = await cloneForEdit();
  if (!clonedId) return;
  if (canEditInDesigner.value) emit('edit-clone', clonedId);
  else emit('edit-json', clonedId);
}

/**
 * Edit an un-run original. With no run history, open the original directly without cloning.
 * If the tool cannot translate the graph, show the reason and ask whether to go to the JSON editor.
 */
/**
 * Bring the "waiting" indicator **to a visible spot.**
 *
 * This screen sits below the workflow list, so arriving right after a save, the graph
 * area is cut off below the fold. If the indicator lives only there, the user sees only
 * the save-complete notice at the top and has to scroll to learn that the *data is being
 * prepared* — it looks as if the screen has frozen.
 */
const waitingRef = ref<HTMLElement | null>(null);
watch(workflowReadyState, async state => {
  if (state !== 'waiting') return;
  await nextTick();
  waitingRef.value?.scrollIntoView({ block: 'center', behavior: 'smooth' });
});

const showEditJsonConfirm = ref(false);
function requestEdit() {
  if (!canEditInDesigner.value) {
    showEditJsonConfirm.value = true;
    return;
  }
  if (props.workflowId) emit('edit-original', props.workflowId);
}
function confirmEditJson() {
  showEditJsonConfirm.value = false;
  if (props.workflowId) emit('edit-json', props.workflowId);
}

/**
 * The result a task produced. For now only SW migration — query it only when the engine
 * attached an execution ID to the task. We decide by the presence of that ID, not the
 * component name, so if the engine starts attaching other components' return values,
 * they attach in the same place.
 */
const showSwResult = ref(false);
const swExecutionIds = computed(() =>
  selectedInstance.value?.software_migration_execution_id
    ? [selectedInstance.value.software_migration_execution_id]
    : [],
);

/**
 * Re-run scope. The name captures what the reference point is.
 *
 * 'upstream' (this task and everything before it) was dropped. Re-running already-
 * succeeded predecessor tasks only recreates resources, and if you really need it you
 * can *select that predecessor task* and re-run with 'after' — there is no reason to
 * express the same thing two ways. (The engine still supports it.)
 */
const RERUN_SCOPES = [
  {
    key: 'only',
    label: 'This task only',
    hint: 'Runs just the selected task again. Tasks after it keep their current result, so use this when only this task needs redoing.',
  },
  {
    key: 'after',
    label: 'This task and everything after it',
    hint: "Runs the selected task again, then everything that depends on it. Use this when the tasks that followed were built on this task's result.",
  },
] as const;

// This runs the entire workflow, so do not start without confirmation
const showRunConfirm = ref(false);

// Cloning creates one more workflow. It grows with every click, so ask for confirmation.
const showCloneConfirm = ref(false);

async function confirmClone() {
  showCloneConfirm.value = false;
  await cloneAndEdit();
}

async function confirmRun() {
  showRunConfirm.value = false;
  await runWorkflow();
}

function downloadLog() {
  const blob = new Blob([logText.value], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${selectedNode.value?.name ?? 'task'}-try${selectedTryNumber.value ?? 1}.log`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/** Per-task re-run — the selected task is the reference point */
function requestRerun(scope: (typeof RERUN_SCOPES)[number]['key']) {
  const taskId = selectedTaskId.value;
  if (!taskId) return;

  previewRerun({
    dryRun: true,
    taskIds: [taskId],
    includeDownstream: scope === 'after',
    includeUpstream: false,
    onlyFailed: false,
    resetDagRuns: true,
  });
}

/**
 * Per-run re-run — regardless of the selected task, the target is the failures of *this
 * entire run*. It sits alongside the run-level actions, not in the detail panel that
 * only appears once a task is selected.
 *
 * The engine rejects an empty target list, so we pass all tasks of this run and let it
 * pick only the failed ones. That catches the failed tasks and the tasks that were
 * blocked because of them.
 */
function requestRerunFailed() {
  // If the status hasn't arrived yet, the target list is empty and the engine rejects it. It can't be clicked before then.
  if (!instances.value.length) return;

  previewRerun({
    dryRun: true,
    taskIds: instances.value.map(i => i.task_id),
    includeDownstream: false,
    includeUpstream: false,
    onlyFailed: true,
    resetDagRuns: true,
  });
}

/**
 * Is it running now — the progress indicator and the button lock use the same basis.
 *
 * **"Has not finished" is the basis, not a list of in-flight state names.** The engine passes
 * the execution engine's state strings through as they are, and a just-started run reports
 * `scheduled` or `none` before it reports `running`. Listing the names meant those moments fell
 * outside every state and the screen went blank again — right after the click, which is exactly
 * when the user is watching. Polling already stops on the same "finished" judgement, so this
 * also keeps the indicator and the polling from disagreeing: while we are still asking, the
 * screen says so.
 */
const runInProgress = computed(
  () => !!selectedRun.value && !isRunFinished(selectedRun.value.state),
);

/*
  Which task the run is currently sitting on, and for how long.

  The progress bar only moves when a task *finishes*. A task that takes ten minutes leaves
  the bar at the same width and every number on screen unchanged for ten minutes, and the
  screen becomes indistinguishable from one that has died. So we say the task's name out
  loud and let the seconds tick — a number that keeps changing is the proof that the screen
  is still alive, and the elapsed time is what tells you whether it is taking unusually long.
*/
const nodeNameById = computed(
  () => new Map(graph.value.nodes.map(n => [n.id, n.name])),
);

const runningTasks = computed(() =>
  instances.value
    .filter(i => taskStateKind(i.state) === 'running')
    .map(i => ({
      name: nodeNameById.value.get(i.task_id) ?? i.task_name ?? i.task_id,
      startDate: i.start_date,
    })),
);

const runningTaskNames = computed(() => runningTasks.value.map(t => t.name));

/** Ticks only while a run is in progress — a clock that runs on a finished run is pure waste */
const now = ref(Date.now());
const { pause: pauseClock, resume: resumeClock } = useIntervalFn(
  () => {
    now.value = Date.now();
  },
  1000,
  { immediate: false },
);

/*
  Where the elapsed time is counted from. While tasks are running it is the earliest of
  them (that is the one the run is waiting on); between tasks there is nothing running, so
  it falls back to the run's own start. The two mean different things, so the wording on
  screen says which one is being shown.
*/
const elapsedFrom = computed(() => {
  // Drop the ones that are not real times *before* choosing the earliest — otherwise the
  // engine's zero value sorts first and wins, and we end up with no counter at all even
  // though a task did report a genuine start.
  const starts = runningTasks.value
    .map(t => startedAtMs(t.startDate))
    .filter((ms): ms is number => ms !== null)
    .sort((a, b) => a - b);
  return starts[0] ?? startedAtMs(selectedRun.value?.start_date);
});

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  if (minutes < 60) return `${minutes}m ${total % 60}s`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

/**
 * A run that has been queued but not actually begun reports its start time as the engine's
 * zero value (`0001-01-01T00:00:00Z`), and a task that has not started reports an empty
 * string. Neither is a time — counting from them printed things like "17755691h 11m", which
 * destroys any trust in the number next to it. Anything at or before the epoch is not a real
 * start, so we show nothing rather than a number that cannot be true.
 */
function startedAtMs(value?: string | null): number | null {
  if (!value) return null;
  const parsed = new Date(value).getTime();
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

const elapsedText = computed(() => {
  const startedAt = elapsedFrom.value;
  if (startedAt === null) return '';
  const ms = now.value - startedAt;
  // A clock skew between the engine and the browser can put the start in the future.
  // Showing a negative duration is worse than showing none.
  if (ms < 0) return '';
  return formatElapsed(ms);
});

watch(
  runInProgress,
  inProgress => {
    if (!inProgress) {
      pauseClock();
      return;
    }
    now.value = Date.now();
    resumeClock();
  },
  { immediate: true },
);

const hasFailedTask = computed(() =>
  instances.value.some(i =>
    ['failed', 'upstream_failed'].includes((i.state ?? '').toLowerCase()),
  ),
);

/*
  A grayed-out button reads like a broken feature. In fact there is simply nothing to
  re-run, but the screen never said so anywhere. Whether there is a failed task or not —
  that one thing alone splits the wording. The button is also locked while a run is in
  progress, but keeping separate wording for that case adds a path to keep in sync on
  every state change and drifts when the logic changes. Look only at the start and the end.
*/
const rerunFailedHint = computed(() =>
  hasFailedTask.value
    ? 'Re-runs the tasks that failed in this run, and the ones that could not run because of them. You are shown the exact list and asked to confirm first.'
    : 'Nothing failed in this run, so there is nothing to re-run. To run the workflow again from the start, use "Start new run".',
);

/**
 * While the confirm modal is up, also show the tasks that will re-run on the graph.
 * A list alone doesn't convey "where it re-runs" visually.
 */
const rerunPreviewIds = computed(() =>
  rerunTargets.value ? rerunTargets.value.map(t => t.task_id) : null,
);

/** Also show which component each re-run target task uses — a basis for judging what re-runs */
function componentOf(taskId: string): string {
  return graph.value.nodes.find(n => n.id === taskId)?.taskComponent ?? '-';
}

const canShowLog = computed(
  () => !!selectedInstance.value && selectedInstance.value.try_number > 0,
);

const tryNumbers = computed(() => {
  const total = selectedInstance.value?.try_number ?? 0;
  return Array.from({ length: total }, (_, i) => i + 1);
});

/* 2026-07-14T07:35:52.138528Z → 2026-07-14 07:35:52. The raw string with microseconds
   overflowed the dropdown width and pushed the status text onto the next line. */
function formatRunTime(value?: string): string {
  if (!value) return '-';
  const m = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/);
  return m ? `${m[1]} ${m[2]}` : value;
}

const runOptions = computed(() =>
  [...runs.value]
    .sort((a, b) => (b.start_date ?? '').localeCompare(a.start_date ?? ''))
    .map(run => ({
      name: run.workflow_run_id,
      label: `${formatRunTime(run.start_date ?? run.execution_date)} · ${taskStateLabel(run.state)}`,
    })),
);

/*
  The width given to the graph is decided by the number of parallel branches. A workflow
  whose tasks run in a single line, like infra or SW migration, is laid out narrow, so the
  leftover width goes to the detail panel; with many parallel branches the graph takes a
  wide spot. When width runs short, the panel drops below.
*/
const graphFlexBasis = computed(
  // graphPixelWidth is the SVG's own width. The graph box takes RunGraph's inner padding
  // (0.5rem left/right) and the box border (1px left/right) on top of that, so unless we
  // add that much to flex-basis the SVG is always clipped even on a roomy screen and a
  // horizontal scrollbar appears.
  () => `calc(${graphPixelWidth(graph.value)}px + 1rem + 2px)`,
);

/** If the value is a JSON string, expand it for readability (cicada stores request_body as a string) */
function formatParamValue(value: any): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  return JSON.stringify(value, null, 2);
}

const selectedParams = computed(() => {
  const spec = selectedNode.value?.spec ?? {};
  return Object.entries(spec)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => ({ key, value: formatParamValue(value) }));
});

function formatDuration(seconds?: number): string {
  if (seconds === undefined || seconds === null) return '-';
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  return `${m}m ${Math.round(seconds - m * 60)}s`;
}

watch(
  () => [props.workflowId, props.runId, props.reloadToken],
  async () => {
    if (props.workflowId) await open(props.workflowId, props.runId);
  },
  { immediate: true },
);

async function onRunChange(runId: string) {
  if (props.workflowId) await selectRun(props.workflowId, runId);
}
</script>

<template>
  <div class="run-viewer" data-testid="workflow-run-viewer">
    <div class="run-viewer__header">
      <!--
        The left side is a history picker for *choosing a past run*, and the right side is
        a button for *starting a new run*. They are opposite in nature, so placing them
        together reads as "re-run the chosen run". (Re-running the chosen run is the
        Re-run in the task detail.)
      -->
      <div class="run-viewer__header-row">
        <div class="run-viewer__run-select">
          <span class="run-viewer__label">Run history</span>
          <p-select-dropdown
            data-testid="workflow-run-select"
            :menu="runOptions"
            :selected.sync="selectedRunId"
            class="run-viewer__dropdown"
            @select="onRunChange"
          />
          <p-badge
            v-if="selectedRun"
            data-testid="workflow-run-state"
            :badge-type="taskStateBadgeType(selectedRun.state)"
          >
            {{ taskStateLabel(selectedRun.state) }}
          </p-badge>
          <span v-if="isPolling" class="run-viewer__polling">
            Auto-refreshing · 3s
          </span>
        </div>

        <!--
          **If we haven't read it yet, offer no buttons at all.**
          At this point we don't know the run history, yet the buttons split on whether
          history exists. Leaving them shown makes Edit appear briefly even on a workflow
          that has history, and at that moment the guard against directly editing the
          original is breached. Show them only after we have what we need to decide.
        -->
        <div v-if="workflowReadyState === 'ready'" class="run-viewer__actions">
          <!--
            A workflow with no run history has no "re-run" — only run it, or edit its
            content. Once it has history, keep the usual buttons (re-run failed → new run →
            clone). A run workflow blocks directly editing the original, so there is no
            Edit here.
          -->
          <template v-if="!hasRuns">
            <p-tooltip
              contents="Runs this workflow for the first time."
              position="bottom"
              :options="{ classes: ['p-tooltip', 'run-viewer-tooltip'] }"
            >
              <p-button
                data-testid="workflow-viewer-run-first-btn"
                size="sm"
                style-type="primary"
                :disabled="runInProgress || runStarting"
                @click="showRunConfirm = true"
              >
                Run
              </p-button>
            </p-tooltip>

            <p-tooltip
              contents="Opens this workflow in the editor to change its content. Available before the first run — once a workflow has run, edit a copy instead."
              position="bottom"
              :options="{ classes: ['p-tooltip', 'run-viewer-tooltip'] }"
            >
              <p-button
                data-testid="workflow-viewer-edit-btn"
                size="sm"
                style-type="tertiary"
                @click="requestEdit"
              >
                Edit
              </p-button>
            </p-tooltip>
          </template>

          <template v-else>
            <!--
              Order: re-run this run's failures → run this workflow anew → clone to change values.
              The further left, the closer to the run you are viewing; the further right, the more it creates something new.
            -->
            <p-tooltip
              :contents="rerunFailedHint"
              position="bottom"
              :options="{ classes: ['p-tooltip', 'run-viewer-tooltip'] }"
            >
              <p-button
                data-testid="workflow-rerun-failed-btn"
                size="sm"
                style-type="tertiary"
                :disabled="!hasFailedTask || rerunPending || runInProgress"
                @click="requestRerunFailed"
              >
                Re-run failed tasks
              </p-button>
            </p-tooltip>

            <p-tooltip
              contents="Starts a new run of the whole workflow from the first task. This does not re-run the run selected above."
              position="bottom"
              :options="{ classes: ['p-tooltip', 'run-viewer-tooltip'] }"
            >
              <p-button
                data-testid="workflow-viewer-run-btn"
                size="sm"
                style-type="primary"
                :disabled="runInProgress || runStarting"
                @click="showRunConfirm = true"
              >
                Start new run
              </p-button>
            </p-tooltip>

            <p-tooltip
              contents="Copies this workflow and opens the copy in the editor, so you can change values without touching the original or its run history."
              position="bottom"
              :options="{ classes: ['p-tooltip', 'run-viewer-tooltip'] }"
            >
              <p-button
                data-testid="workflow-clone-edit-btn"
                size="sm"
                style-type="tertiary"
                :disabled="cloning"
                @click="showCloneConfirm = true"
              >
                Clone &amp; Edit
              </p-button>
            </p-tooltip>
          </template>

          <!--
            A way to view the definition as is. Moved here from the detail screen —
            gathering everything you can do with this workflow in one place means you don't
            have to hunt around for where to do what. Always present regardless of run
            history (since it is a view-only action).
          -->
          <p-tooltip
            contents="Shows the workflow definition as JSON."
            position="bottom"
            :options="{ classes: ['p-tooltip', 'run-viewer-tooltip'] }"
          >
            <p-button
              data-testid="workflow-viewer-view-json-btn"
              size="sm"
              style-type="tertiary"
              :disabled="!props.workflowId"
              @click="props.workflowId && emit('view-json', props.workflowId)"
            >
              View JSON
            </p-button>
          </p-tooltip>
        </div>
      </div>

      <!--
        Keep on screen which run was chosen. The dropdown collapses once you pick, so
        otherwise you can't tell which run, from when, you are currently viewing.
      -->
      <dl
        v-if="selectedRun"
        class="run-viewer__meta"
        data-testid="workflow-run-meta"
      >
        <div>
          <dt>Run ID</dt>
          <dd data-testid="workflow-run-meta-id">
            {{ selectedRun.workflow_run_id }}
          </dd>
        </div>
        <div>
          <dt>Started</dt>
          <dd>{{ selectedRun.start_date || '-' }}</dd>
        </div>
        <div>
          <dt>Ended</dt>
          <dd>{{ selectedRun.end_date || '-' }}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{{ formatDuration(selectedRun.duration_date) }}</dd>
        </div>
      </dl>
    </div>

    <div
      v-if="loadError"
      class="run-viewer__error"
      data-testid="workflow-run-error"
    >
      Failed to load run status: {{ loadError }}
    </div>

    <!-- If the re-run request fails, the modal does not open. Surface that failure here -->
    <div
      v-if="rerunError && !rerunTargets"
      class="run-viewer__error"
      data-testid="workflow-rerun-error"
    >
      {{ rerunError }}
    </div>

    <div v-if="graph.warnings.length" class="run-viewer__warning">
      <div v-for="(warning, i) in graph.warnings" :key="i">
        ⚠ {{ warning }}
      </div>
    </div>

    <div class="run-viewer__body">
      <div
        class="run-viewer__graph"
        data-testid="workflow-run-graph"
        :class="{ 'run-viewer__graph--locked': runStarting }"
        :style="{ flexBasis: graphFlexBasis }"
      >
        <!--
          From the click until the new run can be drawn, the graph still shows the *previous*
          run. Leaving it live would let the user read a stale picture as the new run's, so we
          gray it out and say what we are waiting for. It sits on top rather than replacing the
          graph — losing the picture entirely reads as if something broke.
        -->
        <div
          v-if="runStarting"
          class="run-viewer__starting"
          :class="{ 'run-viewer__starting--inflow': runStartTimedOut }"
          data-testid="workflow-run-starting"
        >
          <!--
            Still waiting. Nothing is wrong yet, so this says only what it is waiting for.
          -->
          <template v-if="!runStartTimedOut">
            <span class="run-viewer__running-spinner" aria-hidden="true" />
            <p class="run-viewer__starting-title">Preparing run data…</p>
            <p class="run-viewer__starting-hint">
              The run has been requested. Waiting until it appears in the run
              history — the graph below still shows the previous run until then.
            </p>
          </template>

          <!--
            The wait ran out. **Do not say the run failed** — the engine took the request and
            may be running it right now; what we know is that we could not confirm it. Saying
            nothing and quietly redrawing (what this used to do) is worse: the screen comes
            back looking normal while the run is nowhere to be seen.
          -->
          <template v-else>
            <p
              class="run-viewer__starting-title run-viewer__starting-title--warn"
              data-testid="workflow-run-start-timeout"
            >
              Cannot find the run information yet
            </p>
            <!--
              One sentence per line. Run together as a single paragraph, the three things this
              says — what happened, what it might mean, what we are asking — blur into one.
            -->
            <p class="run-viewer__starting-hint">
              It has been a while, but the run you started has not appeared yet.
            </p>
            <p class="run-viewer__starting-hint">
              Something may be wrong with the server.
            </p>
            <p class="run-viewer__starting-hint">What would you like to do?</p>
            <p
              v-if="runStartError"
              class="run-viewer__starting-error"
              data-testid="workflow-run-start-error"
            >
              {{ runStartError }}
            </p>
            <div class="run-viewer__starting-actions">
              <p-button
                data-testid="workflow-run-start-keep-waiting"
                size="sm"
                style-type="primary"
                @click="keepWaitingForRun"
              >
                Keep waiting
              </p-button>
              <p-button
                data-testid="workflow-run-start-stop-waiting"
                size="sm"
                style-type="tertiary"
                @click="stopWaitingForRun"
              >
                Cancel
              </p-button>
            </div>
            <!--
              "Cancel" is about *this wait*, not about the run. Nothing here stops a run, and a
              user who reads it the other way would walk away believing they had stopped it.
            -->
            <!--
              Sits apart from the buttons on purpose. Pressed up against them it reads as a
              label *on* the buttons, and the error box above starts to look as though it
              contained them too.
            -->
            <p class="run-viewer__starting-hint run-viewer__starting-note">
              Cancelling stops waiting only — it does not stop the run, which
              may still be going. The screen is refreshed so it shows where
              things actually stand.
            </p>
          </template>
        </div>

        <!--
          Progress appears in the row above the graph *only while it is running*.
          Leaving the bar on a finished run keeps a 100%-filled bar stuck there, which
          reads as "is something still running now?". A finished run's result is already
          told by the status badge in the header and the graph colors. (The reason it does
          not *overlap on top of* the graph is that it would hide tasks.)
        -->
        <div
          v-if="runInProgress && graph.nodes.length"
          class="run-viewer__progress"
          data-testid="workflow-run-progress"
          :data-state="selectedRun?.state ?? 'none'"
        >
          <span class="run-viewer__progress-state">
            <span class="run-viewer__progress-dot" />
            {{ taskStateLabel(selectedRun?.state) }}
          </span>
          <div class="run-viewer__progress-track">
            <div
              class="run-viewer__progress-fill"
              :style="{ width: `${progress.percent}%` }"
            />
          </div>
          <span
            class="run-viewer__progress-count"
            data-testid="workflow-run-progress-count"
          >
            {{ progress.done }} / {{ progress.total }} tasks
            <template v-if="progress.failed">
              · {{ progress.failed }} failed
            </template>
          </span>
        </div>

        <!--
          The progress bar only moves when a task finishes, so during a long task nothing on
          this screen changes and it reads as frozen. This sits in the gap between the bar and
          the graph — the empty strip you look at while waiting — and keeps moving: a spinner,
          the name of the task being waited on, and a second counter that ticks.
        -->
        <div
          v-if="runInProgress && graph.nodes.length"
          class="run-viewer__running"
          data-testid="workflow-run-running"
        >
          <!--
            Not PSpinner: it only comes in gray, and on this near-white panel a gray ring at
            its 2s turn is easy to miss — which is the one thing this indicator must not be.
            This is the same spinner the running node carries, so the two read as one signal.
          -->
          <span class="run-viewer__running-spinner" aria-hidden="true" />
          <span
            v-if="runningTaskNames.length"
            class="run-viewer__running-text"
            data-testid="workflow-run-running-tasks"
          >
            Running: {{ runningTaskNames.join(', ') }}
            <span v-if="elapsedText" class="run-viewer__running-elapsed">
              · elapsed
              <b data-testid="workflow-run-elapsed">{{ elapsedText }}</b>
            </span>
          </span>
          <!--
            Between tasks nothing is running for a moment. Saying "Running: —" would be a lie,
            so we name what is actually happening and count from the run's own start instead —
            hence the different wording on the elapsed time, which now means something else.
          -->
          <span
            v-else
            class="run-viewer__running-text"
            data-testid="workflow-run-running-tasks"
          >
            Waiting for the next task to start
            <span v-if="elapsedText" class="run-viewer__running-elapsed">
              · run elapsed
              <b data-testid="workflow-run-elapsed">{{ elapsedText }}</b>
            </span>
          </span>
        </div>

        <!--
          A just-created workflow briefly can't be read, because the engine hasn't
          registered the DAG yet. Showing "no tasks to display" at that moment is **not
          true** — it's not that there are no tasks, it's that we couldn't read them yet,
          and the user misreads the workflow as empty. So we state that we are waiting
          until it can be read.
        -->
        <div
          v-if="workflowReadyState === 'waiting'"
          ref="waitingRef"
          class="run-viewer__waiting"
          data-testid="workflow-run-waiting"
        >
          <p-spinner size="lg" />
          <p class="run-viewer__waiting-title">Preparing workflow data…</p>
          <p class="run-viewer__waiting-hint">
            Waiting until the workflow can be read. The graph appears here once
            it is ready.
          </p>
        </div>
        <div
          v-else-if="workflowReadyState === 'timeout'"
          class="run-viewer__empty"
          data-testid="workflow-run-waiting"
        >
          This workflow could not be read yet. Open it again in a moment.
        </div>
        <div v-else-if="!graph.nodes.length" class="run-viewer__empty">
          No tasks to display.
        </div>
        <run-graph
          v-else
          :graph="graph"
          :instances="instances"
          :selected-task-id="selectedTaskId"
          :rerun-preview-ids="rerunPreviewIds"
          @select="selectTask"
        />
      </div>

      <aside class="run-viewer__panel" data-testid="workflow-run-task-detail">
        <template v-if="selectedNode">
          <h4 class="run-viewer__panel-title">{{ selectedNode.name }}</h4>
          <dl class="run-viewer__dl">
            <dt>State</dt>
            <dd>
              <p-badge
                data-testid="workflow-run-task-state"
                :badge-type="taskStateBadgeType(selectedInstance?.state)"
              >
                {{ taskStateLabel(selectedInstance?.state) }}
              </p-badge>
            </dd>
            <dt>Component</dt>
            <dd>{{ selectedNode.taskComponent }}</dd>
            <dt>Group</dt>
            <dd>{{ selectedNode.groupName }}</dd>
            <dt>Try</dt>
            <dd>{{ selectedInstance?.try_number ?? 0 }}</dd>
            <dt>Start</dt>
            <dd>{{ selectedInstance?.start_date || '-' }}</dd>
            <dt>End</dt>
            <dd>{{ selectedInstance?.end_date || '-' }}</dd>
            <dt>Duration</dt>
            <dd>{{ formatDuration(selectedInstance?.duration_date) }}</dd>
          </dl>

          <!--
            What this task produced. For now only SW migration results — query it only
            when the engine attached an execution ID to the task. If there is none, don't
            silently leave an empty screen; say so (an empty screen reads as "no software
            is installed").
          -->
          <div class="run-viewer__result" data-testid="workflow-run-result">
            <h5>Result</h5>
            <p-button
              v-if="swExecutionIds.length"
              data-testid="workflow-run-result-sw-btn"
              size="sm"
              style-type="tertiary"
              @click="showSwResult = true"
            >
              View installed software
            </p-button>
            <p
              v-else
              class="run-viewer__hint"
              data-testid="workflow-run-result-empty"
            >
              No result to show for this task.
            </p>
          </div>

          <!-- If it failed, show why right there -->
          <div
            v-if="canShowLog"
            class="run-viewer__logs"
            data-testid="workflow-run-logs"
          >
            <h5>Logs</h5>
            <div class="run-viewer__try-row">
              <p-button
                v-for="n in tryNumbers"
                :key="n"
                data-testid="workflow-run-log-try"
                :data-try="n"
                size="sm"
                :style-type="selectedTryNumber === n ? 'primary' : 'tertiary'"
                @click="loadLog(n)"
              >
                Try {{ n }}
              </p-button>
            </div>

            <p v-if="logLoading" class="run-viewer__hint">Loading…</p>
            <p v-else-if="logError" class="run-viewer__error">{{ logError }}</p>

            <template v-else-if="logText">
              <div v-if="failureSummary">
                <div class="run-viewer__param-key">
                  Failure (excerpt from log)
                </div>
                <pre
                  class="run-viewer__failure"
                  data-testid="workflow-run-failure"
                  >{{ failureSummary }}</pre
                >
              </div>
              <!-- If no cause was found, don't make one up; say so -->
              <p
                v-else-if="selectedInstance?.state === 'failed'"
                class="run-viewer__hint"
              >
                No failure cause found in the log. Check the full log below.
              </p>
              <div class="run-viewer__try-row">
                <p-tooltip
                  contents="Saves the log of the selected try as a text file."
                  position="bottom"
                  :options="{ classes: ['p-tooltip', 'run-viewer-tooltip'] }"
                >
                  <p-button
                    data-testid="workflow-run-log-download"
                    size="sm"
                    style-type="tertiary"
                    @click="downloadLog"
                  >
                    Download log
                  </p-button>
                </p-tooltip>
              </div>
              <details class="run-viewer__log-details">
                <summary>Full log</summary>
                <pre class="run-viewer__log" data-testid="workflow-run-log">{{
                  logText
                }}</pre>
              </details>
            </template>
          </div>

          <div
            v-if="selectedRun"
            class="run-viewer__rerun"
            data-testid="workflow-rerun"
          >
            <h5>Re-run from this task</h5>
            <p class="run-viewer__hint">
              You will be shown exactly which tasks would run again, and asked
              to confirm, before anything is executed. To re-run every failed
              task in this run, use "Re-run failed tasks" above.
            </p>
            <div class="run-viewer__rerun-buttons">
              <p-tooltip
                v-for="scope in RERUN_SCOPES"
                :key="scope.key"
                :contents="scope.hint"
                position="bottom"
                :options="{ classes: ['p-tooltip', 'run-viewer-tooltip'] }"
              >
                <p-button
                  data-testid="workflow-rerun-scope"
                  :data-scope="scope.key"
                  size="sm"
                  style-type="tertiary"
                  :disabled="rerunPending || runInProgress"
                  @click="requestRerun(scope.key)"
                >
                  {{ scope.label }}
                </p-button>
              </p-tooltip>
            </div>
          </div>

          <div class="run-viewer__params" data-testid="workflow-run-params">
            <h5>Parameters</h5>
            <!--
              The engine does not return the values used in that run. The values below are
              always those of the *current definition*, so if the definition changed after
              the run they may differ.
            -->
            <p
              v-if="definitionChangedAfterRun"
              class="run-viewer__param-warning"
              data-testid="workflow-run-param-warning"
            >
              ⚠ The workflow was modified after this run. These are the current
              definition's values and may differ from the ones this run actually
              used.
            </p>
            <p v-else class="run-viewer__hint">
              Values from the current definition.
            </p>

            <p v-if="!selectedParams.length" class="run-viewer__hint">
              No parameters saved on this task.
            </p>
            <div v-for="param in selectedParams" :key="param.key">
              <div class="run-viewer__param-key">{{ param.key }}</div>
              <pre class="run-viewer__param-value">{{ param.value }}</pre>
            </div>
          </div>
        </template>
        <p v-else class="run-viewer__hint">Select a task to see its details.</p>

        <!-- Tasks removed from the definition but still present in this run -->
        <div
          v-if="deletedTaskInstances.length"
          class="run-viewer__deleted"
          data-testid="workflow-run-deleted-tasks"
        >
          <h5>Deleted tasks ({{ deletedTaskInstances.length }})</h5>
          <p class="run-viewer__hint">
            Not in the current workflow definition, but part of this run.
          </p>
          <ul>
            <li v-for="item in deletedTaskInstances" :key="item.task_id">
              {{ item.task_name }} —
              <p-badge :badge-type="taskStateBadgeType(item.state)">
                {{ taskStateLabel(item.state) }}
              </p-badge>
            </li>
          </ul>
        </div>
      </aside>
    </div>

    <!--
      Re-run pre-confirmation. Which tasks re-run is decided by the engine looking at the
      actual execution graph, not by the diagram on screen. So we show the target list the
      engine returned and ask for confirmation.
    -->
    <div
      v-if="rerunTargets"
      class="run-viewer__modal run-viewer__modal--rerun"
      data-testid="workflow-rerun-confirm"
    >
      <div class="run-viewer__modal-box">
        <h4>These tasks will run again ({{ rerunTargets.length }})</h4>

        <p v-if="!rerunTargets.length" class="run-viewer__hint">
          No tasks to re-run.
        </p>
        <ul v-else class="run-viewer__rerun-list">
          <li
            v-for="t in rerunTargets"
            :key="t.task_id"
            data-testid="workflow-rerun-target"
          >
            <strong>{{ t.task_name }}</strong>
            <span class="run-viewer__hint">{{ componentOf(t.task_id) }}</span>
          </li>
        </ul>

        <p class="run-viewer__hint">
          These tasks will run from the start again, and work they already did
          will be applied to the target systems again.
        </p>

        <p v-if="rerunError" class="run-viewer__error">{{ rerunError }}</p>

        <div class="run-viewer__modal-actions">
          <p-button
            data-testid="workflow-rerun-cancel"
            style-type="tertiary"
            @click="cancelRerun"
          >
            Cancel
          </p-button>
          <p-button
            data-testid="workflow-rerun-ok"
            style-type="primary"
            :disabled="!rerunTargets.length || rerunPending"
            @click="confirmRerun"
          >
            Re-run
          </p-button>
        </div>
      </div>
    </div>

    <!-- A full run cannot be undone, so do not start without confirmation -->
    <div
      v-if="showRunConfirm"
      class="run-viewer__modal"
      data-testid="workflow-run-confirm"
    >
      <!--
        The first run (Run) and later runs (Start new run) share the same modal. The two
        cases differ in what the user knows — the first run has no "run to choose" and
        nothing "to re-run", so explaining it in new-run terms would be wrong. Instead we
        tell them what is only possible at this moment, namely that *editing is possible
        only up to now*.
      -->
      <div v-if="!hasRuns" class="run-viewer__modal-box">
        <h4>Run this workflow?</h4>
        <p class="run-viewer__hint">
          The tasks will do their work on the target systems.
        </p>
        <p class="run-viewer__hint run-viewer__hint--caution">
          You can edit this workflow only before its first run. Once it has run,
          edit a copy instead — use Clone &amp; Edit.
        </p>
        <div class="run-viewer__modal-actions">
          <p-button
            data-testid="workflow-run-confirm-cancel"
            style-type="tertiary"
            @click="showRunConfirm = false"
          >
            Cancel
          </p-button>
          <p-button
            data-testid="workflow-run-confirm-ok"
            style-type="primary"
            :disabled="runStarting"
            @click="confirmRun"
          >
            Run
          </p-button>
        </div>
      </div>

      <div v-else class="run-viewer__modal-box">
        <h4>Start a new run of this workflow?</h4>
        <p class="run-viewer__hint">
          This does not re-run the run selected above. It starts a new run of
          the whole workflow from the first task, and the work those tasks do
          will be applied to the target systems again.
        </p>
        <p class="run-viewer__hint">
          To run part of the run selected above again, select a task and use
          Re-run.
        </p>
        <div class="run-viewer__modal-actions">
          <p-button
            data-testid="workflow-run-confirm-cancel"
            style-type="tertiary"
            @click="showRunConfirm = false"
          >
            Cancel
          </p-button>
          <p-button
            data-testid="workflow-run-confirm-ok"
            style-type="primary"
            :disabled="runStarting"
            @click="confirmRun"
          >
            Start new run
          </p-button>
        </div>
      </div>
    </div>

    <!-- Cloning creates one more workflow. It piles up with every click, so ask for confirmation. -->
    <div
      v-if="showCloneConfirm"
      class="run-viewer__modal"
      data-testid="workflow-clone-confirm"
    >
      <div class="run-viewer__modal-box">
        <h4>Copy this workflow and edit the copy?</h4>
        <p class="run-viewer__hint">
          A new workflow is created as a copy of this one, and the editor opens
          on the copy. The original and its run history are left untouched.
        </p>
        <p class="run-viewer__hint">
          Each copy is kept as its own workflow, so make one when you actually
          intend to change values — not to look around.
        </p>
        <!--
          For a graph the tool cannot translate as is, open the clone in the JSON editor.
        -->
        <p
          v-if="!canEditInDesigner"
          class="run-viewer__hint"
          data-testid="workflow-clone-unsupported-note"
        >
          The workflow tool cannot lay this workflow out exactly as it runs, so
          the copy opens in the JSON editor.
        </p>
        <div class="run-viewer__modal-actions">
          <p-button
            data-testid="workflow-clone-confirm-cancel"
            style-type="tertiary"
            @click="showCloneConfirm = false"
          >
            Cancel
          </p-button>
          <p-button
            data-testid="workflow-clone-confirm-ok"
            style-type="primary"
            :loading="cloning"
            :disabled="cloning"
            @click="confirmClone"
          >
            Copy &amp; Edit
          </p-button>
        </div>
      </div>
    </div>

    <!--
      When you try to edit an un-run original but the workflow tool cannot translate it as is.
      Show the reason and ask whether to go to the JSON editor.
    -->
    <div
      v-if="showEditJsonConfirm"
      class="run-viewer__modal"
      data-testid="workflow-unsupported-edit-confirm"
    >
      <div class="run-viewer__modal-box">
        <h4>Edit in the JSON editor?</h4>
        <p class="run-viewer__hint">
          The workflow tool draws a workflow as nested boxes, and this one's run
          order cannot be laid out that way. Opening it there would show
          something different from what actually runs, so edit it as JSON
          instead.
        </p>
        <ul
          v-if="designerSupport.reasons.length"
          class="run-viewer__hint"
          data-testid="workflow-unsupported-reasons"
        >
          <li v-for="(reason, i) in designerSupport.reasons" :key="i">
            {{ reason }}
          </li>
        </ul>
        <div class="run-viewer__modal-actions">
          <p-button
            data-testid="workflow-unsupported-edit-cancel"
            style-type="tertiary"
            @click="showEditJsonConfirm = false"
          >
            Cancel
          </p-button>
          <p-button
            data-testid="workflow-unsupported-edit-json"
            style-type="primary"
            @click="confirmEditJson"
          >
            Edit in JSON editor
          </p-button>
        </div>
      </div>
    </div>

    <!-- The result a task produced (SW migration install list) — reuses the existing result screen -->
    <software-migration-overlay
      :is-visible="showSwResult"
      :selected-run="selectedRun"
      :execution-ids="swExecutionIds"
      @close="showSwResult = false"
    />
  </div>
</template>

<style lang="postcss" scoped>
.run-viewer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  /* Same left/right padding as the other tab contents — without it Run history and the graph hug the left edge */
  padding: 0 1rem 1rem;
}

.run-viewer__header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/*
  Pushing the buttons to the far right leaves a large gap between the run picker and the
  buttons. Keep them to the left, and when width runs short let the button group drop to the next line.
*/
.run-viewer__header-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.run-viewer__label {
  font-size: 0.75rem;
  color: #6b6e78;
  white-space: nowrap; /* keep "Run history" from wrapping to two lines */
}

.run-viewer__actions {
  display: flex;
  flex: 0 0 auto;
  gap: 0.5rem;
}

.run-viewer__run-select {
  display: flex;
  flex: 0 1 auto;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
}

/* If the dropdown eats all the width, the buttons drop below on a narrow screen */
.run-viewer__dropdown {
  flex: 0 1 18rem;
  min-width: 14rem;
}

/* Keep the selected run label on one line. If it overflows, ellipsize rather than wrap */
.run-viewer__dropdown :deep(.p-select-dropdown) {
  white-space: nowrap;
}

.run-viewer__polling {
  font-size: 0.75rem;
  color: #6b6e78;
}

.run-viewer__meta {
  font-size: 0.75rem;
  color: #6b6e78;
}

.run-viewer__error {
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  background: #fdf3f3;
  color: #b93c3c;
  font-size: 0.8125rem;
}

.run-viewer__warning {
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  background: #fff8ef;
  color: #8a5a17;
  font-size: 0.8125rem;
}

.run-viewer__body {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
}

/*
  When width runs short, the detail panel drops below the graph. This keeps the graph from
  being squashed even when the left menu is expanded or parallel branches grow and widen the
  graph. To react to the actual remaining width rather than the viewport, we use wrap instead
  of a media query.
*/
/*
  While a run is starting, the graph below is grayed out and the overlay sits on top of it.
  `position: relative` is what the overlay anchors to.
*/
.run-viewer__graph {
  position: relative;
}

.run-viewer__graph--locked > *:not(.run-viewer__starting) {
  opacity: 0.35;
  pointer-events: none;
}

.run-viewer__starting {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 1rem;
  border-radius: 0.375rem;
  background: rgb(250 250 251 / 82%);
  text-align: center;
}

/*
  While waiting it floats over the graph — it is two short lines and the graph underneath is
  worth keeping in view. Once it turns into a message with buttons it no longer fits inside a
  small graph box, and an overlay would simply clip the title off the top. So that state takes
  its place in the flow and the box grows with it (the graph beneath stays dimmed either way).
*/
.run-viewer__starting--inflow {
  position: static;
  background: transparent;
  padding: 1rem 0.75rem 0.5rem;
}

.run-viewer__starting-title {
  font-weight: 600;
  font-size: 0.8125rem;
  color: #374151;
}

.run-viewer__starting-hint {
  font-size: 0.75rem;
  color: #6b6e78;
  max-width: 22rem;
}

.run-viewer__starting-title--warn {
  color: #8a5a17;
}

.run-viewer__starting-error {
  max-width: 22rem;
  margin-top: 0.5rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.25rem;
  background: #fdf3f3;
  color: #b93c3c;
  font-size: 0.75rem;
  word-break: break-all;
}

.run-viewer__starting-actions {
  display: flex;
  gap: 0.5rem;
  margin: 0.875rem 0 0;
}

/* keep the caveat off the buttons — see the template comment */
.run-viewer__starting-note {
  margin-top: 0.875rem;
}

.run-viewer__graph {
  /*
    flex-basis is decided by the script based on the number of parallel branches. Turning
    grow on here would make that calculation meaningless — even a serial workflow with a
    single task would split the leftover width evenly with the detail panel, using 1094px to
    draw a single node on a 2560px screen. The graph uses only its own width and sends the
    leftover horizontal space to the detail panel.
  */
  flex-grow: 0;
  flex-shrink: 1;
  min-width: 0;
  max-width: 100%;
  border: 1px solid #e5e5e8;
  border-radius: 0.375rem;
  background: #fafafb;
}

.run-viewer__empty {
  padding: 2rem;
  text-align: center;
  color: #6b6e78;
  font-size: 0.8125rem;
}

.run-viewer__waiting-title {
  font-weight: 600;
  color: #374151;
}

.run-viewer__waiting-hint {
  color: #6b6e78;
  text-align: center;
  max-width: 22rem;
}

.run-viewer__waiting {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  min-height: 12rem;
  color: #4b5563;
  font-size: 0.8125rem;
}

.run-viewer__panel {
  flex: 1 1 18rem;
  max-width: 100%;
  border: 1px solid #e5e5e8;
  border-radius: 0.375rem;
  padding: 0.875rem;
}

.run-viewer__panel-title {
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.run-viewer__dl {
  display: grid;
  /* At a fixed 4.5rem, "Component" didn't fit and the 't' spilled onto the next line */
  grid-template-columns: max-content 1fr;
  column-gap: 0.75rem;
  row-gap: 0.375rem;
  font-size: 0.8125rem;
}

.run-viewer__dl dt {
  color: #6b6e78;
  white-space: nowrap;
}

.run-viewer__hint {
  font-size: 0.8125rem;
  color: #6b6e78;
}

/* The line that warns of something irreversible — in the same gray as the rest, it gets skipped over */
.run-viewer__hint--caution {
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  background: #fff8ef;
  color: #8a5a17;
}

.run-viewer__params {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e5e8;
}

.run-viewer__params h5 {
  font-weight: 700;
  font-size: 0.8125rem;
  margin-bottom: 0.25rem;
}

.run-viewer__param-warning {
  font-size: 0.75rem;
  color: #8a5a17;
  background: #fff8ef;
  border-radius: 0.25rem;
  padding: 0.375rem 0.5rem;
  margin-bottom: 0.5rem;
}

.run-viewer__param-key {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b6e78;
}

.run-viewer__param-value {
  margin-top: 0.125rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.25rem;
  background: #f7f7f8;
  font-size: 0.6875rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 14rem;
  overflow: auto;
}

.run-viewer__logs,
.run-viewer__rerun {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e5e8;
}

.run-viewer__logs h5,
.run-viewer__rerun h5 {
  font-weight: 700;
  font-size: 0.8125rem;
  margin-bottom: 0.375rem;
}

.run-viewer__try-row,
.run-viewer__rerun-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.run-viewer__failure {
  margin-top: 0.125rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.25rem;
  background: #fdf3f3;
  color: #8a2a2a;
  font-size: 0.6875rem;
  white-space: pre-wrap;
  word-break: break-all;
}

.run-viewer__log-details {
  margin-top: 0.5rem;
  font-size: 0.75rem;
}

.run-viewer__log {
  margin-top: 0.25rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
  background: #232533;
  color: #e8e8ea;
  font-size: 0.625rem;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 20rem;
  overflow: auto;
}

.run-viewer__modal {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 35%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* During re-run confirmation the graph preview must stay visible, so place the modal toward the bottom */
.run-viewer__modal--rerun {
  align-items: flex-end;
  padding-bottom: 2rem;
  background: rgb(0 0 0 / 15%);
}

.run-viewer__modal-box {
  width: min(30rem, 92vw);
  background: #fff;
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.run-viewer__modal-box h4 {
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.run-viewer__rerun-list {
  margin-bottom: 0.75rem;
  font-size: 0.8125rem;
}

.run-viewer__rerun-list li {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.25rem 0;
  border-bottom: 1px solid #f0f0f2;
}

.run-viewer__modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.run-viewer__deleted {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e5e8;
  font-size: 0.8125rem;
}

.run-viewer__deleted h5 {
  font-weight: 700;
  margin-bottom: 0.25rem;
}
</style>

<!--
  The tooltip is rendered outside this component (on body), so scoped styles don't reach it.
  By default it comes out on one line and long text gets clipped — allow wrapping and give it width.
-->
<style scoped lang="postcss">
.run-viewer__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.25rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.run-viewer__meta div {
  display: flex;
  gap: 0.375rem;
}

.run-viewer__meta dt {
  color: #9ca3af;
}

.run-viewer__meta dd {
  color: #374151;
}

/* Progress row — above the graph box */
.run-viewer__progress {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.run-viewer__progress-state {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.run-viewer__progress-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: #2563eb;
  animation: run-viewer-blink 1s ease-in-out infinite;
}

.run-viewer__progress-track {
  flex: 1 1 auto;
  min-width: 4rem;
  height: 0.375rem;
  border-radius: 9999px;
  background: #e5e7eb;
  overflow: hidden;
}

.run-viewer__progress-fill {
  height: 100%;
  border-radius: 9999px;
  background: #2563eb;
  transition: width 0.4s ease;
}

/* A finished run takes the result color — while running, don't presume the result */
.run-viewer__progress[data-state='success'] .run-viewer__progress-fill {
  background: #16a34a;
}

.run-viewer__progress[data-state='failed'] .run-viewer__progress-fill {
  background: #dc2626;
}

.run-viewer__progress-count {
  white-space: nowrap;
}

/*
  Running strip — the gap between the progress bar and the first task box. Centered because
  that empty middle is where the eye rests while waiting, and it is the same place no matter
  how wide the graph is laid out.
*/
.run-viewer__running {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem 0.125rem;
  font-size: 0.75rem;
  color: #374151;
}

.run-viewer__running-spinner {
  flex: 0 0 auto;
  width: 0.875rem;
  height: 0.875rem;
  border: 2px solid #c7d4f7;
  border-top-color: #2563eb;
  border-radius: 9999px;
  animation: run-viewer-spin 0.9s linear infinite;
}

@keyframes run-viewer-spin {
  to {
    transform: rotate(360deg);
  }
}

/*
  Wrap at spaces, and break inside a word only when that single word is itself too wide for
  the column — a task name can be long. With break-all the sentence split mid-word
  ("...has been goi / ng for"), which reads as a rendering fault.
*/
.run-viewer__running-text {
  min-width: 0;
  text-align: center;
  overflow-wrap: anywhere;
  word-break: normal;
}

.run-viewer__running-elapsed {
  color: #6b7280;
  white-space: nowrap;
}

.run-viewer__running-elapsed b {
  /* the one number that keeps changing — it should be the thing you can find at a glance */
  color: #2563eb;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/*
  With motion turned off the ring stops, but the elapsed counter keeps ticking — the "this is
  still alive" signal survives without anything spinning.
*/
@media (prefers-reduced-motion: reduce) {
  .run-viewer__running-spinner,
  .run-viewer__progress-dot {
    animation: none;
  }
}

@keyframes run-viewer-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
}
</style>

<style lang="postcss">
.run-viewer-tooltip {
  max-width: 22rem;
}

/* Where the description came out on one line and got clipped — allow wrapping so the full text shows */
.run-viewer-tooltip .tooltip-inner {
  max-width: 22rem;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  line-height: 1.45;
  text-align: left;
}
</style>
