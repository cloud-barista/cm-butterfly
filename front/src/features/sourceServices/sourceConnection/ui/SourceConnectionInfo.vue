<script setup lang="ts">
import {
  PFieldGroup,
  PTextInput,
  PTextarea,
  PPaneLayout,
  PI,
} from '@cloudforet-test/mirinae';
</script>

<template>
  <div class="source-connection-layout">
    <p-pane-layout class="source-connection-info">
      <div class="left-layer">
        <p-field-group label="Source Connection Name" required>
          <p-text-input placeholder="Source Connection Name" />
        </p-field-group>
        <p-field-group label="Description">
          <p-textarea />
        </p-field-group>
      </div>
      <div class="right-layer">
        <p-field-group label="IP Address">
          <p-text-input placeholder="###.###.###.###" />
        </p-field-group>
        <p-field-group label="Port (for SSH)">
          <p-text-input placeholder="1~256" />
        </p-field-group>
        <p-field-group label="User">
          <p-text-input placeholder="User ID" />
        </p-field-group>
        <p-field-group label="Password">
          <p-text-input placeholder="Password" />
        </p-field-group>
        <p-field-group class="private-key" label="Private Key">
          <p-text-input />
        </p-field-group>
      </div>
    </p-pane-layout>
    <!-- <p-icon-button name="ic_close" /> -->
    <button>
      <p-i name="ic_close" />
    </button>
  </div>
</template>

<style scoped lang="postcss">
.source-connection-layout {
  @apply flex mb-[1rem];
}
.source-connection-info {
  @apply flex p-[1.5rem] border-[0.0625rem] border-[#DDDDDF];
  min-height: 15.125rem;
  border-radius: 0.25rem 0 0 0.25rem;
  .left-layer {
    @apply w-[450px] mr-[1.5rem];
    .p-text-input {
      @apply w-[450px];
    }
  }
  .right-layer {
    @apply grid grid-cols-2 gap-x-[1.5rem] ml-[1.5rem];
    .p-text-input {
      @apply w-[30rem];
    }
    .private-key {
      @apply col-span-2;
      .p-text-input {
        @apply w-full;
      }
    }
  }
}

button {
  @apply bg-[#EDEDEF] w-[2.5rem];
}

:deep(.p-text-input) {
  @apply w-[19.25rem];
}
</style>
