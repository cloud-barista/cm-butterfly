<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { i18n } from '@/app/i18n';
import SourceConnectionForm from '@/features/sourceServices/sourceConnection/ui/SourceConnectionForm.vue';
import { ref, watchEffect, onBeforeMount } from 'vue';
import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores';

const sourceConnectionStore = useSourceConnectionStore();
interface iProps {
  selectedConnectionId: any;
}

const props = defineProps<iProps>();

const isDisabled = ref<boolean>(false);
const validStates = ref<Map<number, boolean>>(new Map());
let connectionIdCounter = 0;

// 모달이 열릴 때 초기 connection이 없으면 하나 추가
onBeforeMount(() => {
  if (sourceConnectionStore.editConnections.length === 0) {
    sourceConnectionStore.editConnections.push({
      _id: connectionIdCounter++,
      name: '',
      description: '',
      ip_address: '',
      user: '',
      private_key: '',
      ssh_port: '22',
      password: '',
    });
  } else {
    // 기존 connection들에 ID 부여
    sourceConnectionStore.editConnections.forEach((conn: any) => {
      if (!conn._id) {
        conn._id = connectionIdCounter++;
      }
    });
  }
});

const handleValidChange = (id: number, valid: boolean) => {
  validStates.value.set(id, valid);
  // 모든 connection이 유효한지 확인
  const allValid = Array.from(validStates.value.values()).every(v => v);
  isDisabled.value = allValid && validStates.value.size === sourceConnectionStore.editConnections.length;
};

const addSourceConnection = () => {
  sourceConnectionStore.editConnections.push({
    _id: connectionIdCounter++,
    name: '',
    description: '',
    ip_address: '',
    user: '',
    private_key: '',
    ssh_port: '22',
    password: '',
  });
};

const deleteSourceConnection = (id: number) => {
  const index = sourceConnectionStore.editConnections.findIndex((conn: any) => conn._id === id);
  if (index !== -1) {
    sourceConnectionStore.editConnections.splice(index, 1);
    validStates.value.delete(id);
    // 삭제 후 validation 상태 재계산
    const allValid = Array.from(validStates.value.values()).every(v => v);
    isDisabled.value = allValid && validStates.value.size === sourceConnectionStore.editConnections.length;
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
          :key="value._id"
        >
          <source-connection-form
            v-if="sourceConnectionStore.editConnections[i]"
            v-model="sourceConnectionStore.editConnections[i]"
            mode="create"
            :show-delete-button="sourceConnectionStore.editConnections.length > 1"
            @delete="deleteSourceConnection(value._id)"
            @update:valid="valid => handleValidChange(value._id, valid)"
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
