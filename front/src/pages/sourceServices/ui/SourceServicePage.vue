<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import {
  PButton,
  PButtonTab,
  PTab,
  PButtonModal,
} from '@cloudforet-test/mirinae';
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

//trigger true해주면 업데이트 되도록 함.
const modalStates = reactive({
  addServiceGroup: {
    open: false,
    confirm() {
      modalStates.addServiceGroup.open = false;
    },
    trigger: false,
    updateTrigger() {
      modalStates.addServiceGroup.trigger = false;
    },
  },

  addSourceConnection: {
    open: false,
    trigger: false,
    confirm() {
      modalStates.addSourceConnection.open = false;
    },
    updateTrigger() {
      modalStates.addSourceConnection.trigger = false;
    },
  },
  addMetaViewer: {
    open: false,
    confirm() {
      modalStates.addMetaViewer.open = false;
    },
  },
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
    <div>
      <header :class="`${pageName}-page-header`">
        <p>{{ pageName }}</p>
      </header>
      <section :class="`${pageName}-page-body`">
        <SourceServiceList
          :add-modal-state="modalStates.addServiceGroup.open"
          :trigger="modalStates.addServiceGroup.trigger"
          @selectRow="handleClickServiceId"
          @update:addModalState="e => (modalStates.addServiceGroup.open = e)"
          @update:trigger="modalStates.addServiceGroup.updateTrigger"
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
                  @click="modalStates.addServiceGroup.open = true"
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
                :trigger="modalStates.addSourceConnection.trigger"
                :selected-service-id="selectedServiceId"
                @selectRow="id => (selectedConnectionId = id)"
                @update:addModalState="
                  modalStates.addSourceConnection.open = true
                "
                @update:trigger="modalStates.addSourceConnection.updateTrigger"
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
                        :meta-viewer-modal-state="
                          modalStates.addMetaViewer.open
                        "
                      ></SourceInfraCollect>
                    </template>
                    <template #softwareCollect>
                      <SourceSoftwareCollect
                        :source-group-id="selectedServiceId"
                        :connection-id="selectedConnectionId"
                        :meta-viewer-modal-state="
                          modalStates.addMetaViewer.open
                        "
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
    <div class="relative z-10">
      <!--      Modals-->
    </div>
    <div class="relative z-20">
      <!--      PageModals-->
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>
