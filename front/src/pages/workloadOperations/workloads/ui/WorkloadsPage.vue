<script setup lang="ts">
import { VerticalPageLayout } from '@/widgets/layout';
import { WorkloadsLSB } from '@/widgets/workload';
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
    
    // migratorMenu가 비어있으면 빈 배열 반환
    if (!migratorMenu.value || migratorMenu.value.length === 0) {
      return [];
    }
    
    migratorMenu.value.forEach(m => {
      if (m.category.id === MENU_ID.WORKLOAD_OPERATIONS) {
        if (Array.isArray(m.menu) && m.menu.length > 0) {
          m.menu.forEach(sb => {
            if (Object.keys(sb).includes('submenus')) {
              if (sb['submenus'] && sb['submenus'].length > 0) {
                // submenus[0]에서 실제 서브메뉴 배열을 가져옴
                baseMenuSet = sb['submenus'][0];
              }
            }
          });
        }
      }
    });
    
    return baseMenuSet || [];
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
