<script setup lang="ts">
import {
  PButtonModal,
  PFieldGroup,
  PTextInput,
  PButton,
} from '@cloudforet-test/mirinae';
import { ref, reactive, onMounted } from 'vue';
import { showSuccessMessage, showErrorMessage } from '@/shared/utils';
import {
  useGetAllLoadTestScenarioCatalogs,
  useCreateLoadTestScenarioCatalog,
  useUpdateLoadTestScenarioCatalog,
  useDeleteLoadTestScenarioCatalog,
  ILoadTestScenarioCatalog,
  ICreateLoadTestScenarioCatalogRequest,
  IUpdateLoadTestScenarioCatalogRequest,
} from '@/entities/vm';

interface IProps {
  isOpen: boolean;
  nsId: string;
  mciId: string;
  vmId: string;
  ip: string;
}

// ScenarioTemplate 인터페이스는 ILoadTestScenarioCatalog로 대체
// ILoadTestScenarioCatalog가 이미 모든 필드를 포함하므로 별도 확장 불필요
type ScenarioTemplate = ILoadTestScenarioCatalog;

defineProps<IProps>();
const emit = defineEmits(['close']);

// 템플릿 저장을 위한 폼 데이터
const templateForm = reactive({
  name: '',
  description: '',
  virtualUsers: '',
  duration: '',
  rampUpTime: '',
  rampUpSteps: '',
});

// API 훅들
const { data: catalogsData, execute: fetchCatalogs } =
  useGetAllLoadTestScenarioCatalogs();

// 저장된 템플릿 목록
const savedTemplates = ref<ScenarioTemplate[]>([]);
const activeTab = ref<'save' | 'load'>('save');
const editingTemplate = ref<ScenarioTemplate | null>(null);
const loading = ref(false);

// 템플릿 저장
async function saveTemplate() {
  if (!templateForm.name.trim()) {
    showErrorMessage('failed', 'Please enter a template name.');
    return;
  }

  loading.value = true;

  try {
    if (editingTemplate.value) {
      // 수정 모드
      const updateData: IUpdateLoadTestScenarioCatalogRequest = {
        name: templateForm.name,
        description: templateForm.description,
        virtualUsers: templateForm.virtualUsers,
        duration: templateForm.duration,
        rampUpTime: templateForm.rampUpTime,
        rampUpSteps: templateForm.rampUpSteps,
      };

      const { execute: updateCatalogExecute } =
        useUpdateLoadTestScenarioCatalog(editingTemplate.value.id, updateData);
      await updateCatalogExecute();
      showSuccessMessage('success', 'Template updated successfully.');
      editingTemplate.value = null;
    } else {
      // 새로 생성
      const createData: ICreateLoadTestScenarioCatalogRequest = {
        name: templateForm.name,
        description: templateForm.description,
        virtualUsers: templateForm.virtualUsers,
        duration: templateForm.duration,
        rampUpTime: templateForm.rampUpTime,
        rampUpSteps: templateForm.rampUpSteps,
      };

      const { execute: createCatalogExecute } =
        useCreateLoadTestScenarioCatalog(createData);
      await createCatalogExecute();
      showSuccessMessage('success', 'Template saved successfully.');
    }

    // 목록 새로고침
    await loadTemplates();

    // 폼 초기화
    resetForm();
  } catch (error) {
    console.error('Failed to save template:', error);
    showErrorMessage('failed', 'Failed to save template. Please try again.');
  } finally {
    loading.value = false;
  }
}

// 템플릿 수정
function editTemplate(template: ScenarioTemplate) {
  editingTemplate.value = template;
  templateForm.name = template.name;
  templateForm.description = template.description;
  templateForm.virtualUsers = template.virtualUsers;
  templateForm.duration = template.duration;
  templateForm.rampUpTime = template.rampUpTime;
  templateForm.rampUpSteps = template.rampUpSteps;
  activeTab.value = 'save'; // 저장 탭으로 이동
}

// 템플릿 삭제
async function deleteTemplate(templateId: number) {
  loading.value = true;

  try {
    const { execute: deleteCatalogExecute } =
      useDeleteLoadTestScenarioCatalog(templateId);
    await deleteCatalogExecute();
    showSuccessMessage('success', 'Template deleted successfully.');
    // 목록 새로고침
    await loadTemplates();
  } catch (error) {
    console.error('Failed to delete template:', error);
    showErrorMessage('failed', 'Failed to delete template. Please try again.');
  } finally {
    loading.value = false;
  }
}

function cancelEdit() {
  editingTemplate.value = null;
  resetForm();
}

function handleClose() {
  editingTemplate.value = null;
  resetForm();
  // 탭 리셋
  activeTab.value = 'save';
  emit('close');
}

// 폼 리셋 함수
function resetForm() {
  templateForm.name = '';
  templateForm.description = '';
  templateForm.virtualUsers = '';
  templateForm.duration = '';
  templateForm.rampUpTime = '';
  templateForm.rampUpSteps = '';
}

// API에서 템플릿 로드
async function loadTemplates() {
  loading.value = true;

  try {
    await fetchCatalogs();

    if (catalogsData.value?.responseData?.result?.loadTestScenarioCatalogs) {
      savedTemplates.value =
        catalogsData.value.responseData.result.loadTestScenarioCatalogs;
    } else {
      savedTemplates.value = [];
    }
  } catch (error) {
    showErrorMessage('failed', 'Failed to load templates. Please try again.');
  } finally {
    loading.value = false;
  }
}

// 컴포넌트 마운트 시 템플릿 로드
onMounted(() => {
  loadTemplates();
});
</script>

<template>
  <p-button-modal
    :visible="isOpen"
    :v-model="isOpen"
    :loading="loading"
    header-title="Scenario Template Management"
    hide-footer
    @close="handleClose"
    @cancel="handleClose"
  >
    <template #body>
      <div class="template-manager">
        <!-- 탭 헤더 -->
        <div class="tab-header">
          <button
            :class="['tab-button', { active: activeTab === 'save' }]"
            @click="activeTab = 'save'"
          >
            Save Template
          </button>
          <button
            :class="['tab-button', { active: activeTab === 'load' }]"
            @click="activeTab = 'load'"
          >
            Manage Templates
          </button>
        </div>

        <!-- 템플릿 저장 탭 -->
        <div v-if="activeTab === 'save'" class="tab-content">
          <div class="save-section">
            <h3>
              {{ editingTemplate ? 'Edit Template' : 'Save New Template' }}
            </h3>
            <p class="description">
              Save current load configuration as a template for future reuse.
            </p>

            <div class="template-form">
              <p-field-group label="Template Name" required>
                <template #default="{ invalid }">
                  <p-text-input
                    v-model="templateForm.name"
                    :invalid="invalid"
                    placeholder="Enter template name"
                    block
                  />
                </template>
              </p-field-group>

              <p-field-group label="Description">
                <template #default="{ invalid }">
                  <p-text-input
                    v-model="templateForm.description"
                    :invalid="invalid"
                    placeholder="Enter template description"
                    block
                  />
                </template>
              </p-field-group>

              <section class="section">
                <p-field-group label="Virtual Users" required>
                  <template #default="{ invalid }">
                    <p-text-input
                      v-model="templateForm.virtualUsers"
                      :invalid="invalid"
                      type="number"
                      placeholder="Number of virtual users"
                      block
                    />
                  </template>
                </p-field-group>
                <p-field-group label="Test Duration" required>
                  <template #default="{ invalid }">
                    <p-text-input
                      v-model="templateForm.duration"
                      :invalid="invalid"
                      type="number"
                      placeholder="Test Run Time"
                      block
                    >
                      <template #input-right>sec</template>
                    </p-text-input>
                  </template>
                </p-field-group>
                <div class="flex gap-1">
                  <p-field-group
                    class="flex-1 !m-0"
                    label="RampUp Time"
                    required
                  >
                    <template #default="{ invalid }">
                      <p-text-input
                        v-model="templateForm.rampUpTime"
                        :invalid="invalid"
                        placeholder="Time"
                        type="number"
                        block
                      />
                    </template>
                  </p-field-group>
                  <p-field-group
                    class="flex-1 !m-0"
                    label="RampUp Steps"
                    required
                  >
                    <template #default="{ invalid }">
                      <p-text-input
                        v-model="templateForm.rampUpSteps"
                        :invalid="invalid"
                        placeholder="Number of steps"
                        type="number"
                        block
                      />
                    </template>
                  </p-field-group>
                </div>
              </section>

              <div class="save-actions">
                <p-button
                  style-type="primary"
                  :loading="loading"
                  @click="saveTemplate"
                >
                  {{ editingTemplate ? 'Update Template' : 'Save Template' }}
                </p-button>
                <p-button
                  v-if="editingTemplate"
                  style-type="secondary"
                  @click="cancelEdit"
                >
                  Cancel
                </p-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 템플릿 불러오기 탭 -->
        <div v-if="activeTab === 'load'" class="tab-content">
          <div class="load-section">
            <h3>Saved Templates</h3>

            <div class="templates-table">
              <div v-if="loading" class="loading-state">
                <p>Loading templates...</p>
              </div>
              <div v-else-if="savedTemplates.length === 0" class="empty-state">
                <p>No templates saved yet.</p>
              </div>
              <div v-else class="template-list">
                <div
                  v-for="template in savedTemplates"
                  :key="template.id"
                  class="template-item"
                >
                  <div class="template-info">
                    <div class="template-name">
                      <strong>{{ template.name }}</strong>
                      <p class="template-description">
                        {{ template.description }}
                      </p>
                    </div>
                    <div class="template-date">
                      {{ template.createdAt }}
                    </div>
                  </div>
                  <div class="template-actions" @click.stop>
                    <p-button
                      style-type="tertiary"
                      size="sm"
                      @click="editTemplate(template)"
                    >
                      Edit
                    </p-button>
                    <p-button
                      style-type="secondary"
                      size="sm"
                      :loading="loading"
                      @click="deleteTemplate(template.id)"
                    >
                      Delete
                    </p-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="modal-footer">
        <p-button style-type="secondary" @click="handleClose"> Close </p-button>
      </div>
    </template>
  </p-button-modal>
</template>

<style scoped lang="postcss">
.template-manager {
  @apply bg-gray-100;
  padding: 16px;

  .tab-header {
    @apply flex border-b border-gray-300 mb-4;

    .tab-button {
      @apply px-4 py-2 text-sm font-medium border-b-2 border-transparent;
      @apply hover:text-blue-600 hover:border-blue-300;

      &.active {
        @apply text-blue-600 border-blue-600;
      }
    }
  }

  .tab-content {
    .save-section,
    .load-section {
      h3 {
        @apply text-lg font-semibold mb-2;
      }

      .description {
        @apply text-sm text-gray-600 mb-4;
      }
    }

    .template-form {
      .section {
        background: white;
        margin: 8px 0;
        padding: 12px;
        border-radius: 6px;
      }

      .save-actions {
        @apply flex justify-end mt-4 gap-2;
      }
    }

    .templates-table {
      .loading-state,
      .empty-state {
        @apply text-center py-8 text-gray-500;
      }

      .template-list {
        @apply space-y-2;
      }

      .template-item {
        @apply flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all;

        .template-info {
          @apply flex-1;

          .template-name {
            strong {
              @apply block text-sm font-medium text-gray-900;
            }

            .template-description {
              @apply text-xs text-gray-500 mt-1;
            }
          }

          .template-date {
            @apply text-xs text-gray-400 mt-1;
          }
        }

        .template-actions {
          @apply flex gap-1 ml-4;
        }
      }
    }
  }
}

.modal-footer {
  @apply flex justify-end gap-2;
}
</style>
