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
  isUserValid: false,
  isPasswordValid: false,
  isPrivateKeyValid: false,
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
            :invalid="!invalidState.isIpAddressValid"
            placeholder="###.###.###.###"
          />
        </p-field-group>
        <p-field-group label="Port (for SSH)" invalid required>
          <p-text-input
            v-model="addedSourceConnectionInfo.ssh_port"
            placeholder="1~256"
            :invalid="!invalidState.isPortValid"
          />
        </p-field-group>
        <p-field-group label="User" required>
          <p-text-input
            v-model="addedSourceConnectionInfo.user"
            placeholder="User ID"
          />
        </p-field-group>
        <p-field-group label="Password" required>
          <p-text-input
            v-model="addedSourceConnectionInfo.password"
            placeholder="Password"
          />
        </p-field-group>
        <p-field-group class="private-key" label="Private Key" required>
          <p-text-input v-model="addedSourceConnectionInfo.private_key" />
        </p-field-group>
      </div>
    </p-pane-layout>
    <!-- <p-icon-button name="ic_close" /> -->
    <button @click="handleDelete">
      <p-i name="ic_close" />
    </button>
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
