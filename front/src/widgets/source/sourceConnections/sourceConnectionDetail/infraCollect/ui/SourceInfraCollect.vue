<script setup lang="ts">
import { PButton, PDefinitionTable } from '@cloudforet-test/mirinae';
import { onBeforeMount, onMounted, reactive } from 'vue';
import { useSourceInfraCollectModel } from '@/widgets/source/sourceConnections/sourceConnectionDetail/infraCollect/model/sourceInfraCollectModel.ts';
import { useCollectInfra } from '@/entities/sourceConnection/api';

interface IProps {
  sourceGroupId: string | null;
  connectionId: string | null;
}

const props = defineProps<IProps>();
const {
  sourceConnectionStore,
  setConnectionId,
  defineTableModel,
  initTable,
  loadInfraCollectTableData,
} = useSourceInfraCollectModel();

const resCollectInfra = useCollectInfra({
  sgId: props.sourceGroupId,
  connId: props.connectionId,
});

const viewInfraModalState = reactive({
  open: false,
});

onBeforeMount(() => {
  initTable();
});

onMounted(() => {
  setConnectionId(props.connectionId);
});

function handleCollectInfra() {
  resCollectInfra
    .execute()
    .then(res => {
      if (res.data.responseData) {
        if (props.connectionId) {
          sourceConnectionStore.mapSourceConnectionCollectInfraResponse(
            res.data.responseData,
          );
          loadInfraCollectTableData(props.connectionId);
        }
      }
    })
    .catch();
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
      <template #data-collectInfraStatus="{ data }">
        {{ data ? data : 'unknown' }}
      </template>
      <template #data-viewInfra="{ data }">
        <p
          class="text-blue-700 cursor-pointer"
          @click="viewInfraModalState.open = true"
        >
          {{ data ? 'View Infra(Meta) ->' : null }}
        </p>
      </template>
      <template #extra="{ name }">
        <div v-if="name === 'collectInfraStatus'">
          <p-button
            style-type="tertiary"
            size="sm"
            :loading="resCollectInfra.isLoading.value"
            @click="handleCollectInfra"
          >
            Collect Infra
          </p-button>
        </div>
      </template>
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss"></style>
