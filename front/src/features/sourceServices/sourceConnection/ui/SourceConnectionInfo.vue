<script setup lang="ts">
import {
  PFieldGroup,
  PTextInput,
  PTextarea,
  PPaneLayout,
  PI,
} from '@cloudforet-test/mirinae';
import { computed, reactive, watch, watchEffect } from 'vue';

import { useSourceServiceStore } from '@/shared/libs/store/source-service-store';
import { storeToRefs } from 'pinia';

import type { SourceConnection } from '@/shared/libs/store/source-service-store';

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
</script>

<template>
  <div class="source-connection-layout">
    <p-pane-layout class="source-connection-info">
      <div class="left-layer">
        <p-field-group label="Source Connection Name" required>
          <p-text-input
            v-model="state.sourceConnectionInfoList.name"
            placeholder="Source Connection Name"
            @change="handleInfo"
          />
        </p-field-group>
        <p-field-group label="Description">
          <p-textarea v-model="state.sourceConnectionInfoList.description" />
        </p-field-group>
      </div>
      <div class="right-layer">
        <p-field-group label="IP Address">
          <p-text-input
            v-model="state.sourceConnectionInfoList.ip_address"
            placeholder="###.###.###.###"
          />
        </p-field-group>
        <p-field-group label="Port (for SSH)">
          <p-text-input
            v-model="state.sourceConnectionInfoList.ssh_port"
            placeholder="1~256"
          />
        </p-field-group>
        <p-field-group label="User">
          <p-text-input
            v-model="state.sourceConnectionInfoList.user"
            placeholder="User ID"
          />
        </p-field-group>
        <p-field-group label="Password">
          <p-text-input
            v-model="state.sourceConnectionInfoList.password"
            placeholder="Password"
          />
        </p-field-group>
        <p-field-group class="private-key" label="Private Key">
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
