<script setup lang="ts">
import { computed, reactive, ref, watch, watchEffect } from 'vue';
import { PButton, PButtonTab, PTab } from '@cloudforet-test/mirinae';
import SourceServiceList from '@/widgets/source/sourceServices/sourceServiceList/ui/SourceServiceList.vue';
import SourceServiceDetail from '@/widgets/source/sourceServices/sourceServiceDetail/ui/SourceServiceDetail.vue';
import SourceConnectionList from '@/widgets/source/sourceConnections/sourceConnectionList/ui/SourceConnectionList.vue';
import SourceInformation from '@/widgets/source/sourceConnections/sourceConnectionDetail/information/ui/SourceInformation.vue';
import SourceInfraCollect from '@/widgets/source/sourceConnections/sourceConnectionDetail/infraCollect/ui/SourceInfraCollect.vue';
import SourceSoftwareCollect from '@/widgets/source/sourceConnections/sourceConnectionDetail/softwareCollect/ui/SourceSoftwareCollect.vue';
import SourceConnectionModal from '@/widgets/source/sourceConnections/sourceConnectionModal/ui/SourceConnectionModal.vue';
import {
  AddSourceServiceModal,
  EditSourceServiceModal,
} from '@/widgets/sourceServices';
import { useSidebar } from '@/shared/libs/store/sidebar';
import { storeToRefs } from 'pinia';
import MetaViewer from '@/widgets/source/sourceConnections/sourceConnectionDetail/metaViewer/ui/MetaViewer.vue';
import { useSourceInfraCollectModel } from '@/widgets/source/sourceConnections/sourceConnectionDetail/infraCollect/model/sourceInfraCollectModel.ts';
import EditSourceConnectionModal from '@/widgets/source/sourceConnections/sourceConnectionModal/ui/EditSourceConnectionModal.vue';

const { sourceConnectionStore } = useSourceInfraCollectModel();

const sidebar = useSidebar();

const { isCollapsed, isGnbToolboxShown } = storeToRefs(sidebar);

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
    category: 'add',
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
    category: 'add',
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

const isServiceEditBtnClicked = ref<boolean>(false);

const handleSourceGroupEdit = () => {
  modalStates.addServiceGroup.open = true;
  isServiceEditBtnClicked.value = true;
};

const selectedServiceId = ref<string>('');
const selectedConnectionId = ref<string>('');

function handleClickServiceId(id: string) {
  selectedServiceId.value = id;
  selectedConnectionId.value = '';
}

function handleGroupModal(value: boolean) {
  modalStates.addServiceGroup.open = value;
}

function handleConnectionModal(value: boolean) {
  modalStates.addSourceConnection.open = value;
  modalStates.addServiceGroup.open = !value;
  isCollapsed.value = value;
  isGnbToolboxShown.value = !value;
}

const data = computed(() => {
  return sourceConnectionStore.getConnectionById(selectedConnectionId.value)
    ?.softwareData;
});
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header
      v-if="!modalStates.addSourceConnection.open"
      :class="`${pageName}-page-header`"
    >
      <p>{{ pageName }}</p>
    </header>
    <section :class="`${pageName}-page-body`">
      <SourceServiceList
        :add-modal-state="modalStates.addServiceGroup.open"
        :trigger="modalStates.addServiceGroup.trigger"
        @selectRow="handleClickServiceId"
        @update:addModalState="e => (modalStates.addServiceGroup.open = e)"
        @update:trigger="modalStates.addServiceGroup.updateTrigger"
        @update:title="e => (modalStates.addServiceGroup.category = e)"
        @update:connection-title="
          e => (modalStates.addSourceConnection.category = e)
        "
      />
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
                @click="handleSourceGroupEdit"
              >
                Edit
              </p-button>
            </div>
            <SourceServiceDetail :selected-service-id="selectedServiceId" />
          </template>
          <template #connections>
            <div class="tab-section-header">
              <p>Source Connection</p>
            </div>
            <SourceConnectionList
              :trigger="modalStates.addSourceConnection.trigger"
              :selected-service-id="selectedServiceId"
              @selectRow="id => (selectedConnectionId = id)"
              @update:addModalState="handleConnectionModal"
              @update:trigger="modalStates.addSourceConnection.updateTrigger"
              @update:title="
                e => (modalStates.addSourceConnection.category = e)
              "
            >
              <template v-if="selectedConnectionId" #sourceConnectionDetail>
                <p-button-tab
                  v-model="sourceConnectionDetailTabState.activeTab"
                  :tabs="sourceConnectionDetailTabState.tabs"
                >
                  <template #information>
                    <SourceInformation :connection-id="selectedConnectionId" />
                  </template>
                  <template #infraCollect>
                    <SourceInfraCollect
                      :source-group-id="selectedServiceId"
                      :connection-id="selectedConnectionId"
                      :meta-viewer-modal-state="modalStates.addMetaViewer.open"
                      @update:metaViewerModalState="
                        e => (modalStates.addMetaViewer.open = e)
                      "
                    />
                  </template>
                  <template #softwareCollect>
                    <SourceSoftwareCollect
                      :source-group-id="selectedServiceId"
                      :connection-id="selectedConnectionId"
                      :meta-viewer-modal-state="modalStates.addMetaViewer.open"
                      @update:metaViewerModalState="
                        e => (modalStates.addMetaViewer.open = e)
                      "
                    />
                  </template>
                </p-button-tab>
              </template>
            </SourceConnectionList>
          </template>
        </p-tab>
      </div>
    </section>
    <div class="relative z-60">
      <add-source-service-modal
        v-if="modalStates.addServiceGroup.open && !isServiceEditBtnClicked"
        @update:isModalOpened="handleGroupModal"
        @update:is-connection-modal-opened="handleConnectionModal"
        @update:trigger="modalStates.addServiceGroup.trigger = true"
      />
      <edit-source-service-modal
        v-if="modalStates.addServiceGroup.open && isServiceEditBtnClicked"
        :selected-service-id="selectedServiceId"
        @update:is-service-modal-opened="
          e => {
            modalStates.addServiceGroup.open = e;
            isServiceEditBtnClicked = e;
          }
        "
      />
    </div>
    <div class="relative z-70">
      <source-connection-modal
        v-if="
          modalStates.addSourceConnection.open &&
          modalStates.addSourceConnection.category === 'add'
        "
        :selected-connection-id="selectedConnectionId"
        @update:is-connection-modal-opened="handleConnectionModal"
        @update:is-service-modal-opened="
          e => (modalStates.addServiceGroup.open = e)
        "
      />
      <edit-source-connection-modal
        v-else-if="
          modalStates.addSourceConnection.open &&
          modalStates.addSourceConnection.category === 'edit'
        "
        :source-service-id="selectedServiceId"
        :selected-connection-id="selectedConnectionId"
        @update:is-connection-modal-opened="handleConnectionModal"
        @update:is-service-modal-opened="
          e => (modalStates.addServiceGroup.open = e)
        "
        @update:trigger="modalStates.addSourceConnection.trigger = true"
      />

      <meta-viewer
        v-if="
          modalStates.addMetaViewer.open &&
          sourceConnectionStore.getConnectionById(selectedConnectionId)
            ?.infraData
        "
        :infra-data="
          sourceConnectionStore.getConnectionById(selectedConnectionId)
            ?.infraData
        "
        @update:is-meta-viewer-opened="modalStates.addMetaViewer.confirm()"
      />
      <meta-viewer
        v-else-if="modalStates.addMetaViewer.open && data"
        :infra-data="
          sourceConnectionStore.getConnectionById(selectedConnectionId)
            ?.softwareData
        "
        @update:is-meta-viewer-opened="modalStates.addMetaViewer.confirm()"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>
