<script setup lang="ts">
// import TopBarWorkspaces from '@/features/topbar/topbarWorkspaces/ui/TopBarWorkspaces.vue';
import { TopBarToolset } from '@/features/topbar';
import { reactive } from 'vue';

const state = reactive({
  openedMenu: '',
});

const hideMenu = () => {
  state.openedMenu = '';
};

const handleOpenMenu = (menuId: any) => {
  if (state.openedMenu === menuId) {
    hideMenu();
  } else {
    state.openedMenu = menuId;
  }
};

const imgName =
  import.meta.env.VITE_PROJECT_NAME === 'MCMP' ? 'M-CMP' : 'CLOUD-MIGRATOR';
</script>

<template>
  <div class="top-bar">
    <!-- <top-bar-workspaces ref="topBarWorkspaceRef" class="top-bar-workspace" /> -->
    <div class="top-bar-workspacc">
      <span class="logo-name">{{ imgName }}</span>
    </div>
    <top-bar-toolset
      ref="topBarToolsetRef"
      class="toolset"
      :opened-menu="state.openedMenu"
      @open-menu="handleOpenMenu"
      @hide-menu="hideMenu"
    />
  </div>
</template>

<style lang="postcss" scoped>
.logo-name {
  @apply text-xl font-medium pl-[18px];
}
.top-bar {
  @apply bg-white items-center justify-between border-b border-gray-200;
  display: flex !important;
  width: 100%;

  &.admin-top-bar {
    @apply bg-violet-900;
    background: linear-gradient(90deg, #2c0f66 14.69%, #7d5dd2 100%);
    box-shadow: 0 0.125rem 0.25rem 0 rgba(0, 0, 0, 0.12);
  }

  .top-bar-workspace {
    flex: 0 0;
  }

  .middle-section {
    @apply flex justify-center;
    flex: 1 1;
  }

  .toolset {
    @apply inline-flex items-center;
    right: 0;
    padding-right: 1.5rem;
    flex: 0 0;
  }
}
</style>
