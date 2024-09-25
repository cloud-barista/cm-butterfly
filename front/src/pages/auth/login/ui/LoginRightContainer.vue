<script setup lang="ts">
import LoginForm from '@/features/auth/ui/LoginForm.vue';
import { IUserLoginResponse, useGetUserRole } from '@/entities';
import { McmpRouter } from '@/app/providers/router';
import { useAuth } from '@/features/auth/model/useAuth.ts';
import { WORKLOADS_ROUTE } from '@/app/providers/router/routes/workloads.ts';

const resUserInfo = useGetUserRole();
const auth = useAuth();

const handleLoginSuccess = (props: IUserLoginResponse & { id: string }) => {
  auth.setUser(props);
  McmpRouter.getRouter().push({ name: WORKLOADS_ROUTE.PMK._NAME });

  resUserInfo
    .execute()
    .then()
    .catch(err => err);
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
