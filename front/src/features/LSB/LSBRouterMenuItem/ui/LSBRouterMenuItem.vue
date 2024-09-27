<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import type { Ref } from 'vue';
import { useElementSize } from '@vueuse/core';
import { McmpRouter } from '@/app/providers/router';

interface Props {
  submenu: string;
  currentPath?: string;
  item: any;
}

const props = withDefaults(defineProps<Props>(), {
  submenu: '',
  currentPath: '',
  item: () => {},
});

const itemEl = ref<HTMLElement | null>(null);
const textEl = ref<HTMLElement | null>(null);

const state = reactive({
  itemWidth: computed<Ref<number>>(() => useElementSize(itemEl.value).width),
  textWidth: computed<Ref<number>>(() => useElementSize(textEl.value).width),
  hoveredItem: '' as string,
});

// TODO: Route 완료 후 수정 필요
const isSelectedMenu = (selectedMenuRoute: string): boolean => {
  let currentPath = props.currentPath;
  const resolvedHref = McmpRouter.router?.resolve({
    name: selectedMenuRoute,
  });
  if (!currentPath || !selectedMenuRoute) return false;

  return currentPath === resolvedHref?.href;
};
</script>

<template>
  <!-- @click.native="$event.stopImmediatePropagation()" -->
  <router-link
    ref="itemEl"
    class="l-s-b-router-menu-item"
    :class="{ selected: isSelectedMenu(item.name) }"
    :to="{ name: item.name }"
    @mouseenter.native="state.hoveredItem = item.name"
    @mouseleave.native="state.hoveredItem = ''"
  >
    <!-- @click.native="setSelectedSubmenus(submenu)" -->
    <slot name="before-text" v-bind="{ ...props, item, index: item?.id }" />
    <div ref="textEl" class="text-wrapper">
      <slot>
        <div class="text">
          <!-- <p-tooltip position="bottom-start" :contents="item.displayname">
            {{ item.displayname }}
          </p-tooltip> -->
          <span>{{ item.displayname.split(' ')[0] }}</span>
        </div>
      </slot>
      <slot name="after-text" v-bind="{ ...props, item, index: item?.id }" />
    </div>
  </router-link>
</template>

<style scoped lang="postcss">
.l-s-b-router-menu-item {
  @apply border border-transparent inline-flex items-center w-full h-full justify-between text-gray-800;
  font-size: 0.875rem;
  line-height: 125%;
  border-radius: 4px;
  box-sizing: border-box;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  outline: 0;
  height: 2rem;

  &:focus,
  &:focus-within,
  &:active {
    @apply bg-white border-secondary1;
    box-shadow: 0 0 0 2px rgba(theme('colors.secondary1'), 0.2);
  }
  &.selected {
    @apply bg-blue-200;
  }
  &.is-hide-favorite {
    .favorite-button {
      @apply hidden;
    }
    &:hover {
      .favorite-button {
        @apply block;
      }
    }
  }
  &:hover {
    @apply bg-blue-100 cursor-pointer;
  }
  .text-wrapper {
    @apply inline-flex items-center overflow-hidden whitespace-nowrap;
    .text {
      @apply overflow-hidden whitespace-nowrap;
      text-overflow: ellipsis;
    }
    .icon {
      flex-shrink: 0;
      margin-right: 0.25rem;
    }
    .mark-wrapper {
      height: 100%;
      margin-top: -0.25rem;
    }
  }
  .favorite-button {
    flex-shrink: 0;
    margin-left: 0.25rem;
  }
}
</style>
