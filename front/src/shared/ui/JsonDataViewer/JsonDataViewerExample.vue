<template>
  <div class="json-data-viewer-example">
    <h2 class="text-2xl font-bold mb-6">JSON 데이터 뷰어 예시</h2>
    
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-3">통합 뷰어 (표 + 트리 + JSON)</h3>
      <JsonDataViewer
        :json-data="migrationData"
        :use-migration-format="true"
        :table-titles="['서버 정보', '바이너리', '컨테이너', 'Kubernetes', '패키지', '소프트웨어 모델']"
        :available-views="['table', 'tree', 'raw']"
      />
    </div>

    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-3">트리 뷰만</h3>
      <JsonDataTree
        :json-data="generalData"
        :show-search="true"
        :show-values="true"
        :max-depth="5"
        @node-click="handleNodeClick"
      />
    </div>

    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-3">표 뷰만</h3>
      <JsonDataTable
        :json-data="generalData"
        :use-migration-format="false"
      />
    </div>

    <!-- 노드 클릭 정보 -->
    <div v-if="clickedNode" class="node-info">
      <h4 class="text-md font-semibold mb-2">클릭된 노드 정보:</h4>
      <div class="p-4" style="background-color: #f3f4f6; border-radius: 4px;">
        <p><strong>경로:</strong> {{ clickedNode.path }}</p>
        <p><strong>타입:</strong> {{ clickedNode.type }}</p>
        <p><strong>라벨:</strong> {{ clickedNode.label }}</p>
        <p v-if="clickedNode.value !== undefined"><strong>값:</strong> {{ clickedNode.value }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import JsonDataViewer from './JsonDataViewer.vue';
import JsonDataTree from '@/shared/ui/Tree/JsonDataTree.vue';
import JsonDataTable from '@/shared/ui/Table/JsonDataTable.vue';
import { TreeNode } from '@/shared/utils/jsonToTable';

export default defineComponent({
  name: 'JsonDataViewerExample',
  components: {
    JsonDataViewer,
    JsonDataTree,
    JsonDataTable
  },
  setup() {
    const clickedNode = ref<TreeNode | null>(null);

    const migrationData = `{"targetSoftwareModel":{"servers":[{"errors":["No critical errors found"],"migration_list":{"binaries":[{"binary_path":"/usr/local/bin/app","custom_configs":["/etc/app/config.json"],"custom_data_paths":["/var/lib/app/data"],"name":"Sample Application","needed_libraries":["libssl-dev","libcurl4-openssl-dev"],"order":1,"version":"1.0.0"}],"containers":[{"container_id":"sample-container-1","container_image":{"image_architecture":"common","image_hash":"sha256:abc123def456","image_name":"sample-app","image_version":"latest"},"container_ports":[{"container_port":8080,"host_ip":"0.0.0.0","host_port":8080,"protocol":"tcp"}],"container_status":"running","docker_compose_path":"/opt/docker-compose.yml","envs":[{"name":"DB_HOST","value":"localhost"},{"name":"DB_PORT","value":"5432"}],"mount_paths":["/var/lib/app:/app/data"],"name":"sample-app-container","network_mode":"bridge","order":1,"restart_policy":"unless-stopped","runtime":"docker"}],"kubernetes":[{"kube_config":"/etc/kubernetes/admin.conf","order":1,"resources":{"deployment":{"replicas":3,"resources":{"limits":{"cpu":"500m","memory":"512Mi"},"requests":{"cpu":"100m","memory":"128Mi"}}}},"velero":{"backup_location_config":"default","bucket":"backup-bucket","features":"EnableCSI","plugins":"velero/velero-plugin-for-aws:v1.0.0","provider":"aws","secret_file":"/etc/velero/credentials"},"version":"1.24.0"}],"packages":[{"custom_configs":["/etc/nginx/nginx.conf"],"custom_data_paths":["/var/www/html"],"gpg_key_url":"https://nginx.org/keys/nginx_signing.key","name":"nginx","need_to_delete_packages":["apache2"],"needed_packages":["nginx","nginx-common"],"order":1,"repo_url":"http://nginx.org/packages/ubuntu","repo_use_os_version_code":false,"version":"1.18.0"}]},"source_connection_info_id":"conn-12345"}]},"softwareModel":{"id":"7b_COtxNSSeJgu8","name":"nfs-web-sw1-tg01","description":""}}`;
    
    const generalData = {
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, address: { city: 'Seoul', country: 'Korea' } },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, address: { city: 'Busan', country: 'Korea' } },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, address: { city: 'Incheon', country: 'Korea' } }
      ],
      settings: {
        theme: 'dark',
        language: 'ko',
        notifications: true,
        features: ['search', 'filter', 'export']
      },
      metadata: {
        version: '1.0.0',
        lastUpdated: '2024-01-15T10:30:00Z',
        author: {
          name: 'Developer',
          email: 'dev@example.com'
        }
      }
    };

    const handleNodeClick = (node: TreeNode) => {
      clickedNode.value = node;
    };

    return {
      clickedNode,
      migrationData,
      generalData,
      handleNodeClick
    };
  }
});
</script>

<style scoped>
.json-data-viewer-example {
  @apply p-6 min-h-screen space-y-6;
  background-color: #f9fafb;
}

.node-info {
  @apply mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200;
}
</style>
