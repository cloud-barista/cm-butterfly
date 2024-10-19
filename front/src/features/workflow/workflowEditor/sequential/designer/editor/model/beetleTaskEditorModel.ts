import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import { computed, reactive, ref, Ref } from 'vue';
import object from 'async-validator/dist-types/validator/object';
import { isArray, values } from 'lodash';

type InputContext = {
  type: 'input';
  context: {
    title: string;
    model: ReturnType<typeof useInputModel<string>>;
  };
};

type AccordionSlotContext = {
  header: {
    icon: string;
    title: string; // index
  };
  content: Array<InputContext>;
};

type AccordionContext = {
  type: 'accordion';
  context: { [key: string]: AccordionSlotContext[] | number | string };
  index: number;
};

type ConvertedData = InputContext | AccordionContext;

export function useTaskEditorModel() {
  const fromContext = ref<ConvertedData[]>([]);

  function loadInputContext(
    key: string,
    value: string | '' | null,
  ): InputContext {
    return {
      type: 'input',
      context: {
        title: key,
        model: useInputModel(value ?? ''),
      },
    };
  }

  function loadAccordionContext(
    object: object,
    index: number,
  ): AccordionSlotContext {
    return {
      header: {
        icon: 'ic_chevron-down',
        title: index.toString(),
      },
      content: Object.entries(object).map(
        ([key, value]: [key: string, value: string]) => {
          return loadInputContext(key, value);
        },
      ),
    };
  }

  function setFormContext(object: object | '') {
    const context: ConvertedData[] = [];
    if (typeof object === 'object') {
      Object.entries(object).forEach(
        ([key, value]: [key: string, value: string | Array<object>], index) => {
          console.log(key);
          console.log(value);
          if (typeof value === 'string') {
            context.push(loadInputContext(key, value));
          } else if (isArray(value)) {
            context.push({
              type: 'accordion',
              context: {
                subject: key,
                values: value.map((el, index) =>
                  loadAccordionContext(el, index),
                ),
              },
              index,
            });
          }
        },
      );
    }
    // @ts-ignore
    fromContext.value = context;
  }

  return { fromContext, setFormContext };
}
