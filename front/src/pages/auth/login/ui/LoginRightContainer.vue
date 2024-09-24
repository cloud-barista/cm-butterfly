<script setup lang="ts">
import LoginForm from '@/features/auth/ui/LoginForm.vue';
import { IUserLoginResponse, useGetUserRole } from '@/entities';
import { McmpRouter } from '@/app/providers/router';
// import { DASHBOARD_ROUTE } from '@/pages/dashboard/dashboard.route.ts';
import { useAuth } from '@/features/auth/model/useAuth.ts';

const resUserInfo = useGetUserRole();
const auth = useAuth();

const handleLoginSuccess = (props: IUserLoginResponse & { id: string }) => {
  auth.setUser(props);
  // McmpRouter.getRouter().push({ name: DASHBOARD_ROUTE.AWS._NAME });

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
