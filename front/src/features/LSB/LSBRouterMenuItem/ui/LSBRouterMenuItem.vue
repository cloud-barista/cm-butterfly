<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import type { Ref } from 'vue';
import { useElementSize } from '@vueuse/core';
import { McmpRouter } from '@/app/providers/router';

interface Props {
  submenu?: string;
  currentPath?: string;
  item: any;
  lsbTitle: string;
}

const props = withDefaults(defineProps<Props>(), {
  submenu: '',
  currentPath: '',
});

const itemEl = ref<HTMLElement | null>(null);
const textEl = ref<HTMLElement | null>(null);

const state = reactive({
  itemWidth: computed<Ref<number>>(() => useElementSize(itemEl.value).width),
  textWidth: computed<Ref<number>>(() => useElementSize(textEl.value).width),
  hoveredItem: '' as string,
});

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
  <div>
    <p class="px-[8px] pt-[25px] pb-[12px] font-[700]">{{ lsbTitle }}</p>
    <div v-for="(it, i) in item" :key="i">
      <router-link
        ref="itemEl"
        class="l-s-b-router-menu-item"
        :class="{ selected: isSelectedMenu(it.id) }"
        :to="{ name: it.id }"
        @mouseenter.native="state.hoveredItem = it.id"
        @mouseleave.native="state.hoveredItem = ''"
      >
        <slot name="before-text" v-bind="{ ...props, it, index: it?.id }" />
        <div ref="textEl" class="text-wrapper">
          <slot>
            <div class="text">
              <span class="p-[8px]">{{ it.name }}</span>
            </div>
          </slot>
          <slot name="after-text" v-bind="{ ...props, it, index: it?.id }" />
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.l-s-b-router-menu-item {
  @apply border border-transparent inline-flex items-center w-full h-full justify-between text-gray-800;
  font-size: 0.875rem;
  line-height: 125%;
  border-radius: 4px;
  box-sizing: border-box;
  /* padding-left: 0.5rem; */
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
