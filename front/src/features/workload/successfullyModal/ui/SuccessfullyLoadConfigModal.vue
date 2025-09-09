<script setup lang="ts">
import {
  PDefinitionTable,
  PIconModal,
  PSpinner,
  PStatus,
} from '@cloudforet-test/mirinae';
import { useDefinitionTableModel } from '@/shared/hooks/table/definitionTable/useDefinitionTableModel';
import { onBeforeMount, watch } from 'vue';

interface IProps {
  scenarioName: string;
  isOpen: boolean;
}

const props = defineProps<IProps>();
const emit = defineEmits(['close']);

type tableType = 'name' | 'status';

const detailTableModel = useDefinitionTableModel<Record<tableType, any>>();

onBeforeMount(() => {
  initTable();
});

watch(
  () => props.scenarioName,
  () => {
    detailTableModel.tableState.data = organizeTableData();
  },
  { immediate: true },
);

function initTable() {
  detailTableModel.initState();

  detailTableModel.tableState.fields = [
    { label: 'Test Scenario Name', name: 'name', disableCopy: true },
    { label: 'Load Status', name: 'status', disableCopy: true },
  ];
}

function organizeTableData() {
  const data: Record<tableType, any> = {
    name: props.scenarioName,
    status: 'loading',
  };

  return data;
}

function handleClose(e) {
  if (!e) {
    emit('close');
  }
}
</script>

<template>
  <p-icon-modal
    :visible="isOpen"
    :size="'md'"
    :iconName="'ic_checkbox-circle-selected'"
    :headerTitle="'Successfully Requested Load Generation'"
    :headerDesc="'Now, modules for load generation are installed and load is generated.'"
    :styleType="'primary'"
    @clickButton="handleClose"
  >
    <template #body>
      <div class="button-modal-body">
        <p-definition-table
          :fields="detailTableModel.tableState.fields"
          :data="detailTableModel.tableState.data"
          :style-type="'white'"
          class="min-h-0"
          block
        >
          <template #data-status="{ data }">
            <div class="flex">
              <p-spinner size="xs" />
              <p-status :icon="null" :disableIcon="true" :iconSize="0"
                >on_processing
              </p-status>
            </div>
          </template>
        </p-definition-table>
        <section class="content">
          <h2>Notification</h2>
          <label
            >It takes some time to proceed with the test and collect the result
            data. Even if you close this now, it continues in the background.
            You can check the status after closing in ‘Load Status’. If the test
            progresses and the result data collection is successful, the chart
            will appear normally in the Evaluate Performance Results.</label
          >
        </section>
      </div>
    </template>
  </p-icon-modal>
</template>

<style scoped lang="postcss">
.button-modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;

  .content {
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 8px;
    border-radius: 6px;
    border: 1px solid #dddddf;
    background-color: #f8f8fc;

    h2 {
      font-weight: bold;
    }
  }
}
</style>
