<script setup lang="ts">
import { i18n } from '@/app/i18n';
import { PButtonModal } from '@cloudforet-test/mirinae';
import { reactive, ref, watchEffect } from 'vue';
import { UpdateSourceService } from '@/features/sourceServices';
import { useRegisterSourceGroup } from '@/entities/sourceService/api';
import { showSuccessMessage, showErrorMessage } from '@/shared/utils';
import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores.ts';
import { useSourceServiceStore } from '@/shared/libs';
import { storeToRefs } from 'pinia';

const sourceConnectionStore = useSourceConnectionStore();
const sourceServicesStore = useSourceServiceStore();

const { sourceServiceInfo } = storeToRefs(sourceServicesStore);

interface Props {
  trigger?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits([
  'update:isModalOpened',
  'update:is-connection-modal-opened',
  'update:trigger',
]);

const isDisabled = ref<boolean>(false);

const registerSourceGroup = useRegisterSourceGroup<{ request: any }, any>(null);

const state = reactive({
  sourceServiceName: '',
  description: '',
});

watchEffect(() => {
  state.sourceServiceName && state.sourceServiceName.length > 0
    ? (isDisabled.value = true)
    : (isDisabled.value = false);
});

const handleSourceServiceInfo = (value: any) => {
  state.sourceServiceName = value.sourceServiceName;
  state.description = value.description;
};

const handleConfirm = async () => {
  sourceConnectionStore.editConnections.map(sourceConnection => {
    sourceConnection.ssh_port = String(sourceConnection.ssh_port);
  });

  const requestData = {
    name: state.sourceServiceName,
    description: state.description,
    connection_info: sourceConnectionStore.editConnections,
  };

  try {
    const { data } = await registerSourceGroup.execute({
      request: requestData,
    });

    if (data.status && data.status.code === 200) {
      showSuccessMessage('success', 'Register Success');

      sourceServiceInfo.value = {
        name: '',
        description: '',
      };
      sourceConnectionStore.editConnections = [];
      sourceConnectionStore.withSourceConnection = false;

      emit('update:trigger');
      emit('update:isModalOpened', false);
    }
  } catch (error) {
    if (
      (error as any).errorMsg.value ===
      'constraint failed: UNIQUE constraint failed: source_groups.name (2067)'
    ) {
      showErrorMessage('failed', 'Service Name Already Exists');
    }
    showErrorMessage('failed', 'Service Registering Failed');
  }
};

const handleCancel = () => {
  sourceServiceInfo.value = {
    name: '',
    description: '',
  };
  sourceConnectionStore.editConnections = [];
  emit('update:isModalOpened', false);
  sourceConnectionStore.withSourceConnection = false;
};

const handleConnectionModal = (value: boolean) => {
  emit('update:is-connection-modal-opened', value);
};
</script>

<template>
  <div>
    <p-button-modal
      :visible="true"
      header-title="Add Source Service"
      size="md"
      :disabled="!isDisabled"
      :loading="registerSourceGroup.isLoading.value"
      @confirm="handleConfirm"
      @cancel="handleCancel"
      @close="handleCancel"
    >
      <template #body>
        <update-source-service
          :is-edit="false"
          @update:is-connection-modal-opened="handleConnectionModal"
          @update:source-servie-info="handleSourceServiceInfo"
        />
      </template>
      <template #close-button>
        <span>{{ i18n.t('COMPONENT.BUTTON_MODAL.CANCEL') }}</span>
      </template>
      <template #confirm-button>
        <span>{{ i18n.t('COMPONENT.BUTTON_MODAL.ADD') }}</span>
      </template>
    </p-button-modal>
  </div>
</template>

<style scoped lang="postcss"></style>
