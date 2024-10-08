<script setup lang="ts">
import { PButton, PIconButton } from '@cloudforet-test/mirinae';
import { onMounted, onUnmounted, ref, toRef, watch } from 'vue';

interface IProps {
  id: ref<string>;
}

const props = defineProps<IProps>();
const emit = defineEmits(['button-click']);
const text = 'test';
const accordions = [
  {
    icon: 'ic_chevron-down',
    visible: true,
    text: 'Accordion 1 content',
  },
  {
    icon: 'ic_chevron-down',
    visible: false,
    text: 'Accordion 2 content',
  },
  {
    icon: 'ic_chevron-down',
    visible: false,
    text: 'Accordion 3 content',
  },
];
watch(props, nv => {
  console.log('update!');
  console.log(nv);
  // props.id.value = nv;
});

onMounted(() => {
  console.log(props);
  console.log('Mount!');
});

onUnmounted(() => {
  console.log('unMount!');
});
</script>

<template>
  <div>
    <div class="accordion" role="tablist">
      <b-card no-body v-for="(accordion, index) in accordions" :key="index">
        <b-card-header header-tag="header" role="tab">
          <PIconButton
            v-b-toggle="'accordion-' + (index + 1)"
            :name="accordion.icon"
          ></PIconButton>
        </b-card-header>
        <b-collapse
          :id="'accordion-' + (index + 1)"
          :visible="accordion.visible"
          accordion="my-accordion"
          role="tabpanel"
        >
          <b-card-body>
            <b-card-text
              >I start
              {{ accordion.visible ? 'opened' : 'closed' }}
            </b-card-text>
            <b-card-text>{{ accordion.text }}</b-card-text>
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.accordion {
  .card {
    border: none;
    .card-header {
      background-color: transparent;
      .p-button {
        transition: transform 0.1s;
      }

      .p-button.collapsed {
      }

      .p-button.not-collapsed {
        transform: rotate(180deg);
      }
    }
  }
}
</style>
