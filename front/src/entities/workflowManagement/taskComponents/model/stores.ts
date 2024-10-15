import { defineStore } from 'pinia';
import { ITaskComponent } from './types';
import { formatDate } from '@/shared/utils';

export const useTaskComponentsStore = defineStore('TASK_COMPONENTS', {
  state: () => ({
    taskComponents: [
      {
        name: 'task-component-01',
        id: '30001',
        description: 'task component 1 description',
        data: {},
        createdDatetime: formatDate(new Date('2023-12-03')),
        updatedDatetime: formatDate(new Date('2024-01-03')),
      },
      {
        name: 'task-component-02',
        id: '30002',
        description: 'task component 2 description',
        data: {},
        createdDatetime: formatDate(new Date('2023-12-03')),
        updatedDatetime: formatDate(new Date('2024-01-03')),
      },
      {
        name: 'task-component-03',
        id: '30003',
        description: 'task component 3 description',
        data: {},
        createdDatetime: formatDate(new Date('2023-12-03')),
        updatedDatetime: formatDate(new Date('2024-01-03')),
      },
    ] as ITaskComponent[],
  }),
  getters: {
    getTaskComponentById: state => (id: string) => {
      return state.taskComponents.find(
        taskComponent => taskComponent.id === id,
      );
    },
  },
  actions: {
    setTaskComponents(taskComponents: ITaskComponent[]) {
      this.taskComponents = taskComponents;
    },
  },
});
