<script setup lang="ts">
import { PIconButton, PButton } from '@cloudforet-test/mirinae';
import { CreateForm } from '@/widgets/layout';
import { i18n } from '@/app/i18n';
import { SourceConnectionInfo } from '@/features/sourceServices';
import { ref } from 'vue';

const isAdded = ref<boolean[]>([]);

const addSourceConnection = (value: boolean) => {
  isAdded.value.push(value);
};
</script>

<template>
  <create-form
    title="Source Connection"
    subtitle="Add or register a source connection."
    add-button-text="Add Source Connection"
    @addSourceConnection="addSourceConnection"
  >
    <template #add-info>
      <div v-for="(value, i) in isAdded" :key="i">
        <!-- TODO: handleAddSourceConnection 작동시 아래 컴포넌트 한개씩 추가. -->
        <source-connection-info v-if="value" />
      </div>
    </template>
    <template #buttons>
      <p-button style-type="tertiary">
        {{ i18n.t('COMPONENT.BUTTON_MODAL.CANCEL') }}
      </p-button>
      <p-button>{{ i18n.t('COMPONENT.BUTTON_MODAL.APPLY') }}</p-button>
    </template>
  </create-form>
</template>

<style scoped lang="postcss"></style>
