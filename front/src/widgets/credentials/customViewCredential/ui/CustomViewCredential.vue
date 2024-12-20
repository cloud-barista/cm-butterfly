<script setup lang="ts">
import {
  PButton,
  PButtonModal,
  PPaneLayout,
  PFieldGroup,
  PTextInput,
  PDivider,
  PTextarea,
} from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { i18n } from '@/app/i18n';
import { SimpleEditForm } from '@/widgets/layout';
import { reactive, ref, watch } from 'vue';
import { IGetConnconfigListResponse } from '@/entities';
import { useConfigStore } from '@/entities/credentials/model/stores';
import { useCreateCredentials } from '@/entities/credentials/api/index';
import { PTextEditor } from '@cloudforet-test/mirinae';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';
import { storeToRefs } from 'pinia';

const modelName = ref<string>('');
const isDisabled = ref<boolean>(false);

interface iProps {
  // selectedcredentialname.value
  data: string;
  trigger?: boolean;
}

const props = defineProps<iProps>();
const emit = defineEmits([
  'update:close-modal',
  'update:trigger',
  'update:isModalOpened',
]);

const modalState = reactive({
  open: false,
  context: {
    name: '',
    description: '',
  },
});

const state = reactive({
  credentialName: '',
  aWSAccessKey: '',
  aWSSecretKey: '',
});

const configStore = useConfigStore();
const targetModel = ref<IGetConnconfigListResponse | undefined>(undefined);
const resCreateCredential = useCreateCredentials(null);
const serverCode = ref<string>('');
const { configStoreInfo } = storeToRefs(configStore);

watch(
  () => props.data,
  () => {
    targetModel.value = configStore.getConfigByName(props.data);
    serverCode.value =
      <string>targetModel.value?.onpremiseInfraModel.servers || '';
  },
  { immediate: true },
);

// const handleConfirm = async () => {
//     configStore.editConnections.map(sourceConnection => {
//     sourceConnection.ssh_port = String(sourceConnection.ssh_port);
//   });

const handleCancel = () => {
  //   sourceServiceInfo.value = {
  //     name: '',
  //     description: '',
  //   };
  //   sourceConnectionStore.editConnections = [];
  emit('update:isModalOpened', false);
};
const handleConfirm = async () => {
  console.log('handleConfirm');
  const requestData = {
    CredentialName: 'www',
    ProviderName: 'AWS',
    KeyValueInfoList: [
      {
        Key: 'aws_access_key_id',
        Value: state.aWSAccessKey,
      },
      {
        Key: 'aws_secret_access_key',
        Value: state.aWSSecretKey,
      },
    ],
  };

  try {
    const { data } = await resCreateCredential.execute({
      request: requestData,
    });

    if (data.status && data.status.code === 200) {
      showSuccessMessage('success', 'Register Success');

      configStoreInfo.value = {
        credentialName: state.credentialName,
        aWSAccessKey: state.aWSAccessKey,
        aWSSecretKey: state.aWSSecretKey,
      };

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
</script>

<template>
  <div>
    <p-button-modal
      :visible="true"
      header-title="Add Credential"
      size="md"
      :loading="resCreateCredential.isLoading.value"
      @close="handleCancel"
      @cancel="handleCancel"
      @confirm="handleConfirm"
    >
      <template #body>
        <p-pane-layout class="source-service-button-modal">
          <p-pane-layout class="layout">
            <p-field-group label="Credential Name" required>
              <p-text-input v-model="state.credentialName" :disabled="false" />
            </p-field-group>
            <p-field-group label="AWS ACCESS KEY" required>
              <p-text-input v-model="state.aWSAccessKey" :disabled="false" />
            </p-field-group>
            <p-field-group label="AWS SECRET KEY" required>
              <p-text-input
                v-if="state.aWSSecretKey !== null"
                v-model="state.aWSSecretKey"
                :disabled="false"
              />
            </p-field-group>
          </p-pane-layout>
        </p-pane-layout>
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
