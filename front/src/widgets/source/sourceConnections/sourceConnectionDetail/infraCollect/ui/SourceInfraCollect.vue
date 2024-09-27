<script setup lang="ts">
import { PButton, PDefinitionTable, PStatus } from '@cloudforet-test/mirinae';
import { onBeforeMount, onMounted, reactive, watch } from 'vue';
import { useSourceInfraCollectModel } from '@/widgets/source/sourceConnections/sourceConnectionDetail/infraCollect/model/sourceInfraCollectModel.ts';
import { useCollectInfra } from '@/entities/sourceConnection/api';
import { showErrorMessage } from '@/shared/utils';

interface IProps {
  sourceGroupId: string | null;
  connectionId: string | null;
  metaViewerModalState: boolean;
}

const props = defineProps<IProps>();
const emit = defineEmits(['update:metaViewerModalState']);

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
      <template #data-collectInfraStatus="{ data }">
        <p-status :theme="data.color" :text="data.text"></p-status>
      </template>
      <template #data-viewInfra="{ data }">
        <p
          class="text-blue-700 cursor-pointer"
          @click="emit('update:metaViewerModalState', true)"
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
