<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { i18n } from '@/app/i18n';
import { SourceConnectionInfo } from '@/features/sourceServices';
import { ref, watchEffect } from 'vue';
import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores';

const sourceConnectionStore = useSourceConnectionStore();
interface iProps {
  selectedConnectionId: any;
}

const props = defineProps<iProps>();

const isDisabled = ref<boolean>(false);

const addSourceConnection = () => {
  sourceConnectionStore.editConnections.push({
    name: '',
    description: '',
    ip_address: '',
    user: '',
    private_key: '',
    ssh_port: 0,
    password: '',
  });
};

watchEffect(
  () => {
    if (sourceConnectionStore.editConnections.length > 0) {
      sourceConnectionStore.editConnections.forEach(s => {
        if (s.ip_address && s.name && s.password && s.ssh_port && s.user) {
          isDisabled.value = true;
        } else {
          isDisabled.value = false;
        }
      });
    }
  },
  { flush: 'post' },
);

const deleteSourceConnection = () => {
  sourceConnectionStore.editConnections.splice(-1, 1);
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
          :key="i"
        >
          <source-connection-info
            :source-connection="value"
            @delete:source-connection="deleteSourceConnection"
          />
        </div>
      </template>
      <template #buttons>
        <p-button style-type="tertiary" @click="handleCancel">
          {{ i18n.t('COMPONENT.BUTTON_MODAL.CANCEL') }}
        </p-button>
        <p-button :disabled="!isDisabled" @click="handleAddSourceConnection">
          {{ i18n.t('COMPONENT.BUTTON_MODAL.APPLY') }}
        </p-button>
      </template>
    </create-form>
  </div>
</template>
