<script setup lang="ts">
import { PButton } from '@cloudforet-test/mirinae';
import { onMounted, onUnmounted, ref, toRef, watch } from 'vue';

interface IProps {
  id: ref<string>;
}
const props = defineProps<IProps>();
const emit = defineEmits(['button-click']);

watch(props, nv => {
  console.log('update!');
  console.log(nv);
  // props.id.value = nv;
});

onMounted(() => {
  console.log(props);
  console.log('Mount!');
});

onUnmounted(() => {
  console.log('unMount!');
});
</script>

<template>
  <div>
    test!
    <p-button @click="emit('button-click')">{{ id }}</p-button>
  </div>
</template>

<style scoped lang="postcss"></style>
