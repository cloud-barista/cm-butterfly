<script setup lang="ts">
import { LSBRouterMenuItem } from '../../LSBRouterMenuItem';

interface Props {
  menuData?: any;
  currentPath: string;
  lsbTitle: string;
}

const props = withDefaults(defineProps<Props>(), {
  menuData: () => ({}),
});
</script>

<template>
  <div class="l-s-b-menu-list">
    <div class="l-s-b-menu-item">
      <l-s-b-router-menu-item
        :submenu="menuData.name"
        :current-path="currentPath"
        :item="menuData"
        :lsb-title="lsbTitle"
      >
        <template #after-text>
          <slot :name="`after-text-${menuData.id}`" />
        </template>
      </l-s-b-router-menu-item>
    </div>
  </div>
</template>
