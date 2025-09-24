<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SampleEditor from './SampleEditor.vue';
import { Step } from '@/features/workflow/workflowEditor/model/types';

// 예시: grasshopper_task_software_migration 스키마
const exampleSchema = {
  type: 'object',
  properties: {
    targetSoftwareModel: {
      type: 'object',
      properties: {
        servers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              errors: {
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              migration_list: {
                type: 'object',
                properties: {
                  binaries: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        binary_path: { type: 'string' },
                        name: { type: 'string' },
                        version: { type: 'string' },
                        order: { type: 'integer' },
                        custom_configs: {
                          type: 'array',
                          items: { type: 'string' }
                        }
                      },
                      required: ['name', 'version']
                    }
                  },
                  containers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        container_id: { type: 'string' },
                        name: { type: 'string' },
                        container_image: {
                          type: 'object',
                          properties: {
                            image_architecture: {
                              type: 'string',
                              enum: ['common', 'x86_64', 'x86', 'armv5', 'armv6', 'armv7', 'arm64v8']
                            },
                            image_hash: { type: 'string' },
                            image_name: { type: 'string' },
                            image_version: { type: 'string' }
                          },
                          required: ['image_architecture', 'image_hash', 'image_name', 'image_version']
                        },
                        container_ports: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              container_port: { type: 'integer' },
                              host_port: { type: 'integer' },
                              protocol: { type: 'string' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              source_connection_info_id: { type: 'string' }
            }
          }
        }
      },
      required: ['servers']
    }
  },
  required: ['targetSoftwareModel']
};

// 예시: 기존 데이터
const exampleData = {
  targetSoftwareModel: {
    servers: [
      {
        errors: ['error1', 'error2'],
        migration_list: {
          binaries: [
            {
              binary_path: '/usr/bin/example',
              name: 'example-binary',
              version: '1.0.0',
              order: 1,
              custom_configs: ['config1', 'config2']
            }
          ],
          containers: [
            {
              container_id: 'container-123',
              name: 'example-container',
              container_image: {
                image_architecture: 'x86_64',
                image_hash: 'sha256:abc123',
                image_name: 'ubuntu',
                image_version: '20.04'
              },
              container_ports: [
                {
                  container_port: 8080,
                  host_port: 8080,
                  protocol: 'tcp'
                }
              ]
            }
          ]
        },
        source_connection_info_id: 'conn-123'
      }
    ]
  }
};

const step = ref<Step>({
  componentType: 'task',
  id: 'example-step',
  type: 'grasshopper_task_software_migration',
  name: 'grasshopper_task_software_migration',
  properties: {
    isDeletable: true,
    model: exampleSchema,
    fixedModel: {
      path_params: {},
      query_params: {
        nsId: 'default',
        mciId: 'mci-123'
      }
    }
  }
});

function handleSaveComponentName(name: string) {
  console.log('Component name saved:', name);
}

function handleSaveContext(context: any) {
  console.log('Context saved:', context);
}

function handleSaveFixedModel(fixedModel: any) {
  console.log('Fixed model saved:', fixedModel);
}

onMounted(() => {
  console.log('SampleEditor Example mounted');
});
</script>

<template>
  <div class="sample-editor-example">
    <h2>Sample Editor Example</h2>
    <p>This is an example of the SampleEditor component with grasshopper_task_software_migration schema.</p>
    
    <div class="editor-container">
      <SampleEditor
        :step="step"
        @save-component-name="handleSaveComponentName"
        @save-context="handleSaveContext"
        @save-fixed-model="handleSaveFixedModel"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.sample-editor-example {
  padding: 20px;
  height: 100vh;
  background-color: #f8f9fa;
}

.editor-container {
  height: calc(100vh - 120px);
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
</style>
