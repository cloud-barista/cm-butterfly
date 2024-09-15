<script setup lang="ts">
import { LSB } from '@/widgets/layout';
import { PTextInput } from '@cloudforet-test/mirinae';
import { i18n } from '@/app/i18n';
import { computed, onMounted, reactive, watch } from 'vue';
import { ORGANIZATIONS_ROUTE } from '@/app/providers/router/routes/organizations';
import { useGnbStore } from '@/shared/libs/store/gnb-store';
import { useRoute, useRouter } from 'vue-router/composables';

const router = useRouter();
const route = useRoute();

const gnbStore = useGnbStore();

const state = reactive({
  mciNavigation: computed(() => {
    return [
      {
        name: i18n.t('MENU.SETTINGS.ACCOUNT_ACCESS.ORGANIZATIONS._NAME'),
        to: {
          name: ORGANIZATIONS_ROUTE.USERS._NAME,
          // path: 'cloudResources',
        },
      },
    ];
  }),
});

// onMounted(() => {
//   gnbStore.setBreadcrumbs(state.mciNavigation);
// });

interface Props {
  menus: any[];
}

const props = withDefaults(defineProps<Props>(), {
  menus: () => [],
});
</script>

<template>
  <l-s-b class="organizations-l-s-b" :menu-set="menus">
    <p-text-input
      class="organizations-search"
      placeholder="Search Organizations"
    />
    <template #collapsible-contents-project>
      <p-text-input
        class="organizations-search"
        placeholder="Search Organizations"
      />
    </template>
  </l-s-b>
</template>

<style scoped lang="postcss">
.organizations-l-s-b {
  .organizations-search {
    @apply w-full;
    margin-bottom: 0.5rem;
  }
  .search-result-text {
    @apply overflow-hidden whitespace-nowrap;
    text-overflow: ellipsis;
  }
  .search-empty {
    @apply text-paragraph-md;
    white-space: pre;
    margin-top: 0.75rem;
  }
}
</style>
