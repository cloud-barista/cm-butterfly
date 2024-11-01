<script setup lang="ts">
import {
  PButton,
  PSelectCard,
  PToolbox,
  PDataLoader,
  PToolboxTable,
} from '@cloudforet-test/mirinae';
import { useVmListModel } from '@/widgets/workload/vmList/model';
import { onBeforeMount, onMounted, reactive, ref, watch } from 'vue';

interface IProps {
  nsId: string;
  mciId: string;
}

const props = defineProps<IProps>();
const emit = defineEmits(['selectCard']);
const displayCardData = ref([]);
const searchText = ref<string>('');
const { cardState, getVmList, initToolBoxTableModel, vmListTableModel } =
  useVmListModel<IProps>(props);

watch(cardState, () => {
  console.log(cardState.selected);
});

onMounted(() => {
  initToolBoxTableModel();
});

function handleClick(id: string) {
  emit('selectCard', id);
}
</script>

<template>
  <div class="p-4">
    <section class="vmList-container">
      <p-toolbox
        :totalCount="displayCardData.length"
        :pageSizeChangeable="false"
        :searchText="searchText"
        @change=""
        @refresh=""
      >
        <template #left-area>
          <p-button
            style-type="tertiary"
            icon-left="ic_plus_bold"
            :disabled="true"
          >
            Add Server
          </p-button>
        </template>
      </p-toolbox>
      <div class="vmList-content">
        <p-data-loader
          v-if="cardState.cardData.length === 0"
          :data="false"
          :loading="false"
        >
        </p-data-loader>
        <p-select-card
          v-else
          v-for="(value, _) in cardState.cardData"
          :key="value.name"
          v-model="cardState.selected"
          :value="value.name"
          :multi-selectable="true"
          @click="handleClick(value.name)"
          style="
            width: 205.5px;
            height: 56px;
            margin: 0.2rem;
            padding: 10px 16px 10px 16px;
            border-radius: 12px;
          "
        >
          <template #default="scope">
            {{ value.name }}
          </template>
        </p-select-card>
      </div>
    </section>
    <section>
      <slot :name="'vmInfoTable'"></slot>
    </section>
  </div>
</template>

<style scoped lang="postcss">
.vmList-container {
  @apply border-b border-gray-300;
}
.vmList-content {
  @apply w-full flex flex-wrap;
  max-height: 208px;
  padding-top: 10px;
  padding-bottom: 10px;
  overflow-y: auto;
}
</style>
