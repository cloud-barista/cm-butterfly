<template>
  <div class="data-viewer">
    <template v-if="isPrimitive(data)">
      <span class="primitive">{{ data }}</span>
    </template>

    <template v-else-if="isArray(data)">
      <span class="bracket">[</span>
      <div class="indent">
        <DataViewer
          v-for="(item, index) in data"
          :key="index"
          :data="item"
        />
      </div>
      <span class="bracket">]</span>
    </template>

    <template v-else-if="isObject(data)">
      <span class="bracket">{</span>
      <div class="indent">
        <div v-for="(value, key) in data" :key="key">
          <span class="key">{{ key }}: </span>
          <DataViewer :data="value" />
        </div>
      </div>
      <span class="bracket">}</span>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DataViewer',
  components: {
    DataViewer: () => import('./DataViewer.vue')
  },
  props: {
    data: {
      required: true,
    },
  },
  setup(props) {
    // 데이터 타입 체크 헬퍼 함수
    const isPrimitive = (value: any) => {
      return (
        typeof value === 'string' || 
        typeof value === 'number' || 
        typeof value === 'boolean' || 
        value === null ||
        value === undefined
      );
    };

    const isArray = (value: any) => Array.isArray(value);
    
    const isObject = (value: any) => 
      typeof value === 'object' && 
      value !== null && 
      !Array.isArray(value);

    return {
      isPrimitive,
      isArray,
      isObject
    };
  }
});
</script>

<style scoped lang="postcss">
.data-viewer {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.4;
}

.indent {
  margin-left: 20px;
}

.bracket {
  color: #888;
  font-weight: bold;
}

.key {
  font-weight: bold;
  color: #4a4a4a;
}

.primitive {
  color: #007bff;
}

.primitive.string {
  color: #28a745;
}

.primitive.number {
  color: #fd7e14;
}

.primitive.boolean {
  color: #6f42c1;
}

.primitive.null {
  color: #6c757d;
  font-style: italic;
}
</style>
