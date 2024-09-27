<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { i18n } from '@/app/i18n';
import { SourceConnectionInfo } from '@/features/sourceServices';
import { computed, onMounted, watchEffect } from 'vue';
import { useSourceServiceStore } from '@/shared/libs';
import type { SourceConnection } from '@/shared/libs';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router/composables';
import { SOURCE_COMPUTING_ROUTE } from '@/app/providers/router/routes/constants';
import { useSourceConnectionStore } from '@/entities/sourceConnection/model/stores';

const sourceServiceStore = useSourceServiceStore();
const sourceConnectionStore = useSourceConnectionStore();
const router = useRouter();

interface iProps {
  selectedConnectionId: any;
}

const props = defineProps<iProps>();

const { connections } = storeToRefs(sourceConnectionStore);

const {
  editingSourceConnectionList,
  sourceConnectionInfoList,
  sourceConnectionNameList,
} = storeToRefs(sourceServiceStore);

const addSourceConnection = (value: boolean) => {
  if (value) {
    sourceConnectionInfoList.value.push({
      name: '',
      description: '',
      ip_address: '',
      user: '',
      private_key: '',
      ssh_port: 0,
      password: '',
    });
    // sourceServiceStore.setSourceConnectionInfoList({
    //   name: '',
    //   description: '',
    //   ip_address: '',
    //   user: '',
    //   private_key: '',
    //   ssh_port: 0,
    //   password: '',
    // });
  }
};

onMounted(() => {
  Object.values(connections.value).forEach(v => {
    const {
      name,
      ip_address,
      ssh_port,
      description,
      user,
      password,
      private_key,
    } = v;

    const d: SourceConnection = {
      name,
      ip_address,
      ssh_port,
      description,
      user,
      password,
      private_key,
    };

    sourceConnectionInfoList.value.unshift(d);
  });
});

const handleSourceConnection = (value: SourceConnection) => {
  editingSourceConnectionList.value = [
    ...editingSourceConnectionList.value,
    value,
  ];
};

const handleDeleteSourceConnection = (value: boolean) => {
  // value ? isAdded.value.pop() : null;
  value ? sourceConnectionInfoList.value.splice(-1, 1) : null;
};

watchEffect(
  () => {
    sourceConnectionNameList.value = [];

    sourceServiceStore.setSourceConnectionNameList(
      sourceConnectionInfoList.value.map(
        (sourceConnection: SourceConnection) => {
          return sourceConnection.name;
        },
      ),
    );

    // sourceconnectnamelist에 중복된 값을 제거한 후 배열로 다시 할당
    sourceConnectionNameList.value = Array.from(
      new Set(sourceConnectionNameList.value),
    );
  },
  { flush: 'pre' },
);

const handleAddSourceConnection = () => {
  // TODO: temporary route name
  // router.push({ name: SOURCE_COMPUTING_ROUTE.SOURCE_SERVICES._NAME });
};

const handleCancel = () => {
  sourceConnectionInfoList.value = [];
  sourceConnectionNameList.value = [];

  router.push({ name: SOURCE_COMPUTING_ROUTE.SOURCE_SERVICES._NAME });
};

const deleteSourceConnection = (value: boolean) => {
  value
    ? ((sourceConnectionInfoList.value = []),
      (sourceConnectionNameList.value = []))
    : null;
};

const isDisabled = computed(() => {
  let nameCnt: number = 0;
  let _res;
  let length: number = 0;
  if (sourceConnectionInfoList.value.length > 0) {
    length = sourceConnectionInfoList.value.length;
    const res = sourceConnectionInfoList.value.map(
      (sourceConnectionInfo: SourceConnection) => {
        return sourceConnectionInfo.name !== '' &&
          sourceConnectionInfo.ip_address !== '' &&
          sourceConnectionInfo.ssh_port !== 0 &&
          sourceConnectionInfo.user !== '' &&
          sourceConnectionInfo.private_key !== '' &&
          sourceConnectionInfo.password !== ''
          ? sourceConnectionInfo.name
          : null;
      },
    );
    _res = res.filter(r => r !== null);
    nameCnt = _res.length;
  }
  return nameCnt < length || nameCnt !== length ? false : true;
});

const emit = defineEmits(['update:is-connection-modal-opened']);

const handleConnectionModal = (value: boolean) => {
  !value ? emit('update:is-connection-modal-opened', value) : null;
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
      @deleteSourceConnection="deleteSourceConnection"
      @update:is-connection-modal-opened="handleConnectionModal"
    >
      <template #add-info>
        <div v-for="(value, i) in sourceConnectionInfoList" :key="i">
          <source-connection-info
            v-if="value"
            :source-connection="value"
            @update:source-connection="handleSourceConnection"
            @delete:source-connection="handleDeleteSourceConnection"
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

<style scoped lang="postcss">
/* .page-modal-layout {
  overflow-y: scroll;
  position: fixed;
  width: 100vw;
  height: calc(100vh - $top-bar-height);
  top: $top-bar-height;
  left: 0;
  z-index: 99;
  background-color: $bg-color;
} */
</style>
