<script setup lang="ts">
import { CloudResourcesLSB } from '@/features/console';
import { VerticalPageLayout } from '@/app/Layouts';
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { useMenuPerUserStore } from '@/entities';
import { storeToRefs } from 'pinia';
import { GeneralPageLayout } from '@/app/Layouts/generalPageLayout';

const route = useRoute();

const menuPerUserStore = useMenuPerUserStore();

const { flattenedMenus } = storeToRefs(menuPerUserStore);

const state = reactive({
  menuSet: computed(() => {
    let baseMenuSet = [] as any[];
    flattenedMenus?.value?.forEach(flattenedMenu => {
      flattenedMenu.category === 'Cloud Resources'
        ? baseMenuSet.push(flattenedMenu)
        : null;
    });
    return baseMenuSet;
  }),
  lsbVisible: computed<boolean>(() => route.meta?.lsbVisible),
});
</script>

<template>
  <fragment>
    <vertical-page-layout v-if="state.lsbVisible">
      <template #sidebar>
        <cloud-resources-l-s-b :menus="state.menuSet" />
      </template>
      <template #default>
        <router-view />
      </template>
    </vertical-page-layout>
    <general-page-layout v-else>
      <router-view />
    </general-page-layout>
  </fragment>
</template>

<style scoped lang="postcss"></style>
