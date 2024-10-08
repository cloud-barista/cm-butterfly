<script setup lang="ts">
import { i18n } from '@/app/i18n';
import { PFieldGroup, PTextInput } from '@cloudforet-test/mirinae';
</script>

<template>
  <section>
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
  </section>
</template>

<style scoped lang="postcss"></style>
