<script setup lang="ts">
import { LSB } from '@/widgets/layout';
import { watchEffect } from 'vue';
import { PTextInput, PDivider, PI } from '@cloudforet-test/mirinae';

const pageName = 'Workloads';

interface iProps {
  menuSet: any;
}

const props = defineProps<iProps>();
</script>

<template>
  <l-s-b
    :class="`${pageName}-l-s-b page-l-s-b`"
    :menu-set="menuSet"
    :lsb-title="'Workload'"
  >
    <template #default>
      <div class="l-s-b-title">
        <p-i name="ic_service_server" color="#6638B6" />
        <p>Workloads</p>
      </div>
      <p-divider />
    </template>
  </l-s-b>
</template>

<style scoped lang="postcss"></style>
