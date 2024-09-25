<script setup lang="ts">
import { PButton, PDefinitionTable } from '@cloudforet-test/mirinae';
import { onBeforeMount, onMounted, reactive, watch } from 'vue';
import { useSourceSoftwareCollectModel } from '@/widgets/source/sourceConnections/sourceConnectionDetail/softwareCollect/model/sourceSoftwareCollectModel.ts';
import { useCollectSW } from '@/entities/sourceConnection/api';
import { showErrorMessage } from '@/shared/utils';

interface IProps {
  sourceGroupId: string | null;
  connectionId: string | null;
}

const props = defineProps<IProps>();
const {
  loadInfraSWTableData,
  sourceConnectionStore,
  setConnectionId,
  defineTableModel,
  initTable,
} = useSourceSoftwareCollectModel();

const resCollectSW = useCollectSW({
  sgId: props.sourceGroupId,
  connId: props.connectionId,
});

const viewSWModalState = reactive({
  open: false,
});

watch(
  props,
  () => {
    setConnectionId(props.connectionId);
  },
  { immediate: true },
);

onBeforeMount(() => {
  initTable();
});

function handleClickCollectSW() {
  resCollectSW
    .execute()
    .then(res => {
      if (res.data.responseData && props.connectionId) {
        sourceConnectionStore.mapSourceConnectionCollectSWResponse(
          res.data.responseData,
        );
        loadInfraSWTableData(props.connectionId);
      }
    })
    .catch(e => {
      if (e.errorMsg.value) showErrorMessage('Error', e.errorMsg.value);
    });
}
</script>

<template>
  <div>
    <p-definition-table
      :fields="defineTableModel.tableState.fields"
      :data="defineTableModel.tableState.data"
      :loading="defineTableModel.tableState.loading"
      block
    >
      <template #data-collectSwStatus="{ data }"></template>
      <template #data-viewSW="{ data }">
        <p
          class="text-blue-700 cursor-pointer"
          @click="viewSWModalState.open = true"
        >
          {{ data ? 'View SW(Meta) ->' : null }}
        </p>
      </template>
      <template #extra="{ name }">
        <div v-if="name === 'collectSwStatus'">
          <p-button
            style-type="tertiary"
            size="sm"
            :loading="resCollectSW.isLoading.value"
            @click="handleClickCollectSW"
          >
            Collect SW
          </p-button>
        </div>
      </template>
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss"></style>
