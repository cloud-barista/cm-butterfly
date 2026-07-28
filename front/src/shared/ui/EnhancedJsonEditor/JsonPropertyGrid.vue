<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

interface Props {
  data: any;
  readOnly?: boolean;
  /** False while another view is on screen - keyboard shortcuts stay out of the way. */
  active?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false,
  active: true,
});

const emit = defineEmits<{
  (e: 'update:data', value: any): void;
}>();

// Track expanded paths
const expandedPaths = ref<Set<string>>(new Set());

// Search
const searchQuery = ref('');

/*
  Undo / redo state, and the flag that marks a change as our own.
  Declared here because the watcher below runs immediately during setup and reads
  them - declaring them further down left that first run reaching for bindings
  that did not exist yet, which took the whole grid down on its second open.
*/
const selfEdit = ref(false);
const undoStack = ref<string[]>([]);
const redoStack = ref<string[]>([]);
const canUndo = computed(() => undoStack.value.length > 0);
const canRedo = computed(() => redoStack.value.length > 0);

interface FlatRow {
  key: string;
  displayKey: string;
  value: any;
  depth: number;
  path: string;
  /** Path as segments. Used for every write - a key containing "." breaks a string path. */
  keys: string[];
  isExpandable: boolean;
  isExpanded: boolean;
  valueType: string;
  childCount?: number;
  isArrayItem: boolean;
}

function getValueType(value: any): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function getValueDisplay(row: FlatRow): string {
  const v = row.value;
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (Array.isArray(v)) return `Array [${v.length}]`;
  if (typeof v === 'object') return `Object {${Object.keys(v).length}}`;
  if (typeof v === 'string') return v;
  return String(v);
}

function flattenJson(
  data: any,
  parentPath: string,
  depth: number,
  isArrayParent: boolean,
  parentKeys: string[] = [],
): FlatRow[] {
  const rows: FlatRow[] = [];
  if (data === null || data === undefined || typeof data !== 'object') return rows;

  const entries: [string, any][] = Array.isArray(data)
    ? data.map((v, i) => [String(i), v])
    : Object.entries(data);

  for (const [key, value] of entries) {
    const path = `${parentPath}.${key}`;
    const keys = [...parentKeys, key];
    const isExpandable = value !== null && typeof value === 'object';
    const isExpanded = expandedPaths.value.has(path);

    rows.push({
      key,
      displayKey: isArrayParent ? `[${key}]` : key,
      value,
      depth,
      path,
      keys,
      isExpandable,
      isExpanded,
      valueType: getValueType(value),
      childCount: isExpandable
        ? (Array.isArray(value) ? value.length : Object.keys(value).length)
        : undefined,
      isArrayItem: isArrayParent,
    });

    if (isExpandable && isExpanded) {
      rows.push(
        ...flattenJson(value, path, depth + 1, Array.isArray(value), keys),
      );
    }
  }

  return rows;
}

const parsedData = computed(() => {
  if (!props.data) return {};
  if (typeof props.data === 'string') {
    try { return JSON.parse(props.data); }
    catch { return {}; }
  }
  return props.data;
});

const flatRows = computed(() => {
  return flattenJson(parsedData.value, '$', 0, Array.isArray(parsedData.value));
});

const filteredRows = computed(() => {
  if (!searchQuery.value.trim()) return flatRows.value;
  const q = searchQuery.value.toLowerCase();
  return flatRows.value.filter(row => {
    const keyMatch = row.displayKey.toLowerCase().includes(q);
    const valMatch = !row.isExpandable && getValueDisplay(row).toLowerCase().includes(q);
    return keyMatch || valMatch;
  });
});

function toggleExpand(path: string) {
  const next = new Set(expandedPaths.value);
  if (next.has(path)) {
    // Collapse: also collapse all children
    for (const p of next) {
      if (p.startsWith(path)) next.delete(p);
    }
  } else {
    next.add(path);
  }
  expandedPaths.value = next;
}

function expandAll() {
  const allPaths = new Set<string>();
  function collect(data: any, parentPath: string) {
    if (data === null || data === undefined || typeof data !== 'object') return;
    const entries: [string, any][] = Array.isArray(data)
      ? data.map((v, i) => [String(i), v])
      : Object.entries(data);
    for (const [key, value] of entries) {
      const path = `${parentPath}.${key}`;
      if (value !== null && typeof value === 'object') {
        allPaths.add(path);
        collect(value, path);
      }
    }
  }
  collect(parsedData.value, '$');
  expandedPaths.value = allPaths;
}

function collapseAll() {
  expandedPaths.value = new Set();
}

function expandToDepth(maxDepth: number) {
  const paths = new Set<string>();
  function collect(data: any, parentPath: string, depth: number) {
    if (depth >= maxDepth || data === null || data === undefined || typeof data !== 'object') return;
    const entries: [string, any][] = Array.isArray(data)
      ? data.map((v, i) => [String(i), v])
      : Object.entries(data);
    for (const [key, value] of entries) {
      const path = `${parentPath}.${key}`;
      if (value !== null && typeof value === 'object') {
        paths.add(path);
        collect(value, path, depth + 1);
      }
    }
  }
  collect(parsedData.value, '$', 0);
  expandedPaths.value = paths;
}

/*
  Default: expand first 2 levels.
  Our own edits come back through props, and collapsing the tree back to depth 2
  on every one of them would hide the entry the user just added.
*/
watch(
  parsedData,
  () => {
    if (selfEdit.value) {
      selfEdit.value = false;
      return;
    }
    undoStack.value = [];
    redoStack.value = [];
    expandToDepth(2);
  },
  { immediate: true },
);

function getTypeClass(type: string): string {
  const map: Record<string, string> = {
    string: 'type-string',
    number: 'type-number',
    boolean: 'type-boolean',
    null: 'type-null',
    array: 'type-structural',
    object: 'type-structural',
  };
  return map[type] || '';
}

// Editing state
const editingPath = ref<string | null>(null);
const editValue = ref('');

function startEdit(row: FlatRow) {
  if (props.readOnly || row.isExpandable) return;
  editingPath.value = row.path;
  editValue.value = row.valueType === 'string' ? row.value : String(row.value);
}

/* Row operations
   ------------------------------------------------------------------
   The grid is the view people actually use on these documents, because the
   library table mode only opens arrays and our models are objects at the root.
   So adding a row has to work here: keep the keys of the row we copy from, and
   the new entry arrives with every column already in place. */

function cloneData(): any {
  return JSON.parse(JSON.stringify(parsedData.value));
}

// Walk to the container that holds the row, so the last key can be written.
function containerOf(data: any, keys: string[]): any {
  let current = data;
  for (const key of keys.slice(0, -1)) current = current[key];
  return current;
}

/*
  Undo / redo.
  The tree and text views have it, and this is the third view of the same document
  - having it only there makes the table feel like someone else's screen. The stack
  holds whole documents, which is cheap enough here and cannot drift out of step
  with the parent. An edit arriving from anywhere else clears it, since the history
  belongs to the document we were handed.
*/
function currentText(): string {
  return JSON.stringify(parsedData.value, null, 2);
}

function apply(text: string) {
  selfEdit.value = true;
  emit('update:data', text);
}

function commit(data: any) {
  undoStack.value.push(currentText());
  redoStack.value = [];
  apply(JSON.stringify(data, null, 2));
}

function undo() {
  const previous = undoStack.value.pop();
  if (previous === undefined) return;
  redoStack.value.push(currentText());
  apply(previous);
}

function redo() {
  const next = redoStack.value.pop();
  if (next === undefined) return;
  undoStack.value.push(currentText());
  apply(next);
}

const canEdit = computed(() => !props.readOnly);

function copyOf(value: any): any {
  return JSON.parse(JSON.stringify(value ?? null));
}

/*
  Duplicate means one thing everywhere: copy this row, put the copy right below it.

  It used to also sit on the list row itself, where clicking it appended a child
  instead of copying the row - the same icon meaning two different things depending
  on where it sat. On a list row people reasonably expect the list to be copied, so
  the button is simply not offered there. A list is filled by duplicating one of its
  entries, which is the case that matters.
*/
function canDuplicate(row: FlatRow): boolean {
  return canEdit.value && row.isArrayItem;
}

function canRemove(row: FlatRow): boolean {
  return canEdit.value && row.keys.length > 0;
}

/*
  The copy carries the same keys as the entry it came from, so a new firewall rule
  arrives with every column in place and only the values to change.
*/
function duplicateRow(row: FlatRow) {
  if (!canDuplicate(row)) return;
  const data = cloneData();
  const container = containerOf(data, row.keys);
  if (!Array.isArray(container)) return;

  const index = Number(row.keys[row.keys.length - 1]);
  container.splice(index + 1, 0, copyOf(container[index]));
  commit(data);
}

function removeRow(row: FlatRow) {
  if (!canRemove(row)) return;
  const data = cloneData();
  const container = containerOf(data, row.keys);
  const key = row.keys[row.keys.length - 1];

  if (Array.isArray(container)) container.splice(Number(key), 1);
  else delete container[key];
  commit(data);
}

/*
  Hover hint - a real layer rather than the browser's tooltip, so the wording can
  say what the duplicate button does: it copies the entry it sits on rather than
  adding an empty one, and the copy lands right below.
*/
const hint = ref<{ x: number; y: number; text: string } | null>(null);
const duplicateHint =
  'Duplicate this entry. The copy lands just below it with every field already in place - only the values need changing.';
const removeHint =
  'Remove this entry from the document. Nothing else is touched.';

function showHint(event: MouseEvent | FocusEvent, text: string) {
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
  hint.value = { x: box.left + box.width / 2, y: box.top, text };
}

function hideHint() {
  hint.value = null;
}

/* Right-click menu - the row buttons sit at the far right of a wide table, which
   is a long way to travel when the row you want is on the left. */
const rowMenu = ref<{ x: number; y: number; row: FlatRow } | null>(null);

function openRowMenu(event: MouseEvent, row: FlatRow) {
  if (!canEdit.value || !props.active) return;
  if (!canDuplicate(row) && !canRemove(row)) return;
  event.preventDefault();
  rowMenu.value = { x: event.clientX, y: event.clientY, row };
}

/*
  A click inside the menu must not reach the document listener that closes it.
  The modifier alone would do, but Vue 2 then registers a listener with no
  handler and throws while removing it - which corrupts the patch and, among
  other things, stops cell edits from being applied.
*/
function keepMenuOpen() {}

function closeRowMenu() {
  rowMenu.value = null;
}

function runFromMenu(action: 'duplicate' | 'remove') {
  const row = rowMenu.value?.row;
  closeRowMenu();
  if (!row) return;
  if (action === 'duplicate') duplicateRow(row);
  else removeRow(row);
}

onMounted(() => {
  document.addEventListener('click', closeRowMenu);
  document.addEventListener('keydown', onKeydown);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', closeRowMenu);
  document.removeEventListener('keydown', onKeydown);
});
function onKeydown(e: KeyboardEvent) {
  if (!props.active) return;
  if (e.key === 'Escape') {
    closeRowMenu();
    return;
  }
  // While a cell is open for editing, the input owns undo.
  if (editingPath.value !== null || props.readOnly) return;
  const key = e.key.toLowerCase();
  if (!(e.ctrlKey || e.metaKey) || key !== 'z') return;
  e.preventDefault();
  if (e.shiftKey) redo();
  else undo();
}

function confirmEdit(row: FlatRow) {
  if (!editingPath.value) return;

  // Build new value with correct type
  let newValue: any = editValue.value;
  if (row.valueType === 'number') {
    const n = Number(editValue.value);
    if (!isNaN(n)) newValue = n;
  } else if (row.valueType === 'boolean') {
    newValue = editValue.value === 'true';
  } else if (editValue.value === 'null') {
    newValue = null;
  }

  // Apply change to data
  const newData = cloneData();
  containerOf(newData, row.keys)[row.keys[row.keys.length - 1]] = newValue;

  commit(newData);
  editingPath.value = null;
}

function cancelEdit() {
  editingPath.value = null;
}
</script>

<template>
  <div class="property-grid">
    <!-- Toolbar -->
    <div class="pg-toolbar">
      <div class="pg-toolbar-left">
        <button
          class="pg-btn pg-btn-icon"
          data-testid="json-grid-undo"
          title="Undo (Ctrl+Z)"
          :disabled="!canUndo"
          @click="undo"
        >
          &#8630;
        </button>
        <button
          class="pg-btn pg-btn-icon"
          data-testid="json-grid-redo"
          title="Redo (Ctrl+Shift+Z)"
          :disabled="!canRedo"
          @click="redo"
        >
          &#8631;
        </button>
        <span class="pg-toolbar-sep" />
        <button class="pg-btn" title="Expand all" @click="expandAll">
          <span class="pg-icon">&#9660;</span> Expand all
        </button>
        <button class="pg-btn" title="Collapse all" @click="collapseAll">
          <span class="pg-icon">&#9654;</span> Collapse all
        </button>
        <span class="pg-toolbar-sep" />
        <button
          class="pg-btn"
          title="Expand 2 levels"
          @click="expandToDepth(2)"
        >
          D2
        </button>
        <button
          class="pg-btn"
          title="Expand 3 levels"
          @click="expandToDepth(3)"
        >
          D3
        </button>
        <button
          class="pg-btn"
          title="Expand 5 levels"
          @click="expandToDepth(5)"
        >
          D5
        </button>
        <button
          class="pg-btn"
          title="Expand 7 levels"
          @click="expandToDepth(7)"
        >
          D7
        </button>
      </div>
      <div class="pg-toolbar-right">
        <input
          v-model="searchQuery"
          type="text"
          class="pg-search"
          placeholder="Search key or value..."
        />
      </div>
    </div>

    <!-- Table -->
    <div class="pg-table-wrapper">
      <table class="pg-table">
        <thead>
          <tr>
            <th class="pg-th-key">Property</th>
            <th class="pg-th-value">Value</th>
            <th v-if="canEdit" class="pg-th-actions">Row</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in filteredRows"
            :key="row.path"
            :class="['pg-row', `depth-${Math.min(row.depth, 8)}`]"
            @contextmenu="openRowMenu($event, row)"
          >
            <!-- Key column -->
            <td
              class="pg-cell-key"
              :style="{ paddingLeft: (row.depth * 20 + 8) + 'px' }"
            >
              <span
                v-if="row.isExpandable"
                class="pg-toggle"
                @click="toggleExpand(row.path)"
              >
                {{ row.isExpanded ? '&#9660;' : '&#9654;' }}
              </span>
              <span v-else class="pg-toggle-placeholder" />
              <span :class="['pg-key', { 'pg-key-index': row.isArrayItem }]">
                {{ row.displayKey }}
              </span>
            </td>

            <!-- Value column -->
            <td
              class="pg-cell-value"
              :class="getTypeClass(row.valueType)"
              @dblclick="startEdit(row)"
            >
              <!-- Editing mode -->
              <template v-if="editingPath === row.path">
                <input
                  v-model="editValue"
                  class="pg-edit-input"
                  @keydown.enter="confirmEdit(row)"
                  @keydown.escape="cancelEdit"
                  @blur="confirmEdit(row)"
                  ref="editInput"
                  autofocus
                />
              </template>

              <!-- Display mode -->
              <template v-else>
                <template v-if="row.isExpandable">
                  <span class="pg-type-badge">
                    {{ row.valueType === 'array' ? 'Array' : 'Object' }}
                  </span>
                  <span class="pg-count">({{ row.childCount }})</span>
                </template>
                <template v-else>
                  <span class="pg-value">{{ getValueDisplay(row) }}</span>
                </template>
              </template>
            </td>

            <!-- Row actions -->
            <td v-if="canEdit" class="pg-cell-actions">
              <button
                v-if="canDuplicate(row)"
                class="pg-row-btn"
                data-testid="json-grid-row-duplicate"
                @click="duplicateRow(row)"
                @mouseenter="showHint($event, duplicateHint)"
                @mouseleave="hideHint"
                @focus="showHint($event, duplicateHint)"
                @blur="hideHint"
              >
                <svg class="pg-row-icon" viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M10.5 1.5h-6a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1Zm-6-1h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
                  />
                  <path
                    d="M13.5 4.5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-.5h1v.5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1H13v-1h.5Z"
                  />
                </svg>
              </button>
              <button
                v-if="canRemove(row)"
                class="pg-row-btn pg-row-btn-danger"
                data-testid="json-grid-row-remove"
                @click="removeRow(row)"
                @mouseenter="showHint($event, removeHint)"
                @mouseleave="hideHint"
                @focus="showHint($event, removeHint)"
                @blur="hideHint"
              >
                <svg class="pg-row-icon" viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M6.5 1.5h3a.5.5 0 0 1 .5.5v.5h3a.5.5 0 0 1 0 1h-.554l-.7 9.1a1.5 1.5 0 0 1-1.496 1.4H5.75a1.5 1.5 0 0 1-1.496-1.4l-.7-9.1H3a.5.5 0 0 1 0-1h3V2a.5.5 0 0 1 .5-.5Zm-1.94 2 .69 9.024a.5.5 0 0 0 .5.476h4.5a.5.5 0 0 0 .5-.476l.69-9.024H4.56ZM7 5.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2 0a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Z"
                  />
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="filteredRows.length === 0">
            <td :colspan="canEdit ? 3 : 2" class="pg-empty">
              {{ searchQuery ? 'No matching results' : 'Empty data' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Hover hint -->
    <div
      v-if="hint"
      class="pg-hint"
      data-testid="json-grid-hint"
      :style="{ left: hint.x + 'px', top: hint.y + 'px' }"
    >
      {{ hint.text }}
    </div>

    <!-- Right-click menu -->
    <div
      v-if="rowMenu"
      class="pg-menu"
      data-testid="json-grid-row-menu"
      :style="{ left: rowMenu.x + 'px', top: rowMenu.y + 'px' }"
      @click.stop="keepMenuOpen"
    >
      <button
        v-if="canDuplicate(rowMenu.row)"
        class="pg-menu-item"
        data-testid="json-grid-menu-duplicate"
        @click="runFromMenu('duplicate')"
      >
        Duplicate this entry
      </button>
      <button
        v-if="canRemove(rowMenu.row)"
        class="pg-menu-item pg-menu-item-danger"
        data-testid="json-grid-menu-remove"
        @click="runFromMenu('remove')"
      >
        Remove this entry
      </button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.property-grid {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
}

/* Toolbar */
/* Matches the library menu bar, so the three views read as one screen. */
.pg-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 6px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  gap: 8px;
}

.pg-toolbar-sep {
  width: 1px;
  height: 16px;
  margin: 0 3px;
  background: #e5e7eb;
}

.pg-toolbar-left {
  display: flex;
  gap: 4px;
}

.pg-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 24px;
  padding: 0 8px;
  font-size: 11px;
  color: #374151;
  background: transparent;
  border: 0;
  border-radius: 3px;
  cursor: pointer;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #e5e7eb;
  }

  &:disabled {
    color: #d1d5db;
    cursor: default;
  }
}

.pg-btn-icon {
  justify-content: center;
  width: 26px;
  padding: 0;
  font-size: 14px;
}

.pg-icon {
  font-size: 8px;
  vertical-align: middle;
}

.pg-search {
  padding: 3px 8px;
  font-size: 12px;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  outline: none;
  width: 180px;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 1px #6366f1;
  }
}

/* Table */
.pg-table-wrapper {
  flex: 1;
  overflow: auto;
}

.pg-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.pg-th-key,
.pg-th-value,
.pg-th-actions {
  position: sticky;
  top: 0;
  padding: 6px 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  background: #f3f4f6;
  border-bottom: 2px solid #d1d5db;
  text-align: left;
  z-index: 1;
}

.pg-th-key {
  width: 45%;
}

.pg-th-value {
  width: 55%;
}

.pg-th-actions {
  width: 92px;
  text-align: right;
}

.pg-cell-actions {
  padding: 3px 6px;
  text-align: right;
  vertical-align: top;
  white-space: nowrap;
}

.pg-row-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 20px;
  padding: 0;
  margin-left: 2px;
  font-size: 12px;
  line-height: 1.4;
  color: #4b5563;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  cursor: pointer;
  opacity: 0;

  &:hover {
    background: #eef2ff;
    border-color: #c7d2fe;
    color: #4f46e5;
  }
}

.pg-row-btn-danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

/* Keep the row quiet until it is the one being worked on. */
.pg-row:hover .pg-row-btn,
.pg-row-btn:focus {
  opacity: 1;
}

.pg-hint {
  position: fixed;
  z-index: 60;
  max-width: 260px;
  padding: 6px 9px;
  font-size: 11px;
  line-height: 1.5;
  color: #f9fafb;
  background: #111827;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 18%);
  transform: translate(-50%, calc(-100% - 8px));
  pointer-events: none;
}

/* Both row icons share one box so they line up on the same baseline. */
.pg-row-icon {
  display: block;
  width: 13px;
  height: 13px;
  fill: currentcolor;
}

.pg-menu {
  position: fixed;
  z-index: 50;
  min-width: 148px;
  padding: 4px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
}

.pg-menu-item {
  display: block;
  width: 100%;
  padding: 5px 10px;
  font-size: 12px;
  color: #374151;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background: #eef2ff;
    color: #4f46e5;
  }
}

.pg-menu-item-danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.pg-row {
  border-bottom: 1px solid #f0f0f0;

  &:hover {
    background-color: #f8faff;
  }

  &.depth-0 > .pg-cell-key {
    font-weight: 600;
  }
}

/* Depth zebra-striping for visual grouping */
.pg-row.depth-0 { background-color: #ffffff; }
.pg-row.depth-1 { background-color: #fafbfc; }
.pg-row.depth-2 { background-color: #f6f8fa; }
.pg-row.depth-3 { background-color: #f3f5f7; }
.pg-row.depth-4 { background-color: #f0f2f5; }
.pg-row.depth-5,
.pg-row.depth-6,
.pg-row.depth-7,
.pg-row.depth-8 { background-color: #eef0f3; }

.pg-cell-key {
  padding: 5px 8px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-right: 1px solid #e5e7eb;
  vertical-align: top;
}

.pg-cell-value {
  padding: 5px 8px;
  color: #374151;
  word-break: break-word;
  vertical-align: top;
  cursor: default;
}

.pg-toggle {
  display: inline-block;
  width: 16px;
  font-size: 9px;
  color: #6b7280;
  cursor: pointer;
  text-align: center;
  vertical-align: middle;
  user-select: none;

  &:hover {
    color: #6366f1;
  }
}

.pg-toggle-placeholder {
  display: inline-block;
  width: 16px;
}

.pg-key {
  color: #1e3a5f;
  vertical-align: middle;
}

.pg-key-index {
  color: #6366f1;
  font-style: italic;
}

/* Value type colors */
.type-string .pg-value { color: #059669; }
.type-number .pg-value { color: #dc2626; }
.type-boolean .pg-value { color: #7c3aed; }
.type-null .pg-value { color: #9ca3af; font-style: italic; }

.type-structural .pg-type-badge {
  display: inline-block;
  padding: 1px 5px;
  font-size: 10px;
  font-weight: 500;
  color: #6366f1;
  background: #eef2ff;
  border-radius: 3px;
  vertical-align: middle;
}

.pg-count {
  margin-left: 4px;
  font-size: 11px;
  color: #9ca3af;
}

/* Editing */
.pg-edit-input {
  width: 100%;
  padding: 2px 4px;
  font-size: 13px;
  font-family: inherit;
  border: 1px solid #6366f1;
  border-radius: 2px;
  outline: none;
  background: #fffff0;
}

.pg-empty {
  padding: 24px;
  text-align: center;
  color: #9ca3af;
}
</style>
