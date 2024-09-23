<script setup lang="ts">
import { PDefinitionTable, PButton } from '@cloudforet-test/mirinae';
import { onBeforeMount, onMounted } from 'vue';
import { useSourceServiceDetailModel } from '@/widgets/source/sourceServices/sourceServiceDetail/model';

interface IProps {
  selectedServiceId: string;
}

const props = defineProps<IProps>();
const { initTable, tableModel, setServiceId } = useSourceServiceDetailModel();

onBeforeMount(() => {
  initTable();
});

onMounted(() => {
  setServiceId(props.selectedServiceId);
});
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
        <p>{{ data }}</p>
      </template>

      <template #extra="{ name }">
        <div v-if="name === 'status'">
          <p-button style-type="tertiary" size="sm">Edit</p-button>
        </div>
      </template>
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss"></style>
