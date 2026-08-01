<script setup lang="ts">
import { PIconButton } from '@cloudforet-test/mirinae';
interface IProps {
  name: string;
  // The button is mounted into the table's toolbar at runtime, so a testid cannot be written
  // into any template. It is passed here instead and lands on the wrapper.
  testid?: string;
}

const props = defineProps<IProps>();
</script>

<template>
  <div class="tool" :data-testid="props.testid">
    <p-icon-button :name="props.name" @click="$emit('click')"> </p-icon-button>
  </div>
</template>

<style scoped lang="postcss"></style>
