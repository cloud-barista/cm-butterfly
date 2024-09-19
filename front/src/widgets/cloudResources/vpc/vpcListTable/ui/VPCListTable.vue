<script setup lang="ts">
import {
  PHorizontalLayout,
  PToolboxTable,
  PButton,
  PBadge,
  PDivider,
} from '@cloudforet-test/mirinae';
import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import { VPCInformationTableType } from '@/entities';
import { computed, onBeforeMount, onMounted, reactive, ref } from 'vue';
import { VPCCreateModal } from '../../vpcCreateModal';
import { vpcStore } from '@/shared/libs';
import { VPCListTableBottomFilter } from '@/features/cloudResources';
import { storeToRefs } from 'pinia';
import { i18n } from '@/app/i18n';
import { useGetAllVPCs, useDeleteVPC } from '@/entities';
import { insertDynamicComponent } from '@/shared/utils';
import { DeleteVPC } from '@/features/cloudResources';

const resGetAllVPCs = useGetAllVPCs<any, null | { nsId: string }>(null);
const resDeleteVPC = useDeleteVPC<any, null | { nsId: string; vNetId: string }>(
  null,
);

const vpcStoreInstance = vpcStore.useVpcStore();

const { createVpcModalVisible } = storeToRefs(vpcStoreInstance);

interface Props {
  tableItems: Partial<Record<VPCInformationTableType, any>>[];
}

const props = defineProps<Props>();
const emit = defineEmits(['selectRow']);

let trashBtn;

const tableModel =
  useToolboxTableModel<Partial<Record<VPCInformationTableType, any>>>();

tableModel.tableState.items = props.tableItems;
tableModel.tableState.sortedItems = tableModel.tableState.items;

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

const providerStatusSet = [
  {
    key: 'All',
    label: 'All',
  },
  {
    key: 'AWS',
    label: 'AWS',
  },
  {
    key: 'Google',
    label: 'Google',
  },
  {
    key: 'Azure',
    label: 'Azure',
  },
  {
    key: 'NHN',
    label: 'NHN',
  },
  {
    key: 'Other',
    label: 'Other',
  },
];

tableModel.tableState.fields = [
  {
    name: 'vpcName',
    label: 'VPC Name',
  },
  {
    name: 'description',
    label: 'Description',
  },
  {
    name: 'cidrBlock',
    label: 'CIDR Block',
  },
  {
    name: 'provider',
    label: 'Provider',
  },
  {
    name: 'connection',
    label: 'Connection',
  },
];

tableModel.querySearchState.keyItemSet = [
  {
    title: 'columns',
    items: [
      {
        name: 'vpcName',
        label: 'VPC Name',
      },
      {
        name: 'description',
        label: 'Description',
      },
      {
        name: 'cidrBlock',
        label: 'CIDR Block',
      },
      {
        name: 'provider',
        label: 'Provider',
      },
      {
        name: 'connection',
        label: 'Connection',
      },
    ],
  },
];

const toolboxTable = ref(null);
const isOpenedModal = ref(false);

const state = reactive({
  displayItems: computed(() => {
    return tableModel.tableState.displayItems;
  }),
});

const handleSelectedIndex = (index: number) => {
  const selectedData = tableModel.tableState.sortedItems[index];
  emit('selectRow', selectedData);
};

const handleCreateVpc = async () => {
  vpcStoreInstance.setCreateVpcModalVisible(true);
};

const handleTableDataFetch = async () => {
  const { data } = await resGetAllVPCs.execute({
    pathParams: {
      nsId: 'ns01',
    },
  });

  if (Object.keys(data.responseData).length > 0) {
    tableModel.tableState.items = data.responseData.vNet.map(v => {
      const { id, description, cidrBlock, connectionName, subnetInfoList } = v;
      let subnetInfoArr = [] as {
        name: string;
        ipv4_CIDR: string;
      }[];
      if (Array.isArray(subnetInfoList) && subnetInfoList.length > 0) {
        subnetInfoList.forEach(subnet => {
          subnetInfoArr.push({
            name: subnet.Id,
            ipv4_CIDR: cidrBlock,
          });
        });
      }

      let provider = '';
      if (id.includes('aws')) {
        provider = 'AWS';
      } else if (id.includes('google')) {
        provider = 'Google';
      } else if (id.includes('azure')) {
        provider = 'Azure';
      } else if (id.includes('nhanes')) {
        provider = 'NHN';
      } else {
        provider = 'Other';
      }

      return {
        vpcName: id,
        description,
        cidrBlock,
        provider,
        connection: connectionName,
        subnetInfoList: subnetInfoArr,
      };
    });
  } else {
    tableModel.initState();
  }
  tableModel.tableState.sortedItems = tableModel.tableState.items;
  tableModel.handleChange(null);
};

function addDeleteIconAtTable() {
  const toolboxTable = this.$refs.toolboxTable.$el;
  const targetElement = toolboxTable.querySelector('.right-tool-group');
  const instance = insertDynamicComponent(
    DeleteVPC,
    {
      label: '',
    },
    {
      'button-click': async message => {
        trashBtn.$props.focusedData =
          tableModel.tableState.items[tableModel.tableState.selectIndex];
        trashBtn.$props.focus = true;
        // await resDeleteVPC.execute({
        //   pathParams: {
        //     nsId: 'ns01',
        //     vNetId: 'vNet02',
        //   },
        // });
      },
    },
    targetElement,
    'prepend',
  );

  return instance;
}

onBeforeMount(() => {
  tableModel.initState();
  handleTableDataFetch();
});

onMounted(function () {
  trashBtn = addDeleteIconAtTable.bind(this)();
});
</script>

<template>
  <div>
    <p-horizontal-layout :height="400" :min-hieght="400" :max-height="1000">
      <template #container="{ height }">
        <p-toolbox-table
          ref="toolboxTable"
          :loading="tableModel.tableState.loading"
          :items="tableModel.tableState.displayItems"
          :fields="tableModel.tableState.fields"
          :total-count="tableModel.tableState.tableCount"
          :style="{ height: `${height}` }"
          :sortable="tableModel.tableOptions.sortable"
          :sort-by="tableModel.tableOptions.sortBy"
          :selectable="tableModel.tableOptions.selectable"
          :multi-select="tableModel.tableOptions.multiSelect"
          :search-type="tableModel.tableOptions.searchType"
          :key-item-sets="tableModel.querySearchState.keyItemSet"
          :value-handler-map="tableModel.querySearchState.valueHandlerMap"
          :query-tag="tableModel.querySearchState.queryTag"
          :select-index.sync="tableModel.tableState.selectIndex"
          :page-size="tableModel.tableOptions.pageSize"
          @change="tableModel.handleChange"
          @refresh="handleTableDataFetch"
          @select="handleSelectedIndex"
        >
          <template #toolbox-left>
            <p-button
              style-type="primary"
              icon-left="ic_plus_bold"
              @click="handleCreateVpc"
            >
              {{ i18n.t('COMPONENT.BUTTON_MODAL.CREATE') }}
            </p-button>
          </template>
          <template #toolbox-bottom>
            <p-divider />
            <v-p-c-list-table-bottom-filter
              :provider-status-set="providerStatusSet"
              :table-model="tableModel"
            />
          </template>
          <template #col-provider-format="{ value, item }">
            <p-badge
              v-if="providers[value]"
              :background-color="providers[value].color"
              text-color="white"
            >
              {{ item.provider }}
            </p-badge>
          </template>
          <template #col-connection-format="{ value, item }">
            <p-badge
              text-color="#232533"
              font-weight="400"
              background-color="#DDDDDF"
              :table-model="tableModel"
            >
              {{ item.connection }}
            </p-badge>
          </template>
        </p-toolbox-table>
      </template>
    </p-horizontal-layout>
    <v-p-c-create-modal v-if="createVpcModalVisible" />
  </div>
</template>
