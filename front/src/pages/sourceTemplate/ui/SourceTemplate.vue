<script setup lang="ts">
import WorkflowTemplate from '@/features/workflow/workflowTemplate/ui/WorkflowTemplate.vue';
import SourceServiceDetail from '@/widgets/source/sourceServices/sourceServiceDetail/ui/SourceServiceDetail.vue';
import SourceConnectionList from '@/widgets/source/sourceConnections/sourceConnectionList/ui/SourceConnectionList.vue';
import SourceConnectionModal from '@/widgets/source/sourceConnections/sourceConnectionModal/ui/SourceConnectionModal.vue';
import { PButton, PButtonTab, PTab } from '@cloudforet-test/mirinae';
import SourceServiceList from '@/widgets/source/sourceServices/sourceServiceList/ui/SourceServiceList.vue';
import SourceInformation from '@/widgets/source/sourceConnections/sourceConnectionDetail/information/ui/SourceInformation.vue';
import SourceSoftwareCollect from '@/widgets/source/sourceConnections/sourceConnectionDetail/softwareCollect/ui/SourceSoftwareCollect.vue';
import MetaViewer from '@/widgets/source/sourceConnections/sourceConnectionDetail/metaViewer/ui/MetaViewer.vue';
import SourceInfraCollect from '@/widgets/source/sourceConnections/sourceConnectionDetail/infraCollect/ui/SourceInfraCollect.vue';
import { AddSourceServiceModal } from '@/widgets/sourceServices';
const pageName = 'sourceTemplate';
</script>

<template>
  <div class="w-[100%] h-[100%]">
    <div :class="`${pageName}-page page`">
      <header :class="`${pageName}-page-header`">
        <p>{{ pageName }}</p>
      </header>
      <section :class="`${pageName}-page-body`">
        <header class="h-[54px]"></header>
        <section class="workflow-body">
          <WorkflowTemplate></WorkflowTemplate>
        </section>
      </section>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.sourceTemplate-page-body {
  height: calc(100% - 54px);
  .workflow-body {
    height: calc(100% - 100px);
  }
}
</style>
