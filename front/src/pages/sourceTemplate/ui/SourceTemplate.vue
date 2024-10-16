<script setup lang="ts">
import WorkflowTemplate from '@/features/workflow/workflowDesigner/ui/WorkflowDesigner.vue';
import WorkflowTool from '@/features/workflow/ui/WorkflowTool.vue';

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
          <WorkflowTool></WorkflowTool>
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
