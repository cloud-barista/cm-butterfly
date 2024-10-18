<script setup lang="ts">
import { useWorkflowToolModel } from '../model/workflowToolModel.ts';
import {
  ITaskResponse,
  ITaskVmResponse,
  IWorkflow,
} from '@/entities/workflow/model/types.ts';

const workflowToolModel = useWorkflowToolModel();

let t: IWorkflow = {
  createdDatetime: '',
  data: {
    description: '',
    task_groups: [
      {
        description: 'string',
        name: '',
        tasks: [
          {
            dependencies: ['any[]'],
            name: 'string',
            path_params: 'any',
            request_body: {
              name: 'string',
              installMonAgent: 'string',
              label: 'string',
              systemLabel: 'string',
              description: 'string',
              vm: [],
            },
            task_component: 'string',
          },
        ],
        task_groups: [
          {
            description: 'string',
            name: '',
            tasks: [
              {
                dependencies: ['any[]'],
                name: 'string',
                path_params: 'any',
                request_body: {
                  name: 'string',
                  installMonAgent: 'string',
                  label: 'string',
                  systemLabel: 'string',
                  description: 'string',
                  vm: [],
                },
                task_component: 'string',
              },
            ],
            task_groups: [],
          },
        ],
      },
    ],
  },
  description: '',
  id: '',
  name: '',
  updateDatetime: '',
};

let tt = workflowToolModel.setWorkflowSequenceModel(t);
console.log(tt);
</script>

<template></template>

<style scoped lang="postcss"></style>
