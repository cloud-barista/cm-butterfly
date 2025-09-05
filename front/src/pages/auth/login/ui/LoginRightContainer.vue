<script setup lang="ts">
import LoginForm from '@/features/auth/ui/LoginForm.vue';
import { IUserLoginResponse } from '@/entities';
import { McmpRouter } from '@/app/providers/router';
import { useAuth } from '@/features/auth/model/useAuth';
import { SOURCE_COMPUTING_ROUTE } from '@/app/providers/router/routes/constants';

const auth = useAuth();

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
  <div class="login-right-container">
    <LoginForm @handleLoginSuccess="handleLoginSuccess" />
  </div>
</template>

<style scoped lang="postcss">
.login-right-container {
  @apply flex justify-center items-center;
  flex: 2;
}
</style>
