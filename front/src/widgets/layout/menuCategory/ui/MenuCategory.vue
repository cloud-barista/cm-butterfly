<script setup lang="ts">
import { clone } from 'lodash';
import { PI } from '@cloudforet-test/mirinae';
import type { MigratorMenu } from '@/entities';
import { useSidebar } from '@/shared/libs/store/sidebar';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useRoute } from 'vue-router/composables';

const sidebar = useSidebar();
const route = useRoute();

const { isMinimized, isCollapsed } = storeToRefs(sidebar);

const props = defineProps<{
  displayedMenu: MigratorMenu[];
}>();

const selectedMenuId = computed(() => {
  const reversedMatched = clone(route.matched).reverse();
  const closestRoute = reversedMatched.find(r => {
    return r.name !== undefined;
  });
  const targetMenuId: string | any = closestRoute?.meta.menuId;
  return targetMenuId;
});
</script>

<template>
  <!-- displayedMenu.parentMenuId === '' && displayedMenu.isAction === 'false' -->
  <div v-if="!isCollapsed">
    <div v-for="(m, idx) in displayedMenu" :key="idx" class="menu">
      <span v-if="!isMinimized" class="menu-category">{{
        m.category.name
      }}</span>
      <router-link
        class="service-menu"
        :to="{ name: m.menu.id }"
        :class="{
          'is-selected': selectedMenuId === m.category.id,
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
            <span class="menu-title">{{ m.menu.name }}</span>
          </div>
        </div>
      </router-link>
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
      /* width: 0.25rem; */
      width: fit-content;
      height: 1.75rem;
      border-top-right-radius: 0.25rem;
      border-bottom-right-radius: 0.25rem;
    }
  }
}
</style>
