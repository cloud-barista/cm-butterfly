<script setup lang="ts">
import { PNoticeAlert, PToastAlert } from '@cloudforet-test/mirinae';
</script>

<template>
  <div id="app">
    <p-notice-alert group="noticeBottomRight" />
    <p-toast-alert group="toastTopCenter" />
    <router-view />
  </div>
</template>

<style scoped lang="postcss">
#app {
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  width: 100vw;
  height: 100vh;
  background-color: $bg-color;

  .console-loading-wrapper {
    position: absolute;
    height: 100%;
    z-index: 10;

    & > .data-loader-container > .loader-wrapper > .loader.spinner {
      max-height: unset;
    }
  }
}

:deep(.sidebar-container) {
  @apply bg-gray-100;
}

:deep(.non-sidebar-wrapper) {
  min-height: 100%;
}
</style>
