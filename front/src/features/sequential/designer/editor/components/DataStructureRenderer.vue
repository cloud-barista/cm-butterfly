<template>
  <div class="data-structure-renderer">
    <!-- Array 표시 -->
    <span v-if="Array.isArray(value)" :style="getArrayStyle()">
      [Array: {{ value.length }} items]
      <!-- Array 상세 표시 -->
      <div v-if="value.length > 0" :style="getNestedStyle()">
        <div v-for="(arrayItem, arrayIdx) in value.slice(0, getMaxItems())" :key="arrayIdx" :style="getItemStyle()">
          <span :style="getIndexStyle()">{{ arrayIdx + 1 }}:</span>
          <DataStructureRenderer 
            :value="arrayItem" 
            :depth="depth + 1" 
            :max-items="maxItems"
            :max-depth="maxDepth"
          />
        </div>
        <div v-if="value.length > getMaxItems()" :style="getMoreStyle()">
          ... and {{ value.length - getMaxItems() }} more
        </div>
      </div>
    </span>
    
    <!-- Object 표시 -->
    <span v-else-if="typeof value === 'object' && value !== null" :style="getObjectStyle()">
      [Object: {{ Object.keys(value).length }} props]
      <!-- Object 상세 표시 -->
      <div v-if="Object.keys(value).length > 0" :style="getNestedStyle()">
        <div v-for="(objValue, objKey) in value" :key="objKey" :style="getItemStyle()">
          <span :style="getKeyStyle()">{{ objKey }}:</span>
          <DataStructureRenderer 
            :value="objValue" 
            :depth="depth + 1" 
            :max-items="maxItems"
            :max-depth="maxDepth"
          />
        </div>
      </div>
    </span>
    
    <!-- Null 값 표시 -->
    <span v-else-if="value === null" :style="getNullStyle()">
      null
    </span>
    
    <!-- Primitive 값 표시 -->
    <span v-else :style="getPrimitiveStyle()">
      {{ formatPrimitiveValue(value) }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DataStructureRenderer',
  props: {
    value: {
      type: [String, Number, Boolean, Array, Object, null],
      required: false,
      default: null
    },
    depth: {
      type: Number,
      default: 0
    },
    maxItems: {
      type: Number,
      default: 3
    },
    maxDepth: {
      type: Number,
      default: 3
    }
  },
  methods: {
    getMaxItems() {
      return this.depth >= this.maxDepth ? 2 : this.maxItems;
    },
    
    getArrayStyle() {
      return {
        color: '#059669',
        fontWeight: '600'
      };
    },
    
    getObjectStyle() {
      return {
        color: '#7c3aed',
        fontWeight: '600'
      };
    },
    
    getPrimitiveStyle() {
      return {
        color: '#666'
      };
    },
    
    getNullStyle() {
      return {
        color: '#999',
        fontStyle: 'italic'
      };
    },
    
    getNestedStyle() {
      const baseMargin = 8;
      const marginLeft = baseMargin + (this.depth * 8);
      const fontSize = Math.max(8, 12 - this.depth);
      
      return {
        marginLeft: `${marginLeft}px`,
        marginTop: '2px',
        fontSize: `${fontSize}px`
      };
    },
    
    getItemStyle() {
      return {
        marginBottom: '1px'
      };
    },
    
    getIndexStyle() {
      return {
        fontWeight: '500'
      };
    },
    
    getKeyStyle() {
      return {
        fontWeight: '500'
      };
    },
    
    getMoreStyle() {
      const fontSize = Math.max(8, 12 - this.depth);
      return {
        color: '#999',
        fontSize: `${fontSize}px`
      };
    },
    
    formatPrimitiveValue(value: any) {
      if (typeof value === 'string') {
        return `"${value}"`;
      }
      return value;
    }
  }
});
</script>

<style scoped>
.data-structure-renderer {
  display: inline;
}
</style>
