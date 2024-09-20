<script setup lang="ts">
import { reactive, ref } from 'vue';
import MciList from '@/widgets/workload/mci/mciList/ui/MciList.vue';
import VmGroups from '@/widgets/workload/vmGroups/ui/VmGroups.vue';
import { PButton, PButtonTab, PTab } from '@cloudforet-test/mirinae';
import VmDetail from '@/widgets/workload/mci/vmInformation/ui/VmInformation.vue';
import MciDetail from '@/widgets/workload/mci/mciDetail/ui/MciDetail.vue';
import SourceServiceList from '@/widgets/sourceServices/sourceServiceList/ui/SourceServiceList.vue';
import SourceServiceDetail from '@/widgets/sourceServices/sourceServiceDetail/ui/SourceServiceDetail.vue';
import SourceConnectionList from '@/widgets/sourceConnections/sourceConnectionList/ui/SourceConnectionList.vue';

const pageName = 'Source Services';

const mainTabState = reactive({
  activeTab: 'detail',
  tabs: [
    {
      name: 'detail',
      label: 'Detail',
    },
    {
      name: 'connections',
      label: 'Connections',
    },
  ],
});

const sourceConnectionDetailTabState = reactive({
  activeTab: 'Information',
  tabs: [
    {
      name: 'information',
      label: 'Information',
    },
    {
      name: 'infraCollect',
      label: 'Infra Collect',
    },
    {
      name: 'softwareCollect',
      label: 'Software Collect',
    },
  ],
});

const selectedServiceId = ref<string>('');
const selectedConnectionId = ref<string>('');
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header :class="`${pageName}-page-header`">
      <p>{{ pageName }}</p>
    </header>
    <section :class="`${pageName}-page-body`">
      <!--      <MciList :ns-id="nsId" @selectRow="handleSelectMciTableRow"></MciList>-->
      <SourceServiceList
        @selectRow="id => (selectedServiceId = id)"
      ></SourceServiceList>
      <p
        v-if="!selectedServiceId"
        class="flex justify-center text-gray-300 text-sm font-normal"
      >
        Select an item for more details.
      </p>
      <div v-if="selectedServiceId">
        <p-tab v-model="mainTabState.activeTab" :tabs="mainTabState.tabs">
          <template #detail>
            <div class="tab-section-header">
              <p>Source Service information</p>
              <p-button
                :style-type="'tertiary'"
                icon-left="ic_edit"
                @click="() => {}"
                >Edit
              </p-button>
            </div>
            <SourceServiceDetail
              :selected-service-id="selectedServiceId"
            ></SourceServiceDetail>
          </template>
          <template #connections>
            <div class="tab-section-header">
              <p>Source Connection</p>
            </div>
            <SourceConnectionList
              :selected-service-id="selectedServiceId"
              @selectRow="id => (selectedConnectionId = id)"
            >
              <template #sourceConnectionDetail>
                <p-button-tab
                  v-model="sourceConnectionDetailTabState.activeTab"
                  :tabs="sourceConnectionDetailTabState.tabs"
                >
                  <template #information></template>
                  <template #infraCollect></template>
                  <template #softwareCollect></template>
                </p-button-tab>
                <div class="absolute">test</div>
              </template>
            </SourceConnectionList>
          </template>
        </p-tab>
      </div>
    </section>
  </div>
</template>

<style scoped lang="postcss"></style>
