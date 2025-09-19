<script lang="ts">
import { ref } from 'vue';
import { PIconButton, PTextInput } from '@cloudforet-test/mirinae';

interface BinaryItem {
  header: any;
  content: any;
  subItems?: any[];
  index?: number;
}

export default {
  name: 'BinaryAccordion',
  components: {
    PIconButton,
    PTextInput
  },
  props: {
    items: {
      type: Array as () => BinaryItem[],
      required: true
    }
  },
  emits: ['deleteBinary', 'deleteBinarySubItem'],
  setup(props, { emit }) {
    const openIndex = ref<number | null>(null);

    const toggleAccordion = (index: number) => {
      const wasOpen = openIndex.value === index;
      openIndex.value = openIndex.value === index ? null : index;
      const isNowOpen = openIndex.value === index;
      
      console.log('BinaryAccordion toggleAccordion:', {
        index,
        wasOpen,
        isNowOpen,
        action: isNowOpen ? 'opened' : 'closed',
        props: {
          items: props.items,
          itemsLength: props.items?.length
        }
      });
    };

    const isOpen = (index: number) => {
      return openIndex.value === index;
    };

    const start = (el: any) => {
      el.style.height = el.scrollHeight + 'px';
    };

    const end = (el: any) => {
      el.style.height = 'auto';
    };

    const handleDeleteBinary = (index: number) => {
      try {
        console.log('BinaryAccordion handleDeleteBinary:', {
          index,
          props: {
            items: props.items,
            itemsLength: props.items?.length,
            targetItem: props.items?.[index]
          }
        });
        emit('deleteBinary', index);
      } catch (error) {
        console.error('handleDeleteBinary error:', error);
      }
    };

    const handleDeleteBinarySubItem = (binaryIndex: number, subItemIndex: number) => {
      try {
        console.log('BinaryAccordion handleDeleteBinarySubItem:', {
          binaryIndex,
          subItemIndex,
          props: {
            items: props.items,
            itemsLength: props.items?.length,
            targetBinaryItem: props.items?.[binaryIndex],
            targetSubItem: props.items?.[binaryIndex]?.subItems?.[subItemIndex]
          }
        });
        emit('deleteBinarySubItem', binaryIndex, subItemIndex);
      } catch (error) {
        console.error('handleDeleteBinarySubItem error:', error);
      }
    };

    // Binary 필드의 제목을 안전하게 가져오는 함수
    const getFieldTitle = (field: any): string => {
      try {
        if (!field || !field.context) return 'Field';
        return field.context.title || field.context.subject || 'Field';
      } catch (error) {
        console.error('getFieldTitle error:', error);
        return 'Field';
      }
    };

    // Binary 필드에 모델이 있는지 확인하는 함수
    const hasFieldModel = (field: any): boolean => {
      try {
        return !!(field && field.context && field.context.model);
      } catch (error) {
        console.error('hasFieldModel error:', error);
        return false;
      }
    };

    // Binary 필드의 모델을 안전하게 가져오는 함수
    const getFieldModel = (field: any) => {
      try {
        if (hasFieldModel(field)) {
          return field.context.model;
        }
        return { value: '', isValid: true, onBlur: () => {} };
      } catch (error) {
        console.error('getFieldModel error:', error);
        return { value: '', isValid: true, onBlur: () => {} };
      }
    };

    return {
      openIndex,
      toggleAccordion,
      isOpen,
      start,
      end,
      handleDeleteBinary,
      handleDeleteBinarySubItem,
      getFieldTitle,
      hasFieldModel,
      getFieldModel
    };
  }
};
</script>

<template>
  <div class="binary-accordion-box">
    <div v-for="(item, index) in items" :key="index" class="binary-accordion-item">
      <div class="binary-accordion-header">
        <slot
          name="header"
          :header="item.header"
          :item="{ header: item.header, content: item.content, subItems: item.subItems }"
          :index="index"
          :isOpen="isOpen(index)"
          :click="() => toggleAccordion(index)"
          :deleteBinary="() => handleDeleteBinary(index)"
        >
          <div class="w-full h-full flex justify-between items-center" @click.stop="toggleAccordion(index)">
            <div class="flex items-center">
              <PIconButton
                :class="isOpen(index) && 'accordion-isOpen'"
                :name="'ic_chevron-right'"
                :size="'sm'"
                @click.stop="toggleAccordion(index)"
              />
              {{ item.header?.title || `Binary ${index + 1}` }}
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">{{ item.subItems?.length || 0 }} items</span>
              <PIconButton
                :name="'ic_delete'"
                :size="'sm'"
                @click.stop="handleDeleteBinary(index)"
              />
            </div>
          </div>
        </slot>
      </div>

      <transition
        name="accordion"
        @enter="start"
        @after-enter="end"
        @before-leave="start"
        @after-leave="end"
      >
        <div v-show="isOpen(index)" class="binary-accordion-content">
          <slot
            name="content"
            :content="item.content"
            :item="{ header: item.header, content: item.content, subItems: item.subItems }"
            :binaryIndex="index"
            :deleteBinarySubItem="(subItemIndex) => handleDeleteBinarySubItem(index, subItemIndex)"
          >
            <!-- Binary의 기본 필드들을 표시 -->
            <div
              v-for="(field, fieldIndex) of item.content" 
              :key="fieldIndex"
              class="field-group flex border-bottom"
            >
              <div class="field-title-box">
                {{ getFieldTitle(field) }}
              </div>
              <div class="field-content-box">
                <p-text-input
                  v-if="hasFieldModel(field)"
                  v-model="getFieldModel(field).value"
                  :size="'md'"
                  block
                  :invalid="!getFieldModel(field).isValid"
                  @blur="getFieldModel(field).onBlur"
                />
                <div v-else class="text-gray-500">
                  {{ JSON.stringify(field.context, null, 2) }}
                </div>
              </div>
            </div>

            <!-- Binary의 하위 배열들을 표시 -->
            <div
              v-for="(subItem, subIndex) of item.subItems" 
              :key="subIndex"
              class="binary-sub-item"
            >
              <div class="subject-title border-bottom">
                {{ subItem.type }}
              </div>
              <div class="binary-array-content">
                <div
                  v-for="(arrayItem, arrayIndex) of subItem.items" 
                  :key="arrayIndex"
                  class="field-group flex border-bottom"
                >
                  <div class="field-title-box">
                    {{ arrayIndex + 1 }}
                  </div>
                  <div class="field-content-box">
                    <p-text-input
                      v-if="hasFieldModel(arrayItem)"
                      v-model="getFieldModel(arrayItem).value"
                      :size="'md'"
                      block
                      :invalid="!getFieldModel(arrayItem).isValid"
                      @blur="getFieldModel(arrayItem).onBlur"
                    />
                    <div v-else class="text-gray-500">
                      {{ JSON.stringify(arrayItem.context, null, 2) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.binary-accordion-box {
  width: 100%;
}

.binary-accordion-item {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 8px;
  background-color: #ffffff;
  overflow: hidden;
}

.binary-accordion-header {
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
  cursor: pointer;
  padding: 8px 16px;
}

.binary-accordion-content {
  padding: 16px;
  overflow: hidden;
}

.field-group {
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
  align-items: center;
}

.field-group.flex {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.field-title-box {
  font-size: 13px;
  color: #6b7280;
  margin-right: 10px;
  min-width: 120px;
  flex-shrink: 0;
}

.field-content-box {
  flex: 1;
  width: 100%;
}

.border-bottom {
  border-bottom: 1px solid #e5e7eb;
}

.subject-title {
  padding: 8px 16px;
  margin: 8px 0;
  height: 44px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #6b7280;
  font-weight: 600;
  background-color: #f3f4f6;
  border-radius: 4px;
}

.binary-sub-item {
  margin: 8px 0;
  padding: 8px;
  background-color: #f9fafb;
  border-left: 2px solid #6b7280;
  border-radius: 4px;
}

.binary-array-content {
  margin-top: 8px;
}

.accordion-enter-active,
.accordion-leave-active {
  will-change: height, opacity;
  transition:
    height 0.3s ease,
    opacity 0.3s ease;
  overflow: hidden;
}

.accordion-enter,
.accordion-leave-to {
  height: 0 !important;
  opacity: 0;
}

.accordion-isOpen {
  transform: rotate(90deg);
  transition: transform 0.2s ease;
}
</style>
