<script setup lang="ts">
import {
  PFieldGroup,
  PTextInput,
  PTextarea,
  PPaneLayout,
  PI,
} from '@cloudforet-test/mirinae';
import { computed, reactive, ref, watch, watchEffect } from 'vue';

import { useSourceServiceStore } from '@/shared/libs';
import type { SourceConnection } from '@/shared/libs';
import { storeToRefs } from 'pinia';

const sourceServiceStore = useSourceServiceStore();

const { sourceConnectionInfoList } = storeToRefs(sourceServiceStore);

const emit = defineEmits([
  'update:source-connection',
  'delete:source-connection',
]);

interface iProps {
  sourceConnection: SourceConnection;
}

const props = defineProps<iProps>();

const state = reactive({
  sourceConnectionInfoList: computed(() => props.sourceConnection),
});

// watch(state, () => {
//   emit('update:source-connection', state);
// });

const handleDelete = () => {
  emit('delete:source-connection', true);
};

const handleInfo = () => {
  emit('update:source-connection', state.sourceConnectionInfoList);
};

// const isIpAddressValid = ref(false);
const invalidState = reactive({
  isIpAddressValid: false,
  isPortValid: false,
  isUserValid: false,
  isPasswordValid: false,
  isPrivateKeyValid: false,
});

watchEffect(
  () => {
    invalidState.isIpAddressValid =
      state.sourceConnectionInfoList.ip_address === '' ||
      !state.sourceConnectionInfoList.ip_address.match(
        /^(\d{1,3}\.){3}\d{1,3}$/,
      )
        ? false
        : true;

    // TODO: ssh_port가 0인 경우 제외 1~256 사이의 값만 유효하며 숫자여야함 (숫자가 아닌 경우 false)

    invalidState.isPortValid =
      (typeof state.sourceConnectionInfoList.ssh_port === 'number' &&
        state.sourceConnectionInfoList.ssh_port !== 0) ||
      state.sourceConnectionInfoList.ssh_port > 1 ||
      state.sourceConnectionInfoList.ssh_port < 256
        ? false
        : true;

    // invalidState.isPortValid =
    //   (typeof state.sourceConnectionInfoList.ssh_port === 'number' &&
    //     state.sourceConnectionInfoList.ssh_port !== 0) ||
    //   state.sourceConnectionInfoList.ssh_port > 1 ||
    //   state.sourceConnectionInfoList.ssh_port < 256
    //     ? true
    //     : false;
  },
  { flush: 'post' },
);
</script>

<template>
  <div class="source-connection-layout">
    <p-pane-layout class="source-connection-info">
      <div class="left-layer">
        <p-field-group label="Source Connection Name" invalid required>
          <p-text-input
            v-model="state.sourceConnectionInfoList.name"
            placeholder="Source Connection Name"
            :invalid="!state.sourceConnectionInfoList.name"
            @change="handleInfo"
          />
        </p-field-group>
        <p-field-group label="Description">
          <p-textarea v-model="state.sourceConnectionInfoList.description" />
        </p-field-group>
      </div>
      <div class="right-layer">
        <p-field-group label="IP Address" invalid required>
          <p-text-input
            v-model="state.sourceConnectionInfoList.ip_address"
            :invalid="!invalidState.isIpAddressValid"
            placeholder="###.###.###.###"
          />
        </p-field-group>
        <p-field-group label="Port (for SSH)" invalid required>
          <p-text-input
            v-model="state.sourceConnectionInfoList.ssh_port"
            placeholder="1~256"
            :invalid="!invalidState.isPortValid"
          />
        </p-field-group>
        <p-field-group label="User" required>
          <p-text-input
            v-model="state.sourceConnectionInfoList.user"
            placeholder="User ID"
          />
        </p-field-group>
        <p-field-group label="Password" required>
          <p-text-input
            v-model="state.sourceConnectionInfoList.password"
            placeholder="Password"
          />
        </p-field-group>
        <p-field-group class="private-key" label="Private Key" required>
          <p-text-input v-model="state.sourceConnectionInfoList.private_key" />
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
  min-height: 15.125rem;
  border-radius: 0.25rem 0 0 0.25rem;
  .left-layer {
    @apply w-[450px] mr-[1.5rem];
    .p-text-input {
      @apply w-[450px];
    }
  }
  .right-layer {
    @apply grid grid-cols-2 gap-x-[1.5rem] ml-[1.5rem];
    .p-text-input {
      @apply w-[30rem];
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
