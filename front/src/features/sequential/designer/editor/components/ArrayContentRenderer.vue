<template>
  <div class="array-content-renderer">
    <div v-if="arrayType === 'stringArray'">
      <span v-if="hasData">
        Items: {{ data.length }} strings
        <div v-if="data.length > 0" :style="getContentStyle()">
          <div v-for="(item, idx) in data.slice(0, 3)" :key="idx" :style="getItemStyle()">
            • {{ item }}
          </div>
          <div v-if="data.length > 3" :style="getMoreStyle()">
            ... and {{ data.length - 3 }} more
          </div>
        </div>
      </span>
      <span v-else>
        Items: 0 strings (empty array)
      </span>
    </div>
    
    <div v-else-if="arrayType === 'nestedObjectArray'">
      <span v-if="hasData">
        Items: {{ data.length }} objects
        <div v-if="data.length > 0" :style="getContentStyle()">
          <div v-for="(item, idx) in data.slice(0, 2)" :key="idx" :style="getObjectItemStyle()">
            <!-- nestedObjectArrayItem 타입인 경우 -->
            <div v-if="item.type === 'nestedObjectArrayItem'">
              <div :style="getObjectTitleStyle()">• {{ item.context.subject }}: {{ item.context.values?.length || 0 }} properties</div>
              <div :style="getObjectContentStyle()">
                <div v-for="(field, fieldIdx) in item.context.values?.filter(f => f.context.title !== 'errors' && f.context.subject !== 'errors')" :key="fieldIdx" :style="getPropertyStyle()">
                  <span :style="getPropertyKeyStyle()">{{ field.context.title || field.context.subject }}:</span>
                  <span :style="getPropertyValueStyle()">
                    <span v-if="field.type === 'input'">{{ field.context.model?.value || 'empty' }}</span>
                    <span v-else-if="field.type === 'nestedObject'">{{ field.type }} ({{ field.context.subject || field.context.title }})</span>
                    <span v-else>{{ field.type }}</span>
                  </span>
                </div>
              </div>
            </div>
            <!-- 일반 객체인 경우 (하위 호환성) -->
            <div v-else>
              <div :style="getObjectTitleStyle()">• Object {{ idx + 1 }}: {{ Object.keys(item).length }} properties</div>
              <div :style="getObjectContentStyle()">
                <div v-for="(value, key) in item" :key="key" :style="getPropertyStyle()">
                  <span :style="getPropertyKeyStyle()">{{ key }}:</span>
                  <DataStructureRenderer 
                    :value="value || null" 
                    :depth="1" 
                    :max-items="2"
                    :max-depth="2"
                  />
                </div>
              </div>
            </div>
          </div>
          <div v-if="data.length > 2" :style="getMoreStyle()">
            ... and {{ data.length - 2 }} more objects
          </div>
        </div>
      </span>
      <span v-else>
        Items: 0 objects (empty array)
        <div :style="getSchemaInfoStyle()">
          Schema defines nested object structure
        </div>
        <!-- 스키마 기반 구조 표시 -->
        <div :style="getSchemaStructureStyle()">
          <div :style="getSchemaTitleStyle()">Expected object structure:</div>
          <div v-for="schemaProp in schemaProperties" :key="schemaProp.name" :style="getSchemaPropStyle()">
            <span :style="getSchemaPropNameStyle()">{{ schemaProp.name }}:</span>
            <span :style="getSchemaPropTypeStyle()">{{ schemaProp.type }}</span>
            <span v-if="schemaProp.isArray" :style="getArrayTagStyle()">[Array: {{ schemaProp.arrayType || 'Unknown' }}]</span>
            <span v-if="schemaProp.isObject" :style="getObjectTagStyle()">[Object]</span>
            <!-- 객체 타입인 경우 내부 properties 표시 -->
            <div v-if="schemaProp.isObject" :style="getNestedObjectStyle()">
              <div v-for="nestedProp in getNestedObjectProperties(schemaProp.name)" :key="nestedProp.name" :style="getNestedPropStyle()">
                <span :style="getNestedPropNameStyle()">{{ nestedProp.name }}:</span>
                <span :style="getNestedPropTypeStyle()">{{ nestedProp.type }}</span>
              </div>
            </div>
          </div>
        </div>
      </span>
    </div>
    
    <div v-else-if="arrayType === 'objectArray'">
      <span v-if="hasData">
        Items: {{ data.length }} objects
      </span>
      <span v-else>
        Items: 0 objects (empty array)
      </span>
    </div>
    
    <div v-else-if="arrayType === 'unknownArray'">
      <span v-if="hasData">
        Items: {{ data.length }}
        <div v-if="data.length > 0" :style="getContentStyle()">
          <div v-for="(item, idx) in data.slice(0, 3)" :key="idx" :style="getItemStyle()">
            • {{ typeof item === 'object' ? `Object (${Object.keys(item).length} props)` : item }}
          </div>
          <div v-if="data.length > 3" :style="getMoreStyle()">
            ... and {{ data.length - 3 }} more
          </div>
        </div>
      </span>
      <span v-else>
        Items: 0 (empty array)
      </span>
    </div>
    
    <div v-else>
      <span v-if="hasData">
        Items: {{ data.length }}
      </span>
      <span v-else>
        Items: 0 (empty array)
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DataStructureRenderer from './DataStructureRenderer.vue';

export default defineComponent({
  name: 'ArrayContentRenderer',
  components: {
    DataStructureRenderer
  },
  props: {
    arrayType: {
      type: String,
      required: true
    },
    data: {
      type: Array,
      default: () => []
    },
    schemaProperties: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    hasData() {
      return Array.isArray(this.data) && this.data.length > 0;
    }
  },
  methods: {
    getContentStyle() {
      return {
        marginLeft: '8px'
      };
    },
    
    getItemStyle() {
      return {
        color: '#666'
      };
    },
    
    getObjectItemStyle() {
      return {
        color: '#666',
        marginBottom: '4px'
      };
    },
    
    getObjectTitleStyle() {
      return {
        fontWeight: '500'
      };
    },
    
    getObjectContentStyle() {
      return {
        marginLeft: '12px',
        fontSize: '11px'
      };
    },
    
    getPropertyStyle() {
      return {
        marginBottom: '2px'
      };
    },
    
    getPropertyKeyStyle() {
      return {
        fontWeight: '500'
      };
    },
    
    getPropertyValueStyle() {
      return {
        color: '#666',
        marginLeft: '4px'
      };
    },
    
    getMoreStyle() {
      return {
        color: '#999'
      };
    },
    
    getSchemaInfoStyle() {
      return {
        marginLeft: '8px',
        color: '#999',
        fontStyle: 'italic'
      };
    },
    
    getSchemaStructureStyle() {
      return {
        marginLeft: '16px',
        marginTop: '4px',
        fontSize: '10px',
        color: '#666'
      };
    },
    
    getSchemaTitleStyle() {
      return {
        fontWeight: '500',
        marginBottom: '2px'
      };
    },
    
    getSchemaPropStyle() {
      return {
        marginLeft: '8px',
        marginBottom: '1px'
      };
    },
    
    getSchemaPropNameStyle() {
      return {
        fontWeight: '500'
      };
    },
    
    getSchemaPropTypeStyle() {
      return {
        color: '#888'
      };
    },
    
    getArrayTagStyle() {
      return {
        color: '#059669',
        fontWeight: '600'
      };
    },
    
    getObjectTagStyle() {
      return {
        color: '#7c3aed',
        fontWeight: '600'
      };
    },
    
    getNestedObjectStyle() {
      return {
        marginLeft: '12px',
        marginTop: '2px',
        fontSize: '9px',
        color: '#888'
      };
    },
    
    getNestedPropStyle() {
      return {
        marginLeft: '8px',
        marginBottom: '1px'
      };
    },
    
    getNestedPropNameStyle() {
      return {
        fontWeight: '500',
        color: '#666'
      };
    },
    
    getNestedPropTypeStyle() {
      return {
        color: '#999'
      };
    },
    
    getNestedObjectProperties(objectName: string) {
      // 하드코딩된 중첩 객체 properties
      const nestedObjectMap: Record<string, Array<{name: string, type: string}>> = {
        'resources': [
          { name: 'cpu', type: 'string' },
          { name: 'memory', type: 'string' },
          { name: 'storage', type: 'string' }
        ],
        'velero': [
          { name: 'backup_name', type: 'string' },
          { name: 'backup_location', type: 'string' },
          { name: 'schedule', type: 'string' }
        ],
        'container_image': [
          { name: 'name', type: 'string' },
          { name: 'tag', type: 'string' },
          { name: 'registry', type: 'string' }
        ]
      };
      
      return nestedObjectMap[objectName] || [];
    }
  }
});
</script>

<style scoped>
.array-content-renderer {
  display: inline;
}
</style>
