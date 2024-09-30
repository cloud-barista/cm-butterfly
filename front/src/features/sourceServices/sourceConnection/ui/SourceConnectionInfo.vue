<script setup lang="ts">
import {
  PFieldGroup,
  PTextInput,
  PTextarea,
  PPaneLayout,
  PI,
} from '@cloudforet-test/mirinae';
import { ref, reactive, watch, watchEffect } from 'vue';
import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores';

const sourceConnectionStore = useSourceConnectionStore();

const emit = defineEmits([
  'update:source-connection',
  'delete:source-connection',
]);

interface iProps {
  sourceConnection: any;
}

const props = defineProps<iProps>();

const state = reactive({
  sourceConnectionInfoList: ref(props.sourceConnection),
});

const handleDelete = () => {
  emit('delete:source-connection', true);
};

const handleInfo = () => {
  emit('update:source-connection', true);
};

// const isIpAddressValid = ref(false);
const invalidState = reactive({
  isIpAddressValid: false,
  isPortValid: false,
});

watchEffect(() => {
  invalidState.isIpAddressValid =
    state.sourceConnectionInfoList.ip_address === '' ||
    !state.sourceConnectionInfoList.ip_address.match(/^(\d{1,3}\.){3}\d{1,3}$/)
      ? false
      : true;

  // invalidState.isPasswordValid =
  //   state.sourceConnectionInfoList.password === '' ||
  //   !state.sourceConnectionInfoList.password.match(
  //     /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,16}$/,
  //   )
  //     ? false
  //     : true;

  if (typeof Number(state.sourceConnectionInfoList.ssh_port) === 'number') {
    invalidState.isPortValid =
      Number(state.sourceConnectionInfoList.ssh_port) > 0 &&
      Number(state.sourceConnectionInfoList.ssh_port) < 256
        ? true
        : false;
  }
});
</script>

<template>
  <div class="source-connection-layout">
    <p-pane-layout class="source-connection-info">
      <div class="left-layer">
        <p-field-group label="Source Connection Name" invalid required>
          <p-text-input
            v-model="sourceConnection.name"
            placeholder="Source Connection Name"
            :invalid="!sourceConnection.name"
          />
        </p-field-group>
        <p-field-group label="Description">
          <p-textarea v-model="sourceConnection.description" />
        </p-field-group>
      </div>
      <div class="right-layer">
        <p-field-group label="IP Address" invalid required>
          <p-text-input
            v-model="sourceConnection.ip_address"
            :invalid="!invalidState.isIpAddressValid"
            placeholder="###.###.###.###"
          />
        </p-field-group>
        <p-field-group label="Port (for SSH)" invalid required>
          <p-text-input
            v-model="sourceConnection.ssh_port"
            placeholder="1~256"
            :invalid="!invalidState.isPortValid"
          />
        </p-field-group>
        <p-field-group label="User" invalid required>
          <p-text-input
            v-model="sourceConnection.user"
            placeholder="User ID"
            :invalid="!sourceConnection.user"
          />
        </p-field-group>
        <p-field-group label="Password" invalid required>
          <p-text-input
            v-model="sourceConnection.password"
            placeholder="Password"
            :invalid="!invalidState.isPasswordValid"
          />
        </p-field-group>
        <p-field-group class="private-key" label="Private Key" invalid required>
          <p-text-input
            v-model="sourceConnection.private_key"
            :invalid="!sourceConnection.private_key"
          />
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
