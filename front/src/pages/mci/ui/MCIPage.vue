<script setup lang="ts">
import MciList from '@/widgets/workload/mci/mciList/ui/MciList.vue';
import { reactive, ref, PropType, Ref } from 'vue';
import { PTab, PButtonTab } from '@cloudforet-test/mirinae';
import MciDetail from '@/widgets/workload/mci/mciDetail/ui/MciDetail.vue';
import { useMCIStore } from '@/entities/mci/model';
import VmGroups from '@/widgets/workload/vmGroups/ui/VmGroups.vue';
import VmDetail from '@/widgets/workload/mci/vmInformation/ui/VmInformation.vue';

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
  ],
});

//TODO projectId 가져와야함.
const nsId = 'ns01';

const selectedMciId = ref<string>('');
const selectedGroupId = ref<string>('');

function handleSelectMciTableRow(id: string) {
  selectedMciId.value = id;
}

function handleSelectVmGroupTableRow(id: string) {
  selectedGroupId.value = id;
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
            <MciDetail :selectedMciId="selectedMciId"></MciDetail>
          </template>
          <template #server>
            <VmGroups
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
                    <VmDetail
                      :mci-id="selectedMciId"
                      :ns-id="nsId"
                      :vm-group-id="selectedGroupId"
                    >
                    </VmDetail>
                  </template>
                  <template #conntection></template>
                  <template #monitoring></template>
                </p-button-tab>
              </template>
            </VmGroups>
          </template>
        </p-tab>
      </div>
    </section>
  </div>
</template>

<style scoped lang="postcss"></style>
