<script setup lang="ts">
import { PDefinitionTable, PButton, PStatus } from '@cloudforet-test/mirinae';
import { onBeforeMount, onMounted, ref, watch, watchEffect } from 'vue';
import { useSourceServiceDetailModel } from '@/widgets/source/sourceServices/sourceServiceDetail/model/sourceServiceDetailModel.ts';
import {
  useGetSourceGroupStatus,
  useGetSourceService,
} from '@/entities/sourceService/api';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';
import { storeToRefs } from 'pinia';
import { useRefreshSourceGroupConnectionInfoStatus } from '@/entities/sourceConnection/api';

interface IProps {
  selectedServiceId: string;
}

const props = defineProps<IProps>();

const emit = defineEmits(['update:source-connection-name']);

// loadSourceServiceData,
const { sourceServiceStore, initTable, tableModel, setServiceId } =
  useSourceServiceDetailModel();

// const resGetSourceGroupStatus = useGetSourceGroupStatus(null); // deprecated
const refreshSourceGroupConnectionInfoStatus =
  useRefreshSourceGroupConnectionInfoStatus(null);
const getSourceService = useGetSourceService(null);
// const { serviceWithStatus } = storeToRefs(sourceServiceStore);

watch(refreshSourceGroupConnectionInfoStatus.status, nv => {
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

const checkAble = ref<boolean>(false);

onBeforeMount(() => {
  initTable();
});

watchEffect(() => {
  emit(
    'update:source-connection-name',
    sourceServiceStore.getServiceById(props.selectedServiceId)?.name,
  );
});

async function getSourceServiceWithStatus() {
  try {
    const { data } = await getSourceService.execute({
      pathParams: {
        sgId: props.selectedServiceId,
      },
    });
    if (data.status && data.status.code === 200) {
      sourceServiceStore.setServiceWithConnectionStatus(data.responseData);
    }
  } catch (error) {
    console.log(error);
  }
}

watchEffect(() => {
  getSourceServiceWithStatus();
});

/**
 * TODO: 문제점: refresh한다고해서 바로 반영이 되지 않음 -> 근데 connections에서 add / edit하면 바로 반영됨...
 * 뭔가 refresh btn의 의미가 없음....
 * 그렇다고
 */

async function handleSourceGroupStatusRefresh() {
  try {
    const { data } = await refreshSourceGroupConnectionInfoStatus.execute({
      pathParams: {
        sgId: props.selectedServiceId,
      },
    });

    if (data.status && data.status.code === 200) {
      // loadSourceServiceData(props.selectedServiceId);
      getSourceServiceWithStatus();
    }
  } catch (err) {
    console.log(err);
  }
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
            :loading="
              refreshSourceGroupConnectionInfoStatus.status.value === 'loading'
            "
            @click="handleSourceGroupStatusRefresh"
          >
            Refresh
          </p-button>
        </div>
      </template>
    </p-definition-table>
  </div>
</template>
