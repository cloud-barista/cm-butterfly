<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { i18n } from '@/app/i18n';
import { EditSourceConnectionInfo } from '@/features/sourceServices';
import { ref, watchEffect } from 'vue';
import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores';
import { useCreateConnectionInfo } from '@/entities/sourceConnection/api';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';
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

const isDisabled = ref<boolean>(false);

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

const handleAddSourceConnection = async () => {
  if (props.multiSelectedConnectionIds.length > 0) {
    saveLoading.value = true;
    try {
      connectionInfoData.value.forEach(async info => {
        const { data } = await updateConnectionInfo.execute({
          pathParams: {
            sgId: props.sourceServiceId,
            connId: info.id,
          },
          request: {
            description: info.description,
            ip_address: info.ip_address,
            password: info.password,
            private_key: info.private_key,
            ssh_port: info.ssh_port,
            user: info.user,
          },
        });
        if (data) {
          saveLoading.value = false;
          showSuccessMessage('success', 'Connection Modified Successfully');
          emit('update:trigger');
          emit('update:is-connection-modal-opened', false);
          emit('update:is-service-modal-opened', false);
        }
      });
    } catch (error) {
      saveLoading.value = false;
      if (
        (error as any).errorMsg ===
        'constraint failed: UNIQUE constraint failed: connection_infos.name (2067)'
      ) {
        showErrorMessage('failed', 'Connection Info Name Already Exists');
      }
      showErrorMessage('failed', 'Connection Modifying Failed');
    }
  } else if (
    props.selectedConnectionId.length === 0 &&
    props.multiSelectedConnectionIds.length === 0
  ) {
    saveLoading.value = true;
    try {
      if (props.selectedConnectionId.length === 0) {
        const { data } = await createConnectionInfo.execute({
          pathParams: {
            sgId: props.sourceServiceId,
          },
          request: {
            description: connectionInfoData.value[0].description,
            ip_address: connectionInfoData.value[0].ip_address,
            name: connectionInfoData.value[0].name,
            password: connectionInfoData.value[0].password,
            private_key: connectionInfoData.value[0].private_key,
            ssh_port: connectionInfoData.value[0].ssh_port,
            user: connectionInfoData.value[0].user,
          },
        });

        if (data) {
          saveLoading.value = false;
          showSuccessMessage('success', 'Connection Created Successfully');

          emit('update:trigger');
          emit('update:is-connection-modal-opened', false);
          emit('update:is-service-modal-opened', false);
        }
      }
    } catch (error) {
      saveLoading.value = false;
      if (
        (error as any).errorMsg.value ===
        'constraint failed: UNIQUE constraint failed: connection_infos.name (2067)'
      ) {
        showErrorMessage('failed', 'Connection Info Name Already Exists');
      }
      showErrorMessage('failed', 'Connection Creation Failed');
    }
  }
};

watchEffect(() => {
  connectionInfoData.value.forEach(data => {
    if (
      data.name !== '' &&
      data.ip_address !== '' &&
      data.user !== '' &&
      data.password !== '' &&
      data.ssh_port !== 0
    ) {
      isDisabled.value = true;
    } else if (typeof Number(data.ssh_port) !== 'number') {
      isDisabled.value = false;
    } else {
      isDisabled.value = false;
    }
  });
});

watchEffect(() => {
  if (props.selectedConnectionId.length > 0) {
    isDisabled.value = true;
  }
});
</script>

<template>
  <div class="page-modal-layout">
    <!-- :badge-title="sourceServiceId" -->
    <create-form
      class="modal-layer"
      title="Source Connection"
      subtitle="Add or edit a source connection."
      add-button-text=""
      :need-widget-layout="true"
      :loading="saveLoading"
      @update:is-connection-modal-opened="handleConnectionModal"
      @update:modal-state="
        () => {
          emit('update:is-service-modal-opened', false);
          emit('update:is-connection-modal-opened', false);
        }
      "
    >
      <template #add-info>
        <edit-source-connection-info
          :selected-source-connection-ids="multiSelectedConnectionIds"
          :source-service-id="sourceServiceId"
          @update:values="e => (connectionInfoData = e)"
        />
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
          :disabled="!isDisabled"
          :loading="saveLoading"
          @click="handleAddSourceConnection"
        >
          {{ i18n.t('COMPONENT.BUTTON_MODAL.SAVE') }}
        </p-button>
      </template>
    </create-form>
  </div>
</template>
