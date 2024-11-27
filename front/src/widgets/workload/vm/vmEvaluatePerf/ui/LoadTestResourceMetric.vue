<script setup lang="ts">
import { useGetLoadTestResourceMetric } from '@/entities/vm/api/api.ts';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { IResourceMetricData } from '@/entities/workspace/model/types.ts';
import * as echarts from 'echarts';
import { PDataLoader } from '@cloudforet-test/mirinae';
import { formatDate, showErrorMessage } from '@/shared/utils';
interface IProps {
  nsId: string;
  mciId: string;
  vmId: string;
}

const props = defineProps<IProps>();

const resGetLoadTestResourceMetric = useGetLoadTestResourceMetric(null);

const chartContainer = ref<HTMLDivElement | null>(null);
const chart = ref<echarts.ECharts | null>(null);

watch(props, () => {
  loadChart();
});

onMounted(() => {
  loadChart();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', () => chart.value?.resize());
});

function loadChart() {
  resGetLoadTestResourceMetric
    .execute({
      queryParams: {
        nsId: props.nsId,
        mciId: props.mciId,
        vmId: props.vmId,
        format: 'normal',
      },
    })
    .then(res => {
      if (res.data.responseData && res.data.responseData.result) {
        createTimeSeriesChart(
          chartContainer.value,
          res.data.responseData.result,
          'line',
        );
      }
    })
    .catch(e => {});
}

function createTimeSeriesChart(
  container: HTMLDivElement | null,
  data: IResourceMetricData[],
  chartType = 'line',
) {
  const seriesData = data.map((item: IResourceMetricData) => ({
    name: item.Label,
    type: chartType,
    data: item.Metrics.map(metric => ({
      value: [formatDate(metric.Timestamp), parseFloat(metric.Value)],
    })),
  }));

  const xAxisLabels =
    data.length > 0
      ? data[0].Metrics.map(metric => formatDate(metric.Timestamp))
      : [];

  const option = {
    title: {
      text: '',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: data.map(item => item.Label),
    },
    xAxis: {
      type: 'category',
      name: 'Time',
      data: xAxisLabels,
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      name: 'Value',
      scale: true,
    },
    series: seriesData,
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0,
        start: 0,
        end: 100,
      },
      {
        type: 'inside',
        xAxisIndex: 0,
        start: 0,
        end: 100,
      },
    ],
  };

  if (container) {
    chart.value = echarts.init(container, null, {
      renderer: 'canvas',
      useDirtyRect: false,
    });
    chart.value.setOption(option);
    window.addEventListener('resize', () => chart.value?.resize());
  }
}
</script>

<template>
  <div class="w-full h-full">
    <div
      v-if="resGetLoadTestResourceMetric.status.value === 'success'"
      ref="chartContainer"
      class="w-full h-full relative"
    ></div>
    <p-data-loader
      v-else
      :data="false"
      :loading="resGetLoadTestResourceMetric.isLoading.value"
      class="w-full h-full"
    >
    </p-data-loader>
  </div>
</template>

<style scoped lang="postcss"></style>
