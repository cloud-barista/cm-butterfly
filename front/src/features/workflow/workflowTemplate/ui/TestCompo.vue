<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { onMounted, onUnmounted } from 'vue';
interface IProps {
  id: string;
}
const props = defineProps<IProps>();
const emit = defineEmits(['button-click']);

onMounted(() => {
  console.log('Mount!');
});

onUnmounted(() => {
  console.log('unMount!');
});
</script>

<template>
  <div>
    test!
    <p-button @click="emit('button-click')">{{ props.id }}</p-button>
  </div>
</template>

<style scoped lang="postcss"></style>
