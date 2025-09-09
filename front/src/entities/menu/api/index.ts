import { IAxiosResponse, useAxiosPost } from '@/shared/libs';
import { IMigratorMenu } from '@/entities/menu/model/types';

const GET_MENU_TREE = 'getmenutree';

export function useGetMenuTree() {
  return useAxiosPost<IAxiosResponse<IMigratorMenu[]>, null>(
    GET_MENU_TREE,
    null,
  );
}
