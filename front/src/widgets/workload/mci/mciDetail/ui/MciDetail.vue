<script setup lang="ts">
import { useMciDetailModel } from '@/widgets/workload/mci/mciDetail/model';
import { onBeforeMount, onMounted, watch, PropType } from 'vue';
import { PBadge, PDefinitionTable } from '@cloudforet-test/mirinae';

interface IProps {
  selectedMciId: string;
}

const props = defineProps<IProps>();
const mciDetailModel = useMciDetailModel();

onBeforeMount(() => {
  mciDetailModel.initTable();
  mciDetailModel.tableModel.tableState.loading = false;
});

watch(
  props,
  nv => {
    mciDetailModel.setMciId(nv.selectedMciId);
  },
  { immediate: true },
);
</script>

<template>
  <div>
    <p-definition-table
      :fields="mciDetailModel.tableModel.tableState.fields"
      :data="mciDetailModel.tableModel.tableState.data"
      :loading="mciDetailModel.tableModel.tableState.loading"
    >
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
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss"></style>
