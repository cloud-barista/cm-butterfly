<script setup lang="ts">
import LoginForm from '@/features/auth/ui/LoginForm.vue';
import { IUserLoginResponse } from '@/entities';
import { McmpRouter } from '@/app/providers/router';
import { useAuth } from '@/features/auth/model/useAuth';
import { SOURCE_COMPUTING_ROUTE } from '@/app/providers/router/routes/constants';

const auth = useAuth();

const imgName =
  import.meta.env.VITE_PROJECT_NAME === 'MCMP' ? 'M-CMP' : 'CLOUD-MIGRATOR';

const handleLoginSuccess = (props: IUserLoginResponse & { id: string }) => {
  auth.setUser(props);
  McmpRouter.getRouter()
    .push({
      name: SOURCE_COMPUTING_ROUTE.SOURCE_SERVICES._NAME,
    })
    .then()
    .catch(() => {});
};
</script>

<template>
  <section class="login-page">
    <div class="logo-container">
      <span class="logo-name">{{ imgName }}</span>
    </div>
    <div class="login-container-wrapper">
      <LoginForm @handleLoginSuccess="handleLoginSuccess" />
    </div>
  </section>
</template>

<style scoped lang="postcss">
.login-page {
  @apply flex justify-center items-center;
  width: 100%;
  height: 100vh;
  background-image: url('@/shared/asset/image/img_blurred-background-min.png');

  .logo-container {
    position: fixed;
    top: 20px;
    left: 20px;
    display: flex;
    align-items: center;
    gap: 10px;

    .logo-name {
      @apply text-xl italic font-medium;
    }
  }

  .login-container-wrapper {
    @apply flex justify-center items-center;
  }
}
</style>
