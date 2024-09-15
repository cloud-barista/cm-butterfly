<script setup lang="ts">
import {
  PI,
  PButton,
  PIconButton,
  PTextInput,
  PFieldGroup,
} from '@cloudforet-test/mirinae';
import { WidgetLayout } from '@/widgets/layout';
import { ref } from 'vue';
import { useRouter } from 'vue-router/composables';
import { vpcStore } from '@/shared/libs';

const vpcStoreInstance = vpcStore.useVpcStore();

const router = useRouter();

interface Props {
  subnetList: {
    name: string;
    ipv4_CIDR: string;
  }[];
}

const props = defineProps<Props>();

// TODO: change api response
const subnetList = ref(props.subnetList);

const deleteSelectedVPCSubnet = (index: number) => {
  vpcStoreInstance.removeVPCSubnet(index);
};

const deleteSelectedSubnet = (index: number) => {
  vpcStoreInstance.removeSubnet(index);
};
const handleAddingSubnet = () => {
  subnetList.value.push({
    name: '',
    ipv4_CIDR: '',
  });
};

const handleGoBack = () => {
  vpcStoreInstance.removeSubnetList();
  router.go(-1);
};
</script>

<template>
  <div class="subnet-page-layer">
    <div class="subnet-page-top">
      <p-icon-button
        style-type="transparent"
        name="ic_arrow-left"
        width="2rem"
        height="2rem"
        @click="handleGoBack"
      />
      <p>Subnet</p>
    </div>
    <widget-layout
      class="widget-layout"
      title="Manage your subnets."
      overflow="auto"
    >
      <template #default>
        <p-button
          class="icon-plus"
          icon-left="ic_plus"
          style-type="secondary"
          @click="handleAddingSubnet"
        >
          Add Subnet
        </p-button>
        <div class="subnet-list">
          <p class="title-wrapper">
            <span class="title">Subnet Name</span>
            <span class="title">CIDR Block</span>
          </p>
          <div
            v-for="(subnet, idx) in subnetList"
            :key="idx"
            ref="subnetInput"
            class="input-wrapper"
          >
            <p-field-group
              :invalid="!subnet.name"
              :invalid-text="'No Subnet Name'"
            >
              <p-text-input v-model="subnet.name" :invalid="!subnet.name" />
            </p-field-group>
            <!-- :disabled="subnet.subnetName.length > 0" -->
            <p-field-group
              :invalid="!subnet.ipv4_CIDR"
              :invalid-text="'No CIDR Block'"
            >
              <p-text-input
                v-model="subnet.ipv4_CIDR"
                :invalid="!subnet.ipv4_CIDR"
              />
            </p-field-group>
            <p-icon-button
              v-if="router.currentRoute.name === 'vpcSubnets'"
              class="icon-close"
              name="ic_close"
              @click="deleteSelectedVPCSubnet(idx)"
            />
            <p-icon-button
              v-else-if="router.currentRoute.name === 'subnets'"
              class="icon-close"
              name="ic_close"
              @click="deleteSelectedSubnet(idx)"
            />
          </div>
        </div>
      </template>
    </widget-layout>
    <div class="action-buttons">
      <slot name="buttons" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.subnet-page-layer {
  @apply px-[1.5rem] py-[1.5rem];
  .subnet-page-top {
    @apply flex gap-[0.75rem];
    p {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.375rem;
    }
    .go-back {
      cursor: pointer;
    }
  }
}

.widget-layout {
  min-height: 45.25rem;
  .icon-plus {
    @apply mb-[1.5rem];
  }
  .subnet-list {
    .title-wrapper {
      @apply flex gap-[9.25rem] mb-[1rem];
      .title {
        font-size: 1rem;
        font-weight: 700;
      }
    }
  }
}

.input-wrapper {
  @apply flex gap-[1rem];
  .icon-close {
    margin-top: 4px;
  }
}

.action-buttons {
  @apply flex justify-end gap-[1rem] mt-[1.5rem];
}
</style>
