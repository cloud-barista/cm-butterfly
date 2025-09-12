<script setup lang="ts">
import { PBadge, PButton, PDataTable } from '@cloudforet-test/mirinae';
import { onBeforeMount, watch } from 'vue';
import { useGetLoadTestEvaluationData } from '@/entities/vm/api/api';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import {
  ILoadTestResultAggregateResponse,
  LoadTestResultAggregateTableType,
} from '@/entities/workspace/model/types';
import { showErrorMessage } from '@/shared/utils';

interface IProps {
  nsId: string;
  mciId: string;
  vmId: string;
}

const props = defineProps<IProps>();
const emit = defineEmits(['openLoadconfig']);

const detailTableModel =
  useDefinitionTableModel<Record<LoadTestResultAggregateTableType, any>>();

function initTable() {
  detailTableModel.initState();

  detailTableModel.tableState.fields = [
    { label: 'Average', name: 'average' },
    { label: 'Error Percent', name: 'errorPercent' },
    { label: 'Label', name: 'label' },
    { label: 'Max Time', name: 'maxTime' },
    { label: 'Median', name: 'median' },
    { label: 'Min Time', name: 'minTime' },
    { label: '95th Percentile', name: 'ninetyFive' },
    { label: '99th Percentile', name: 'ninetyNine' },
    { label: '90th Percentile', name: 'ninetyPercent' },
    { label: 'Received KB', name: 'receivedKB' },
    { label: 'Request Count', name: 'requestCount' },
    { label: 'Sent KB', name: 'sentKB' },
    { label: 'Throughput', name: 'throughput' },
  ];
  
  // Initialize data as empty array to prevent type error
  detailTableModel.tableState.data = [];
}

function organizeDefineTableData(response: ILoadTestResultAggregateResponse) {
  const data: Record<LoadTestResultAggregateTableType, any> = {
    average: response.average,
    errorPercent: response.errorPercent,
    label: response.label,
    maxTime: response.maxTime,
    median: response.median,
    minTime: response.minTime,
    ninetyFive: response.ninetyFive,
    ninetyNine: response.ninetyNine,
    ninetyPercent: response.ninetyPercent,
    receivedKB: response.receivedKB,
    requestCount: response.requestCount,
    sentKB: response.sentKB,
    throughput: response.throughput,
  };

  return data;
}

const resGetLoadTestResourceMetric =
  useGetLoadTestEvaluationData<'aggregate'>(null);

onBeforeMount(() => {
  initTable();
});

watch(
  props,
  nv => {
    resGetLoadTestResourceMetric
      .execute({
        queryParams: {
          nsId: nv.nsId,
          mciId: nv.mciId,
          vmId: nv.vmId,
          format: 'aggregate',
        },
      })
      .then(res => {
        detailTableModel.tableState.loading = true;

        if (res.data.responseData && res.data.responseData['result'] && Array.isArray(res.data.responseData['result'])) {
          detailTableModel.tableState.data = res.data.responseData[
            'result'
          ].map((item: ILoadTestResultAggregateResponse) =>
            organizeDefineTableData(item),
          );
        } else {
          detailTableModel.tableState.data = [];
        }
      })
      .catch(e => {
        showErrorMessage('error', e.errorMsg.value);
        detailTableModel.tableState.data = [];
      })
      .finally(() => {
        detailTableModel.tableState.loading = false;
      });
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <div>
    <p-data-table
      :fields="detailTableModel.tableState.fields"
      :items="detailTableModel.tableState.data"
      :loading="
        detailTableModel.tableState.loading ||
        resGetLoadTestResourceMetric.isLoading.value
      "
      block
      class="min-h-5"
    >
      <template #extra="{ name }">
        <div v-if="name === 'loadStatus'">
          <p-button
            style-type="tertiary"
            size="sm"
            @click="emit('openLoadconfig')"
          >
            Load Config
          </p-button>
        </div>
      </template>
      <template #data-provider="{ data }">
        <p-badge
          v-for="(provider, index) in data"
          :key="index"
          :backgroundColor="provider.color"
          class="mr-1"
        >
          {{ provider.name }}
        </p-badge>
      </template>
    </p-data-table>
  </div>
</template>

<style scoped lang="postcss"></style>
