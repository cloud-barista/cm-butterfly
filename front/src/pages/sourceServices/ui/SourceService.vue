<script setup lang="ts">
import { reactive, ref } from 'vue';
import MciList from '@/widgets/workload/mci/mciList/ui/MciList.vue';
import VmGroups from '@/widgets/workload/vmGroups/ui/VmGroups.vue';
import { PButtonTab, PTab } from '@cloudforet-test/mirinae';
import VmDetail from '@/widgets/workload/mci/vmInformation/ui/VmInformation.vue';
import MciDetail from '@/widgets/workload/mci/mciDetail/ui/MciDetail.vue';
import SourceServiceList from '@/widgets/sourceServices/sourceServiceList/ui/SourceServiceList.vue';

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

const selectedServiceId = ref<string>('');
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header :class="`${pageName}-page-header`">
      <p>{{ pageName }}</p>
    </header>
    <section :class="`${pageName}-page-body`">
      <!--      <MciList :ns-id="nsId" @selectRow="handleSelectMciTableRow"></MciList>-->
      <SourceServiceList></SourceServiceList>
      <p
        v-if="!selectedServiceId"
        class="flex justify-center text-gray-300 text-sm font-normal"
      >
        Select an item for more details.
      </p>
    </section>
  </div>
</template>

<style scoped lang="postcss"></style>
