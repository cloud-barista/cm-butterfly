<script setup lang="ts">
import MciList from '@/widgets/workload/mci/mciList/ui/MciList.vue';
import { reactive, ref } from 'vue';
import { PButton, PTab } from '@cloudforet-test/mirinae';
import MciDetail from '@/widgets/workload/mci/mciDetail/ui/MciDetail.vue';
import VmList from '@/widgets/workload/vm/vmList/ui/VmList.vue';
import { isNullOrUndefined } from '@/shared/utils';
import { DEFAULT_NAMESPACE } from '@/shared/constants/namespace';

const pageName = 'Infra Workloads';

const tabState = reactive({
  activeTab: 'detail',
  tabs: [
    {
      name: 'detail',
      label: 'Detail',
    },
    {
      name: 'server',
      label: 'Server',
    },
  ],
});

const selectedMciId = ref<string>('');
const selectedVmId = ref<string>('');

function handleSelectMciTableRow(id: string) {
  selectedMciId.value = id;
  selectedVmId.value = '';
}

function handleSelectVmListTableRow(id: string) {
  if (!isNullOrUndefined(id)) selectedVmId.value = id;
  else {
    selectedVmId.value = '';
  }
}
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header :class="`${pageName}-page-header`">
      <p>{{ pageName }}</p>
    </header>
    <section :class="`${pageName}-page-body`">
      <MciList
        :ns-id="DEFAULT_NAMESPACE"
        @selectRow="handleSelectMciTableRow"
      />
      <p
        v-if="!selectedMciId"
        class="flex justify-center text-gray-300 text-sm font-normal"
      >
        Select an item for more details.
      </p>
      <div v-if="selectedMciId">
        <p-tab v-model="tabState.activeTab" :tabs="tabState.tabs">
          <template #detail>
            <div class="tab-section-header">
              <p>Workload Information</p>
              <div class="flex gap-1.5">
                <p-button style-type="tertiary" :disabled="true">
                  Evaluate Perf
                </p-button>
                <p-button style-type="tertiary" :disabled="true">
                  Estimate Cost
                </p-button>
              </div>
            </div>
            <MciDetail :selected-mci-id="selectedMciId" />
          </template>
          <template #server>
            <div class="tab-section-header">
              <p>Server List</p>
            </div>
            <VmList
              :ns-id="DEFAULT_NAMESPACE"
              :mci-id="selectedMciId"
              :selected-vm-id="selectedVmId"
              @selectCard="handleSelectVmListTableRow"
            />
          </template>
        </p-tab>
      </div>
    </section>
  </div>
</template>

<style scoped lang="postcss"></style>
