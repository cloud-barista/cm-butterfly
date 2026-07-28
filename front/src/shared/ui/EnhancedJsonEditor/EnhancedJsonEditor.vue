<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from 'vue';
import {
  JSONEditor,
  Mode,
  type Content,
  type OnChangeStatus,
  type JSONEditorPropsOptional,
  type MenuItem,
} from 'vanilla-jsoneditor';
import JsonPropertyGrid from './JsonPropertyGrid.vue';
import { registerJsonEditor, unregisterJsonEditor } from './editorPresence';

interface Props {
  /** JSON data - string or object */
  modelValue?: string | object;
  /** Editor mode: 'tree' | 'text' | 'table' */
  mode?: 'tree' | 'text' | 'table';
  /** Read-only mode */
  readOnly?: boolean;
  /** Main menu bar visible */
  mainMenuBar?: boolean;
  /** Navigation bar visible */
  navigationBar?: boolean;
  /** Status bar visible */
  statusBar?: boolean;
  /** Editor height */
  height?: string;
  /** Show Import button (always hidden when readOnly) */
  allowImport?: boolean;
  /** Show Export button (available even when readOnly) */
  allowExport?: boolean;
  /** Prefix of the exported file name: {fileName}-{yyyyMMdd-HHmmss}.json */
  fileName?: string;
  /** Maximum size of an imported file, in bytes */
  maxImportSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  mode: 'tree',
  readOnly: false,
  mainMenuBar: true,
  navigationBar: true,
  statusBar: true,
  height: '100%',
  allowImport: true,
  allowExport: true,
  fileName: 'json-data',
  maxImportSize: 10 * 1024 * 1024,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  /*
    Vue 2 matches event names literally, so a parent listening on the hyphenated
    "@update:model-value" never hears "update:modelValue". Three screens were
    written that way and silently dropped every edit made in this editor. They
    are fixed, and this alias is emitted alongside so the next one cannot break
    the same way without anyone noticing.
  */
  (e: 'update:model-value', value: string): void;
  (e: 'update:mode', value: string): void;
  (
    e: 'change',
    value: {
      content: Content;
      previousContent: Content;
      changeStatus: OnChangeStatus;
    },
  ): void;
  (e: 'error', value: Error): void;
  (e: 'import', value: { fileName: string; json: unknown }): void;
  (e: 'export', value: { fileName: string }): void;
}>();

const editorRef = ref<HTMLElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
let editorInstance: JSONEditor | null = null;
const currentMode = ref<Mode>(props.mode as Mode);
/*
  The menu's "table" button opens the Property Grid, not the library table mode.
  The library lays out one row per array entry and refuses anything else, while
  every document these editors handle - infra model, software model, workflow
  definition - is an object at the root. So table mode has no table to draw here,
  and the grid, which flattens any document to key/value rows, takes its place.
*/
const showPropertyGrid = ref(props.mode === 'table');
const gridRef = ref<{
  expandAll: () => void;
  collapseAll: () => void;
  expandToDepth: (depth: number) => void;
  openSearch: () => void;
} | null>(null);
const hasError = ref(false);
const errorMessage = ref('');

// Convert incoming modelValue to Content
function toContent(value: string | object | undefined): Content {
  if (value === undefined || value === null || value === '') {
    return { json: {} };
  }
  if (typeof value === 'string') {
    try {
      return { json: JSON.parse(value) };
    } catch {
      return { text: value };
    }
  }
  return { json: value };
}

// Convert Content back to string for emit
function contentToString(content: Content): string {
  if ('json' in content && content.json !== undefined) {
    const result = JSON.stringify(content.json, null, 2);
    console.log(
      '[EnhancedJsonEditor] contentToString (JSON mode):',
      result.substring(0, 50),
    );
    return result;
  }
  if ('text' in content && content.text !== undefined) {
    const trimmed = content.text.trim();
    console.log(
      '[EnhancedJsonEditor] contentToString (Text mode), trimmed:',
      JSON.stringify(trimmed).substring(0, 50),
    );
    // For an empty string, return the JSON of an empty object
    if (!trimmed || trimmed === '') {
      console.log('[EnhancedJsonEditor] Empty text detected, returning "{}"');
      return '{}';
    }
    return content.text;
  }
  console.log('[EnhancedJsonEditor] contentToString fallback, returning "{}"');
  return '{}'; // default to '{}' instead of an empty string
}

/* ── Import / Export ───────────────────────────────────────── */

// Import only in an editable editor (when readOnly, the button is not shown at all)
const showImport = computed(() => props.allowImport && !props.readOnly);
const showExport = computed(() => props.allowExport);
const showToolbar = computed(() => showImport.value || showExport.value);

// Emit both spellings - see the note on the alias in defineEmits.
function emitModelValue(value: string) {
  emit('update:modelValue', value);
  emit('update:model-value', value);
}

function setError(message: string) {
  hasError.value = true;
  errorMessage.value = message;
  emit('error', new Error(message));
}

// Get the content currently shown in the editor as JSON (including unsaved edits in progress).
// In text mode the JSON may be broken, so return null if parsing fails.
function getCurrentJson(): unknown | null {
  const content: Content = editorInstance
    ? editorInstance.get()
    : toContent(props.modelValue);

  if ('json' in content && content.json !== undefined) {
    return content.json;
  }
  if ('text' in content && content.text !== undefined) {
    const trimmed = content.text.trim();
    if (!trimmed) return {};
    return JSON.parse(trimmed);
  }
  return null;
}

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
}

function handleExport() {
  let json: unknown | null;
  try {
    json = getCurrentJson();
  } catch (err) {
    setError(`Export failed: invalid JSON format (${(err as Error).message})`);
    return;
  }
  if (json === null) {
    setError('Export failed: no JSON content to export');
    return;
  }

  const outName = `${props.fileName}-${timestamp()}.json`;
  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = outName;
  anchor.click();
  URL.revokeObjectURL(url);

  hasError.value = false;
  errorMessage.value = '';
  emit('export', { fileName: outName });
}

function triggerImport() {
  fileInputRef.value?.click();
}

// Apply the file content to the editor. If parsing fails, leave the existing content as-is.
function applyImportedText(text: string, sourceName: string) {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (err) {
    setError(`Import failed: JSON parse error (${(err as Error).message})`);
    return;
  }

  hasError.value = false;
  errorMessage.value = '';

  if (editorInstance) {
    editorInstance.update({ json } as Content);
  }
  emitModelValue(JSON.stringify(json, null, 2));
  emit('import', { fileName: sourceName, json });
}

function handleFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (file.size > props.maxImportSize) {
    const limitMb = Math.round(props.maxImportSize / (1024 * 1024));
    setError(`Import failed: file is too large (max ${limitMb}MB)`);
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    applyImportedText(String(reader.result ?? ''), file.name);
    input.value = ''; // clear it so the same file can be selected again
  };
  reader.onerror = () => {
    setError('Import failed: cannot read file');
    input.value = '';
  };
  reader.readAsText(file);
}

function initEditor() {
  if (!editorRef.value) return;

  const editorProps: JSONEditorPropsOptional = {
    content: toContent(props.modelValue),
    mode: currentMode.value,
    readOnly: props.readOnly,
    // Force mainMenuBar to show even when readOnly is true
    mainMenuBar: props.mainMenuBar,
    navigationBar: props.navigationBar,
    statusBar: props.statusBar,
    onChange: (
      content: Content,
      previousContent: Content,
      changeStatus: OnChangeStatus,
    ) => {
      if (props.readOnly) {
        console.log('[EnhancedJsonEditor] onChange skipped - readOnly mode');
        return;
      }
      console.log(
        '[EnhancedJsonEditor] onChange triggered, readOnly:',
        props.readOnly,
      );
      hasError.value = false;
      errorMessage.value = '';
      const strValue = contentToString(content);
      console.log(
        '[EnhancedJsonEditor] Emitting update:modelValue:',
        JSON.stringify(strValue).substring(0, 100),
        'type:',
        typeof strValue,
      );
      emitModelValue(strValue);
      emit('change', { content, previousContent, changeStatus });
    },
    /*
      The grid used to carry its own row of controls under the editor's, which
      read as two toolbars for one document. The editor offers this hook to put
      items in its own menu, so the grid's controls go there - in the same place
      the tree view keeps expand and collapse, so the row does not rearrange
      itself when you change view.

      Three of the editor's own items are dropped while the grid is showing.
      Search reaches the view the editor is drawing, which is hidden here, so it
      would be a second magnifier that finds nothing. Sort and transform act on
      whatever the editor has selected, and the grid makes no selection in it -
      there is no way to say which array to sort, which is why a nested one like
      the network interfaces never appears as a choice.

      Icons are given as the shape the menu expects; drawing our own keeps
      another icon set out of this project's dependencies.
    */
    onRenderMenu: (items, context) => {
      if (context.mode !== Mode.table) return items;

      const icon = (path: string) => ({
        prefix: 'cm',
        iconName: 'grid',
        icon: [16, 16, [], '', path],
      });

      const titleOf = (item: MenuItem) =>
        'title' in item ? (item.title ?? '') : '';
      const isMode = (item: MenuItem) => /current mode/i.test(titleOf(item));
      const unusableHere = (item: MenuItem) =>
        /^(Search|Sort|Transform)/i.test(titleOf(item));

      const kept = items.filter(item => !unusableHere(item));
      const lastMode = kept.map(isMode).lastIndexOf(true);

      const ours: MenuItem[] = [
        {
          type: 'button',
          title: 'Expand all',
          icon: icon(
            'M2 3h12v1.5H2V3Zm0 4.25h12v1.5H2v-1.5ZM8 15l-3-3.5h6L8 15Z',
          ),
          onClick: () => gridRef.value?.expandAll(),
        },
        {
          type: 'button',
          title: 'Collapse all',
          icon: icon(
            'M2 7.25h12v1.5H2v-1.5ZM2 11.5h12V13H2v-1.5ZM8 1l3 3.5H5L8 1Z',
          ),
          onClick: () => gridRef.value?.expandToDepth(1),
        },
        {
          type: 'button',
          text: 'D3',
          title: 'Expand 3 levels',
          onClick: () => gridRef.value?.expandToDepth(3),
        },
        {
          type: 'button',
          text: 'D5',
          title: 'Expand 5 levels',
          onClick: () => gridRef.value?.expandToDepth(5),
        },
        {
          type: 'button',
          text: 'D7',
          title: 'Expand 7 levels',
          onClick: () => gridRef.value?.expandToDepth(7),
        },
        {
          type: 'button',
          title: 'Search (Ctrl+F)',
          icon: icon(
            'M6.75 1.5a5.25 5.25 0 0 1 4.14 8.48l3.57 3.56-1.06 1.06-3.56-3.57A5.25 5.25 0 1 1 6.75 1.5Zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z',
          ),
          onClick: () => gridRef.value?.openSearch(),
        },
      ];

      return [
        ...kept.slice(0, lastMode + 1),
        { type: 'separator' },
        ...ours,
        ...kept.slice(lastMode + 1),
      ];
    },
    onChangeMode: (mode: Mode) => {
      currentMode.value = mode;
      // The grid stands in for table mode - see the note by showPropertyGrid.
      showPropertyGrid.value = mode === Mode.table;
      emit('update:mode', mode);
    },
    onError: (err: Error) => {
      hasError.value = true;
      errorMessage.value = err.message;
      emit('error', err);
    },
  };

  editorInstance = new JSONEditor({
    target: editorRef.value,
    props: editorProps,
  });

  // Force menu to show after initialization if readOnly and mainMenuBar is true
  if (props.readOnly && props.mainMenuBar) {
    setTimeout(() => {
      // vanilla-jsoneditor hides menu in readOnly mode, so we force it to show
      const menuElement = editorRef.value?.querySelector('.jse-menu');
      if (menuElement) {
        (menuElement as HTMLElement).style.display = 'flex';
      }
    }, 100);
  }
}

onMounted(() => {
  // The help panel leads with the editor while the editor is on screen.
  registerJsonEditor();
  nextTick(() => {
    initEditor();
  });
});

onBeforeUnmount(() => {
  unregisterJsonEditor();
  if (editorInstance) {
    editorInstance.destroy();
    editorInstance = null;
  }
});

// Watch for external modelValue changes
watch(
  () => props.modelValue,
  newValue => {
    console.log(
      '[EnhancedJsonEditor] modelValue changed:',
      typeof newValue,
      newValue?.length || Object.keys(newValue || {}).length,
    );
    if (!editorInstance) {
      console.warn('[EnhancedJsonEditor] Editor instance not ready');
      return;
    }
    try {
      const newContent = toContent(newValue);
      console.log(
        '[EnhancedJsonEditor] Updating editor with content:',
        'json' in newContent ? 'JSON mode' : 'Text mode',
      );
      editorInstance.update(newContent);
      console.log('[EnhancedJsonEditor] Editor updated successfully');
    } catch (err) {
      console.error(
        '[EnhancedJsonEditor] Failed to update editor content:',
        err,
      );
    }
  },
);

// Watch for readOnly changes
watch(
  () => props.readOnly,
  newReadOnly => {
    if (!editorInstance) return;
    editorInstance.updateProps({ readOnly: newReadOnly });
    // Force menu to show after readOnly change if mainMenuBar is true
    if (newReadOnly && props.mainMenuBar) {
      setTimeout(() => {
        const menuElement = editorRef.value?.querySelector('.jse-menu');
        if (menuElement) {
          (menuElement as HTMLElement).style.display = 'flex';
        }
      }, 100);
    }
  },
);

function handlePropertyGridUpdate(value: string) {
  emitModelValue(value);
  // Also sync to vanilla-jsoneditor
  if (editorInstance) {
    try {
      editorInstance.update(toContent(value));
    } catch {
      // ignore
    }
  }
}

// Expose methods for parent component
defineExpose({
  getEditor: () => editorInstance,
  exportJson: handleExport,
  importJson: (text: string) =>
    applyImportedText(text, `${props.fileName}.json`),
  refresh: () => {
    if (!editorInstance) return;
    editorInstance.update(toContent(props.modelValue));
  },
  setMode: (mode: 'tree' | 'text' | 'table') => {
    if (!editorInstance) return;
    try {
      if (mode === 'table' || mode === Mode.table) {
        showPropertyGrid.value = true;
        editorInstance.updateProps({ mode: Mode.table });
        currentMode.value = Mode.table;
      } else {
        showPropertyGrid.value = false;
        const editorMode = mode === 'tree' ? Mode.tree : Mode.text;
        editorInstance.updateProps({ mode: editorMode });
        currentMode.value = editorMode;
      }
    } catch (e) {
      console.warn('setMode failed:', e.message);
    }
  },
  expandAll: () => {
    if (!editorInstance) return;

    try {
      // Skip in Property Grid mode
      if (showPropertyGrid.value) {
        console.log('expandAll: Skipping - Property Grid mode');
        return;
      }

      // Expand is only possible in tree mode
      if (currentMode.value !== Mode.tree) {
        console.log(
          'expandAll: Skipping - not in tree mode, current mode:',
          currentMode.value,
        );
        return;
      }

      // Only run expand in tree mode
      editorInstance.expand(() => true);
    } catch (e) {
      console.warn('expandAll failed:', e.message);
    }
  },
  collapseAll: () => {
    if (!editorInstance) return;

    try {
      if (showPropertyGrid.value) {
        console.log('collapseAll: Skipping - Property Grid mode');
        return;
      }

      if (currentMode.value !== Mode.tree) {
        console.log(
          'collapseAll: Skipping - not in tree mode, current mode:',
          currentMode.value,
        );
        return;
      }

      editorInstance.expand(() => false);
    } catch (e) {
      console.warn('collapseAll failed:', e.message);
    }
  },
});
</script>

<template>
  <div class="enhanced-json-editor" :style="{ height }">
    <!-- File toolbar - kept outside the vanilla editor so it stays visible in Property Grid mode too -->
    <div v-if="showToolbar" class="file-toolbar">
      <button
        v-if="showImport"
        type="button"
        class="file-btn"
        title="Import JSON file"
        @click="triggerImport"
      >
        ↑ Import
      </button>
      <button
        v-if="showExport"
        type="button"
        class="file-btn"
        title="Export to JSON file"
        @click="handleExport"
      >
        ↓ Export
      </button>
      <input
        ref="fileInputRef"
        type="file"
        accept="application/json,.json"
        class="file-input"
        @change="handleFileSelected"
      />
    </div>

    <!-- vanilla-jsoneditor - keeps the menu bar visible in every mode -->
    <div
      ref="editorRef"
      class="editor-container"
      :class="{ 'menu-only': showPropertyGrid }"
    />

    <!-- Property Grid view (replaces vanilla-jsoneditor table mode) -->
    <!--
      Kept mounted and merely hidden. Tearing it down on every mode change threw
      inside Vue's own teardown and left the editor unable to open the grid again;
      keeping it also preserves what the user had expanded and their undo history.
    -->
    <div v-show="showPropertyGrid" class="property-grid-wrapper">
      <JsonPropertyGrid
        ref="gridRef"
        :data="modelValue"
        :read-only="readOnly"
        :active="showPropertyGrid"
        @update:data="handlePropertyGridUpdate"
      />
    </div>

    <!-- Error indicator - also carries Import/Export failures, so it must show in Property Grid mode as well -->
    <div v-if="hasError" class="error-bar">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped lang="postcss">
.enhanced-json-editor {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  background-color: #ffffff;
}

.file-toolbar {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 5px 10px;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.file-btn {
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #4f46e5;
  background: #ffffff;
  border: 1px solid #c7d2fe;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background: #eef2ff;
  }
}

.file-input {
  display: none;
}

.editor-container {
  flex: 1;
  overflow: auto;
  min-height: 200px;

  /* vanilla-jsoneditor style overrides */
  :deep(.jse-main) {
    border: none !important;
    min-height: 200px;
  }

  :deep(.jse-theme-default) {
    --jse-theme-color: #6366f1;
    --jse-theme-color-highlight: #e0e7ff;
  }

  /*
    The bar is light, so its buttons must be dark — set both, never just one.
    vanilla-jsoneditor colours its menu buttons white to sit on its own dark bar.
    Under 0.23 the background rule below lost to the library's stylesheet, so the
    bar stayed dark and the white buttons were legible. Under 3.x it wins: the bar
    turned light, the buttons stayed white, and they were invisible until hovered.
  */
  :deep(.jse-menu) {
    background-color: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    display: flex !important; /* Force menu to show even in readOnly mode */
  }

  /* Leave .jse-selected alone — that is how the current mode is marked. */
  :deep(.jse-menu .jse-button:not(.jse-selected)) {
    color: #374151 !important;
  }

  :deep(.jse-menu .jse-button:not(.jse-selected):hover) {
    background-color: #e5e7eb !important;
    color: #111827 !important;
  }

  :deep(.jse-contents) {
    border: none !important;
  }
}

.property-grid-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/*
  While the grid is showing, the library keeps its menu bar - that bar is how the
  user moves between text, tree and table, and it marks which one they are on. Only
  the editor's own content is hidden, and the grid takes that space.
*/
.editor-container.menu-only {
  flex: 0 0 auto;
  min-height: 0;
  overflow: visible;

  :deep(.jse-main) {
    min-height: 0 !important;
  }

  /*
    The menu bar is not a direct child of .jse-main - it sits inside the wrapper
    for the current mode (.jse-table-mode and friends). Hiding that wrapper takes
    the menu with it, so hide what is beside the menu instead.
  */
  :deep(.jse-main > * > *:not(.jse-menu)) {
    display: none !important;
  }
}

.error-bar {
  padding: 4px 12px;
  font-size: 11px;
  color: #dc2626;
  background-color: #fef2f2;
  border-top: 1px solid #fecaca;
}
</style>
