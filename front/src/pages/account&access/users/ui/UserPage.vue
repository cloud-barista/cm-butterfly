<script setup lang="ts">
import UserListTable from '@/widgets/user/userlist/ui/UserListTable.vue';
import UserInformation from '@/widgets/user/userinfomation/ui/UserInformation.vue';
import { UserInformationTableType, UserWorkspaceTableType } from '@/entities';
import { onMounted, Ref, ref } from 'vue';
import { useGnbStore } from '@/shared/libs/store/gnb-store';
import { useRoute, useRouter } from 'vue-router/composables';

const router = useRouter();
const route = useRoute();
const gnbStore = useGnbStore();

// onMounted(() => {
//   router.currentRoute.matched.forEach(matchedRoute => {
//     matchedRoute.meta?.menuId === router.currentRoute.meta?.menuId
//       ? gnbStore.setBreadcrumbs([
//           {
//             name: route.name as string,
//             to: {
//               name: router.currentRoute.name as string,
//             },
//           },
//         ])
//       : null;
//   });
// });

const pageName = 'Users';
const selectedRow: Ref<
  Partial<Record<UserInformationTableType | UserWorkspaceTableType, any>>
> = ref({});

const handleSelectRow = (
  selectedData: Record<UserInformationTableType | UserWorkspaceTableType, any>,
) => {
  selectedRow.value = selectedData || {};
};
</script>

<template>
  <div :class="`${pageName}-page page`">
    <header :class="`${pageName}-page-header`">
      <p>{{ pageName }}</p>
    </header>
    <section :class="`${pageName}-page-body`">
      <UserListTable @selectRow="handleSelectRow" />
      <p
        v-if="!Object.keys(selectedRow).length"
        class="flex justify-center text-gray-300 text-sm font-normal"
      >
        Select an item for more details.
      </p>
      <UserInformation :table-items="selectedRow" />
    </section>
  </div>
</template>

<style scoped lang="postcss"></style>
