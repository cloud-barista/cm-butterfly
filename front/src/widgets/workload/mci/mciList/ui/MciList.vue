<script setup lang="ts">
import { useMciListModel } from '@/widgets/workload/mci/mciList/model';
import {
  PButton,
  PHorizontalLayout,
  PToolboxTable,
  PBadge,
  PSelectDropdown,
} from '@cloudforet-test/mirinae';
import { onBeforeMount, onMounted, reactive, computed } from 'vue';
import MciDeleteModal from './MciDeleteModal.vue';

interface IProps {
  nsId: string;
}

const props = defineProps<IProps>();
const emit = defineEmits(['selectRow']);

const { mciTableModel, initToolBoxTableModel, fetchMciList, loading } =
  useMciListModel(props);

const mciCreateModalState = reactive({
  open: false,
  props: {},
});

const isActionDisabled = computed(() => {
  return mciTableModel.tableState.selectIndex.length === 0;
});

const actionState = reactive({
  actionMenus: computed(() => [
    { name: 'delete', label: 'Delete', disabled: isActionDisabled.value },
  ]),
  selectedActionItem: '',
});

const deleteModalState = reactive({
  visible: false,
});

const selectedMciList = computed(() => {
  return mciTableModel.tableState.selectIndex.map(index => {
    return mciTableModel.tableState.displayItems[index];
  });
});

function handleDelete(item: string) {
  if (item === 'delete') {
    deleteModalState.visible = true;
  }
}

async function handleDeleted() {
  await fetchMciList();
}

function handleSelectedIndex(index: number[]) {
  if (index.length === 1) {
    const selectedData = mciTableModel.tableState.displayItems[index[0]];
    if (selectedData) {
      emit('selectRow', selectedData.name);
    } else {
      emit('selectRow', '');
    }
  } else {
    emit('selectRow', '');
  }
}

onBeforeMount(() => {
  initToolBoxTableModel();
});

onMounted(() => {
  fetchMciList();
});
</script>

<template>
  <div>
    <p-horizontal-layout :height="400" :min-height="400" :max-height="1000">
      <template #container="{ height }">
        <p-toolbox-table
          ref="toolboxTable"
          :loading="loading"
          :items="mciTableModel.tableState.displayItems"
          :fields="mciTableModel.tableState.fields"
          :total-count="mciTableModel.tableState.tableCount"
          :style="{ height: `${height}px` }"
          :sortable="mciTableModel.tableOptions.sortable"
          :sort-by="mciTableModel.tableOptions.sortBy"
          :selectable="mciTableModel.tableOptions.selectable"
          :multi-select="mciTableModel.tableOptions.multiSelect"
          :search-type="mciTableModel.tableOptions.searchType"
          :key-item-sets="mciTableModel.querySearchState.keyItemSet"
          :value-handler-map="mciTableModel.querySearchState.valueHandlerMap"
          :query-tag="mciTableModel.querySearchState.queryTag"
          :select-index.sync="mciTableModel.tableState.selectIndex"
          :page-size="mciTableModel.tableOptions.pageSize"
          @change="mciTableModel.handleChange"
          @refresh="fetchMciList"
          @select="handleSelectedIndex"
        >
          <template #toolbox-left>
            <p-select-dropdown
              placeholder="Action"
              :menu="actionState.actionMenus"
              :selected.sync="actionState.selectedActionItem"
              reset-selected-on-unmounted
              class="mr-2"
              @select="handleDelete"
            />
            <p-button
              style-type="primary"
              icon-left="ic_plus_bold"
              disabled
              @click="mciCreateModalState.open = true"
            >
              Create
            </p-button>
          </template>
          <template #col-provider-format="{ item, field }">
            <p-badge
              v-for="(provider, index) in item.provider"
              :key="index"
              :background-color="provider.color"
              class="mr-1"
            >
              {{ provider.name }}
            </p-badge>
          </template>
        </p-toolbox-table>
      </template>
    </p-horizontal-layout>
    <mci-delete-modal
      :visible.sync="deleteModalState.visible"
      :selected-mci-list="selectedMciList"
      :ns-id="nsId"
      @deleted="handleDeleted"
    />
  </div>
</template>

<style scoped lang="postcss"></style>
