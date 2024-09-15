<script setup lang="ts">
import { GNBToolbox } from '@/widgets/layout';
import { GNBNavigationRail } from '@/widgets/layout';
import { useSidebar } from '@/shared/libs/store/sidebar.ts';
import { storeToRefs } from 'pinia';

const sidebar = useSidebar();
const { isMinimized, isCollapsed } = storeToRefs(sidebar);
</script>

<template>
  <div>
    <div class="layout-container">
      <nav class="gnb">
        <g-n-b-toolbox class="g-n-b-item g-n-b-toolbox" />
        <g-n-b-navigation-rail class="g-n-b-item g-n-b-rail" />
      </nav>
      <main
        class="main"
        :class="{
          'is-hide': isCollapsed,
          'is-minimize': !isCollapsed && isMinimized,
        }"
      >
        <slot name="main" />
      </main>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.gnb {
  .g-n-b-item {
    @apply absolute flex border-gray-200;
  }
  .g-n-b-rail {
    z-index: 50;
  }
  .g-n-b-toolbox {
    z-index: 100;
  }
}
.main {
  @apply absolute;
  top: $gnb-toolbox-height;
  left: $gnb-navigation-rail-max-width;
  width: calc(100% - $gnb-navigation-rail-max-width);
  height: calc(100% - $gnb-toolbox-height);
  margin: auto;
  transition:
    left 0.3s ease,
    width 0.3s ease;
  &.is-hide {
    left: 0;
    width: 100%;
  }
  &.is-minimize {
    left: $gnb-navigation-rail-min-width;
    width: calc(100% - $gnb-navigation-rail-min-width);
  }
}

.top-bar {
  width: 100%;
  height: $top-bar-height;
  z-index: 100;
  flex-shrink: 0;
  top: 0;
}
</style>
