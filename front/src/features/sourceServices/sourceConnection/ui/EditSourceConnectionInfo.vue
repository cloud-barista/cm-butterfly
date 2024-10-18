<script setup lang="ts">
import {
  PFieldGroup,
  PTextInput,
  PTextarea,
  PPaneLayout,
  PI,
} from '@cloudforet-test/mirinae';
import { reactive, ref, watch, watchEffect } from 'vue';
import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores';

const sourceConnectionStore = useSourceConnectionStore();

const emit = defineEmits([
  'update:source-connection',
  'delete:source-connection',
  'update:save-able',
  'update:values',
]);

const ssh_port = ref<number | null>(null);

// TODO: sourceconnectionId가 있으면 수정으로, 없으면 추가로 처리
// 현재 수정 api는 없음

// TODO: 이미 존재하는 source service에 하나의 source connection 추가하는 api

interface iProps {
  selectedSourceConnectionId: string;
  sourceServiceId: string;
}

const props = defineProps<iProps>();

const addedSourceConnectionInfo = ref<any>({});

const handleDelete = () => {
  emit('delete:source-connection', true);
};

// const isIpAddressValid = ref(false);
const invalidState = reactive({
  isIpAddressValid: false,
  isPortValid: false,
});

watchEffect(() => {
  invalidState.isIpAddressValid =
    addedSourceConnectionInfo.value.ip_address === '' ||
    !addedSourceConnectionInfo.value.ip_address.match(/^(\d{1,3}\.){3}\d{1,3}$/)
      ? false
      : true;

  if (typeof Number(addedSourceConnectionInfo.value.ssh_port) === 'number') {
    invalidState.isPortValid =
      Number(addedSourceConnectionInfo.value.ssh_port) > 0 &&
      Number(addedSourceConnectionInfo.value.ssh_port) < 256
        ? true
        : false;
  }
});

watchEffect(() => {
  if (
    props.selectedSourceConnectionId !== undefined &&
    props.selectedSourceConnectionId.length > 0
  ) {
    addedSourceConnectionInfo.value = sourceConnectionStore.getConnectionById(
      props.selectedSourceConnectionId,
    );
  }
});

watchEffect(() => {
  if (Object.keys(addedSourceConnectionInfo.value).length > 0) {
    emit('update:values', addedSourceConnectionInfo.value);
  }
});

watch(
  ssh_port,
  nv => {
    if (nv !== null) {
      addedSourceConnectionInfo.value.ssh_port = ssh_port.value;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="source-connection-layout">
    <p-pane-layout class="source-connection-info">
      <div class="left-layer">
        <p-field-group label="Source Connection Name" invalid required>
          <p-text-input
            v-model="addedSourceConnectionInfo.name"
            placeholder="Source Connection Name"
            :invalid="!addedSourceConnectionInfo.name"
          />
        </p-field-group>
        <p-field-group label="Description">
          <p-textarea v-model="addedSourceConnectionInfo.description" />
        </p-field-group>
      </div>
      <div class="right-layer">
        <p-field-group label="IP Address" invalid required>
          <p-text-input
            v-model="addedSourceConnectionInfo.ip_address"
            placeholder="###.###.###.###"
            :invalid="!invalidState.isIpAddressValid"
          />
        </p-field-group>
        <p-field-group label="Port (for SSH)" invalid required>
          <p-text-input v-if="selectedSourceConnectionId" v-model="ssh_port" />
          <p-text-input
            v-else
            v-model="addedSourceConnectionInfo.ssh_port"
            placeholder="1~256"
            :invalid="!invalidState.isPortValid"
          />
        </p-field-group>
        <p-field-group label="User" invalid required>
          <p-text-input
            v-model="addedSourceConnectionInfo.user"
            placeholder="User ID"
            :invalid="!addedSourceConnectionInfo.user"
          />
        </p-field-group>
        <p-field-group label="Password" invalid required>
          <p-text-input
            v-model="addedSourceConnectionInfo.password"
            placeholder="Password"
            :invalid="!addedSourceConnectionInfo.password"
          />
        </p-field-group>
        <p-field-group class="private-key" label="Private Key" invalid required>
          <p-text-input
            v-model="addedSourceConnectionInfo.private_key"
            :invalid="!addedSourceConnectionInfo.private_key"
          />
        </p-field-group>
      </div>
    </p-pane-layout>
    <!-- <p-icon-button name="ic_close" /> -->
  </div>
</template>

<style scoped lang="postcss">
.source-connection-layout {
  @apply flex mb-[1rem];
}
.source-connection-info {
  @apply flex p-[1.5rem] border-[0.0625rem] border-[#DDDDDF];
  width: 100%;
  min-height: 15.125rem;
  border-radius: 0.25rem 0 0 0.25rem;
  .left-layer {
    /* @apply w-[450px] mr-[1.5rem]; */
    .p-text-input {
      @apply w-[450px];
    }
  }
  .right-layer {
    @apply grid grid-cols-2 gap-x-[1.5rem] ml-[1.5rem];
    .p-text-input {
      /* @apply w-[20rem]; */
    }
    .private-key {
      @apply col-span-2;
      .p-text-input {
        @apply w-full;
      }
    }
  }
}

button {
  @apply bg-[#EDEDEF] w-[2.5rem];
}

:deep(.p-text-input) {
  @apply w-[19.25rem];
}
</style>
