<script setup lang="ts">
import { PDefinitionTable, PButton, PStatus } from '@cloudforet-test/mirinae';
import { onBeforeMount, reactive, ref, watch, watchEffect } from 'vue';
import { useSourceServiceDetailModel } from '@/widgets/source/sourceServices/sourceServiceDetail/model/sourceServiceDetailModel';
import {
  useGetInfraSourceGroup,
  useGetSourceService,
} from '@/entities/sourceService/api';
import { showErrorMessage } from '@/shared/utils';
import {
  useRefreshSourceGroupConnectionInfoStatus,
  useCollectSWSourceGroup,
} from '@/entities/sourceConnection/api';
import SourceServiceRefineModal from '@/features/sourceServices/sourceServiceRefinedModal/ui/sourceServiceRefineModal.vue';

interface IProps {
  selectedServiceId: string;
}

const props = defineProps<IProps>();

const emit = defineEmits([
  'update:source-connection-name',
  'update:custom-view-json-modal',
]);

const {
  sourceServiceStore,
  initTable,
  tableModel,
  setServiceId,
  loadSourceServiceData,
} = useSourceServiceDetailModel();

const refreshSourceGroupConnectionInfoStatus =
  useRefreshSourceGroupConnectionInfoStatus(null);
const getSourceService = useGetSourceService(null);
const resGetInfraSourceGroup = useGetInfraSourceGroup(null);
const infraModel = ref<any>(null);

// Software 관련 상태
const softwareModel = ref<any>(null);
const resCollectSWSourceGroup = useCollectSWSourceGroup(null);

const modalState = reactive({
  open: false,
  context: {
    name: '',
    description: '',
  },
});

// Software 모달 상태
const softwareModalState = reactive({
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
  const serviceName = sourceServiceStore.getServiceById(props.selectedServiceId)?.name;
  if (serviceName) {
    emit('update:source-connection-name', serviceName);
  }
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
        
        // 데이터를 가져온 후 자동으로 모달 열기
        modalState.open = true;
      }
    })
    .catch(e => {
      console.error('Failed to get source group infras:', e);
      infraModel.value = null;
    });
}

function getSourceGroupSoftware() {
  resCollectSWSourceGroup
    .execute({
      pathParams: {
        sgId: props.selectedServiceId,
      },
    })
    .then(res => {
      if (res.data.responseData) {
        sourceServiceStore.mappingSoftwareModel(
          props.selectedServiceId,
          res.data.responseData,
        );
        softwareModel.value = res.data.responseData;
        loadSourceServiceData(props.selectedServiceId);
        
        // 데이터를 가져온 후 자동으로 모달 열기
        softwareModalState.open = true;
      }
    })
    .catch(e => {
      console.error('Failed to get source group software:', e);
      softwareModel.value = null;
    });
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
      console.log(tableModel.tableState.data);
    }
  } catch (err: any) {
    showErrorMessage('error', err.errorMsg?.value || 'Unknown error occurred');
  }
}

function handleJsonModal() {
  modalState.open = true;
}

function handleSoftwareModal() {
  softwareModalState.open = true;
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

      <template #data-viewSoftware="{ data }">
        <p class="text-blue-700 cursor-pointer" @click="handleSoftwareModal">
          {{ data.isShow ? 'View Software(Meta) ->' : null }}
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
        <div v-else-if="name === 'viewSoftware'">
          <p-button
            style-type="tertiary"
            size="sm"
            :loading="resCollectSWSourceGroup.isLoading.value"
            @click="getSourceGroupSoftware"
          >
            Collect SW
          </p-button>
        </div>
      </template>
    </p-definition-table>
    <SourceServiceRefineModal
      v-if="modalState.open"
      :sgId="props.selectedServiceId"
      :collect-data="infraModel"
      data-type="infra"
      data-source="sourceGroup"
      @update:is-meta-viewer-opened="modalState.open = false"
    />
    <SourceServiceRefineModal
      v-if="softwareModalState.open"
      :sgId="props.selectedServiceId"
      :collect-data="softwareModel"
      data-type="software"
      data-source="sourceGroup"
      @update:is-meta-viewer-opened="softwareModalState.open = false"
    />
  </div>
</template>
