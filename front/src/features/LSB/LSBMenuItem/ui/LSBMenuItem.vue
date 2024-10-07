<script setup lang="ts">
import { LSBRouterMenuItem } from '../../LSBRouterMenuItem';

interface Props {
  menuData: any;
  currentPath: string;
}

withDefaults(defineProps<Props>(), {
  menuData: () => ({}),
  currentPath: undefined,
});
</script>

<template>
  <div class="l-s-b-menu-list">
    <div class="l-s-b-menu-item">
      <l-s-b-router-menu-item
        :submenu="menuData.displayname"
        :current-path="currentPath"
        :item="menuData"
      >
        <template #after-text>
          <slot :name="`after-text-${menuData.id}`" />
        </template>
      </l-s-b-router-menu-item>
    </div>
  </div>
</template>
