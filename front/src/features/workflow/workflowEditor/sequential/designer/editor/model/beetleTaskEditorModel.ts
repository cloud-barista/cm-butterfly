import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import { computed, reactive, ref, Ref, UnwrapRef } from 'vue';
import object from 'async-validator/dist-types/validator/object';
import { isArray, values } from 'lodash';

type EntityContext = {
  type: 'entity';
  context: {
    subject: 'Entity';
    values: Array<InputContext | KeyValueInputContext>;
  };
};

type InputContext = {
  type: 'input';
  context: {
    title: string;
    model: ReturnType<typeof useInputModel<string>>;
  };
};

type KeyValueInputContext = {
  type: 'keyValueInput';
  context: {
    title: ReturnType<typeof useInputModel<string>>;
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
  originalData: Array<any>;
};

type ConvertedData = EntityContext | AccordionContext;

export function useTaskEditorModel() {
  const formContext = ref<ConvertedData[]>([]);
  const saveFormContext = ref<ConvertedData[]>([]);

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

  function loadKeyValueInputContext(): KeyValueInputContext {
    return {
      type: 'keyValueInput',
      context: {
        title: useInputModel(''),
        model: useInputModel(''),
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
              originalData: value,
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
    saveFormContext.value = JSON.parse(JSON.stringify(context));
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

  function addEntity(
    target: UnwrapRef<Array<InputContext | KeyValueInputContext>>,
  ) {
    // formContext.value[0].context.values.push(loadKeyValueInputContext());
    // @ts-ignore
    target.push(loadKeyValueInputContext());
  }

  function addArray(parentIndex: number) {
    // console.log(formContext.value[targetIndex].context.values);
    // console.log(
    //   JSON.parse(
    //     JSON.stringify(saveFormContext.value[targetIndex].context.values[0]),
    //   ),
    // );
    //기존에 저장되어져 있는 데이터 그대로
    console.log(formContext.value[parentIndex]);
    if (formContext.value[parentIndex].type === 'accordion') {
      formContext.value[parentIndex].context.values.push(
        // @ts-ignore
        loadAccordionContext(formContext.value[parentIndex].originalData[0], 0),
      );
    }
  }

  return {
    formContext,
    setFormContext,
    convertFormModelToStepProperties,
    addEntity,
    addArray,
  };
}
