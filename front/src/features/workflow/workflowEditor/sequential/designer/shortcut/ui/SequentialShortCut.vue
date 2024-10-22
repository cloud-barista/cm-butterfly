<script setup lang="ts">
import { watch } from 'vue';

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

function handleClick(e, item: item) {
  e.preventDefault();
  item.callback();
}
</script>

<template>
  <div
    class="sequential-shortcut sqd-context-menu sqd-theme-light"
    v-if="props.open"
    v-bind:style="{ left: `${xPos}px`, top: `${yPos}px` }"
    @click.right="
      e => {
        e.preventDefault();
      }
    "
  >
    <div
      v-for="(item, index) of props.items"
      class="sqd-context-menu-item"
      @click="e => handleClick(e, item)"
    >
      {{ item.label }}
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>
