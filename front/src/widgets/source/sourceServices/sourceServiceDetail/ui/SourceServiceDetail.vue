<script setup lang="ts">
import { PDefinitionTable, PButton, PStatus } from '@cloudforet-test/mirinae';
import { onBeforeMount, reactive, ref, watch, watchEffect } from 'vue';
import { useSourceServiceDetailModel } from '@/widgets/source/sourceServices/sourceServiceDetail/model/sourceServiceDetailModel';
import { useGetInfraSourceGroup } from '@/entities/sourceService/api';
import { showErrorMessage } from '@/shared/utils';
import { useRefreshSourceGroupConnectionInfoStatus } from '@/entities/sourceConnection/api';
import SourceServiceInfraRefineModal from '@/features/sourceServices/sourceServiceInfraRefinedModal/ui/sourceServiceInfraRefineModal.vue';

interface IProps {
  selectedServiceId: string;
}

const props = defineProps<IProps>();

const emit = defineEmits(['update:source-connection-name']);

const {
  sourceServiceStore,
  initTable,
  tableModel,
  setServiceId,
  loadSourceServiceData,
} = useSourceServiceDetailModel();

const refreshSourceGroupConnectionInfoStatus =
  useRefreshSourceGroupConnectionInfoStatus(null);
const resGetInfraSourceGroup = useGetInfraSourceGroup(null);
const infraModel = ref({});

const modalState = reactive({
  open: false,
  context: {
    name: '',
    description: '',
  },
});

onBeforeMount(() => {
  initTable();
});

watch(
  props,
  () => {
    setServiceId(props.selectedServiceId);
  },
  { immediate: true },
);

watchEffect(() => {
  emit(
    'update:source-connection-name',
    sourceServiceStore.getServiceById(props.selectedServiceId)?.name,
  );
});

function getSourceGroupInfras() {
  resGetInfraSourceGroup
    .execute({
      pathParams: {
        sgId: props.selectedServiceId,
      },
    })
    .then(res => {
      if (res.data.responseData) {
        sourceServiceStore.mappinginfraModel(
          props.selectedServiceId,
          res.data.responseData,
        );
        infraModel.value = res.data.responseData;
        loadSourceServiceData(props.selectedServiceId);
      }
    })
    .catch(e => {});
}

async function handleSourceGroupStatusRefresh() {
  try {
    const { data } = await refreshSourceGroupConnectionInfoStatus.execute({
      pathParams: {
        sgId: props.selectedServiceId,
      },
    });

    if (data.responseData && data.responseData.message) {
      sourceServiceStore.mappingSourceGroupStatus(
        props.selectedServiceId,
        data.responseData.message,
      );

      loadSourceServiceData(props.selectedServiceId);
    }
  } catch (err: any) {
    showErrorMessage('error', err.errorMsg.value);
  }
}

function handleJsonModal() {
  modalState.open = true;
}
</script>

<template>
  <div>
    <p-definition-table
      :fields="tableModel.tableState.fields"
      :data="tableModel.tableState.data"
      :loading="
        tableModel.tableState.loading || resGetInfraSourceGroup.isLoading.value
      "
      :block="true"
    >
      <template #data-status="{ data }">
        <p-status :theme="data.color" :text="data.text" />
      </template>

      <template #data-viewInfra="{ data }">
        <p class="text-blue-700 cursor-pointer" @click="handleJsonModal">
          {{ data.isShow ? 'View Infra(Meta) ->' : null }}
        </p>
      </template>

      <template #extra="{ name }">
        <div v-if="name === 'status'">
          <p-button
            style-type="tertiary"
            size="sm"
            :loading="refreshSourceGroupConnectionInfoStatus.isLoading.value"
            @click="handleSourceGroupStatusRefresh"
          >
            Refresh
          </p-button>
        </div>
        <div v-else-if="name === 'viewInfra'">
          <p-button
            style-type="tertiary"
            size="sm"
            :loading="resGetInfraSourceGroup.isLoading.value"
            @click="getSourceGroupInfras"
          >
            Collect Infra
          </p-button>
        </div>
      </template>
    </p-definition-table>
    <SourceServiceInfraRefineModal
      v-if="modalState.open"
      :sg-id="props.selectedServiceId"
      :collect-data="infraModel"
      @update:is-meta-viewer-opened="modalState.open = false"
    />
  </div>
</template>
