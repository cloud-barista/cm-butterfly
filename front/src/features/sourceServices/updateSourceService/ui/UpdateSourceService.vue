<script setup lang="ts">
import {
  PPaneLayout,
  PFieldGroup,
  PTextInput,
  PToggleButton,
  PDivider,
  PButton,
  PTextarea,
} from '@cloudforet-test/mirinae';
import { watchEffect, ref, reactive, computed, watch } from 'vue';
import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores';
import { DOC_LINKS, openDocLink } from '@/shared/constants/docLinks';
import { useSourceServiceStore } from '@/shared/libs';
import { storeToRefs } from 'pinia';
import { showErrorMessage, toErrorMessage } from '@/shared/utils';
import {
  validateConnection,
  findDuplicateNameIndexes,
  CONNECTION_LIMIT_PER_GROUP,
  DEFAULT_SSH_PORT,
} from '@/shared/utils/connectionValidation';
import {
  useParseTabularImport,
  type ITabularImportRow,
} from '@/entities/sourceConnection/api/tabularImport';

const sourceConnectionStore = useSourceConnectionStore();
const sourceServiceStore = useSourceServiceStore();

const { sourceServiceInfo } = storeToRefs(sourceServiceStore);

interface iProps {
  sourceServiceName?: string;
  description?: string | null;
  isEdit: boolean;
  loading?: boolean;
}

const props = defineProps<iProps>();

const emit = defineEmits([
  'update:source-servie-info',
  'update:is-connection-modal-opened',
  'update:import-blocked',
]);

const state = reactive({
  sourceServiceName: sourceServiceInfo.value.name,
  description: sourceServiceInfo.value.description as string | null | undefined,
});

const handleCheckSourceConnection = () => {
  sourceConnectionStore.setWithSourceConnection(
    !sourceConnectionStore.withSourceConnection,
  );
};

const handleLink = () => {
  emit('update:is-connection-modal-opened', true);
};

const handleDownloadTemplate = () => {
  const headers = [
    'name',
    'description',
    'ip_address',
    'ssh_port',
    'user',
    'password',
    'private_key',
  ];
  const csvContent = headers.join(',') + '\n';
  const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility

  const blob = new Blob([bom + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'source_connection_template.csv';
  link.click();
  URL.revokeObjectURL(url);
};

const fileInputRef = ref<HTMLInputElement | null>(null);

const handleOpenImportGuide = () => {
  openDocLink(DOC_LINKS.sourceConnectionBulkImport);
};

const handleImportSourceConnection = () => {
  fileInputRef.value?.click();
};

// The server does the parsing. It handles quoted commas, newlines within values, and BOM per spec
// and returns Excel in the same form, so the screen only layers validation on the received rows.
const parseImport = useParseTabularImport();

interface PreviewRow {
  index: number;
  data: Record<string, string>;
  errors: string[];
}

const previewRows = ref<PreviewRow[]>([]);
const previewFileErrors = ref<string[]>([]);
const importedFileName = ref<string>('');
// Problems with the file itself (no data, unsupported format, corruption, etc.). Since the user
// resolves these by fixing the file, show them inside the import area rather than a popup.
const importFileProblem = ref<string>('');
const isParsing = ref<boolean>(false);

const hasPreview = computed(() => previewRows.value.length > 0);
const invalidRowCount = computed(
  () => previewRows.value.filter(row => row.errors.length > 0).length,
);
const isPreviewValid = computed(
  () =>
    hasPreview.value &&
    invalidRowCount.value === 0 &&
    previewFileErrors.value.length === 0,
);

const clearPreview = () => {
  previewRows.value = [];
  previewFileErrors.value = [];
  importFileProblem.value = '';
  importedFileName.value = '';
  sourceConnectionStore.editConnections = [];
};

const readFile = (file: File): Promise<{ text?: string; base64?: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The file could not be read.'));

    // Excel is binary, so send it as base64. CSV is sent as plain text.
    if (/\.(xlsx|xlsm|xls)$/i.test(file.name)) {
      reader.onload = e => {
        const result = String(e.target?.result ?? '');
        resolve({ base64: result.split(',')[1] ?? '' });
      };
      reader.readAsDataURL(file);
      return;
    }
    reader.onload = e => resolve({ text: String(e.target?.result ?? '') });
    reader.readAsText(file);
  });

// If a single file exceeds the group limit, registration is rejected outright, so warn in advance.
const buildPreview = (rows: ITabularImportRow[], fileErrors: string[]) => {
  const fields = rows.map(row => ({
    ...row.data,
    ssh_port: row.data.ssh_port || DEFAULT_SSH_PORT,
  }));
  const duplicates = findDuplicateNameIndexes(fields);

  previewRows.value = rows.map((row, idx) => {
    const errors = validateConnection(fields[idx]);
    if (duplicates.has(idx)) {
      errors.push('Duplicate name in this file. Names are case-insensitive.');
    }
    return { index: row.index, data: fields[idx], errors };
  });

  previewFileErrors.value = [...fileErrors];
  if (rows.length > CONNECTION_LIMIT_PER_GROUP) {
    previewFileErrors.value.push(
      `A source group can hold up to ${CONNECTION_LIMIT_PER_GROUP} connections. This file has ${rows.length}.`,
    );
  }

  // If any problem remains, don't pass it on as a registration target.
  sourceConnectionStore.editConnections = isPreviewValid.value
    ? previewRows.value.map(row => ({ ...row.data }))
    : [];
};

// If the imported file still has problems, registration must be blocked. Otherwise it proceeds
// with an empty registration target and a group with no connections is quietly created.
const isImportBlocked = computed(
  () => hasPreview.value && !isPreviewValid.value,
);

watchEffect(() => {
  emit('update:import-blocked', isImportBlocked.value);
});

const invalidRows = computed(() =>
  previewRows.value.filter(row => row.errors.length > 0),
);

// Never surface the credential value itself on screen. Only indicate which method is used.
const describeAuth = (row: Record<string, string>) => {
  const methods: string[] = [];
  if (row.password) methods.push('Password');
  if (row.private_key) methods.push('Private key');
  return methods.length > 0 ? methods.join(' + ') : '—';
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  clearPreview();
  // Name the file straight away. Until now it only appeared once the preview had been built, so
  // choosing a file and the rows arriving looked like one event - there was no moment on screen
  // that said which file had been picked, or that one had been picked at all.
  importedFileName.value = file.name;
  isParsing.value = true;

  try {
    const { text, base64 } = await readFile(file);
    const { data } = await parseImport.execute({
      fileName: file.name,
      content: text,
      contentBase64: base64,
    });

    // Problems with the file itself arrive as a failure status inside a normal response. Since
    // the user can fix them, show them as-is.
    if (data?.status?.code !== 200) {
      importedFileName.value = file.name;
      importFileProblem.value =
        data?.status?.message || 'The file could not be read.';
      return;
    }

    const result = data.responseData;
    importedFileName.value = file.name;
    buildPreview(result?.rows ?? [], result?.fileErrors ?? []);
  } catch (error) {
    // Only problems that can't be fixed by editing the file, like a network failure, are shown in a popup.
    showErrorMessage(
      'Import Failed',
      toErrorMessage(error, 'The file could not be read.'),
    );
  } finally {
    isParsing.value = false;
    target.value = '';
  }
};

const sourceConnectionNames = ref<string>('');

watchEffect(
  () => {
    sourceConnectionNames.value = '';
    sourceConnectionStore.editConnections.forEach(
      (sourceConnection, idx: number) => {
        if (sourceConnection.name.length > 0) {
          idx === sourceConnectionStore.editConnections.length - 1
            ? (sourceConnectionNames.value += sourceConnection.name)
            : (sourceConnectionNames.value += sourceConnection.name + ', ');
        }
      },
    );
  },
  { flush: 'post' },
);

watchEffect(
  () => {
    emit('update:source-servie-info', {
      sourceServiceName: state.sourceServiceName,
      description: state.description,
    });
  },
  { flush: 'post' },
);

watchEffect(() => {
  if (
    props.sourceServiceName ||
    (props.sourceServiceName && props.description)
  ) {
    state.sourceServiceName = props.sourceServiceName;
    state.description = props.description;
  }
});

const isAddDisabled = computed(
  () => sourceConnectionStore.withSourceConnection,
);

watchEffect(
  () => {
    sourceServiceInfo.value.name = state.sourceServiceName;
    sourceServiceInfo.value.description = state.description;
  },
  { flush: 'post' },
);

const isToggleDisabled = ref<boolean>(true);

watch(
  () => isToggleDisabled,
  () => {
    if (props.isEdit) {
      isToggleDisabled.value = false;
    }
  },
  { immediate: true },
);
</script>

<template>
  <p-pane-layout class="source-service-button-modal">
    <p-pane-layout class="layout">
      <p-field-group label="Source Service Name" invalid required>
        <p-text-input
          v-model="state.sourceServiceName"
          data-testid="source-service-name"
          placeholder="Source Service Name"
          :invalid="!state.sourceServiceName"
          :disabled="false"
        />
      </p-field-group>
      <p-field-group label="Description">
        <p-textarea
          v-if="state.description !== null"
          v-model="state.description"
          data-testid="source-service-description"
          :disabled="false"
        />
      </p-field-group>
    </p-pane-layout>
    <p-pane-layout class="layout">
      <div class="toggle">
        <p-toggle-button
          data-testid="source-service-with-connection"
          :value="sourceConnectionStore.withSourceConnection"
          :disabled="!isToggleDisabled || loading"
          @change-toggle="handleCheckSourceConnection"
        />
        <span>With Source Connection</span>
      </div>
      <p-divider />
      <p-button
        data-testid="source-service-go-add-connection"
        style-type="tertiary"
        :disabled="!isAddDisabled || loading"
        @click="handleLink"
      >
        Go add Source Connection
      </p-button>
      <div class="or-divider">
        <span>or</span>
      </div>
      <div class="import-buttons">
        <p-button
          style-type="tertiary"
          data-testid="source-import-template"
          :disabled="!isAddDisabled || loading"
          @click="handleDownloadTemplate"
        >
          Download Source Connection Template
        </p-button>
        <p-button
          style-type="tertiary"
          data-testid="source-import-file"
          :disabled="!isAddDisabled || loading"
          @click="handleImportSourceConnection"
        >
          Import Source Connection
        </p-button>
        <input
          ref="fileInputRef"
          type="file"
          accept=".csv,.xlsx,.xlsm"
          hidden
          data-testid="source-import-input"
          @change="handleFileChange"
        />
      </div>
      <p class="import-help" data-testid="source-import-help">
        The template is CSV. You can fill it in and upload it as CSV or Excel
        (.xlsx) — both work.
        <a
          href="#"
          data-testid="source-import-guide-link"
          @click.prevent="handleOpenImportGuide"
        >
          How to prepare the file
        </a>
      </p>
      <!--
        The chosen file, on its own line. It stays put through reading, preview and problem, so the
        sequence reads as three steps rather than as a list that appeared by itself.
      -->
      <p
        v-if="importedFileName"
        class="import-selected"
        data-testid="source-import-filename"
      >
        Selected file: <strong>{{ importedFileName }}</strong>
      </p>

      <div
        v-if="isParsing"
        class="import-status"
        data-testid="source-import-parsing"
      >
        Reading {{ importedFileName }}…
      </div>

      <div
        v-else-if="importFileProblem"
        class="import-problem"
        data-testid="source-import-problem"
      >
        {{ importFileProblem }}
      </div>

      <div
        v-else-if="hasPreview"
        class="import-preview"
        data-testid="source-import-preview"
      >
        <div class="preview-summary">
          <span>
            <strong data-testid="source-import-count">
              {{ previewRows.length }} connection(s)
            </strong>

            <span
              v-if="invalidRowCount > 0"
              class="preview-invalid"
              data-testid="source-import-invalid-count"
            >
              — {{ invalidRowCount }} row(s) need attention
            </span>
          </span>
          <!-- Need a way out after uploading a bad file. Without this, the register
               button stays blocked even when registering just the group. -->
          <button
            type="button"
            class="preview-clear"
            data-testid="source-import-clear"
            @click="clearPreview"
          >
            Remove
          </button>
        </div>

        <ul
          v-if="previewFileErrors.length > 0"
          class="preview-file-errors"
          data-testid="source-import-file-errors"
        >
          <li v-for="(message, i) in previewFileErrors" :key="i">
            {{ message }}
          </li>
        </ul>

        <div class="preview-table-wrap">
          <table class="preview-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>IP Address</th>
                <th>Port</th>
                <th>User</th>
                <th>Auth</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in previewRows"
                :key="row.index"
                :class="{ 'row-invalid': row.errors.length > 0 }"
                :data-testid="`source-import-row-${row.index}`"
              >
                <td>{{ row.index }}</td>
                <td>{{ row.data.name }}</td>
                <td>{{ row.data.ip_address }}</td>
                <td>{{ row.data.ssh_port }}</td>
                <td>{{ row.data.user }}</td>
                <td>{{ describeAuth(row.data) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul
          v-if="invalidRowCount > 0"
          class="preview-row-errors"
          data-testid="source-import-row-errors"
        >
          <li v-for="row in invalidRows" :key="row.index">
            <strong>Row {{ row.index }}</strong>
            <span v-if="row.data.name"> ({{ row.data.name }})</span>:
            {{ row.errors.join(' ') }}
          </li>
        </ul>
      </div>

      <p-field-group
        v-else
        class="source-connection-result"
        label="Source Connection"
        required
      >
        <p-text-input
          v-model="sourceConnectionNames"
          class="source-connection"
          :disabled="true"
        />
      </p-field-group>
    </p-pane-layout>
  </p-pane-layout>
</template>

<style scoped lang="postcss">
.link {
  font-weight: 400;
}
.link:hover {
  @apply text-blue-700;
  text-decoration: underline;
  cursor: pointer;
}
.source-service-button-modal {
  @apply flex flex-col gap-[1rem] bg-[#F7F7F7] p-[1rem] border-none;
  p {
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
    .optional {
      margin-left: 0.25rem;
      color: #898995;
      font-size: 0.75rem;
      font-weight: 400;
    }
  }
  .layout {
    @apply flex flex-col gap-[0.75rem] bg-[#FFF] rounded-[0.375rem] p-[0.75rem] border-none;
    .or-divider {
      @apply flex items-center gap-[0.5rem];
      span {
        color: #898995;
        font-size: 0.75rem;
      }
      &::before,
      &::after {
        content: '';
        flex: 1;
        height: 1px;
        background-color: #e5e5e5;
      }
    }
    .import-selected {
      @apply text-[0.8125rem] text-gray-700 mt-[0.5rem];
    }
    .import-status {
      @apply text-[0.8125rem] text-gray-600 py-[0.75rem];
    }
    .import-problem {
      @apply text-[0.8125rem] text-red-600 mt-[0.5rem] py-[0.5rem];
    }
    .import-preview {
      @apply mt-[0.5rem];
      .preview-summary {
        @apply text-[0.8125rem] mb-[0.5rem] flex items-center justify-between gap-[0.75rem];
      }
      .preview-clear {
        @apply text-[0.75rem] underline text-gray-600 shrink-0;
      }
      .preview-invalid {
        @apply text-red-600;
      }
      .preview-file-errors,
      .preview-row-errors {
        @apply text-[0.75rem] text-red-600 mb-[0.5rem] list-disc pl-[1.25rem];
      }
      .preview-table-wrap {
        @apply max-h-[16rem] overflow-auto border border-[#DDDDDF] rounded-[0.25rem];
      }
      .preview-table {
        @apply w-full text-[0.75rem];
        th {
          @apply text-left bg-[#F7F7F7] px-[0.5rem] py-[0.375rem] sticky top-0;
        }
        td {
          @apply px-[0.5rem] py-[0.375rem] border-t border-[#EDEDEF];
        }
        .row-invalid td {
          @apply bg-[#FFF5F5];
        }
      }
    }
    .import-help {
      @apply text-[0.75rem] text-gray-600 mt-[0.5rem] mb-[0.5rem];
      a {
        @apply underline;
      }
    }
    .import-buttons {
      @apply flex gap-[0.5rem];
      :deep(.p-button) {
        flex: 1;
      }
    }
    .input-container {
      @apply bg-[#F7F7F7];
    }
    .p-field-group {
      margin-bottom: 0;
    }
    .source-connection-result {
      margin-top: 2rem;
    }
    .toggle {
      /* @apply p-[0.75rem]; */
      @apply flex gap-[0.5rem];
      span {
        font-size: 0.875rem;
        font-weight: 700;
        line-height: 1.0938rem;
      }
    }
  }
}
:deep(.p-link) {
  font-size: 14px;
  /* font-weight: 400; */
}
:deep(.p-text-input) {
  width: 100%;
}
</style>
