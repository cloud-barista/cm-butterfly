<script setup lang="ts">
import { PIconButton } from '@cloudforet-test/mirinae';
import { onMounted, onUnmounted } from 'vue';
interface IProps {
  name: string;
}

const props = defineProps<IProps>();
</script>

<template>
  <div class="tool">
    <p-icon-button :name="props.name" @click="$emit('click')"> </p-icon-button>
  </div>
</template>

<style scoped lang="postcss"></style>
