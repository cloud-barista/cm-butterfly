<script setup lang="ts">
import {
  PTab,
  PDefinitionTable,
  PBadge,
  PButton,
  PStatus,
  PDataTable,
  PButtonModal,
} from '@cloudforet-test/mirinae';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { UserInformationTableType, UserWorkspaceTableType } from '@/entities';
import { IDefineTableField } from '@/shared/hooks/table/toolboxTable/types';
import { useToolboxTableModel } from '@/shared/hooks/table/toolboxTable/useToolboxTableModel';
import MIcon from '@/shared/ui/CommonIcon/ui/MIcon.vue';
import {
  formatDate,
  showErrorMessage,
  showSuccessMessage,
} from '@/shared/utils';
import {
  useDeleteWorkspaceById,
  useGetWorkspaceListById,
} from '@/entities/workspace/api';
import UserEditModal from '@/features/user/userEditModal/ui/UserEditModal.vue';
import { IWorkspaceDetailData } from '@/entities/workspace/model/types';

interface IProps {
  tableItems: Partial<
    Record<UserInformationTableType | UserWorkspaceTableType, any>
  >;
}

const props = defineProps<IProps>();

const resWorkspaceList = useGetWorkspaceListById(null);
const resDelete = useDeleteWorkspaceById(null);
const tabState = reactive({
  activeTab: 'detail',
});

const workspaceModalState = reactive({
  loading: computed<boolean>(() => resDelete.isLoading.value),
  open: false,
  props: {
    userid: computed(() => props.tableItems.username),
    workspaceId: '',
  },
});

const editModalState = reactive({
  open: false,
  props: {
    userid: computed(() => props.tableItems.userId),
    workspaceId: '',
  },
});

const defineTableField: Array<IDefineTableField<UserInformationTableType>> = [
  { label: 'Id', name: 'userId' },
  { label: 'Name', name: 'name' },
  { label: 'Description', name: 'description' },
  { label: 'Company', name: 'company' },
  { label: 'Department', name: 'department' },
  { label: 'Group', name: 'group', disableCopy: true },
  { label: 'Approved', name: 'approved', disableCopy: true },
  { label: 'Call Invite', name: 'callInvite', disableCopy: true },
  { label: 'Receive Invite', name: 'receiveInvite', disableCopy: true },
  { label: 'Default Roles', name: 'defaultRoles', disableCopy: true },
];

const workspaceTableField: any = [
  { name: 'workspace', label: 'Workspace' },
  { name: 'invited', label: 'Invite' },
  { name: 'role', label: 'Role' },
  { name: 'removeAction', label: '' },
];
const tabs = [
  {
    name: 'detail',
    label: 'Detail',
  },
  {
    name: 'workspace',
    label: 'Workspace',
  },
];

const workspaceTableModel =
  useToolboxTableModel<
    Partial<
      Record<
        UserInformationTableType | UserWorkspaceTableType | 'originalData',
        any
      >
    >
  >();

let selectedWorkspace = ref<
  Partial<
    Record<
      UserInformationTableType | UserWorkspaceTableType | 'originalData',
      any
    >
  >
>({});

const isSelected = computed(() => {
  if (!props.tableItems) return false;
  return Object.values(props.tableItems).length;
});

watch(props, nv => {
  if (props.tableItems) {
    getWorkspaceList();
  }
});

const getWorkspaceList = () => {
  resWorkspaceList
    .execute({
      pathParams: {
        userId: props.tableItems.username,
      },
    })
    .then(res => {
      if (res.data.responseData && res.data.responseData.length) {
        workspaceTableModel.tableState.items = res.data.responseData!.map(
          (workspace: IWorkspaceDetailData) => organizeWorkspaceList(workspace),
        );
        workspaceTableModel.tableState.sortedItems =
          workspaceTableModel.tableState.items;
      } else {
        workspaceTableModel.initState();
      }
      workspaceTableModel.handleChange(null);
    })
    .catch(error => {
      showErrorMessage('Error', error.errorMsg);
    });
};

const organizeWorkspaceList = (workspace: IWorkspaceDetailData) => {
  const workspaceitem: Record<UserWorkspaceTableType | 'originalData', any> = {
    workspace: workspace.workspaceProject.workspace.name,
    role: workspace.role.name,
    invited: formatDate(workspace.workspaceProject.workspace.created_at),
    removeAction: true,
    originalData: workspace,
  };
  return workspaceitem;
};

const handleWorkspaceDeleteClick = (
  data: Record<UserWorkspaceTableType | 'originalData', any>,
) => {
  workspaceModalState.open = true;
  workspaceModalState.props.workspaceId =
    data.originalData.workspaceProject.workspace.id;
};

const handleWorkspaceDeleteConfirm = () => {
  resDelete
    .execute({
      pathParams: {
        userId: workspaceModalState.props.userid,
        workspaceId: workspaceModalState.props.workspaceId,
      },
    })
    .then(res => {
      showSuccessMessage(
        'Success',
        res.data.responseData?.message || 'Delete Success',
      );
      workspaceModalState.open = false;
      getWorkspaceList();
    })
    .catch(err => {
      showErrorMessage('Error', err.errorMsg);
    });
};

const handleClose = e => {
  editModalState.open = false;
  if (e) {
    getWorkspaceList();
  }
};

onMounted(() => {
  workspaceTableModel.tableState.fields = workspaceTableField;
});
</script>

<template>
  <div v-if="isSelected">
    <p-tab :tabs="tabs" v-model="tabState.activeTab">
      <template #workspace>
        <div class="tab-section-header">
          <p>Allocated Workspaces</p>
          <p-button
            :style-type="'tertiary'"
            icon-left="ic_edit"
            @click="editModalState.open = true"
            >Edit
          </p-button>
        </div>
        <p-data-table
          :fields="workspaceTableModel.tableState.fields"
          :items="workspaceTableModel.tableState.displayItems"
          :loading="resWorkspaceList.isLoading.value"
          @rowLeftClick="e => (selectedWorkspace = e)"
        >
          <template #col-workspace-format="{ item }">
            <div class="flex gap-2 w-full h-full items-center">
              <MIcon :text="'W'" :theme="'blue'" size="xs"></MIcon>
              {{ item.workspace }}
            </div>
          </template>

          <template #col-removeAction-format="{ item }">
            <p-button
              :style-type="'tertiary'"
              :size="'sm'"
              @click="() => handleWorkspaceDeleteClick(item)"
              >Remove
            </p-button>
          </template>
        </p-data-table>
      </template>
      <template #detail>
        <div class="tab-section-header">
          <p>User Information</p>
          <p-button
            :style-type="'tertiary'"
            icon-left="ic_edit"
            @click="editModalState.open = true"
            >Edit
          </p-button>
        </div>
        <p-definition-table
          :fields="defineTableField"
          :data="props.tableItems"
          :loading="false"
          style-type="primary"
          :block="false"
        >
          <template #data-group="scope">
            <p-badge
              v-for="(datum, i) in scope.data"
              :key="i"
              :badge-type="'subtle'"
              :style-type="'gray200'"
              :shape="'square'"
              :style="{ marginRight: '5px' }"
            >
              {{ datum }}
            </p-badge>
          </template>
          <template #data-approved="scope">
            <p-status
              :icon-color="`${scope.data ? '#60b731' : '#C2C2C6'}`"
              :text="`${scope.data ? 'Approved' : 'Not approved'}`"
            />
          </template>
          <template #data-defaultRoles="scope">
            <p-badge
              v-for="(datum, i) in scope.data"
              :key="i"
              :badge-type="'subtle'"
              :style-type="'gray200'"
              :shape="'square'"
              :style="{ marginRight: '5px' }"
            >
              {{ datum }}
            </p-badge>
          </template>
        </p-definition-table>
      </template>
    </p-tab>
    <p-button-modal
      :visible="workspaceModalState.open"
      :theme-color="'alert'"
      :size="'sm'"
      :loading="workspaceModalState.loading"
      :header-title="'Are you sure you want to remove the user from this workspace?'"
      @confirm="handleWorkspaceDeleteConfirm"
      @cancel="workspaceModalState.open = false"
      @close="workspaceModalState.open = false"
    ></p-button-modal>
    <UserEditModal
      :id="props.tableItems.username"
      :full-name="props.tableItems.name"
      :workspaces="workspaceTableModel.tableState.items"
      :is-open="editModalState.open"
      @close="handleClose"
    ></UserEditModal>
  </div>
</template>

<style scoped lang="postcss">
.tab-section-header {
  padding: 2rem 1rem 1.5rem 1rem;
  margin-top: 0.625rem;
  display: flex;
  justify-content: space-between;

  p {
    font-size: 1.5rem;
    font-weight: 400;
  }
}
</style>
