<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router/composables';
import { MENU_ID } from '@/entities';

/**
 * Migration Guide — the in-console entry point for "how do I actually migrate?".
 *
 * This screen is deliberately a *map*, not a manual. It lays out the five steps of a
 * migration in order and sends the user to the screen where each step happens, so a
 * first-time user is never left guessing which menu to open next.
 *
 * The written guide lives in `docs/guide/quick-start-migration.md` and stays the single
 * source of truth; this page links out to it rather than restating it, so the two cannot
 * drift apart.
 *
 * Built with plain markup on purpose — new screens should not widen the mirinae surface
 * (see DESIGN-MIRINAE "inventory": do not pull mirinae into new screens).
 *
 * ── Known limits of this first version, to be closed next ──────────────────────────
 * The guide link opens GitHub in a new tab, so the reader leaves the console. That
 * breaks the round trip this page is meant to provide:
 *
 *   1. Reading the guide loses the "which step am I on?" context.
 *   2. `activeRouteName` below reads `?from=`, but nothing sets that query yet — no
 *      screen offers a way back here — so the highlight never actually lights up.
 *   3. Without a return path, the router-links only lead outward.
 *
 * Closing it means embedding the step text here (so the reader stays in the console),
 * deriving the current step from the *actual* route instead of a hand-passed query,
 * and giving each step screen a way back. Kept out of this change on purpose: the
 * written guide had to be verified against the real screens first.
 */

type Step = {
  no: number;
  title: string;
  /** One entry per sentence: each starts on its own line and still wraps on narrow screens. */
  detail: string[];
  routeName: string;
  testId: string;
  /**
   * A written guide that goes deeper than this step's one line, when one exists.
   *
   * Rendered *outside* the step's link — a link inside a link is not valid markup and the
   * inner one stops working.
   */
  guide?: { title: string; file: string };
};

/** The guides live with the source, so they move with it and cannot drift into a stale copy */
const GUIDE_BASE =
  'https://github.com/cloud-barista/cm-butterfly/blob/main/docs/guide/';

function guideUrlFor(file: string): string {
  return GUIDE_BASE + file;
}

const steps: Step[] = [
  {
    no: 1,
    title: 'Register Source Service',
    detail: [
      'Register the servers you want to migrate.',
      'Each connection is one source server, reached over SSH.',
    ],
    routeName: MENU_ID.SOURCE_SERVICES,
    testId: 'migration-guide-step-source-service',
    guide: {
      title: 'Bulk import of source connections',
      file: 'source-connection-bulk-import.md',
    },
  },
  {
    no: 2,
    title: 'Create Source Model',
    detail: [
      'Collect from the servers you registered, on the same Source Services screen, and save the result as a source model.',
      'Everything after this is built from that model.',
    ],
    routeName: MENU_ID.SOURCE_MODELS,
    testId: 'migration-guide-step-source-model',
  },
  {
    no: 3,
    title: 'Create Target Model',
    detail: [
      'A target model is generated from the source model.',
      'Adjust the values you want and save it as a custom model.',
    ],
    routeName: MENU_ID.TARGET_MODELS,
    testId: 'migration-guide-step-target-model',
  },
  {
    no: 4,
    title: 'Create Workflow',
    detail: [
      'Create the migration workflow straight from a target model.',
      'You can also build one yourself in the workflow editor.',
    ],
    routeName: MENU_ID.WORKFLOWS,
    testId: 'migration-guide-step-create-workflow',
    guide: {
      title: 'Running workflow tasks in parallel',
      file: 'workflow-parallel-steps.md',
    },
  },
  {
    no: 5,
    title: 'Edit and Run Workflow',
    detail: [
      'Open the workflow you want and change any value it needs.',
      'Run it when it is ready - the migration happens here.',
    ],
    routeName: MENU_ID.WORKFLOWS,
    testId: 'migration-guide-step-run-workflow',
    guide: {
      title: 'Reading the run status screen',
      file: 'workflow-run-status.md',
    },
  },
];

const route = useRoute();

/**
 * Highlight the step matching the screen the user came from, so the guide doubles as a
 * "where am I in the migration?" indicator rather than a static list.
 */
const activeRouteName = computed(() => String(route.query.from ?? ''));

function isActive(step: Step): boolean {
  return (
    activeRouteName.value !== '' && activeRouteName.value === step.routeName
  );
}

const guideUrl = guideUrlFor('quick-start-migration.md');
</script>

<template>
  <div class="max-w-3xl p-6" data-testid="migration-guide-page">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Migration Guide</h1>
      <p class="mt-2 text-sm text-gray-600">
        A migration runs through the five steps below, in order. Select a step
        to open the screen where it happens. The help icon at the top right
        shows help for whichever screen you are on.
      </p>
    </header>

    <ol class="flex flex-col" data-testid="migration-guide-steps">
      <li v-for="(step, index) in steps" :key="step.no" class="flex flex-col">
        <router-link
          :to="{ name: step.routeName }"
          :data-testid="step.testId"
          class="group flex items-start gap-4 rounded-lg border p-4 transition-colors hover:border-blue-400 hover:bg-blue-50"
          :class="
            isActive(step)
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white'
          "
        >
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
            :class="
              isActive(step)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700'
            "
          >
            {{ step.no }}
          </span>
          <span class="flex flex-1 flex-col">
            <span class="text-base font-medium text-gray-900">{{
              step.title
            }}</span>
            <span class="mt-1 text-sm text-gray-600">
              <span v-for="(line, l) in step.detail" :key="l" class="block">{{
                line
              }}</span>
            </span>
          </span>
          <span
            class="self-center text-lg text-gray-300 transition-colors group-hover:text-blue-500"
            aria-hidden="true"
            >&rsaquo;</span
          >
        </router-link>

        <!--
          The run between two steps. The line sits under the middle of the number
          badge (badge 2rem wide, inside 1rem of card padding, so its centre is at
          2rem) and carries the guide link beside it, which keeps the column of
          numbers, the line and the links on one axis - the eye then reads the
          steps as a sequence rather than as five separate boxes.

          It sits outside the step because the step itself is a link, and a link
          inside a link does not work.
        -->
        <div class="flex items-center gap-3" :class="step.guide ? 'py-1' : ''">
          <span
            class="ml-8 h-6 w-px shrink-0"
            :class="index < steps.length - 1 ? 'bg-gray-300' : 'bg-transparent'"
            aria-hidden="true"
          />
          <!--
            Say it is a document before it is clicked. On its own the title read
            as a caption, and you only learned it was a link by pressing it.
          -->
          <a
            v-if="step.guide"
            :href="guideUrlFor(step.guide.file)"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-xs text-blue-600"
            :data-testid="`${step.testId}-guide`"
          >
            <svg
              class="h-3 w-3 shrink-0"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M4 1.5h5.2L13 5.3V14a.5.5 0 0 1-.5.5h-8A.5.5 0 0 1 4 14V1.5Zm1 1V13.5h7V6H8.7V2.5H5Zm4.7.7V5H12L9.7 3.2ZM6 7.5h5v1H6v-1Zm0 2.5h5v1H6v-1Z"
              />
            </svg>
            <span class="underline">Guide: {{ step.guide.title }}</span>
            <span class="text-gray-400">&#8599;</span>
          </a>
        </div>
      </li>
    </ol>

    <!--
      The boxes give the order; this says what the order is made of. Someone
      arriving here does not yet know what a model is or why there are two of
      them, and that is the question the steps alone leave open.
    -->
    <section class="mt-8 flex flex-col gap-3 text-sm text-gray-700">
      <h2 class="text-base font-semibold text-gray-900">
        What the steps are made of
      </h2>
      <p>
        A migration moves a workload from the servers you have to somewhere
        else, usually a cloud. It does that through models - a machine or its
        software written in the shape this system works with.
      </p>
      <p>
        A <strong>source model</strong> describes the origin: the servers you
        are migrating from. A <strong>target model</strong> describes the same
        workload for the destination. Both are models; they differ only in which
        side they describe. Change either one's values and save it under a new
        name and you have a <strong>custom model</strong>, with the original
        left as it was.
      </p>
      <p>
        A <strong>workflow</strong> is generated from a target model and is what
        actually carries the migration out. It is also the last place values can
        be changed before anything is created, which is why adjusting there is
        often easiest - the target model is already in the destination's shape,
        and the workflow is the final word.
      </p>
      <p>
        Target models and workflows can be exported to a file and imported back,
        so one that works can be kept and reused like a template.
      </p>
      <p>
        Infrastructure and software follow the same five steps. Infrastructure
        recommendations come with an estimated cost to choose by; software
        recommendations come with a list of what to install, and expect the
        infrastructure to exist already.
      </p>
    </section>

    <footer class="mt-6 text-sm text-gray-600">
      <span>
        Looking for the full walkthrough, including software migration and load
        testing?
      </span>
      <a
        :href="guideUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 text-blue-600"
        data-testid="migration-guide-full-doc"
      >
        <svg class="h-3 w-3 shrink-0" viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 1.5h5.2L13 5.3V14a.5.5 0 0 1-.5.5h-8A.5.5 0 0 1 4 14V1.5Zm1 1V13.5h7V6H8.7V2.5H5Zm4.7.7V5H12L9.7 3.2ZM6 7.5h5v1H6v-1Zm0 2.5h5v1H6v-1Z"
          />
        </svg>
        <span class="underline">Guide: Quick start</span>
        <span class="text-gray-400">&#8599;</span>
      </a>
    </footer>
  </div>
</template>

<style scoped lang="postcss"></style>
