<script setup lang="ts">
import { PDefinitionTable, PButton } from '@cloudforet-test/mirinae';
import { useSourceModelDetailModel } from '@/widgets/models/sourceModels';
import { onBeforeMount, onMounted, ref, watch, watchEffect } from 'vue';

interface iProps {
  selectedSourceModelId: string;
}

const props = defineProps<iProps>();

const { sourceModelStore, setSourceModelId, initTable, tableModel } =
  useSourceModelDetailModel();

watch(
  props,
  () => {
    setSourceModelId(props.selectedSourceModelId);
  },
  { immediate: true },
);

onBeforeMount(() => {
  initTable();
});

// const isColCopyAble = ref<boolean[]>([]);

// watchEffect(() => {
//   tableModel.tableState.fields.forEach(field => {
//     field.name === 'createdDateTime' ||
//     field.name === 'updatedDateTime' ||
//     field.name === 'customAndViewJSON' ||
//     field.name === 'recommendModel'
//       ? isColCopyAble.value.push(false)
//       : isColCopyAble.value.push(true);
//   });
// });
</script>

<template>
  <div>
    <p-definition-table
      :fields="tableModel.tableState.fields"
      :data="tableModel.tableState.data"
      :loading="tableModel.tableState.loading"
      :block="true"
      :disable-copy="true"
    >
      <template #data-customAndViewJSON>
        <p-button style-type="transparent">
          <p class="button-text">Custom & View Source Model</p>
        </p-button>
      </template>
      <template #data-recommendModel>
        <p-button style-type="transparent">
          <p class="button-text">View Recommended List</p>
        </p-button>
      </template>
    </p-definition-table>
  </div>
</template>

<style scoped lang="postcss">
.button-text {
  @apply text-sm text-blue-700;
  font-weight: 400;
  margin: unset;
}
</style>
