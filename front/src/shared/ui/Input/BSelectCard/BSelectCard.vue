<script setup lang="ts">
import { PDataLoader } from '@cloudforet-test/mirinae';
import { ref } from 'vue';

interface data {
  label: string;
  id: string;
  checked: boolean;
}

interface IProps {
  value: data[];
  loading: boolean;
}

const props = defineProps<IProps>();

const checked = ref([]);

function handleChange(e) {
  e.checked = !e.checked;
}
</script>

<template>
  <div class="w-full h-full">
    <p-data-loader :data="value" :loading="loading">
      <template #defalut="context">
        {{ context }}
        <div v-for="(el, index) of context">
          <div
            class="card"
            @click="handleChange"
            :class="checked ?? el.checked"
          >
            <slot v-bind="{ el, index }">
              <input type="checkbox" :checked="el.checked" />
              <label>{{ el.label }}</label>
            </slot>
          </div>
        </div>
      </template>
    </p-data-loader>
  </div>
</template>

<style scoped lang="postcss">
.card {
  width: 205.5px;
  height: 56px;
  margin: 0.2rem;
  padding: 10px 16px 10px 16px;
  border-radius: 12px;
}
.card[data-checked] {
  border: 1px solid blue;
}
</style>
