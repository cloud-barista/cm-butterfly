<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { i18n } from '@/app/i18n';
import { EditSourceConnectionInfo } from '@/features/sourceServices';
import { ref, watchEffect } from 'vue';
import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores';
import { useCreateConnectionInfo } from '@/entities/sourceConnection/api';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';

const sourceConnectionStore = useSourceConnectionStore();

interface iProps {
  selectedConnectionId: any;
  sourceServiceId: string;
}

const props = defineProps<iProps>();

const createConnectionInfo = useCreateConnectionInfo(
  props.sourceServiceId,
  sourceConnectionStore.editConnections[0],
);

const isDisabled = ref<boolean>(false);

const connectionInfoData = ref<any>({});
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
  saveLoading.value = true;
  try {
    if (props.selectedConnectionId.length === 0) {
      const { data } = await createConnectionInfo.execute({
        pathParams: {
          sgId: props.sourceServiceId,
        },
        request: {
          ...connectionInfoData.value,
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
    showErrorMessage('failed', 'Connection Creation Failed');
    console.log(error);
  }
};

// const handleDisable = (value: boolean) => {
//   isDisabled.value = !value;
// }

watchEffect(() => {
  if (
    props.selectedConnectionId.length === 0 &&
    connectionInfoData.value?.name !== undefined &&
    connectionInfoData.value?.ip_address !== undefined &&
    connectionInfoData.value?.user !== undefined &&
    connectionInfoData.value?.password !== undefined &&
    connectionInfoData.value?.private_key !== undefined &&
    connectionInfoData.value?.ssh_port !== 0
  ) {
    isDisabled.value = true;
  } else {
    isDisabled.value = false;
  }
});

watchEffect(() => {
  if (props.selectedConnectionId.length > 0) {
    isDisabled.value = false;
  }
});
</script>

<template>
  <div class="page-modal-layout">
    <create-form
      class="modal-layer"
      title="Source Connection"
      subtitle="Add or edit a source connection."
      add-button-text=""
      @update:is-connection-modal-opened="handleConnectionModal"
      @update:is-service-modal-opened="
        e => emit('update:is-service-modal-opened', false)
      "
    >
      <template #add-info>
        <edit-source-connection-info
          :selected-source-connection-id="selectedConnectionId"
          :source-service-id="sourceServiceId"
          @update:values="e => (connectionInfoData = e)"
        />
        <!-- @update:save-able="handleDisable" -->
      </template>
      <template #buttons>
        <p-button style-type="tertiary" @click="handleCancel">
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
