<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { i18n } from '@/app/i18n';
import SourceConnectionForm from '@/features/sourceServices/sourceConnection/ui/SourceConnectionForm.vue';
import { ref, watchEffect, computed } from 'vue';
import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores';
import { useCreateConnectionInfo } from '@/entities/sourceConnection/api';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';
import {
  connectionRowKey,
  newConnectionRowId,
} from '@/shared/utils/connectionRows';
import {
  DEFAULT_SSH_PORT,
  isConnectionRowValid,
} from '@/shared/utils/connectionValidation';
import { useUpdateConnectionInfo } from '@/entities/sourceConnection/api';

const sourceConnectionStore = useSourceConnectionStore();
const updateConnectionInfo = useUpdateConnectionInfo(null, null, null);

interface iProps {
  selectedConnectionId: any;
  sourceServiceId: string;
  multiSelectedConnectionIds: string[];
}

const props = defineProps<iProps>();

const createConnectionInfo = useCreateConnectionInfo(
  props.sourceServiceId,
  sourceConnectionStore.editConnections[0],
);

const connectionInfoData = ref<any[]>([]);
const emit = defineEmits([
  'update:is-connection-modal-opened',
  'update:is-service-modal-opened',
  'update:trigger',
]);

const handleConnectionModal = (value: boolean) => {
  !value ? emit('update:is-connection-modal-opened', value) : null;
};

const handleCancel = () => {
  emit('update:is-connection-modal-opened', false);
  emit('update:is-service-modal-opened', false);
};

const saveLoading = ref<boolean>(false);

// Determine whether this is Add mode or Edit mode
const isAddMode = computed(
  () =>
    props.multiSelectedConnectionIds.length === 0 &&
    props.selectedConnectionId.length === 0,
);

const emptyConnection = () => ({
  _id: newConnectionRowId(),
  name: '',
  description: '',
  ip_address: '',
  // A string, like the other registration screen. The linked system declares
  // ssh_port as a string and rejects a number outright ("expected=string,
  // got=number"), so a row whose port was never retyped could not be saved.
  ssh_port: DEFAULT_SSH_PORT,
  user: '',
  password: '',
  private_key: '',
});

// Rows are added to the source list, not to the de-duplicated copy — the copy is
// rebuilt from the source list, so a row pushed straight into it disappears the
// next time that happens.
const addSourceConnection = () => {
  sourceConnectionsByIds.value.push(emptyConnection());
};

const deleteSourceConnection = (id: string) => {
  const index = sourceConnectionsByIds.value.findIndex(
    (conn: any) => connectionRowKey(conn) === id,
  );
  if (index !== -1) {
    sourceConnectionsByIds.value.splice(index, 1);
  }
};

// Consolidated EditSourceConnectionInfo logic
const sourceConnectionsByIds = ref<any[]>([]);
const uniqueSourceConnectionsByIds = ref<any[]>([]);

// Every row must be ready to save. Asked of the rows themselves, so nothing
// depends on which form reported last or on any per-row bookkeeping. A row for an
// already-registered connection opens empty and only sends what was typed, so the
// blank-means-keep rule applies to it.
const isSaveEnabled = computed(
  () =>
    uniqueSourceConnectionsByIds.value.length > 0 &&
    uniqueSourceConnectionsByIds.value.every((conn: any) =>
      isConnectionRowValid(conn, { existing: !!conn._original }),
    ),
);

// An already-registered connection opens with all input fields empty. Existing values are
// shown only as placeholders, and only fields the user actually enters are validated and sent.
// In particular, the three credential fields are returned encrypted by the server, so putting
// those values back into the inputs would overwrite the stored plaintext with ciphertext and
// break the connection.
const toEditableRow = (connId: string) => {
  const stored = sourceConnectionStore.getConnectionById(connId) as any;
  return {
    _id: newConnectionRowId(),
    id: stored?.id,
    _original: stored,
    name: '',
    description: '',
    ip_address: '',
    ssh_port: '',
    user: '',
    password: '',
    private_key: '',
  };
};

// Load data based on the selected Connection ID
watchEffect(() => {
  if (props.multiSelectedConnectionIds.length === 1) {
    sourceConnectionsByIds.value = [
      toEditableRow(props.multiSelectedConnectionIds[0]),
    ];
  } else if (props.multiSelectedConnectionIds.length > 1) {
    sourceConnectionsByIds.value =
      props.multiSelectedConnectionIds.map(toEditableRow);
  } else if (
    props.multiSelectedConnectionIds.length === 0 &&
    props.selectedConnectionId.length === 0
  ) {
    // Adding a new Connection
    sourceConnectionsByIds.value = [emptyConnection()];
  }
});

// Remove duplicates
watchEffect(() => {
  uniqueSourceConnectionsByIds.value = Array.from(
    new Map(
      sourceConnectionsByIds.value.map(item => [connectionRowKey(item), item]),
    ).values(),
  );
});

// Keep connectionInfoData in sync with uniqueSourceConnectionsByIds
watchEffect(() => {
  connectionInfoData.value = uniqueSourceConnectionsByIds.value;
});

// An empty input field means "leave it as-is," so it's not included in the request.
//
// Name is excluded. The linked system puts a global uniqueness constraint on connection names
// (`connection_infos.name`, case-insensitive), so a name can collide even with connections in
// other source groups. Since this screen saves multiple entries at once, if one fails midway
// it's hard to tell how far it was applied. Name changes are handled one at a time via the
// per-item edit in the list/detail views.
const UPDATABLE_FIELDS = [
  'description',
  'ip_address',
  'ssh_port',
  'user',
  'password',
  'private_key',
] as const;

const buildUpdateRequest = (info: any) => {
  const request: Record<string, unknown> = {};
  UPDATABLE_FIELDS.forEach(field => {
    const value = info[field];
    if (value === undefined || value === null) return;
    const trimmed = String(value).trim();
    if (trimmed === '') return;
    // If entered but identical to the existing value, there's no reason to send it.
    const current = info._original?.[field];
    if (current !== undefined && String(current) === trimmed) return;
    request[field] = trimmed;
  });
  return request;
};

// An already-registered connection has its name locked. Name collisions are only reported by
// the server at save time, and since this screen saves multiple entries sequentially, one
// failure can happen after the others were already applied. Name changes are handled one at a
// time via the per-item edit in the list/detail views.
const getReadonlyFields = (connection: any) => {
  // A newly added connection needs a name entered, so don't lock it.
  if (!connection.id) return [] as string[];
  return ['name'];
};

const handleAddSourceConnection = async () => {
  saveLoading.value = true;

  try {
    // Split connections into existing (has id) and new (no id)
    const existingConnections = connectionInfoData.value.filter(
      info => info.id,
    );
    const newConnections = connectionInfoData.value.filter(info => !info.id);

    // Update existing connections — include only the fields the user actually entered.
    // The linked system applies only the fields sent and keeps the existing values for the
    // rest, so there's no need to send empty values along.
    for (const info of existingConnections) {
      const request = buildUpdateRequest(info);
      // If nothing changed, don't send the request.
      if (Object.keys(request).length === 0) continue;

      await updateConnectionInfo.execute({
        pathParams: {
          sgId: props.sourceServiceId,
          connId: info.id,
        },
        request,
      });
    }

    // Create new connections
    for (const info of newConnections) {
      await createConnectionInfo.execute({
        pathParams: {
          sgId: props.sourceServiceId,
        },
        request: {
          description: info.description,
          ip_address: info.ip_address,
          name: info.name,
          password: info.password,
          private_key: info.private_key,
          // Always a string — see emptyConnection above.
          ssh_port: String(info.ssh_port ?? DEFAULT_SSH_PORT),
          user: info.user,
        },
      });
    }

    saveLoading.value = false;
    showSuccessMessage('success', 'Connection(s) Saved Successfully');
    emit('update:trigger');
    emit('update:is-connection-modal-opened', false);
    emit('update:is-service-modal-opened', false);
  } catch (error) {
    saveLoading.value = false;
    if (
      (error as any).errorMsg?.value ===
      'constraint failed: UNIQUE constraint failed: connection_infos.name (2067)'
    ) {
      // The name uniqueness constraint is global rather than per source group, and is
      // case-insensitive. Even if the group you're viewing has no matching name, it can
      // collide with a connection in another group, so it gets blocked without any way to
      // tell where the conflict happened.
      showErrorMessage(
        'failed',
        'Connection name already in use. Names must be unique across all source groups, ignoring case.',
      );
    } else {
      showErrorMessage('failed', 'Connection Save Failed');
    }
  }
};
</script>

<template>
  <div class="page-modal-layout">
    <!-- :badge-title="sourceServiceId" -->
    <create-form
      class="modal-layer"
      title="Source Connection"
      subtitle="Add or edit a source connection."
      add-button-text="Add Source Connection"
      :need-widget-layout="true"
      :loading="saveLoading"
      @addSourceConnection="addSourceConnection"
      @update:is-connection-modal-opened="handleConnectionModal"
      @update:modal-state="
        () => {
          emit('update:is-service-modal-opened', false);
          emit('update:is-connection-modal-opened', false);
        }
      "
    >
      <template #add-info>
        <div
          v-for="(info, i) in uniqueSourceConnectionsByIds"
          :key="connectionRowKey(info)"
        >
          <source-connection-form
            :source-connection="uniqueSourceConnectionsByIds[i]"
            mode="edit"
            :existing="info._original ?? null"
            :show-delete-button="uniqueSourceConnectionsByIds.length > 1"
            :readonly="getReadonlyFields(info)"
            @delete="deleteSourceConnection(connectionRowKey(info))"
          />
        </div>
      </template>
      <template #buttons>
        <p-button
          style-type="tertiary"
          :disabled="saveLoading"
          @click="handleCancel"
        >
          {{ i18n.t('COMPONENT.BUTTON_MODAL.CANCEL') }}
        </p-button>
        <p-button
          data-testid="source-connection-save"
          :disabled="!isSaveEnabled"
          :loading="saveLoading"
          @click="handleAddSourceConnection"
        >
          {{ i18n.t('COMPONENT.BUTTON_MODAL.SAVE') }}
        </p-button>
      </template>
    </create-form>
  </div>
</template>
