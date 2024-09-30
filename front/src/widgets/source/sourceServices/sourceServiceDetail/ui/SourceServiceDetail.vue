<script setup lang="ts">
import { PDefinitionTable, PButton, PStatus } from '@cloudforet-test/mirinae';
import { onBeforeMount, onMounted, watch } from 'vue';
import { useSourceServiceDetailModel } from '@/widgets/source/sourceServices/sourceServiceDetail/model/sourceServiceDetailModel.ts';
import { useGetSourceGroupStatus } from '@/entities/sourceService/api';
import {
  showErrorMessage,
  showLoadingMessage,
  showSuccessMessage,
} from '@/shared/utils';
import { get } from '@vueuse/core';
import { SourceServiceStatus } from '@/entities/sourceService/model/types.ts';
import { storeToRefs } from 'pinia';

interface IProps {
  selectedServiceId: string;
}

const props = defineProps<IProps>();
const {
  loadSourceServiceData,
  sourceServiceStore,
  initTable,
  tableModel,
  setServiceId,
} = useSourceServiceDetailModel();
const resGetSourceGroupStatus = useGetSourceGroupStatus(null);

watch(resGetSourceGroupStatus.status, nv => {
  if (nv === 'error') {
    showErrorMessage(
      'Error',
      'Failed to check collector installation connection status',
    );
  } else if (nv === 'success') {
    showSuccessMessage(
      'Success',
      'Successfully updated the collector installation and connection status.',
    );
  }
});

watch(
  props,
  () => {
    setServiceId(props.selectedServiceId);
  },
  { immediate: true },
);

onBeforeMount(() => {
  initTable();
});

function handleSourceGroupStatusCheck() {
  resGetSourceGroupStatus
    .execute({
      pathParams: {
        sgId: props.selectedServiceId,
      },
    })
    .then(res => {
      sourceServiceStore.setServiceStatus(
        props.selectedServiceId,
        res.data.responseData?.agentConnectionStatus,
      );

      loadSourceServiceData(props.selectedServiceId);
    });
}
</script>

<template>
  <div>
    <p-definition-table
      :fields="tableModel.tableState.fields"
      :data="tableModel.tableState.data"
      :loading="tableModel.tableState.loading"
      :block="true"
    >
      <template #data-status="{ data }">
        <p-status :theme="data.color" :text="data.text" />
      </template>

      <template #extra="{ name }">
        <div v-if="name === 'status'">
          <p-button
            style-type="tertiary"
            size="sm"
            :loading="resGetSourceGroupStatus.status.value === 'loading'"
            @click="handleSourceGroupStatusCheck"
          >
            Check
          </p-button>
        </div>
      </template>
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss"></style>
