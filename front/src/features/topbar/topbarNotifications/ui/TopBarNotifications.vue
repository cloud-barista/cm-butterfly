<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import { blue } from '@/app/style/colors';
import { PTooltip, PI } from '@cloudforet-test/mirinae';
import { computed, reactive } from 'vue';
import { TopBarNotificationContextMenu } from '@/widgets/layout';

interface Props {
  visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
});

const emit = defineEmits<{ (e: 'update:visible', value: boolean): void }>();

const setVisible = (visible: boolean) => {
  emit('update:visible', visible);
  // visible ? (props.visible = false) : (props.visible = true);
};

const state = reactive({
  hasNotification: computed(() => true),
  notificationCount: 0,
  iconColor: computed<string>(() => {
    return blue[600];
  }),
});

const showNotiMenu = () => {
  if (!props.visible) setVisible(true);
};

const hideNotiMenu = () => {
  if (props.visible) setVisible(false);
};

const handleNotiButtonClick = () => {
  setVisible(!props.visible);
};
</script>

<template>
  <div
    v-on-click-outside="hideNotiMenu"
    class="top-bar-notifications"
    @click.stop
    @keydown.esc="hideNotiMenu"
  >
    <p-tooltip contents="Notifications" position="absolute">
      <span
        :class="{ 'menu-button': true, opened: visible }"
        tabindex="0"
        role="button"
        @click.stop="handleNotiButtonClick"
        @keydown.enter="showNotiMenu"
      >
        <span class="dot" />
        <p-i
          class="menu-icon"
          name="ic_gnb_notification"
          width="1.375rem"
          height="1.375rem"
        />
      </span>
    </p-tooltip>
    <div v-show="visible" class="notification-content">
      <top-bar-notification-context-menu :visible="props.visible" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.top-bar-notifications {
  position: relative;

  .menu-button {
    @apply inline-flex items-center justify-center text-gray-500 rounded-full;
    width: 2rem;
    height: 2rem;
    line-height: $top-bar-height;
    cursor: pointer;

    &:hover {
      @apply text-blue-600 bg-blue-100;
    }

    &.opened {
      @apply text-blue-600 bg-blue-200;
    }

    .menu-icon {
      &:hover {
        @apply text-blue-600;
      }
    }
    .dot {
      @apply absolute rounded-full bg-white;
      top: 6px;
      right: 7px;
      width: 8px;
      height: 8px;
      &::before {
        content: '';

        @apply absolute rounded-full bg-blue-500;
        top: 1px;
        right: 1px;
        width: 6px;
        height: 6px;
      }
    }

    .disabled {
      cursor: not-allowed;
    }
  }

  .notification-content {
    @apply absolute bg-white rounded-xs border border-gray-200;
    display: flex;
    flex-direction: column;
    width: 27.5rem;
    min-height: auto;
    top: 100%;
    right: 0;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
    margin-right: -0.5rem;
    z-index: 1000;
  }
}
</style>
