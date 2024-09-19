// TODO: Role별 접근가능한 페이지 목록 정의
import { MENU_ID } from '../../../../entities';
import type { MenuId } from '../../../../entities';

export const PLATFORM_ADMIN_DEFAULT_PERMISSIONS: MenuId[] = [
  MENU_ID.ORGANIZATIONS,
  MENU_ID.USERS,
  // MENU_ID.VPC,
  // MENU_ID.MANAGE_WORKLOADS,
  // MENU_ID.MANAGE_WORKSPACE,
];

export const ADMIN_DEFAULT_PERMISSIONS: MenuId[] = [];

export const OPERATOR_DEFAULT_PERMISSIONS: MenuId[] = [];

export const VIEWER_DEFAULT_PERMISSIONS: MenuId[] = [];

export const BILL_ADMIN_DEFAULT_PERMISSIONS: MenuId[] = [];

export const BILL_VIEWER_DEFAULT_PERMISSIONS: MenuId[] = [];

export const MIGRATOR_ADMIN_DEFAULT_PERMISSIONS: MenuId[] = [
  MENU_ID.SOURCE_SERVICES,
  MENU_ID.SOURCE_MODELS,
  MENU_ID.TARGET_MODELS,
  MENU_ID.WORKFLOWS,
  MENU_ID.WORKFLOW_TEMPLATES,
  MENU_ID.TASK_COMPONENTS,
];

export const NO_ROLE_DEFAULT_PERMISSIONS: MenuId[] = [];
