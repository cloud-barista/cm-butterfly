<script setup lang="ts">
import LoginLeftContainer from '@/pages/auth/login/ui/LoginLeftContainer.vue';
import LoginRightContainer from '@/pages/auth/login/ui/LoginRightContainer.vue';
</script>

<template>
  <section class="login-page">
    <div class="login-container-wrapper">
      <LoginLeftContainer />
      <LoginRightContainer />
    </div>
  </section>
</template>

<style scoped lang="postcss">
.login-page {
  width: 100%;
  /* height: 100%; */
  background-image: url('@/shared/asset/image/img_blurred-background-min.png');
  .login-container-wrapper {
    display: flex;
    height: 100%;
  }
}
</style>
