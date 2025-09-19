<template>
  <div class="json-data-table">
    <div v-for="(table, tableIndex) in tables" :key="tableIndex" class="table-container">
      <h3 class="table-title">{{ getTableTitle(tableIndex) }}</h3>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th 
                v-for="column in table.columns" 
                :key="column.key"
                :style="{ width: column.width }"
                class="table-header"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in table.rows" :key="rowIndex" class="table-row">
              <td 
                v-for="column in table.columns" 
                :key="column.key"
                class="table-cell"
              >
                {{ formatCellValue(row[column.key]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { TableData, createMigrationDataTables, jsonToTable } from '@/shared/utils/jsonToTable';

export default defineComponent({
  name: 'JsonDataTable',
  props: {
    jsonData: {
      type: [String, Object] as PropType<string | object>,
      required: true
    },
    useMigrationFormat: {
      type: Boolean,
      default: false
    },
    tableTitles: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  computed: {
    tables(): TableData[] {
      if (this.useMigrationFormat) {
        return createMigrationDataTables(this.jsonData);
      } else {
        return jsonToTable(this.jsonData);
      }
    }
  },
  methods: {
    getTableTitle(index: number): string {
      if (this.tableTitles[index]) {
        return this.tableTitles[index];
      }
      
      const defaultTitles = [
        '서버 정보',
        '바이너리 정보',
        '컨테이너 정보',
        'Kubernetes 정보',
        '패키지 정보',
        '소프트웨어 모델 정보'
      ];
      
      return defaultTitles[index] || `표 ${index + 1}`;
    },
    formatCellValue(value: any): string {
      if (value === null || value === undefined) {
        return 'N/A';
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
    }
  }
});
</script>

<style scoped>
.json-data-table {
  @apply space-y-6;
}

.table-container {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

.table-title {
  @apply text-lg font-semibold text-gray-800 px-4 py-3 border-b border-gray-200;
  background-color: #f9fafb;
}

.table-wrapper {
  @apply overflow-x-auto;
}

.data-table {
  @apply w-full border-collapse;
}

.table-header {
  @apply bg-gray-100 text-gray-700 font-medium text-sm px-4 py-3 text-left border-b border-gray-200;
}

.table-row {
  @apply hover:bg-gray-100 transition-colors;
}

.table-row:nth-child(even) {
  background-color: #f9fafb;
}

.table-cell {
  @apply px-4 py-3 text-sm text-gray-600 border-b border-gray-100;
}

.table-cell:first-child {
  @apply font-medium text-gray-800;
}
</style>
