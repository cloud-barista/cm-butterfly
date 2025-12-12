<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { i18n } from '@/app/i18n';
import SourceConnectionForm from '@/features/sourceServices/sourceConnection/ui/SourceConnectionForm.vue';
import { ref, watchEffect, computed } from 'vue';
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
const validStates = ref<Map<number | string, boolean>>(new Map());

const handleValidChange = (id: number | string, valid: boolean) => {
  validStates.value.set(id, valid);
  // 모든 connection이 유효한지 확인
  const allValid = Array.from(validStates.value.values()).every(v => v);
  isDisabled.value = allValid && validStates.value.size === uniqueSourceConnectionsByIds.value.length;
};

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

// Add 모드인지 Edit 모드인지 확인
const isAddMode = computed(() => 
  props.multiSelectedConnectionIds.length === 0 && 
  props.selectedConnectionId.length === 0
);

let connectionIdCounter = 0;

const addSourceConnection = () => {
  const newId = connectionIdCounter++;
  uniqueSourceConnectionsByIds.value.push({
    _id: newId,
    name: '',
    ip_address: '',
    ssh_port: 22,
    user: '',
    password: '',
    private_key: '',
  });
  validStates.value.set(newId, false);
};

const deleteSourceConnection = (id: number | string) => {
  const index = uniqueSourceConnectionsByIds.value.findIndex((conn: any) => (conn._id || conn.id) === id);
  if (index !== -1) {
    uniqueSourceConnectionsByIds.value.splice(index, 1);
    validStates.value.delete(id);
    // 삭제 후 validation 상태 재계산
    const allValid = Array.from(validStates.value.values()).every(v => v);
    isDisabled.value = allValid && validStates.value.size === uniqueSourceConnectionsByIds.value.length;
  }
};

// EditSourceConnectionInfo 로직 통합
const sourceConnectionsByIds = ref<any[]>([]);
const uniqueSourceConnectionsByIds = ref<any[]>([]);
let isInitialized = false;

// 선택된 Connection ID에 따라 데이터 로드
watchEffect(() => {
  if (props.multiSelectedConnectionIds.length === 1) {
    sourceConnectionsByIds.value = [
      {
        _id: connectionIdCounter++,
        ...sourceConnectionStore.getConnectionById(
          props.multiSelectedConnectionIds[0],
        ),
        user: '',
        password: '',
        private_key: '',
      },
    ];
  } else if (props.multiSelectedConnectionIds.length > 1) {
    sourceConnectionsByIds.value = props.multiSelectedConnectionIds.map(
      (connId: string) => ({
        _id: connectionIdCounter++,
        ...sourceConnectionStore.getConnectionById(connId),
        user: '',
        password: '',
        private_key: '',
      }),
    );
  } else if (props.multiSelectedConnectionIds.length === 0 && 
             props.selectedConnectionId.length === 0) {
    // 새 Connection 추가인 경우
    sourceConnectionsByIds.value = [
      {
        _id: connectionIdCounter++,
        name: '',
        ip_address: '',
        ssh_port: 22,
        user: '',
        password: '',
        private_key: '',
      },
    ];
  }
});

// 중복 제거
watchEffect(() => {
  uniqueSourceConnectionsByIds.value = Array.from(
    new Map(sourceConnectionsByIds.value.map((item, index) => [item.id || `new-${index}`, item])).values(),
  );
});

// connectionInfoData 업데이트 및 validStates 초기화 (한 번만)
watchEffect(() => {
  if (uniqueSourceConnectionsByIds.value.length > 0) {
    // connectionInfoData를 uniqueSourceConnectionsByIds와 동일하게 유지
    connectionInfoData.value = uniqueSourceConnectionsByIds.value;
    
    // validStates가 아직 초기화되지 않았거나 크기가 다를 때만 초기화
    if (!isInitialized || validStates.value.size !== uniqueSourceConnectionsByIds.value.length) {
      validStates.value.clear();
      uniqueSourceConnectionsByIds.value.forEach((conn) => {
        const connId = conn._id || conn.id;
        if (!validStates.value.has(connId)) {
          validStates.value.set(connId, false);
        }
      });
      isInitialized = true;
    }
  }
}, { flush: 'sync' });

// readonly 필드 계산 - 기존 connection 중 다중 선택 시에만 user, password, private_key readonly
const getReadonlyFields = (connection: any) => {
  // 새로 추가하는 connection (id 없음)은 모든 필드 입력 가능
  if (!connection.id) {
    return [];
  }
  // 기존 connection이 2개 이상 선택되었을 때만 일부 필드 readonly
  if (props.multiSelectedConnectionIds.length > 1) {
    return ['user', 'password', 'private_key'];
  }
  return [];
};

const handleAddSourceConnection = async () => {
  saveLoading.value = true;
  
  try {
    // connection들을 기존(id 있음)과 신규(id 없음)로 분리
    const existingConnections = connectionInfoData.value.filter(info => info.id);
    const newConnections = connectionInfoData.value.filter(info => !info.id);
    
    // 기존 connection 업데이트
    for (const info of existingConnections) {
      await updateConnectionInfo.execute({
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
    }
    
    // 새 connection 생성
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
          ssh_port: info.ssh_port,
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
      showErrorMessage('failed', 'Connection Info Name Already Exists');
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
        <div v-for="(info, i) in uniqueSourceConnectionsByIds" :key="info._id || info.id || i">
          <source-connection-form
            :source-connection="uniqueSourceConnectionsByIds[i]"
            mode="edit"
            :show-delete-button="uniqueSourceConnectionsByIds.length > 1"
            :readonly="getReadonlyFields(info)"
            @delete="deleteSourceConnection(info._id || info.id)"
            @update:valid="valid => handleValidChange(info._id || info.id, valid)"
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
