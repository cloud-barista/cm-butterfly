<script setup lang="ts">
import { CreateForm } from '@/widgets/layout';
import { SourceConnectionInfo } from '@/features/sourceServices';
import { PButton } from '@cloudforet-test/mirinae';
import { i18n } from '@/app/i18n';
import { useSourceServiceStore } from '@/shared/libs';
import type { SourceConnection } from '@/shared/libs';
import { storeToRefs } from 'pinia';
import { computed, onMounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router/composables';

const sourceServiceStore = useSourceServiceStore();
const router = useRouter();

const { editingSourceConnectionList, sourceConnectionInfoList } =
  storeToRefs(sourceServiceStore);

// TODO: store에 저장된 특정 source group의 source connection list 정보를 가져오는 로직 필요
// 우선 임시로 아래와 같이 작성
const _sourceConnectionInfoList: SourceConnection[] = [
  {
    name: 'source connection 1',
    description: 'source connection 1 description',
    ip_address: '192.168.0.1',
    user: 'user1',
    private_key: 'key',
    ssh_port: 22,
    password: 'password',
  },
  {
    name: 'source connection 2',
    description: 'source connection 2 description',
    ip_address: '111.111.111.10',
    user: 'user2',
    private_key: 'key',
    ssh_port: 22,
    password: 'password',
  },
];

onMounted(() => {
  sourceConnectionInfoList.value = [
    ...sourceConnectionInfoList.value,
    ..._sourceConnectionInfoList,
  ];
});

const addSourceConnection = (value: boolean) => {
  value
    ? sourceServiceStore.setSourceConnectionInfoList({
        name: '',
        description: '',
        ip_address: '',
        user: '',
        private_key: '',
        ssh_port: 0,
        password: '',
      })
    : null;
};

const deleteSourceConnection = (value: boolean) => {
  value ? (sourceConnectionInfoList.value = []) : null;
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

const handleCancel = () => {};

const handleSave = () => {
  // TODO: store에 저장된 source connection 정보를 서버로 전송하는 로직 필요 (api connection)
  // sourceConnectionInfoList.value를 api에 request로 보내면 됨.
};

const handleSourceConnection = (value: SourceConnection) => {};

const handleDeleteSourceConnection = () => {};

// TODO: 해당 페이지 떠날 때 store에 저장된 source connection 정보 초기화 필요 (두 가지 페이지가 있어서 겹칠 경우 대비)
// TODO: 페이지 이동 시 초기화하는 로직 필요 아래에 코드 추가해주세요

router.beforeEach((to, from, next) => {
  // 이전페이지로 돌아가지 않는한 store의 source connection 정보 초기화
  if (to.name !== 'CloudResources') {
    sourceConnectionInfoList.value = [];
  }
});
</script>

<template>
  <create-form
    title="Source Connection"
    subtitle="Add or register a source connection."
    add-button-text="Add Source Connection"
    @addSourceConnection="addSourceConnection"
    @deleteSourceConnection="deleteSourceConnection"
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
      <p-button :disabled="!isDisabled" @click="handleSave">
        {{ i18n.t('COMPONENT.BUTTON_MODAL.SAVE') }}
      </p-button>
    </template>
  </create-form>
</template>

<style scoped lang="postcss"></style>
