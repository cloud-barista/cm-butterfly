<script setup lang="ts">
import {
  PFieldGroup,
  PTextInput,
  PTextarea,
  PPaneLayout,
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
const sourceConnectionsByIds = ref<any[]>([]);
const uniqueSourceConnectionsByIds = ref<any[]>([]);

interface iProps {
  selectedSourceConnectionIds: string[];
  sourceServiceId: string;
}

const props = defineProps<iProps>();

const addedSourceConnectionInfo = ref<any>({});

const invalidState = reactive({
  isIpAddressValid: false,
  isPortValid: false,
});

watchEffect(() => {
  uniqueSourceConnectionsByIds.value.forEach(info => {
    invalidState.isIpAddressValid =
      info.ip_address === '' ||
      !info.ip_address.match(/^(\d{1,3}\.){3}\d{1,3}$/)
        ? false
        : true;

    if (typeof Number(info.ssh_port) === 'number') {
      invalidState.isPortValid =
        Number(info.ssh_port) > 0 && Number(info.ssh_port) < 65535
          ? true
          : false;
    }
  });
});

watchEffect(() => {
  if (props.selectedSourceConnectionIds.length === 1) {
    sourceConnectionsByIds.value = [
      {
        ...sourceConnectionStore.getConnectionById(
          props.selectedSourceConnectionIds[0],
        ),
        user: '',
        password: '',
        private_key: '',
      },
    ];
  } else if (props.selectedSourceConnectionIds.length > 1) {
    props.selectedSourceConnectionIds.forEach((connId: string) => {
      sourceConnectionsByIds.value = [
        ...sourceConnectionsByIds.value,
        {
          ...sourceConnectionStore.getConnectionById(connId),
          user: '',
          password: '',
          private_key: '',
        },
      ];
    });
  }
});

watchEffect(() => {
  if (sourceConnectionsByIds.value.length === 0) {
    sourceConnectionsByIds.value = [
      {
        name: '',
        ip_address: '',
        ssh_port: null,
        user: '',
        password: '',
        private_key: '',
      },
    ];
  }
});

watchEffect(() => {
  uniqueSourceConnectionsByIds.value = Array.from(
    new Map(sourceConnectionsByIds.value.map(item => [item.id, item])).values(),
  );
});

watchEffect(() => {
  if (uniqueSourceConnectionsByIds.value.length > 0) {
    emit('update:values', uniqueSourceConnectionsByIds.value);
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
    <div v-for="(info, i) in uniqueSourceConnectionsByIds" :key="i">
      <p-pane-layout class="source-connection-info">
        <div class="left-layer">
          <p-field-group label="Source Connection Name" invalid required>
            <p-text-input
              v-model="info.name"
              placeholder="Source Connection Name"
              :invalid="!info.name"
            />
          </p-field-group>
          <p-field-group label="Description">
            <p-textarea v-model="addedSourceConnectionInfo.description" />
          </p-field-group>
        </div>
        <div class="right-layer">
          <p-field-group label="IP Address" invalid required>
            <p-text-input
              v-model="info.ip_address"
              placeholder="###.###.###.###"
              :invalid="!invalidState.isIpAddressValid"
            />
          </p-field-group>
          <p-field-group label="Port (for SSH)" invalid required>
            <p-text-input
              v-model="info.ssh_port"
              placeholder="1~65535"
              :invalid="!invalidState.isPortValid"
            />
          </p-field-group>
          <p-field-group label="User" invalid required>
            <p-text-input
              v-model="info.user"
              placeholder="User ID"
              :invalid="!info.user"
            />
          </p-field-group>
          <p-field-group label="Password">
            <p-text-input v-model="info.password" placeholder="Password" />
          </p-field-group>
          <p-field-group class="private-key" label="Private Key">
            <p-textarea v-model="info.private_key" :rows="5" />
          </p-field-group>
        </div>
      </p-pane-layout>
    </div>
    <!-- <p-icon-button name="ic_close" /> -->
  </div>
</template>

<style scoped lang="postcss">
.source-connection-layout {
  @apply flex mb-[1rem] flex-col gap-[1rem];
}
.source-connection-info {
  @apply flex p-[1.5rem] border-[0.0625rem] border-[#DDDDDF];
  width: 100%;
  min-height: 15.125rem;
  border-radius: 0.25rem 0 0 0.25rem;
  flex-wrap: wrap;
  .left-layer {
    @apply w-[450px] mr-[1.5rem];
    .p-text-input {
      /* @apply w-[450px]; */
    }
    .p-textarea {
    }
  }
  .right-layer {
    @apply flex flex-wrap gap-x-[1.5rem];
    flex: 1;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    .p-text-input {
      /* @apply w-[20rem]; */
    }
    .private-key {
      @apply col-span-2 w-full;
      .p-textarea {
        @apply w-full;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .source-connection-info {
    flex-direction: column;
  }

  .left-layer {
    @apply w-full;
    margin-right: 0;
  }

  .right-layer {
    @apply w-full;
    margin-left: 0;
    display: grid;
    grid-template-columns: 1fr;
  }
}
button {
  @apply bg-[#EDEDEF] w-[2.5rem];
}

:deep(.p-text-input) {
  @apply w-[19.25rem];
}

:deep(.p-textarea) {
  @apply w-[23.25rem];
}
</style>
