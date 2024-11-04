<script setup lang="ts">
import {
  PButton,
  PSelectCard,
  PToolbox,
  PDataLoader,
  PToolboxTable,
} from '@cloudforet-test/mirinae';
import { useVmListModel } from '@/widgets/workload/vm/vmList/model';
import { onBeforeMount, onMounted, reactive, ref, watch } from 'vue';

interface IProps {
  nsId: string;
  mciId: string;
}

const props = defineProps<IProps>();
const emit = defineEmits(['selectCard']);

const { getVmList, initToolBoxTableModel, vmListTableModel } =
  useVmListModel<IProps>(props);

onMounted(() => {
  initToolBoxTableModel();
});

function handleClick(value: any) {
  console.log(value);
  if (value && value.name) emit('selectCard', value.originalData.id);
}
</script>

<template>
  <div class="p-4">
    <section class="vmList-container">
      <p-toolbox
        :pageSizeChangeable="false"
        :key-item-sets="vmListTableModel.querySearchState.keyItemSet"
        :value-handler-map="vmListTableModel.querySearchState.valueHandlerMap"
        :query-tag="vmListTableModel.querySearchState.queryTag"
        :total-count="vmListTableModel.tableState.tableCount"
        :page-size="vmListTableModel.tableOptions.pageSize"
        :search-type="vmListTableModel.tableOptions.searchType"
        @change="vmListTableModel.handleChange"
        @refresh="() => {}"
      >
        <template #left-area>
          <p-button
            style-type="tertiary"
            icon-left="ic_plus_bold"
            :disabled="true"
          >
            Add Server
          </p-button>
        </template>
      </p-toolbox>
      <div class="vmList-content">
        <p-data-loader
          v-if="vmListTableModel.tableState.displayItems.length === 0"
          :data="false"
          :loading="false"
        >
        </p-data-loader>
        <p-select-card
          v-else
          v-for="(value, index) in vmListTableModel.tableState.displayItems"
          :key="value.name"
          v-model="vmListTableModel.tableState.selectIndex"
          :value="value.name"
          :multi-selectable="true"
          @click="() => handleClick(value)"
          style="
            width: 205.5px;
            height: 56px;
            margin: 0.2rem;
            padding: 10px 16px 10px 16px;
            border-radius: 12px;
          "
        >
          <template #default="scope">
            {{ value.name }}
          </template>
        </p-select-card>
      </div>
    </section>
    <section>
      <slot :name="'vmInfoTable'"></slot>
    </section>
  </div>
</template>

<style scoped lang="postcss">
.vmList-container {
  @apply border-b border-gray-300;
}
.vmList-content {
  @apply w-full flex flex-wrap;
  max-height: 208px;
  padding-top: 10px;
  padding-bottom: 10px;
  overflow-y: auto;
}
</style>
