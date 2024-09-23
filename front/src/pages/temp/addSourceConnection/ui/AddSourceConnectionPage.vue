<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { i18n } from '@/app/i18n';
import { SourceConnectionInfo } from '@/features/sourceServices';
import { ref, watch } from 'vue';
import { useSourceServiceStore } from '@/shared/libs/store/source-service-store';

const sourceServiceStore = useSourceServiceStore();

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

const sourceConnectionList = ref<SourceConnection[]>([]);

const addSourceConnection = (value: boolean) => {
  isAdded.value.push(value);
};

const handleSourceConnection = (value: any) => {
  sourceConnectionList.value.push(value);
};

const handleDeleteSourceConnection = (value: boolean) => {
  value ? isAdded.value.pop() : null;
};

watch(
  sourceConnectionList,
  () => {
    console.log(sourceConnectionList.value);
  },
  { immediate: true },
);

const handleAddSourceConnection = () => {
  let nameArr: string[] = [];
  sourceConnectionList.value.forEach((sourceConnection: SourceConnection) => {
    nameArr.push(sourceConnection.name);
  });
  sourceServiceStore.setSourceConnectionList(nameArr);
};
</script>

<template>
  <create-form
    title="Source Connection"
    subtitle="Add or register a source connection."
    add-button-text="Add Source Connection"
    @addSourceConnection="addSourceConnection"
  >
    <template #add-info>
      <div v-for="(value, i) in isAdded" :key="i">
        <source-connection-info
          v-if="value"
          @update:source-connection="handleSourceConnection"
          @delete:source-connection="handleDeleteSourceConnection"
        />
      </div>
    </template>
    <template #buttons>
      <p-button style-type="tertiary">
        {{ i18n.t('COMPONENT.BUTTON_MODAL.CANCEL') }}
      </p-button>
      <p-button @click="handleAddSourceConnection">
        {{ i18n.t('COMPONENT.BUTTON_MODAL.APPLY') }}
      </p-button>
    </template>
  </create-form>
</template>

<style scoped lang="postcss"></style>
