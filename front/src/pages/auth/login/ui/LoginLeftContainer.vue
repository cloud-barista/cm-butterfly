<script setup lang="ts">
const imgName =
  import.meta.env.VITE_PROJECT_NAME === 'MCMP' ? 'M-CMP' : 'CLOUD-MIGRATOR';
</script>

<template>
  <div class="login-left-container">
    <div class="logo-container">
      <!-- <img class="logo" alt="logo" :src="imgSrc" /> -->
      <span class="logo-name">{{ imgName }}</span>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.login-left-container {
  flex: 1;

  .logo-container {
    position: fixed;
    top: 20px;
    left: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    .logo {
      width: 56px;
      height: 56px;
      object-fit: fill;
    }
    .logo-name {
      @apply text-xl italic font-medium;
    }
  }
}
</style>
