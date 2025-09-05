<script setup lang="ts">
interface item {
  label: string;
  callback: Function;
}

interface IProps {
  items: Array<item>;
  open: boolean;
  xPos: number;
  yPos: number;
}

const props = defineProps<IProps>();
const emit = defineEmits(['close']);
function handleClick(e, item: item) {
  e.preventDefault();
  item.callback();
  emit('close');
}
</script>

<template>
  <div
    v-if="props.open"
    class="sequential-shortcut sqd-context-menu sqd-theme-light"
    :style="{ left: `${xPos}px`, top: `${yPos}px` }"
    @click.right="
      e => {
        e.preventDefault();
      }
    "
  >
    <div
      v-for="(sItem, index) of props.items"
      :key="`sqd-context-menu-item-${index}`"
      class="sqd-context-menu-item"
      @click="e => handleClick(e, sItem)"
    >
      {{ sItem.label }}
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>
