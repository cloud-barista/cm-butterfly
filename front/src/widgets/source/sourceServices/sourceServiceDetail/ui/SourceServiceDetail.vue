<script setup lang="ts">
import { PDefinitionTable, PButton, PStatus } from '@cloudforet-test/mirinae';
import {
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  watch,
  watchEffect,
} from 'vue';
import { useSourceServiceDetailModel } from '@/widgets/source/sourceServices/sourceServiceDetail/model/sourceServiceDetailModel.ts';
import {
  useGetInfraSourceGroup,
  useGetSourceGroupStatus,
  useGetSourceService,
} from '@/entities/sourceService/api';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';
import { storeToRefs } from 'pinia';
import { useRefreshSourceGroupConnectionInfoStatus } from '@/entities/sourceConnection/api';
import { CustomViewSourceModel } from '@/widgets/models/sourceModels';
import SourceServiceInfraRefineModal from '@/features/sourceServices/sourceServiceInfraRefinedModal/ui/sourceServiceInfraRefineModal.vue';

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
    getSourceGroupInfras();
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
      console.log(tableModel.tableState.data);
    }
  } catch (err) {
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

      <template #data-viewInfra>
        <p class="link-button-text" @click="handleJsonModal">
          Custom & View Source Model
        </p>
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
    <SourceServiceInfraRefineModal
      v-if="modalState.open"
      :sgId="props.selectedServiceId"
      :collect-data="infraModel"
      @update:is-meta-viewer-opened="modalState.open = false"
    />
  </div>
</template>
