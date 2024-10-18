import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import { computed, reactive, Ref } from 'vue';

type ConvertedData = InputContext | AccordionContext;

export function useTaskEditorModel() {
  const fromContext = reactive({});

  function setFromContext(object: object) {}

  function loadInputContext(key, value): InputContext {
    return {
      type: 'input',
      context: {
        title: key,
        model: useInputModel(value ?? ''),
      },
    };
  }

  function loadAccordionContext(arr: Array<object>): AccordionContext {
    return {
      type: 'accordion',
      context: {
        header:{
          icon: 'ic_chevron-down',
          title : Object.keys(arr[0])[0]
        }
        content : arr.map(el => loadInputContext(el))

      },
    };
  }
}
//예시 flow
let t = {
  a: 'a',
  b: 'b',
  d: [
    {
      ㄱ: 'ㄱ',
      ㄴ: 'ㄴ ',
    },
  ],
  c: 'c',
};

//a,b,c 경우
let t1: InputContext = {
  type: 'input',
  context: {
    title: 'a or b or c',
    model: useInputModel<string>('a or b or c'),
  },
};

//d의 경우.
let t2: AccordionContext = {
  type: 'accordion',
  context: {
    header: {
      icon: 'ic_chevron-down',
      title: 'index',
    },
    content: [
      {
        type: 'input',
        context: {
          title: 'ㄱ or ㄴ',
          model: useInputModel('ㄱ or ㄴ'),
        },
      },
    ],
  },
};

const result = [t1, t2];

type InputContext = {
  type: 'input';
  context: {
    title: string;
    model: ReturnType<typeof useInputModel<string>>;
  };
};

type AccordionContext = {
  type: 'accordion';
  context: {
    header: {
      icon: string;
      title: string; // index
    };
    content: Array<InputContext>;
  };
};
