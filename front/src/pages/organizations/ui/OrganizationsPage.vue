<script setup lang="ts">
import { OrganizationsLSB } from '@/features/console';
import { VerticalPageLayout } from '@/app/Layouts';
import { GeneralPageLayout } from '@/app/Layouts/generalPageLayout';
import { useRoute } from 'vue-router/composables';
import { useMenuPerUserStore } from '@/entities';
import { storeToRefs } from 'pinia';
import { computed, reactive } from 'vue';

const route = useRoute();
const menuPerUserStore = useMenuPerUserStore();

const { flattenedMenus } = storeToRefs(menuPerUserStore);

const state = reactive({
  menuSet: computed(() => {
    let baseMenuSet = [] as any[];
    flattenedMenus?.value?.forEach(flattenedMenu => {
      // TODO: api 받아온 후 수정 필요
      flattenedMenu.category === 'Organizations'
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
        <organizations-l-s-b :menus="state.menuSet" />
      </template>
      <template #default>
        <router-view />
      </template>
    </vertical-page-layout>
    <!-- <general-page-layout>
      <router-view />
    </general-page-layout> -->
  </fragment>
</template>

<style scoped lang="postcss"></style>
