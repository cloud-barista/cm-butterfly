<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue';
import { useRoute } from 'vue-router/composables';
import { clone, toLower } from 'lodash';
import { PI } from '@cloudforet-test/mirinae';
import type { Menu } from '@/entities/user/store/menuPerUserStore';
import { useMenuPerUserStore } from '@/entities';
import { useSidebar } from '@/shared/libs/store/sidebar';
import { storeToRefs } from 'pinia';
import { MENU_ID } from '@/entities/menu';

const menuPerUserStore = useMenuPerUserStore();
const sidebar = useSidebar();

const { category } = storeToRefs(menuPerUserStore);
const { isMinimized, isCollapsed } = storeToRefs(sidebar);

const props = defineProps<{
  displayedMenu: Menu[];
}>();

const route = useRoute();

const state = reactive({
  isInit: false as boolean | undefined,
  isHovered: false,
  category: '',
  gnbMenuList: computed<Menu[]>(() => {
    return flattenMenusWithCategory(props.displayedMenu);
  }),
  selectedMenuId: computed(() => {
    const reversedMatched = clone(route.matched).reverse();
    const closestRoute = reversedMatched.find((r: any) => r.name !== undefined);
    const targetMenuId: string | any = closestRoute?.meta.menuId;
    return targetMenuId;
  }),
});

const flattenMenusWithCategory = (menu: Menu[]) => {
  let flatMenu = [] as any[];

  for (let m of menu) {
    flatMenu = flatMenu.concat(flattenMenu(m, m.displayname));
  }

  return flatMenu;
};

const flattenMenu = (menu: Menu, majorCategory?: string) => {
  let flatMenu = [] as any[];
  if (menu.menus && menu.menus.length > 0) {
    for (let subMenu of menu.menus) {
      if (subMenu.isAction === 'false') {
        flatMenu = flatMenu.concat(flattenMenu(subMenu, majorCategory));
      } else {
        flatMenu.push({
          majorCategory: majorCategory,
          category: menu.displayname,
          id: subMenu.id,
          parentMenuId: subMenu.parentMenuId,
          name: subMenu.name,
          displayname: subMenu.displayname,
          isAction: subMenu.isAction,
          priority: subMenu.priority,
        });
      }
    }
  }

  return flatMenu;
};

onMounted(() => {
  state.isInit = true;
});

watch(
  () => state.gnbMenuList,
  () => {
    menuPerUserStore.setFlattendMenus(state.gnbMenuList);
  },
);
</script>

<template>
  <!-- displayedMenu.parentMenuId === '' && displayedMenu.isAction === 'false' -->
  <div v-if="!isCollapsed">
    <div v-if="state.gnbMenuList.length > 0">
      <div v-for="(menu, idx) in state.gnbMenuList" :key="idx" class="menu">
        <span
          v-if="
            (idx === 0 ||
              menu.majorCategory !==
              state.gnbMenuList[idx - 1].majorCategory) &&
              !isMinimized
          "
          class="menu-category"
        >{{ menu.majorCategory }}</span
        >
        <span
          v-else-if="
            (idx === 0 ||
              menu.majorCategory !==
              state.gnbMenuList[idx - 1].majorCategory) &&
              isMinimized
          "
        >&nbsp;
        </span>
        <router-link
          v-if="
            idx === 0 || menu.category !== state.gnbMenuList[idx - 1].category
          "
          class="service-menu"
          :to="{
            name: `${menu.category.split(' ').join('')}`,
          }"
          :class="{
            'is-selected':
              toLower(state.selectedMenuId) ===
              toLower(menu.category?.split(' ').join('')),
          }"
        >
          <!-- 'is-only-label': menu?.isAction === 'true', -->
          <div class="menu-wrapper">
            <p-i
              name="ic_member"
              class="menu-button"
              height="1.25rem"
              width="1.25rem"
              color="inherit"
            />
            <div v-if="!isMinimized" class="menu-container">
              <span class="menu-title">{{ menu.category }}</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
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
      width: 0.25rem;
      height: 1.75rem;
      border-top-right-radius: 0.25rem;
      border-bottom-right-radius: 0.25rem;
    }
  }
}
</style>
