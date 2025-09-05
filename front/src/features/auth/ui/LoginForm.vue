<script setup lang="ts">
import { PButton, PTextInput, PFieldGroup, PI } from '@cloudforet-test/mirinae';
import {
  IUserLogin,
  IUserLoginResponse,
  useGetLogin,
  validateId,
  validatePassword,
} from '@/entities';
import { Ref, ref, watch } from 'vue';
import { i18n } from '@/app/i18n';
import { useInputModel } from '@/shared/hooks/input/useInputModel';
import { useSidebar } from '@/shared/libs/store/sidebar';
import { storeToRefs } from 'pinia';

const emit = defineEmits(['handleLoginSuccess']);

const validationMsg: Ref<string | null> = ref<string | null>('');

// const userId = useInputModel<string | null>('cmiguser', validateId, 0);
const userId = useInputModel<string | null>('', validateId, 0);
const userPW = useInputModel<string | null>(
  '',
  // 'cmiguserPassword!',
  validatePassword,
  0,
);

const resLogin = useGetLogin<IUserLoginResponse, IUserLogin | null>(null);
const sidebar = useSidebar();

const { isCollapsed, isGnbToolboxShown } = storeToRefs(sidebar);

const handleLogin = async () => {
  if (!userId.touched.value || !userPW.touched.value) {
    await Promise.all([
      userId.exeValidation(userId.value.value),
      userPW.exeValidation(userPW.value.value),
    ]);
  }
  validationMsg.value =
    userId.errorMessage.value ||
    userPW.errorMessage.value ||
    validationMsg.value ||
    null;

  if (userId.isValid.value && userPW.isValid.value) {
    isCollapsed.value = false;
    isGnbToolboxShown.value = true;
    resLogin.execute({
      request: {
        id: userId.value.value!,
        password: userPW.value.value!,
      },
    });
  }
};

const handleLoginSuccess = (props: IUserLoginResponse & { id: string }) => {
  emit('handleLoginSuccess', props);
};

//FIXME role 처리
watch(resLogin.data, () => {
  handleLoginSuccess({
    ...resLogin.data.value?.responseData,
    id: userId.value.value!,
    role: 'admin',
  });
});

watch([resLogin.error, resLogin.errorMsg], nv => {
  validationMsg.value = nv[1];
  userPW.value.value = '';
});
</script>

<template>
  <section class="login-form-wrapper">
    <header class="header">
      <p class="title">
        {{ i18n.t('AUTH.LOGIN._NAME') }}
      </p>
      <div v-if="validationMsg" class="error-msg-box">
        <span class="error-msg">{{ validationMsg }}</span>
        <p-i
          name="ic_close"
          width="1.5rem"
          height="1.5rem"
          class="cursor-pointer"
          color="inherit"
          @click="validationMsg = ''"
        />
      </div>
    </header>
    <section class="section">
      <p-field-group
        :label="i18n.t('AUTH.LOGIN.USER_ID')"
        :invalid="!userId.isValid.value"
        required
      >
        <template #default="{ invalid }">
          <p-text-input
            v-model="userId.value.value"
            :invalid="invalid"
            :placeholder="'id'"
            block
            @blur="userId.onBlur"
          />
        </template>
      </p-field-group>
      <p-field-group
        :label="i18n.t('AUTH.LOGIN.PASSWORD')"
        :invalid="!userPW.isValid.value"
        required
      >
        <template #default="{ invalid }">
          <p-text-input
            v-model="userPW.value.value"
            type="password"
            appearance-type="masking"
            :invalid="invalid"
            :placeholder="i18n.t('AUTH.LOGIN.PASSWORD')"
            block
            @blur="userPW.onBlur"
            @keydown.prevent.enter="handleLogin"
          />
        </template>
      </p-field-group>
    </section>
    <footer class="footer">
      <p-button
        style-type="primary"
        type="submit"
        size="md"
        class="login-in-btn"
        :loading="resLogin.isLoading.value"
        @click="handleLogin"
      >
        {{ i18n.t('AUTH.LOGIN._NAME') }}
      </p-button>
    </footer>
  </section>
</template>

<style scoped lang="postcss">
.login-form-wrapper {
  @apply rounded-lg border-gray-200 border;

  width: 28.5rem;
  position: relative;
  align-self: center;
  padding: 2rem;
  background-color: white;

  .header {
    position: relative;

    .title {
      @apply text-display-md text-gray-900 font-bold;
      margin-bottom: 1.5rem;
    }

    .error-msg-box {
      @apply absolute bg-red-100 text-red-500;
      display: flex;
      justify-content: space-between;
      right: 0;
      bottom: 0;
      left: 0;
      height: 2.25rem;
      padding: 0.5rem;

      .error-msg {
        font-size: 0.875rem;
        line-height: 140%;
      }
    }
  }

  .section {
    @apply flex flex-col;
    gap: 1.25rem;

    .p-field-group {
      margin-bottom: 0;
    }

    :deep(.invalid-feedback) {
      display: block !important;
      margin-top: 0.25rem;
    }
  }

  .footer {
    .login-in-btn {
      width: 100%;
      margin-top: 40px;
    }
  }
}
</style>
