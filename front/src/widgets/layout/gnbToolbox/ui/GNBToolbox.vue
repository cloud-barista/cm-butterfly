<script setup lang="ts">
import { PTooltip, PIconButton, PBreadcrumbs } from '@cloudforet-test/mirinae';
import { useSidebar } from '@/shared/libs/store/sidebar';
import { storeToRefs } from 'pinia';
import { useBreadcrumbs } from '@/shared/hooks/breadcrumb';
import type { Breadcrumb } from '@/shared/types';
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';
import { useGnbStore } from '@/shared/libs/store/gnb-store';
import { clone } from 'lodash';
import { MenuId } from '@/entities';

const sidebar = useSidebar();
const gnbStore = useGnbStore();
const gnbGetters = gnbStore.getters;
const route = useRoute();
const { breadcrumbs } = useBreadcrumbs();

const { isCollapsed } = storeToRefs(sidebar);

const state = reactive({
  routes: computed(() => {
    let routes: Breadcrumb[] = [];
    if (breadcrumbs.value.length === 0) {
      routes = [...routes, ...breadcrumbs.value];
    }
    routes = [...routes, ...gnbGetters.breadcrumbs];
    return routes;
  }),
  selectedMenuId: computed(() => {
    const reversedMatched = clone(route.matched).reverse();
    const closestRoute = reversedMatched.find(
      m => m.meta?.menuId !== undefined,
    );
    const targetMenuId: MenuId = closestRoute?.meta.menuId;
    return targetMenuId;
  }),
  currentMenuId: computed(
    () => route.matched[route.matched.length - 1].meta.menuId,
  ),
  breadcrumbs: computed(() => {
    let resultArr: Breadcrumb[] = [];
    if (route.meta?.category) {
      resultArr = [{ name: `${route.meta?.category}` }];
      route.matched.forEach(matchedRoute => {
        matchedRoute.meta?.menuId === route.meta?.menuId
          ? resultArr.push({
              name: matchedRoute.name as string,
              to: {
                name: matchedRoute.name as string,
              },
            })
          : null;
      });
    }
    return resultArr;
  }),
});

const handleClickMenuButton = () => {
  sidebar.toggleCollapse();
};
</script>

<template>
  <div class="g-n-b-toolbox">
    <div class="navigation-section">
      <p-tooltip
        class="menu-button-wrapper"
        position="bottom"
        :contents="isCollapsed ? 'Open Menu' : 'Close Menu'"
      >
        <p-icon-button
          name="ic_gnb_menu"
          style-type="transparent"
          class="menu-button"
          shape="square"
          size="md"
          @click="handleClickMenuButton"
        />
      </p-tooltip>
      <p-breadcrumbs :routes="state.breadcrumbs" :copiable="false">
        <template #default="props">
          <!-- TODO: -->
          {{ props }}
        </template>
      </p-breadcrumbs>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.g-n-b-toolbox {
  @apply justify-between bg-white border-b;
  top: 0;
  width: 100%;
  height: $gnb-toolbox-height;
  padding-right: 1rem;
  z-index: 50;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12);
  .navigation-section {
    @apply flex items-center;
    .menu-button-wrapper {
      @apply flex items-center justify-center;
      width: $gnb-navigation-rail-min-width;
      .menu-button {
        @apply border-none text-gray-900;
        margin-bottom: -0.025rem;
        &:hover {
          @apply text-blue-600;
        }
      }
    }
  }
  .extra-section {
    @apply flex items-center text-gray-500 text-label-sm;
    gap: 0.25rem;
    .copy-button {
      @apply flex items-center text-gray-500;
    }
  }
}

:deep(.p-copy-button) {
  .copy-button-alert {
    top: calc($top-bar-height + $gnb-toolbox-height - 0.5rem) !important;
  }
}

:deep('.p-context-menu') {
  z-index: 999;
}
</style>
