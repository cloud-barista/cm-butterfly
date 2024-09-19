<script setup lang="ts">
import {
  PButtonModal,
  PPaneLayout,
  PTextInput,
  PFieldGroup,
  PTextarea,
  PRadio,
  PEmpty,
  PToggleButton,
  PDivider,
  PLink,
} from '@cloudforet-test/mirinae';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { vpcStore } from '@/shared/libs';
import { ListDropDown } from '@/widgets/layout/listDropDown';
import { storeToRefs } from 'pinia';
import {
  useCreateVPC,
  useGetProviderList,
  useGetRegionList,
  PROVIDER_ID_LIST,
} from '@/entities';
import { i18n } from '@/app/i18n';

const resCreateVPC = useCreateVPC<{ pathParams: any; request: any }, any>(null);
const resProviderList = useGetProviderList<any, null>();
const resRegionList = useGetRegionList<any, null>();

const vpcStoreInstance = vpcStore.useVpcStore();

const isConnectionEmpty = ref<boolean>(true);
const isConfirmPossible = ref<boolean>(false);

const { withSubnet, createdVpc } = storeToRefs(vpcStoreInstance);
// TODO: change real data

// const PROVIDER_LIST = ['AWS', 'Azure', 'Google'];
const providerIdList = ref<string[]>([]);
const regionIdList = ref<string[]>([]);

onMounted(async () => {
  const { data } = await resProviderList.execute();
  providerIdList.value = data.responseData.output;
});

onMounted(async () => {
  // const { data } = await resRegionList.execute();
  // data.responseData.region.forEach(r => {
  //   r['ProviderName'] === 'NHNCLOUD' ? console.log(r) : null;
  // });
});

// TODO: provider조건으로 filtering하는 기능 추가 (BE에서 제공해야함)
const LOCATION_LIST = ['Asia Pracific', 'Europe', 'North America'];
const REGION_LIST = ['Seoul', 'Tokyo', 'Singapore'];

const state = reactive({
  vpcName: '',
  description: '',
  providerList: computed(() => {
    let providerList = [{ name: '', value: '' }] as any[];
    providerIdList.value.forEach((providerId: string) => {
      Object.keys(PROVIDER_ID_LIST).includes(providerId)
        ? providerList.push({
            name: PROVIDER_ID_LIST[providerId],
            key: providerId,
          })
        : null;
    });
    return providerList;
  }),
  provider: computed(() => {
    return Object.values(PROVIDER_ID_LIST);
  }),
  selectedProvider: '',
  location: LOCATION_LIST.flatMap(location => {
    return { name: location };
  }),
  selectedLocation: '',
  region: REGION_LIST.flatMap(region => {
    return { name: region };
  }),
  selectedRegion: '',
  connectionList: computed(() => {
    return [
      { key: 'aws-ap-northeast-2', name: 'aws-ap-northeast-2' },
      { key: 'aws-ap-northeast-1', name: 'aws-ap-northeast-1' },
      { key: 'connection3', name: 'Connection 3' },
    ];
  }),
  selectedConnection: '',
});

// TODO: change api response

const textData = reactive({
  vpcName: '',
  description: '',
  selectedConnection: '',
  cidrBlock: '',
});

const isSelectedProvider = computed(() => {
  return state.selectedProvider !== '';
});
const isSelectedLocation = computed(() => {
  return state.selectedLocation !== '';
});

watch(
  () => [textData, createdVpc],
  () => {
    if (textData.cidrBlock.length > 0) {
      createdVpc.value.cidrBlock = textData.cidrBlock;
    }
    if (textData.selectedConnection.length > 0) {
      createdVpc.value.selectedConnection = textData.selectedConnection;
    }
    if (textData.description.length > 0) {
      createdVpc.value.description = textData.description;
    }
    if (textData.vpcName.length > 0) {
      createdVpc.value.vpcName = textData.vpcName;
    }
  },
);

watch(
  () => [
    isConfirmPossible,
    state.selectedConnection,
    createdVpc.value.selectedConnection,
  ],
  () => {
    if (state.selectedConnection.length > 0) {
      createdVpc.value.selectedConnection = state.selectedConnection;
    }
    createdVpc.value.selectedConnection.length < 0
      ? (isConfirmPossible.value = false)
      : (isConfirmPossible.value = true);
  },
  { immediate: false },
);

watch(
  () => [
    isConnectionEmpty,
    state.selectedLocation,
    state.selectedProvider,
    state.selectedRegion,
  ],
  () => {
    state.selectedProvider.length > 0 &&
    state.selectedLocation.length > 0 &&
    state.selectedRegion.length > 0
      ? (isConnectionEmpty.value = false)
      : (isConnectionEmpty.value = true);
  },
  { immediate: false },
);

const predicate = (value: any, current: any) => {
  return current && value.key == current.key;
};

const handleCheck = (value: boolean) => {
  vpcStoreInstance.setWithSubnet(value);
};
console.log(createdVpc.value.subnetList);

const handleConfirm = async () => {
  try {
    const { data } = await resCreateVPC.execute({
      pathParams: {
        // TODO: nsId 변경
        nsId: 'ns01',
      },
      request: {
        cidrBlock: createdVpc.value.cidrBlock,
        connectionName: createdVpc.value.selectedConnection?.key,
        name: createdVpc.value.vpcName,
        subnetInfoList: createdVpc.value.subnetList,
        description: createdVpc.value.description,
      },
    });
  } catch (err: any) {
    throw new Error('Failed to create VPC', err);
  }
  // TODO: save vpc data (api call)

  vpcStoreInstance.setCreateVpcModalVisible(false); // close modal

  // TODO: api call (데이 저장 후) 상태값 삭제.

  // vpcStoreInstance.removeCreatedVpc();
  // vpcStoreInstance.removeWithSubnet(); // withSubnet 상태값 삭제
};

const handleClose = () => {
  vpcStoreInstance.setCreateVpcModalVisible(false);
};

const handleClickProvider = (prv: string) => {
  state.selectedProvider = prv;
};

const handleClickLocation = (location: string) => {
  state.selectedLocation = location;
};

const handleClickRegion = (region: string) => {
  state.selectedRegion = region;
};
</script>

<template>
  <p-button-modal
    :visible="true"
    header-title="Create VPC"
    size="md"
    :disabled="!createdVpc.selectedConnection"
    @close="handleClose"
    @cancel="handleClose"
    @confirm="handleConfirm"
  >
    <template #body>
      <p-pane-layout class="create-vpc-layout">
        <div class="create-vpc">
          <p-pane-layout class="layout layout-top">
            <p-field-group label="VPC Name" required>
              <p-text-input
                v-model="createdVpc.vpcName"
                placeholder="VPC Name"
              />
            </p-field-group>
            <p-field-group label="Description">
              <p-textarea v-model="createdVpc.description" />
            </p-field-group>
          </p-pane-layout>
          <p-pane-layout class="layout layout-middle">
            <p>Connection</p>
            <div class="select-container">
              <list-drop-down
                :menu="state.providerList"
                :list="state.provider"
                title="Provider"
                @update:selectedItem="handleClickProvider"
              />
              <list-drop-down
                :menu="state.location"
                :list="LOCATION_LIST"
                :is-disabled="!isSelectedProvider"
                title="Location"
                @update:selectedItem="handleClickLocation"
              />
              <list-drop-down
                :menu="state.region"
                :list="REGION_LIST"
                :is-disabled="!isSelectedLocation"
                title="Region"
                @update:selectedItem="handleClickRegion"
              />
            </div>
            <div
              v-if="
                state.selectedProvider &&
                state.selectedLocation &&
                state.selectedRegion
              "
              class="connection-data"
            >
              <p-radio
                v-for="(connection, idx) in state.connectionList"
                :key="connection.key"
                v-model="createdVpc.selectedConnection"
                class="radio-button"
                :value="connection"
                :predicate="predicate"
              >
                {{ connection.name }}
              </p-radio>
              <p>{{ createdVpc.selectedConnection }}</p>
            </div>
            <div v-else class="empty-image">
              <p-empty show-image image-size="sm" title="No Data">
                Select Provider and Region
              </p-empty>
            </div>
          </p-pane-layout>
          <p-pane-layout class="layout layout-bottom">
            <p-field-group label="CIDR Block" required>
              <p-text-input
                v-model="createdVpc.cidrBlock"
                placeholder="ex) 10.0.0.0/16"
              />
            </p-field-group>
          </p-pane-layout>
          <p-pane-layout class="layout with-subnet">
            <div class="subnet-toggle">
              <p-toggle-button
                :value="withSubnet"
                @change-toggle="handleCheck(true)"
              />
              <span>With subnet</span>
            </div>
            <p-divider class="divider" />
            <p-link
              text="Go add subnet"
              :to="{ name: 'subnets' }"
              :highlight="withSubnet"
              :disabled="!withSubnet"
              action-icon="internal-link"
            />
          </p-pane-layout>
        </div>
      </p-pane-layout>
    </template>
    <template #close-button>
      <span>Cancel</span>
    </template>
    <template #confirm-button>
      <span>Confirm</span>
    </template>
  </p-button-modal>
</template>

<style scoped lang="postcss">
:deep(.modal-content) {
  min-height: 57.5rem;
}
.create-vpc-layout {
  @apply bg-[#F7F7F7] p-[1rem] border-none;
  p {
    font-size: 0.875rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    .optional {
      margin-left: 0.25rem;
      color: #898995;
      font-size: 0.75rem;
      font-weight: 400;
    }
  }
  .create-vpc {
    .p-field-group {
      margin-bottom: 0;
    }
  }
  .p-text-input {
    @apply mb-[0.75rem];
  }
  .layout {
    @apply p-[0.75rem] mb-[1rem];
  }
  .layout-middle {
    .select-container {
      @apply flex gap-[0.25rem];
      .text-container {
        padding: 0.5rem;
        cursor: pointer;
        &:hover {
          @apply bg-blue-100;
        }
        &.selected {
          @apply bg-blue-200;
        }
        .select-text {
          font-size: 0.875rem;
          font-weight: 400;
        }
      }
    }
    .connection-data {
      @apply mt-[1.1875rem] mb-[3.6875rem] flex flex-col;
      .radio-button {
        @apply p-[0.5rem];
      }
      .selected {
        @apply bg-[#E0F2FF];
      }
    }
    .empty-image {
      @apply flex justify-evenly w-full h-full overflow-auto p-8;
    }
  }
  .layout-bottom {
    .p-text-input {
      @apply mb-0;
    }
  }
  .with-subnet {
    margin-bottom: 0;
    .subnet-toggle {
      @apply flex gap-[0.5rem];
      span {
        font-size: 0.875rem;
        font-weight: 700;
      }
    }
    .divider {
      @apply my-[0.75rem];
    }
  }
}
:deep(.p-select-dropdown) {
  @apply w-[14rem];
}
</style>
