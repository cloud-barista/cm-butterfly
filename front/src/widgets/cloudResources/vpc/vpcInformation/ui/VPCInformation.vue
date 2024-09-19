<script setup lang="ts">
import {
  PTab,
  PDefinitionTable,
  PDataTable,
  PBadge,
  PButton,
  PPaneLayout,
} from '@cloudforet-test/mirinae';
import {
  VPCInformationTableType,
  SubnetInformationTableType,
} from '@/entities';
import { computed, onMounted, reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';
import { vpcStore } from '@/shared/libs';
import { storeToRefs } from 'pinia';
import { i18n } from '@/app/i18n';
import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';

const vpcStoreInstance = vpcStore.useVpcStore();

const { addedSubnetList } = storeToRefs(vpcStoreInstance);

const subnetTableModel =
  useToolboxTableModel<Partial<Record<SubnetInformationTableType, any>>>();

const router = useRouter();

interface IProps {
  tableItems: Partial<Record<VPCInformationTableType, any>>;
}

const props = defineProps<IProps>();
const isSelected = computed(() => {
  if (!props.tableItems) return false;
  return Object.values(props.tableItems).length;
});

watch(
  () => [props.tableItems.subnetInfoList],
  () => {
    vpcStoreInstance.setAddedSubnetList(props.tableItems.subnetInfoList);
  },
  { immediate: false },
);

const providers: any = {
  AWS: {
    color: '#FF9900',
  },
  Google: {
    color: '#4387F4',
  },
  Azure: {
    color: '#00BCF0',
  },
  NHN: {
    color: '#125DE6',
  },
  Other: {
    color: '#bbb',
  },
};

const tabs = [
  {
    name: 'details',
    label: 'Details',
  },
  {
    name: 'connection',
    label: 'Connection',
  },
  {
    name: 'subnets',
    label: 'Subnets',
  },
];

const defineTableField = [
  { label: 'VPC Name', name: 'vpcName' },
  { label: 'Description', name: 'description' },
  { label: 'Provider', name: 'provider' },
  { label: 'CIDR Block', name: 'cidrBlock' },
  { label: 'Company', name: 'company' },
  { label: 'Workspace', name: 'workspace' },
  { label: 'Project', name: 'project' },
];

const connectionField = [
  {
    name: 'connectionName',
    label: 'Connection Name',
  },
  {
    name: 'provider',
    label: 'Provider',
  },
  {
    name: 'region',
    label: 'Region',
  },
  {
    name: 'zone',
    label: 'Zone',
  },
];

const subnetsField: any = [
  {
    name: 'name',
    label: 'Subnet Name',
  },
  {
    name: 'ipv4_CIDR',
    label: 'CIDR Block',
  },
  {
    name: 'removeAction',
    label: '',
  },
];

const tabState = reactive({
  activeTab: 'details',
});

const handleSubnetPage = () => {
  router.push({
    name: 'vpcSubnets',
  });
};

const handleSubnetDeleteClick = () => {};

onMounted(() => {
  subnetTableModel.tableState.fields = subnetsField;
});
</script>

<template>
  <div v-if="isSelected">
    <p-tab v-model="tabState.activeTab" :tabs="tabs">
      <template #details>
        <div class="tab-section-header">
          <p>{{ i18n.t('CLOUD_RESOURCES.VPC._NAME') }} Information</p>
        </div>
        <p-definition-table
          :fields="defineTableField"
          :data="props.tableItems"
          :loading="false"
          style-type="primary"
          :block="false"
        />
      </template>
      <template #connection>
        <div class="tab-section-header">
          <p>{{ i18n.t('CLOUD_RESOURCES.VPC.CONNECTION') }}</p>
        </div>
        <p-data-table
          :fields="connectionField"
          :items="[
            {
              connectionName: `${tableItems.connection}`,
              provider: `${tableItems.provider}`,
              region: `ap-northeast-1`,
              zone: 'ap-northeast-1a',
            },
          ]"
        >
          {{ tableItems.connection }}
          <template #col-provider-format="{ value, item }">
            <p-badge
              v-if="providers[value]"
              :background-color="providers[value].color"
              text-color="white"
            >
              {{ item.provider }}
            </p-badge>
          </template>
        </p-data-table>
        <p-pane-layout>
          <!-- TODO: monitoring -->
        </p-pane-layout>
      </template>
      <template #subnets>
        <div class="tab-section-header">
          <p>{{ i18n.t('CLOUD_RESOURCES.VPC.SUBNETS') }}</p>
          <p-button
            icon-left="ic_edit"
            style-type="tertiary"
            @click="handleSubnetPage"
          >
            {{ i18n.t('COMPONENT.BUTTON_MODAL.EDIT') }}
          </p-button>
        </div>
        <p-data-table :fields="subnetsField" :items="tableItems.subnetInfoList">
          <template #col-removeAction-format>
            <p-button
              style-type="tertiary"
              size="sm"
              @click="handleSubnetDeleteClick"
            >
              {{ i18n.t('COMPONENT.BUTTON_MODAL.REMOVE') }}
            </p-button>
          </template>
        </p-data-table>
      </template>
    </p-tab>
  </div>
</template>

<style scoped lang="postcss">
.tab-section-header {
  padding: 2rem 1rem 1.5rem 1rem;
  margin-top: 0.625rem;
  display: flex;
  justify-content: space-between;

  p {
    font-size: 1.5rem;
    font-weight: 400;
  }
}
:deep(.p-data-table) {
  min-height: 6rem;
}
.p-pane-layout {
  @apply rounded-[4px] mx-[16px] bg-[#F7F7F7] border-[#DDDDDF];
  min-height: 14.875rem;
}
</style>
