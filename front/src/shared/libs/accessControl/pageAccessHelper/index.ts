// TODO: per Role, page access control Helper Function define
import {
  ADMIN_DEFAULT_PERMISSIONS,
  BILL_ADMIN_DEFAULT_PERMISSIONS,
  BILL_VIEWER_DEFAULT_PERMISSIONS,
  MIGRATOR_ADMIN_DEFAULT_PERMISSIONS,
  NO_ROLE_DEFAULT_PERMISSIONS,
  OPERATOR_DEFAULT_PERMISSIONS,
  PLATFORM_ADMIN_DEFAULT_PERMISSIONS,
  VIEWER_DEFAULT_PERMISSIONS,
} from './config';
import { RoleType } from './types';
import { MenuId } from '../../../../entities';
/**
 * @description
 * Role Type
 * 1) Platform Admin - platform setting
 * 2) Admin - workspace ~ workload Management & User Role Mapping
 * 3) Operator - Workload Management
 * 4) viewer - Read Only
 * 5) Bill Admin - Bill Management
 * 6) Bill Viewer - Bill Read Only
 * 7) Migrator Admin - Migration Management
 */

export const getMinimalPageAccessPermissionList = (
  roleType?: RoleType,
): MenuId[] => {
  if (roleType === 'PLATFORM_ADMIN') return PLATFORM_ADMIN_DEFAULT_PERMISSIONS;
  if (roleType === 'ADMIN') return ADMIN_DEFAULT_PERMISSIONS;
  if (roleType === 'OPERATOR') return OPERATOR_DEFAULT_PERMISSIONS;
  if (roleType === 'VIEWER') return VIEWER_DEFAULT_PERMISSIONS;
  if (roleType === 'BILL_ADMIN') return BILL_ADMIN_DEFAULT_PERMISSIONS;
  if (roleType === 'BILL_VIEWER') return BILL_VIEWER_DEFAULT_PERMISSIONS;
  if (roleType === 'MIGRATOR_ADMIN') return MIGRATOR_ADMIN_DEFAULT_PERMISSIONS;
  return NO_ROLE_DEFAULT_PERMISSIONS;
};
