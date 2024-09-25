<script setup lang="ts">
import { reactive, ref } from 'vue';
import { PButton, PButtonTab, PTab } from '@cloudforet-test/mirinae';
import SourceServiceList from '@/widgets/source/sourceServices/sourceServiceList/ui/SourceServiceList.vue';
import SourceServiceDetail from '@/widgets/source/sourceServices/sourceServiceDetail/ui/SourceServiceDetail.vue';
import SourceConnectionList from '@/widgets/source/sourceConnections/sourceConnectionList/ui/SourceConnectionList.vue';
import SourceInformation from '@/widgets/source/sourceConnections/sourceConnectionDetail/information/ui/SourceInformation.vue';
import SourceInfraCollect from '@/widgets/source/sourceConnections/sourceConnectionDetail/infraCollect/ui/SourceInfraCollect.vue';
import SourceSoftwareCollect from '@/widgets/source/sourceConnections/sourceConnectionDetail/softwareCollect/ui/SourceSoftwareCollect.vue';

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
  activeTab: 'information',
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

function handleClickServiceId(id: string) {
  selectedServiceId.value = id;
  selectedConnectionId.value = '';
}
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header :class="`${pageName}-page-header`">
      <p>{{ pageName }}</p>
    </header>
    <section :class="`${pageName}-page-body`">
      <SourceServiceList @selectRow="handleClickServiceId"></SourceServiceList>
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
              <template #sourceConnectionDetail v-if="selectedConnectionId">
                <p-button-tab
                  v-model="sourceConnectionDetailTabState.activeTab"
                  :tabs="sourceConnectionDetailTabState.tabs"
                >
                  <template #information>
                    <SourceInformation
                      :connection-id="selectedConnectionId"
                    ></SourceInformation>
                  </template>
                  <template #infraCollect>
                    <SourceInfraCollect
                      :source-group-id="selectedServiceId"
                      :connection-id="selectedConnectionId"
                    ></SourceInfraCollect>
                  </template>
                  <template #softwareCollect>
                    <SourceSoftwareCollect
                      :source-group-id="selectedServiceId"
                      :connection-id="selectedConnectionId"
                    ></SourceSoftwareCollect>
                  </template>
                </p-button-tab>
              </template>
            </SourceConnectionList>
          </template>
        </p-tab>
      </div>
    </section>
  </div>
</template>

<style scoped lang="postcss"></style>
