<script setup lang="ts">
import { PSelectStatus, PSelectDropdown } from '@cloudforet-test/mirinae';
import { vpcStore } from '@/shared/libs';
import { storeToRefs } from 'pinia';
import { toLower } from 'lodash';

interface Props {
  tableModel: any;
  providerStatusSet: { key: string; label: string }[];
}

const props = defineProps<Props>();

const { providerStatusSet } = props;

const vpcStoreInstance = vpcStore.useVpcStore();

const { selectedProviderType } = storeToRefs(vpcStoreInstance);

const handleSelectProviderType = (value: string) => {
  vpcStoreInstance.setSelectedProviderType(value);
  if (value === 'All') {
    // eslint-disable-next-line vue/no-mutating-props
    props.tableModel.tableState.displayItems =
      props.tableModel.tableState.items;
  } else {
    const filteredItem = props.tableModel.tableState.items.filter(
      (displayItem: any) => {
        return toLower(displayItem.provider) === toLower(value);
      },
    );
    // eslint-disable-next-line vue/no-mutating-props
    props.tableModel.tableState.displayItems = filteredItem;
  }
};
</script>

<template>
  <div class="vpc-list-table-bottom-filters">
    <div class="left-filter">
      <span class="title">Provider</span>
      <p-select-status
        v-for="(provider, pidx) in providerStatusSet"
        :key="pidx"
        :value="provider.key"
        :selected="selectedProviderType"
        @change="handleSelectProviderType"
      >
        {{ provider.label }}
      </p-select-status>
    </div>
    <div class="right-filter">
      <div class="region">
        <span class="title">Region</span>
        <p-select-dropdown>
          <template #dropdown-button>
            <div>
              <span>All</span>
            </div>
          </template>
        </p-select-dropdown>
      </div>
      <div class="connection">
        <span class="title">Connection</span>
        <p-select-dropdown>
          <template #dropdown-button>
            <div>
              <span>All</span>
            </div>
          </template>
        </p-select-dropdown>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.vpc-list-table-bottom-filters {
  @apply flex justify-between mt-[0.875rem];
  padding: 0 16px 14px;
  .right-filter {
    @apply flex gap-4;
    .p-select-dropdown {
      @apply ml-[1.5rem];
    }
  }
  .left-filter {
    span {
      font-size: 0.875rem;
    }
    .p-status {
      @apply ml-[0.75rem];
    }
  }
}
.title {
  font-size: 0.875rem;
  color: #515364;
  font-weight: 400;
}
</style>
