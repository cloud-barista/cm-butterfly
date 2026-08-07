<script setup lang="ts">
import { useMciListModel } from '@/widgets/workload/mci/mciList/model';
import {
  PButton,
  PHorizontalLayout,
  PToolboxTable,
  PBadge,
  PSelectDropdown,
} from '@cloudforet-test/mirinae';
import {
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  reactive,
  computed,
  ref,
  watch,
  nextTick,
} from 'vue';
import MciDeleteModal from './MciDeleteModal.vue';
import LifecycleControlModal from '@/features/workload/lifecycleControl/ui/LifecycleControlModal.vue';
import {
  LIFECYCLE_ACTIONS,
  LIFECYCLE_ACTION_ORDER,
  type ILifecycleTarget,
} from '@/features/workload/lifecycleControl/model';
import type { LifecycleAction } from '@/entities/mci/api';
import TableLoadingSpinner from '@/shared/ui/LoadingSpinner/TableLoadingSpinner.vue';
import DynamicTableIconButton from '@/shared/ui/Button/dynamicIconButton/DynamicTableIconButton.vue';
import { insertDynamicComponent } from '@/shared/utils';
import { useDynamicTableHeight } from '@/shared/hooks/table/useDynamicTableHeight';
import { useToolboxTableHeight } from '@/shared/hooks/table/useToolboxTableHeight';
import {
  allDeleteRecords,
  getDeleteRecord,
  type DeleteRecord,
} from '@/entities/mci/lib/deleteTracker';

interface IProps {
  nsId: string;
}

const props = defineProps<IProps>();
const emit = defineEmits(['selectRow']);

const {
  mciTableModel,
  initToolBoxTableModel,
  fetchMciList,
  followTransition,
  stopFollowing,
  stopFollowingDeletes,
  loading,
  retryNotice,
} = useMciListModel(props);

const { dynamicHeight, minHeight, maxHeight } = useDynamicTableHeight(
  computed(() => mciTableModel.tableState.items.length),
  computed(() => mciTableModel.tableOptions.pageSize),
);

const { toolboxTableRef, adjustedDynamicHeight } = useToolboxTableHeight(
  computed(() => dynamicHeight.value),
);

const tableKey = ref(0); // bumped to force the table to re-render

const mciCreateModalState = reactive({
  open: false,
  props: {},
});

const isActionDisabled = computed(() => {
  return mciTableModel.tableState.selectIndex.length === 0;
});

// Lifecycle actions only. Delete sits in the toolbar as an icon next to refresh, where every
// other list in the console keeps it.
const actionState = reactive({
  actionMenus: computed(() =>
    LIFECYCLE_ACTION_ORDER.map(action => ({
      name: action,
      label: LIFECYCLE_ACTIONS[action].label,
      disabled: isActionDisabled.value,
    })),
  ),
  selectedActionItem: '',
});

const deleteModalState = reactive({
  visible: false,
});

const lifecycleModalState = reactive({
  visible: false,
  action: null as LifecycleAction | null,
});

const selectedMciList = computed(() => {
  return mciTableModel.tableState.selectIndex.map(index => {
    return mciTableModel.tableState.displayItems[index];
  });
});

/**
 * The selected rows as lifecycle targets.
 *
 * In cb-tumblebug an infra's id *is* its name, but the two are read from different fields and the
 * one the API needs is the id — falling back to the name only when the row has no id.
 */
const lifecycleTargets = computed<ILifecycleTarget[]>(() =>
  selectedMciList.value.map(item => ({
    id: item?.id ?? item?.name ?? '',
    name: item?.name ?? '',
    status: item?.status,
  })),
);

function handleAction(item: string) {
  if (LIFECYCLE_ACTION_ORDER.includes(item as LifecycleAction)) {
    lifecycleModalState.action = item as LifecycleAction;
    lifecycleModalState.visible = true;
  }
}

/**
 * Puts the delete button in the table's toolbar, beside refresh.
 *
 * Every other list in the console carries delete there, so this one did not belong in the
 * action dropdown. The toolbar is drawn by the table component and has no slot for that spot,
 * so the button is mounted into it — the same way the other lists do it.
 *
 * The table is re-rendered on every load (`tableKey`), which throws the mounted node away, so
 * this runs after each load and checks whether the node is still there.
 */
function mountDeleteButton() {
  const table = toolboxTableRef.value?.$el as HTMLElement | undefined;
  const toolGroup = table?.querySelector('.right-tool-group');
  if (
    !toolGroup ||
    toolGroup.querySelector('[data-testid="mci-delete-action"]')
  )
    return;

  insertDynamicComponent(
    DynamicTableIconButton,
    { name: 'ic_delete', testid: 'mci-delete-action' },
    {
      // Same behaviour the dropdown item had: open the dialog for whatever is selected.
      // Deciding what can actually be deleted is the dialog's job — a workload already being
      // deleted is left out there rather than being kept out of the dialog.
      click: () => {
        if (mciTableModel.tableState.selectIndex.length > 0) {
          deleteModalState.visible = true;
        }
      },
    },
    toolGroup as HTMLElement,
    'prepend',
  );
}

async function handleDeleted() {
  await fetchMciList();
  // re-render once the data has loaded
  tableKey.value++;
}

/**
 * The action was accepted — now show it happening.
 *
 * Refresh once so the workload flips to Suspending/Rebooting straight away, then keep re-reading
 * the list until it settles. Without that second part the row would sit on the transitional status
 * for ever and read as stuck.
 */
async function handleLifecycleRequested() {
  const ids = lifecycleTargets.value.map(t => t.id).filter(Boolean);
  await fetchMciList();
  tableKey.value++;
  followTransition(ids);
}

function handleSelectedIndex(index: number[]) {
  if (index.length === 1) {
    const selectedData = mciTableModel.tableState.displayItems[index[0]];
    if (selectedData) {
      emit('selectRow', selectedData.name);
    } else {
      emit('selectRow', '');
    }
  } else {
    emit('selectRow', '');
  }
}

// ── Delete status ──────────────────────────────────────────────────────────
// Shows a `Delete Status` column for any listed infra that has a delete request against it.
// With no delete requests at all, the column does not appear.

/** Narrows the delete records to those matching the rows currently on screen. */
function activeRecords(): DeleteRecord[] {
  const uids = new Set(
    mciTableModel.tableState.displayItems.map((it: any) => it?.uid),
  );
  return allDeleteRecords().filter(r => uids.has(r.uid));
}

const hasActiveDeletes = computed(() => activeRecords().length > 0);

/** Looks up one row's delete record from the slot. */
function deleteStatusOf(uid: string): DeleteRecord | undefined {
  return getDeleteRecord(uid);
}

// Add the `Delete Status` column only while delete requests exist; drop it otherwise.
const DELETE_STATUS_FIELD = { name: 'deleteStatus', label: 'Delete Status' };
watch(hasActiveDeletes, active => {
  const fields = mciTableModel.tableState.fields;
  const idx = fields.findIndex((f: any) => f.name === 'deleteStatus');
  if (active && idx === -1) {
    // insert right after the first column (name)
    const nameIdx = fields.findIndex((f: any) => f.name === 'name');
    fields.splice(nameIdx === -1 ? 0 : nameIdx + 1, 0, {
      ...DELETE_STATUS_FIELD,
    });
  } else if (!active && idx !== -1) {
    fields.splice(idx, 1);
  }
});

// Whether a delete has *finished* is decided by deleteTracker, which runs app-wide so results
// arrive even while another screen is open. What this screen adds is re-reading the list while
// any row is being deleted — a finished delete has to leave the table, and the row's status has
// to stop saying "In progress". Without it the screen stays as it was when it opened, which is
// what the dialog's "you can leave and follow it in the list" would otherwise be promising.

onBeforeMount(() => {
  initToolBoxTableModel();
});

onMounted(async () => {
  await fetchMciList();
  // re-render after the initial data load
  tableKey.value++;
});

// The table is thrown away and drawn again on every load, taking the mounted delete button with
// it, so it is put back once the table is on screen again.
watch(
  [loading, tableKey],
  () => {
    if (loading.value) return;
    nextTick(mountDeleteButton);
  },
  { immediate: true },
);

// Leaving the screen ends the transition watch. It only exists to keep *this* list honest.
onBeforeUnmount(() => {
  stopFollowing();
  stopFollowingDeletes();
});
</script>

<template>
  <div>
    <p-horizontal-layout :key="tableKey" :height="adjustedDynamicHeight">
      <template #container="{ height }">
        <!--
          Loading, and while it is waiting to ask again, why.

          The lookup shares a per-second allowance with everything else that reaches the linked
          system through cm-beetle — including its own work while a delete or a migration runs.
          Being turned away is ordinary and resolves itself, so it belongs *in* the loading
          state rather than in a notice beside it: the screen is still working, and a separate
          banner would read as though it had stopped.
        -->
        <table-loading-spinner
          :loading="loading"
          :height="height"
          :message="
            retryNotice
              ? 'The server is handling as many lookups as it can.'
              : 'Loading Infra list...'
          "
        >
          <template #detail>
            <p
              v-if="retryNotice"
              class="list-retry-detail"
              data-testid="mci-list-retry-notice"
            >
              <!-- The count and its unit are kept on one line; split apart they read as
                   two separate things rather than as a time. -->
              <span class="list-retry-wait"
                >Retrying in
                <b data-testid="mci-list-retry-seconds">{{
                  retryNotice.seconds
                }}</b>
                {{ retryNotice.seconds === 1 ? 'second' : 'seconds' }}</span
              >
              <span class="list-retry-count" data-testid="mci-list-retry-count"
                >Retry {{ retryNotice.attempt }}/{{
                  retryNotice.maxRetries
                }}</span
              >
            </p>
          </template>
        </table-loading-spinner>

        <!-- table once loading has finished -->
        <p-toolbox-table
          v-if="!loading"
          ref="toolboxTableRef"
          data-testid="mci-list-table"
          :items="mciTableModel.tableState.displayItems"
          :fields="mciTableModel.tableState.fields"
          :total-count="mciTableModel.tableState.tableCount"
          :style="{ height: `${height}px` }"
          :sortable="mciTableModel.tableOptions.sortable"
          :sort-by="mciTableModel.tableOptions.sortBy"
          :selectable="mciTableModel.tableOptions.selectable"
          :multi-select="mciTableModel.tableOptions.multiSelect"
          :search-type="mciTableModel.tableOptions.searchType"
          :key-item-sets="mciTableModel.querySearchState.keyItemSet"
          :value-handler-map="mciTableModel.querySearchState.valueHandlerMap"
          :query-tag="mciTableModel.querySearchState.queryTag"
          :select-index.sync="mciTableModel.tableState.selectIndex"
          :page-size="mciTableModel.tableOptions.pageSize"
          @change="mciTableModel.handleChange"
          @refresh="() => fetchMciList()"
          @select="handleSelectedIndex"
        >
          <template #toolbox-left>
            <p-select-dropdown
              data-testid="mci-action-dropdown"
              placeholder="Action"
              :menu="actionState.actionMenus"
              :selected.sync="actionState.selectedActionItem"
              reset-selected-on-unmounted
              class="mr-2"
              @select="handleAction"
            >
              <!--
                Identifiers for the menu items.

                mirinae's PContextMenu copies only the props it knows from each menu entry, so a
                data-testid put on the entry object is dropped without a word. Drawing the label
                through this slot is the way to attach one. The slot must always render an element
                (DESIGN-MIRINAE §1.7).
              -->
              <template #menu-item--format="{ item }">
                <span :data-testid="`mci-action-${item.name}`">{{
                  item.label
                }}</span>
              </template>
            </p-select-dropdown>
            <p-button
              style-type="primary"
              icon-left="ic_plus_bold"
              disabled
              @click="mciCreateModalState.open = true"
            >
              Create
            </p-button>
          </template>
          <!--
            The infrastructure's own id, marked so it can be addressed directly.

            A migration names what it creates from the prefix it was given, so a test that goes
            looking for a name is relying on a naming rule holding - and cannot tell this run's
            infrastructure from one left behind by an earlier run. The id is the thing that is
            actually unique, so it is carried on the cell as well as shown in it.

            Both identifiers go on: the id is what the APIs are addressed by, and the uid is what
            the platform assigns and what other records point at. Which one is to hand depends on
            where you came from, so neither is left out.
          -->
          <template #col-id-format="{ item }">
            <span
              :data-testid="`mci-row-${item.id}`"
              :data-infra-id="item.id"
              :data-infra-uid="item.uid"
            >
              {{ item.id }}
            </span>
          </template>
          <template #col-provider-format="{ item, field }">
            <p-badge
              v-for="(provider, index) in item.provider"
              :key="index"
              :background-color="provider.color"
              class="mr-1"
            >
              {{ provider.name }}
            </p-badge>
          </template>
          <template #col-deleteStatus-format="{ item }">
            <span
              v-if="deleteStatusOf(item.uid)?.status === 'Handling'"
              class="delete-status handling"
              data-testid="wl-row-delete-status"
            >
              <span class="spinner" /> In progress
            </span>
            <!--
              The reason is carried twice. The styled popover can be clipped by the table's
              scroll area, so a native `title` carries it as well — the browser draws that one
              and no container can trap it. With no reason, say where one can be obtained.
            -->
            <span
              v-else-if="deleteStatusOf(item.uid)?.status === 'Error'"
              class="delete-status error-cell"
              data-testid="wl-row-delete-status"
              :title="
                deleteStatusOf(item.uid)?.errorReason ||
                'No reason was returned. Deleting it again shows the reason before it starts.'
              "
            >
              Failed
              <span
                v-if="deleteStatusOf(item.uid)?.errorReason"
                class="error-popover"
                data-testid="wl-delete-error-popover"
                >{{ deleteStatusOf(item.uid)?.errorReason }}</span
              >
            </span>
          </template>
        </p-toolbox-table>
      </template>
    </p-horizontal-layout>
    <mci-delete-modal
      :visible.sync="deleteModalState.visible"
      :selected-mci-list="selectedMciList"
      :ns-id="nsId"
      @deleted="handleDeleted"
    />
    <lifecycle-control-modal
      :visible.sync="lifecycleModalState.visible"
      :action="lifecycleModalState.action"
      scope="infra"
      :ns-id="nsId"
      :targets="lifecycleTargets"
      @requested="handleLifecycleRequested"
    />
  </div>
</template>

<style scoped lang="postcss">
.delete-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8125rem;
}
.delete-status.handling {
  color: #6b7280;
}
.delete-status .spinner {
  width: 12px;
  height: 12px;
  border: 2px solid #d1d5db;
  border-top-color: #6b7280;
  border-radius: 50%;
  animation: wl-delete-spin 0.8s linear infinite;
}
@keyframes wl-delete-spin {
  to {
    transform: rotate(360deg);
  }
}
/* The reason appears on hover with no tooltip delay, and only when there is one. */
.delete-status.error-cell {
  position: relative;
  color: #dc2626;
  font-weight: 600;
  cursor: default;
}
.delete-status.error-cell .error-popover {
  display: none;
  position: absolute;
  top: 100%;
  /* Anchored left, a long reason runs past the right edge of the table and is clipped. */
  right: 0;
  z-index: 20;
  max-width: 360px;
  padding: 8px 10px;
  background: #1f2937;
  color: #f9fafb;
  font-weight: 400;
  border-radius: 6px;
  white-space: normal;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}
.delete-status.error-cell:hover .error-popover {
  display: block;
}

/* Sits under the spinner message. Amber rather than red: nothing has failed. */
.list-retry-detail {
  margin-top: -4px;
  font-size: 13px;
  color: #92400e;
  line-height: 1.5;
  text-align: center;
}
.list-retry-wait {
  white-space: nowrap;
}
.list-retry-count {
  margin-left: 8px;
  font-family: monospace;
  color: #6b7280;
}
</style>
