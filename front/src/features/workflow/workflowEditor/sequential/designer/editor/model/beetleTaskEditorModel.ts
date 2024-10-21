import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import { computed, reactive, ref, Ref } from 'vue';
import object from 'async-validator/dist-types/validator/object';
import { isArray, values } from 'lodash';

type EntityContext = {
  type: 'entity';
  context: {
    subject: 'Entity';
    values: Array<InputContext>;
  };
};

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
  context: {
    subject: string;
    values: Array<AccordionSlotContext>;
  };
  index: number;
};

type ConvertedData = EntityContext | AccordionContext;

export function useTaskEditorModel() {
  const formContext = ref<ConvertedData[]>([]);

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
    const context: ConvertedData[] = [
      {
        type: 'entity',
        context: {
          subject: 'Entity',
          values: [],
        },
      },
    ];
    if (typeof object === 'object') {
      Object.entries(object).forEach(
        ([key, value]: [key: string, value: string | Array<object>], index) => {
          if (typeof value === 'string') {
            if (context[0].type === 'entity') {
              context[0].context.values.push(loadInputContext(key, value));
            }
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
    formContext.value = context;
  }

  // unMount시 modelContext를 StepProperties로 하고 반환된 properties를 Step으로 저장
  // 겹치는 key가 있으면 경고나 제외 하는 로직도 추가해야함.
  function convertFormModelToStepProperties(): object {
    const properties = {};

    formContext.value.forEach(data => {
      if (data.type === 'entity') {
        let t = data.context.values.map(value => {
          // @ts-ignore
          return getInputData(value.context);
        });

        Object.assign(properties, ...t);
      } else if (data.type === 'accordion') {
        const accordionData = {
          [data.context.subject]: data.context.values.map(value =>
            // @ts-ignore
            getAccordionSlotData(value),
          ),
        };
        Object.assign(properties, accordionData);
      }
    });
    return properties;
  }

  function getAccordionSlotData(accordionSlotContext: AccordionSlotContext) {
    return accordionSlotContext.content.map(data => getInputData(data.context));
  }

  function getInputData(inputContext: InputContext['context']) {
    console.log(inputContext);
    return {
      [inputContext.title]: inputContext.model.value,
    };
  }

  return { formContext, setFormContext, convertFormModelToStepProperties };
}
