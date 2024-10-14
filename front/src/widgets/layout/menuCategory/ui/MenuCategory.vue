<script setup lang="ts">
import { clone } from 'lodash';
import { IMigratorMenu, MENU_ID } from '@/entities';
import { useSidebar } from '@/shared/libs/store/sidebar';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router/composables';
import { useGetMenuTree } from '@/entities/menu/api';
import { useMigratorMenuStore } from '@/entities/menu/model/stores';

const migratorMenuStore = useMigratorMenuStore();
const { migratorMenu } = storeToRefs(migratorMenuStore);

const sidebar = useSidebar();
const route = useRoute();
const getMenuTree = useGetMenuTree();

const { isCollapsed } = storeToRefs(sidebar);

const isDataLoaded = ref<boolean>(false);
const loadedCnt = ref(0);

const selectedMenuId = computed(() => {
  const reversedMatched = clone(route.matched).reverse();
  const closestRoute = reversedMatched.find(r => {
    return r.name !== undefined;
  });
  const targetMenuId: string | any = closestRoute?.meta.menuId;
  return targetMenuId;
});

onBeforeUnmount(() => {
  migratorMenu.value = [];
});

onMounted(async () => {
  await fetchMenuTree();
});

onMounted(() => {
  document
    .querySelector('.g-n-b-navigation-rail')
    ?.addEventListener('mouseover', () => {
      sidebar.toggleHover(true);
    });
  document
    .querySelector('.g-n-b-navigation-rail')
    ?.addEventListener('mouseleave', () => {
      sidebar.toggleHover(false);
    });
});

async function fetchMenuTree() {
  if (!isDataLoaded.value && loadedCnt.value < 1) {
    isDataLoaded.value = true;
    loadedCnt.value += 1;
    const { data } = await getMenuTree.execute();
    if (
      Array.isArray(data.responseData) &&
      data.responseData.length > 0 &&
      data.responseData[0].id === MENU_ID.MIGRATIONS
    ) {
      data.responseData[0].menus?.sort((a: IMigratorMenu, b: IMigratorMenu) => {
        return a.priority - b.priority;
      });
      data.responseData[0].menus?.forEach((migratorMenu: IMigratorMenu) => {
        migratorMenuStore.setMigratorMenu(migratorMenu);
      });
    }
  }
}
</script>

<template>
  <div v-if="!isCollapsed">
    <div v-for="(m, idx) in migratorMenu" :key="idx" class="menu">
      <span class="menu-category">
        {{ m.category.name }}
      </span>
      <router-link
        v-for="(n, i) in m.menu"
        :key="i"
        class="service-menu"
        :to="{ name: n.id }"
        :class="{
          'is-selected': selectedMenuId === n.id,
          'is-disabled': !(
            n.id === 'sourceservices' ||
            n.id === 'sourcemodels' ||
            n.id === 'targetmodels' ||
            n.id === 'workflows' ||
            n.id === 'workflowtemplates' ||
            n.id === 'taskcomponents'
          ),
        }"
      >
        <div class="menu-wrapper">
          <div class="menu-container">
            <span class="menu-title">{{ n.name }}</span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}
.menu {
  @apply mb-[1.7rem];
}
.menu-category {
  font-size: 14px;
  color: #898995;
}
.service-menu {
  @apply flex items-center justify-between text-label-md mt-[8px];
  width: 100%;
  height: 2rem;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
  gap: 0.75rem;
  border-radius: 0.25rem;
  .menu-wrapper {
    @apply flex items-center;
    gap: 0.625rem;
    .menu-container {
      @apply flex items-end;
      .mark-item {
        margin-left: 0.125rem;
      }
      .learn-more-button {
        margin-bottom: -0.125rem;
        margin-left: 0.5rem;
      }
    }
  }
  .favorite-button {
    @apply hidden;
  }
  &:hover:not(.is-only-label) {
    @apply bg-violet-100 cursor-pointer;
    .favorite-button {
      @apply block;
    }
  }
  &.is-only-label {
    @apply items-end text-gray-500 cursor-default;
    height: 2.625rem;
    padding-bottom: 0.5rem;
  }
  &.is-selected {
    @apply relative bg-violet-100 text-violet-600;
    &::before {
      @apply absolute;
      content: '';
      top: 0.125rem;
      left: -0.75rem;
      width: fit-content;
      height: 1.75rem;
      border-top-right-radius: 0.25rem;
      border-bottom-right-radius: 0.25rem;
    }
  }
}
</style>
