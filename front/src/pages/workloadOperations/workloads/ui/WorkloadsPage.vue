<script setup lang="ts">
import { VerticalPageLayout } from '@/app/Layouts';
import { WorkloadsLSB } from '@/widgets/workloads';
import { computed, reactive } from 'vue';
import { MENU_ID, useMigratorMenuStore } from '@/entities';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router/composables';

const route = useRoute();

const migratorMenuStore = useMigratorMenuStore();

const { migratorMenu } = storeToRefs(migratorMenuStore);

const state = reactive({
  menuSet: computed(() => {
    let baseMenuSet: any;
    migratorMenu.value.forEach(m => {
      if (m.category.id === MENU_ID.WORKLOAD_OPERATIONS) {
        if (Array.isArray(m.menu) && m.menu.length > 0) {
          m.menu.forEach(sb => {
            if (Object.keys(sb).includes('submenus')) {
              if (sb['submenus'].length > 0) {
                baseMenuSet = sb['submenus'];
              }
            }
          });
        }
      }
    });
    return baseMenuSet[0];
  }),
  lsbVisible: computed<boolean>(() => route.meta?.lsbVisible),
});
</script>

<template>
  <vertical-page-layout v-if="state.lsbVisible">
    <template #sidebar>
      <workloads-l-s-b :menu-set="state.menuSet" />
    </template>
    <template #default>
      <router-view />
    </template>
  </vertical-page-layout>
</template>

<style scoped lang="postcss"></style>
