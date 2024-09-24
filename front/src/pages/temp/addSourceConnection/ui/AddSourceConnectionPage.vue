<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { i18n } from '@/app/i18n';
import { SourceConnectionInfo } from '@/features/sourceServices';
import { computed, ref, watch, onMounted, watchEffect } from 'vue';
import { useSourceServiceStore } from '@/shared/libs/store/source-service-store';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router/composables';

const sourceServiceStore = useSourceServiceStore();
const router = useRouter();

const {
  editingSourceConnectionList,
  sourceConnectionInfoList,
  sourceConnectionNameList,
} = storeToRefs(sourceServiceStore);

// TODO: types.ts로 이동
interface SourceConnection {
  name: string;
  description: string;
  ip_address: string;
  user: string;
  private_key: string;
  ssh_port: number;
  password: string;
}

const isAdded = ref<boolean[]>([]);

const addSourceConnection = (value: boolean) => {
  if (value) {
    sourceServiceStore.setSourceConnectionInfoList({
      name: '',
      description: '',
      ip_address: '',
      user: '',
      private_key: '',
      ssh_port: 0,
      password: '',
    });
  }
};

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
  router.push({ name: 'CloudResources' });
};

const handleCancel = () => {
  sourceConnectionInfoList.value = [];
  sourceConnectionNameList.value = [];

  router.push({ name: 'CloudResources' });
};

const handleGoBack = (value: boolean) => {
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
        return sourceConnectionInfo.name !== ''
          ? sourceConnectionInfo.name
          : null;
      },
    );
    _res = res.filter(r => r !== null);
    nameCnt = _res.length;
  }
  return nameCnt < length || nameCnt !== length ? false : true;
});
</script>

<template>
  <create-form
    title="Source Connection"
    subtitle="Add or register a source connection."
    add-button-text="Add Source Connection"
    @addSourceConnection="addSourceConnection"
    @deleteSourceConnection="handleGoBack"
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
</template>

<style scoped lang="postcss"></style>
