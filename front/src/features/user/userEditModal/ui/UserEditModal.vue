<script setup lang="ts">
import { i18n } from '@/app/i18n';
import {
  PButton,
  PButtonModal,
  PFieldGroup,
  PSelectDropdown,
  PTextInput,
} from '@cloudforet-test/mirinae';
import {
  useBulkAddWorkspaceList,
  useBulkDeleteWorkspaceList,
  useEditWorkspaceList,
  useGetWorkspaceList,
  useWorkspaceRoleList,
} from '@/entities/workspace/api';
import { onMounted, reactive, watch } from 'vue';
import { IWorkspaceData } from '@/entities/workspace/model/types.ts';
import { UserInformationTableType, UserWorkspaceTableType } from '@/entities';
import { showErrorMessage, showSuccessMessage } from '@/shared/utils';

interface IProps {
  id: string;
  fullName?: string;
  role?: string;
  workspaces?: Partial<
    Record<
      UserInformationTableType | UserWorkspaceTableType | 'originalData',
      any
    >
  >[];
  isOpen: boolean;
}

interface IMenu {
  name: string;
  label: string;
  type: string;
}

const props = defineProps<IProps>();
const emit = defineEmits(['close']);

const workspaceList = reactive({
  menu: [],
  selected: [],
  resWorkspaceList: useGetWorkspaceList(),
  resEditWorkspaceList: useEditWorkspaceList(null),
});

const roleList = reactive({
  menu: [],
  selected: [],
});

const organizeWorkspaceListToDropDownMenu = (
  workspace: IWorkspaceData,
): IMenu => {
  return {
    name: workspace.id,
    label: workspace.name,
    type: 'item',
  };
};

watch(props, nv => {
  workspaceList.resWorkspaceList.execute().then(res => {
    if (res.data.responseData && res.data.responseData.length > 0) {
      workspaceList.menu = res.data.responseData.map(workspace =>
        organizeWorkspaceListToDropDownMenu(workspace),
      );

      workspaceList.selected = workspaceList.menu.filter(workspace =>
        props.workspaces!.some(
          diffWorkspace =>
            workspace.name ===
            diffWorkspace.originalData.workspaceProject.workspace.id,
        ),
      );
    }
  });
});

const handleConfirm = async () => {
  const workspacesToDelete = props.workspaces!.filter(
    workspace =>
      !workspaceList.selected.some(
        diffWorkspace =>
          workspace.originalData.workspaceProject.workspace.id ===
          diffWorkspace.name,
      ),
  );

  const workspacesToAdd = workspaceList.selected.filter(
    workspace =>
      !props.workspaces!.some(
        diffWorkspace =>
          workspace.name ===
          diffWorkspace.originalData.workspaceProject.workspace.id,
      ),
  );

  try {
    if (roleList.selected.length === 0) {
      throw {
        message: 'Role not selected',
        keepModal: true,
      };
    }

    await useBulkAddWorkspaceList(
      workspacesToAdd,
      props.id,
      roleList.selected[0].name,
    );

    await useBulkDeleteWorkspaceList(workspacesToDelete, props.id);

    showSuccessMessage('Success', 'Edit Success');
    emit('close', true);
  } catch (e) {
    if (e.keepModal) {
      showErrorMessage('Error', e.message);
    } else {
      showErrorMessage('Error', 'server error');
      emit('close', false);
    }
  }
};

const handleClose = () => {
  emit('close', false);
};

onMounted(() => {
  const resWorkspaceRoleList = useWorkspaceRoleList();

  try {
    resWorkspaceRoleList.execute().then(res => {
      res.data.responseData?.roles?.map(role => {
        return { name: role.id, label: role.name };
      });
    });
  } catch (e) {
    showErrorMessage('Error', 'Failed to return role Information');
  }
});
</script>

<template>
  <p-button-modal
    :visible="props.isOpen"
    :size="'md'"
    :header-title="'Edit User'"
    @close="handleClose"
    @cancel="handleClose"
    @confirm="handleConfirm"
  >
    <template #body>
      <div class="user-edit-box">
        <div class="user-edit-body">
          <section class="user-info-section">
            <p-field-group
              :label="i18n.t('AUTH.LOGIN.USER_ID')"
              disabled
              required
            >
              <template #default>
                <p-text-input v-model="props.id" block disabled />
              </template>
            </p-field-group>
            <p-field-group :label="'Name'" disabled required>
              <template #default>
                <p-text-input v-model="props.fullName" block disabled />
              </template>
            </p-field-group>
          </section>
          <section class="user-info-section">
            <p>Workspace Mapping</p>
            <hr />
            <br />
            <p-field-group
              :label="'This users will have access to'"
              required
              block
            >
              <template #default>
                <p-select-dropdown
                  show-select-marker
                  :menu="workspaceList.menu"
                  :placeholder="'Select one workspace of more'"
                  :style="{ display: 'block' }"
                  use-fixed-menu-style
                  multi-selectable
                  :selected.sync="workspaceList.selected"
                  :page-size="5"
                  :appearance-type="'badge'"
                  :show-clear-selection="true"
                  :loading="workspaceList.resWorkspaceList.isLoading"
                  show-delete-all-button
                />
              </template>
            </p-field-group>
            <p-field-group :label="'With a role'" required>
              <template #default>
                <p-select-dropdown
                  :menu="roleList.menu"
                  :selected.sync="roleList.selected"
                  :placeholder="'Select a role'"
                  :page-size="5"
                  use-fixed-menu-style
                  is-filterable
                />
              </template>
            </p-field-group>
          </section>
        </div>
      </div>
    </template>
  </p-button-modal>
</template>

<style scoped lang="postcss">
.user-edit-box {
  .user-edit-body {
    @apply bg-gray-100 p-4;

    .user-info-section {
      @apply bg-white p-3;

      & > p {
        @apply mb-2;
      }
    }
  }
}
</style>
