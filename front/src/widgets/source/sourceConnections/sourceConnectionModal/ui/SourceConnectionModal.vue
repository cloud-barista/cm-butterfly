<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { i18n } from '@/app/i18n';
import SourceConnectionForm from '@/features/sourceServices/sourceConnection/ui/SourceConnectionForm.vue';
import { ref, computed, onBeforeMount } from 'vue';
import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores';
import {
  connectionRowKey,
  newConnectionRowId,
} from '@/shared/utils/connectionRows';
import { isConnectionRowValid } from '@/shared/utils/connectionValidation';

const sourceConnectionStore = useSourceConnectionStore();
interface iProps {
  selectedConnectionId: any;
}

const props = defineProps<iProps>();

const emptyConnection = () => ({
  _id: newConnectionRowId(),
  name: '',
  description: '',
  ip_address: '',
  user: '',
  private_key: '',
  ssh_port: '22',
  password: '',
});

// Add one connection if there are none when the modal opens
onBeforeMount(() => {
  if (sourceConnectionStore.editConnections.length === 0) {
    sourceConnectionStore.editConnections.push(emptyConnection());
    return;
  }
  // Rows kept in the store from an earlier visit, or produced by a file import,
  // may be missing an id or a field. Rebuilding each one gives it both — a field
  // added to an existing object afterwards would not be reactive, and the save
  // button below would then miss what the user types into it.
  sourceConnectionStore.editConnections =
    sourceConnectionStore.editConnections.map((conn: any) => ({
      ...emptyConnection(),
      ...conn,
      _id: connectionRowKey(conn) || newConnectionRowId(),
    }));
});

// Every row must be ready to save. Asked of the rows themselves, so nothing
// depends on which form reported last or on any per-row bookkeeping.
const isSaveEnabled = computed(
  () =>
    sourceConnectionStore.editConnections.length > 0 &&
    sourceConnectionStore.editConnections.every((conn: any) =>
      isConnectionRowValid(conn),
    ),
);

const addSourceConnection = () => {
  sourceConnectionStore.editConnections.push(emptyConnection());
};

const deleteSourceConnection = (id: string) => {
  const index = sourceConnectionStore.editConnections.findIndex(
    (conn: any) => connectionRowKey(conn) === id,
  );
  if (index !== -1) {
    sourceConnectionStore.editConnections.splice(index, 1);
  }
};

const emit = defineEmits([
  'update:is-connection-modal-opened',
  'update:is-service-modal-opened',
]);

const handleCancel = () => {
  emit('update:is-connection-modal-opened', false);
};

const handleAddSourceConnection = () => {
  emit('update:is-connection-modal-opened', false);
  emit('update:is-service-modal-opened', true);
};
</script>

<template>
  <div class="page-modal-layout">
    <create-form
      class="modal-layer"
      title="Source Connection"
      subtitle="Add or register a source connection."
      add-button-text="Add Source Connection"
      :need-widget-layout="true"
      @addSourceConnection="addSourceConnection"
      @update:modal-state="
        () => {
          emit('update:is-connection-modal-opened', false);
          emit('update:is-service-modal-opened', true);
        }
      "
    >
      <template #add-info>
        <div
          v-for="(value, i) in sourceConnectionStore.editConnections"
          :key="connectionRowKey(value)"
        >
          <source-connection-form
            v-if="sourceConnectionStore.editConnections[i]"
            :source-connection="sourceConnectionStore.editConnections[i]"
            mode="create"
            :show-delete-button="
              sourceConnectionStore.editConnections.length > 1
            "
            @delete="deleteSourceConnection(connectionRowKey(value))"
          />
        </div>
      </template>
      <template #buttons>
        <p-button style-type="tertiary" @click="handleCancel">
          {{ i18n.t('COMPONENT.BUTTON_MODAL.CANCEL') }}
        </p-button>
        <p-button
          data-testid="source-connection-apply"
          :disabled="!isSaveEnabled"
          @click="handleAddSourceConnection"
        >
          {{ i18n.t('COMPONENT.BUTTON_MODAL.APPLY') }}
        </p-button>
      </template>
    </create-form>
  </div>
</template>
