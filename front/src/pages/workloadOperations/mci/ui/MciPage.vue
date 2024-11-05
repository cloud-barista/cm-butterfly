<script setup lang="ts">
import MciList from '@/widgets/workload/mci/mciList/ui/MciList.vue';
import { reactive, ref } from 'vue';
import { PTab, PButtonTab, PButton } from '@cloudforet-test/mirinae';
import MciDetail from '@/widgets/workload/mci/mciDetail/ui/MciDetail.vue';
import VmList from '@/widgets/workload/vm/vmList/ui/VmList.vue';
import VmInformation from '@/widgets/workload/vm/vmInformation/ui/VmInformation.vue';
import { isNullOrUndefined } from '@/shared/utils';

const pageName = 'MCI';

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

const vmDetailTabState = reactive({
  activeTab: 'information',
  tabs: [
    {
      name: 'information',
      label: 'Information',
    },
    {
      name: 'connection',
      label: 'Connection',
    },
    {
      name: 'monitoring',
      label: 'Monitoring',
    },
    {
      name: 'evaluatePref',
      label: 'Evaluate Pref',
    },
    {
      name: 'estimateCost',
      label: 'Estimate Cost',
    },
  ],
});

//TODO projectId 가져와야함.
const nsId = 'mig01';

const selectedMciId = ref<string>('');
const selectedVmId = ref<string>('');

function handleSelectMciTableRow(id: string) {
  selectedMciId.value = id;
}

function handleSelectVmGroupTableRow(id: string) {
  console.log(selectedVmId.value);
  if (!isNullOrUndefined(id)) selectedVmId.value = id;
}
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header :class="`${pageName}-page-header`">
      <p>{{ pageName }}</p>
    </header>
    <section :class="`${pageName}-page-body`">
      <MciList :ns-id="nsId" @selectRow="handleSelectMciTableRow"></MciList>
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
              <p>MCI Information</p>
              <div class="flex gap-1.5">
                <p-button style-type="tertiary" :disabled="true">
                  Evaluate Perf
                </p-button>
                <p-button style-type="tertiary" :disabled="true">
                  Estimate Cost
                </p-button>
              </div>
            </div>
            <MciDetail :selectedMciId="selectedMciId"></MciDetail>
          </template>
          <template #server>
            <div class="tab-section-header">
              <p>Server List</p>
            </div>
            <VmList
              :ns-id="nsId"
              :mci-id="selectedMciId"
              @selectCard="handleSelectVmGroupTableRow"
            >
              <template #vmInfoTable>
                <p-button-tab
                  v-model="vmDetailTabState.activeTab"
                  :tabs="vmDetailTabState.tabs"
                >
                  <template #information>
                    <VmInformation
                      :mciId="selectedMciId"
                      :nsId="nsId"
                      :vmId="selectedVmId"
                    >
                    </VmInformation>
                  </template>
                  <template #connection>
                    <p>to be..</p>
                  </template>
                  <template #monitoring>
                    <p>to be..</p>
                  </template>
                  <template #evaluatePref> </template>
                  <template #estimateCost>
                    <p>to be..</p>
                  </template>
                </p-button-tab>
              </template>
            </VmList>
          </template>
        </p-tab>
      </div>
    </section>
  </div>
</template>

<style scoped lang="postcss"></style>
