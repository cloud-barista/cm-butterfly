import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import { ref, UnwrapRef } from 'vue';
import { isArray } from 'lodash';
import { DEFAULT_NAMESPACE } from '@/shared/constants/namespace';

interface fixedModel {
  path_params: Record<string, string>;
  query_params: Record<string, string>;
}

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

type QueryParamsModel = {
  type: 'params';
  context: {
    subject: 'Query_Params';
    values: Array<InputContext>;
  };
};

type PathParamsModel = {
  type: 'params';
  context: {
    subject: 'Path_Params';
    values: Array<InputContext>;
  };
};

// 새로운 Context 타입들 추가
type NestedObjectContext = {
  type: 'nestedObject';
  context: {
    subject: string;
    values: Array<InputContext | NestedObjectContext | ArrayContext>;
  };
};

type ArrayContext = {
  type: 'array';
  context: {
    subject: string;
    values: Array<InputContext | NestedObjectContext | ArrayContext>;
  };
  originalData: Array<any>;
};

type SoftwareModelContext = {
  type: 'softwareModel';
  context: {
    subject: 'Software Model';
    values: Array<InputContext>;
  };
};

type ConvertedData = EntityContext | AccordionContext | NestedObjectContext | ArrayContext | SoftwareModelContext;

export function useGrasshopperTaskEditorModel() {
  const formContext = ref<ConvertedData[]>([]);
  const paramsContext = ref<{
    path_params: PathParamsModel;
    query_params: QueryParamsModel;
  }>();
  const componentNameModel = ref();
  
  // originalObject를 저장할 변수 추가
  let originalObject: any = null;

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
      content: Object.entries(object)
        .filter(([key, value]: [key: string, value: any]) => {
          // string 타입이거나 객체 타입인 경우 모두 처리
          return typeof value === 'string' || (typeof value === 'object' && value !== null);
        })
        .map(([key, value]: [key: string, value: any]) => {
          if (typeof value === 'string') {
            return loadInputContext(key, value);
          } else if (typeof value === 'object' && value !== null) {
            // 객체인 경우 JSON.stringify로 변환하여 표시
            return loadInputContext(key, JSON.stringify(value, null, 2));
          }
          return loadInputContext(key, '');
        }),
    };
  }

  // 새로운 Context 생성 함수들
  function loadNestedObjectContext(
    key: string,
    object: any,
  ): NestedObjectContext {
    const values: Array<InputContext | NestedObjectContext | ArrayContext> = [];
    
    Object.entries(object).forEach(([subKey, subValue]) => {
      if (typeof subValue === 'string' || typeof subValue === 'number' || typeof subValue === 'boolean') {
        values.push(loadInputContext(subKey, String(subValue)));
      } else if (Array.isArray(subValue)) {
        values.push(loadArrayContext(subKey, subValue));
      } else if (typeof subValue === 'object' && subValue !== null) {
        values.push(loadNestedObjectContext(subKey, subValue));
      }
    });

    return {
      type: 'nestedObject',
      context: {
        subject: key,
        values,
      },
    };
  }

  function loadArrayContext(
    key: string,
    array: any[],
  ): ArrayContext {
    const values: Array<InputContext | NestedObjectContext | ArrayContext> = [];
    
    array.forEach((item, index) => {
      if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
        values.push(loadInputContext(`${key}[${index}]`, String(item)));
      } else if (Array.isArray(item)) {
        values.push(loadArrayContext(`${key}[${index}]`, item));
      } else if (typeof item === 'object' && item !== null) {
        // servers 배열의 경우 특별 처리
        if (key === 'servers') {
          values.push(loadServerContext(`${key}[${index}]`, item, index));
        } else {
          values.push(loadNestedObjectContext(`${key}[${index}]`, item));
        }
      }
    });

    return {
      type: 'array',
      context: {
        subject: key,
        values,
      },
      originalData: array,
    };
  }

  function loadSoftwareModelContext(softwareModel: any): SoftwareModelContext {
    const values: Array<InputContext> = [];
    
    Object.entries(softwareModel).forEach(([key, value]) => {
      values.push(loadInputContext(key, String(value)));
    });

    return {
      type: 'softwareModel',
      context: {
        subject: 'Software Model',
        values,
      },
    };
  }

  function loadServerContext(
    key: string,
    server: any,
    index: number,
  ): NestedObjectContext {
    const values: Array<InputContext | NestedObjectContext | ArrayContext> = [];
    
    Object.entries(server).forEach(([subKey, subValue]) => {
      console.log(`서버[${index}] 처리 중: ${subKey}`, subValue);
      
      if (typeof subValue === 'string' || typeof subValue === 'number' || typeof subValue === 'boolean') {
        values.push(loadInputContext(subKey, String(subValue)));
      } else if (Array.isArray(subValue)) {
        // errors 배열이나 다른 배열들 처리
        values.push(loadArrayContext(subKey, subValue));
      } else if (typeof subValue === 'object' && subValue !== null) {
        // migration_list 같은 중첩 객체 처리
        values.push(loadNestedObjectContext(subKey, subValue));
      }
    });

    return {
      type: 'nestedObject',
      context: {
        subject: `Server ${index + 1}`,
        values,
      },
    };
  }

  function setComponentName(name: string) {
    componentNameModel.value = loadInputContext('name', name);
  }

  function setParamsContext(fixedModel: fixedModel) {
    console.log('=== setParamsContext 시작 ===');
    console.log('입력받은 fixedModel:', fixedModel);
    
    // path_params에서 nsId가 있으면 DEFAULT_NAMESPACE 값으로 설정
    const processedPathParams = { ...fixedModel.path_params };
    console.log('원본 path_params:', fixedModel.path_params);
    if ('nsId' in processedPathParams) {
      processedPathParams.nsId = DEFAULT_NAMESPACE;
      console.log('nsId를 DEFAULT_NAMESPACE로 변경:', processedPathParams);
    }

    // query_params에서 nsId가 있으면 DEFAULT_NAMESPACE 값으로 설정
    const processedQueryParams = { ...fixedModel.query_params };
    console.log('원본 query_params:', fixedModel.query_params);
    if ('nsId' in processedQueryParams) {
      processedQueryParams.nsId = DEFAULT_NAMESPACE;
      console.log('nsId를 DEFAULT_NAMESPACE로 변경:', processedQueryParams);
    }

    console.log('processedPathParams entries:', Object.entries(processedPathParams));
    console.log('processedQueryParams entries:', Object.entries(processedQueryParams));
    
    paramsContext.value = {
      path_params: {
        type: 'params',
        context: {
          subject: 'Path_Params',
          values: Object.entries(processedPathParams).map(([key, value]) =>
            loadInputContext(key, value),
          ),
        },
      },
      query_params: {
        type: 'params',
        context: {
          subject: 'Query_Params',
          values: Object.entries(processedQueryParams).map(([key, value]) =>
            loadInputContext(key, value),
          ),
        },
      },
    };
    
    console.log('최종 생성된 paramsContext:', paramsContext.value);
    console.log('=== setParamsContext 완료 ===');
  }

  function setFormContext(object: object | '') {
    console.log('=== setFormContext 시작 ===');
    console.log('입력받은 object:', object);
    console.log('object 타입:', typeof object);
    
    // originalObject 저장 (새로운 모델 구조인 경우 전체 객체 저장)
    if (typeof object === 'object' && object !== null && 'targetSoftwareModel' in object) {
      console.log('targetSoftwareModel이 있는 객체입니다.');
      originalObject = object;
      // targetSoftwareModel만 추출하여 처리
      object = (object as any).targetSoftwareModel || '';
      console.log('추출된 targetSoftwareModel:', object);
    } else {
      console.log('일반 객체 또는 빈 문자열입니다.');
      originalObject = null;
    }
    
    const context: ConvertedData[] = [];
    
    // Software Model 추가 (originalObject에서 추출)
    if (originalObject && (originalObject as any).softwareModel) {
      console.log('Software Model 추가:', (originalObject as any).softwareModel);
      context.push(loadSoftwareModelContext((originalObject as any).softwareModel));
    }
    
    if (typeof object === 'object' && object !== null) {
      console.log('객체 처리 시작, Object.entries:', Object.entries(object));
      Object.entries(object).forEach(
        ([key, value]: [key: string, value: any], index) => {
          console.log(`처리 중: key=${key}, value=`, value, `type=${typeof value}`);
          
          // servers부터 매핑 시작
          if (key === 'servers' && Array.isArray(value)) {
            console.log('servers 배열 처리:', key, value);
            context.push(loadArrayContext(key, value));
          } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            console.log('기본 타입 처리:', key, value);
            // 기본 타입은 Entity에 추가
            if (context.length === 0 || context[0].type !== 'entity') {
              context.unshift({
                type: 'entity',
                context: {
                  subject: 'Entity',
                  values: [],
                },
              });
            }
            if (context[0].type === 'entity') {
              context[0].context.values.push(loadInputContext(key, String(value)));
            }
          } else if (Array.isArray(value)) {
            console.log('배열 처리:', key, value);
            context.push(loadArrayContext(key, value));
          } else if (typeof value === 'object' && value !== null) {
            console.log('중첩 객체 처리:', key, value);
            context.push(loadNestedObjectContext(key, value));
          }
        },
      );
    }
    
    console.log('최종 생성된 context:', context);
    // @ts-ignore
    formContext.value = context;
    console.log('=== setFormContext 완료 ===');
  }

  function convertFormModelToStepProperties(): object {
    // 새로운 모델 구조만 지원: originalObject에 targetSoftwareModel 값만 업데이트
    const updatedTargetSoftwareModel: any = {};
    const updatedSoftwareModel: any = {};
    
    formContext.value.forEach(data => {
      if (data.type === 'entity') {
        const convertedObject: any[] = [];
        data.context.values.forEach(value => {
          if (value.type === 'keyValueInput') {
            if (
              value.context.title.value !== '' &&
              !entityKeyValidation(value.context.title)
            ) {
              //@ts-ignore
              convertedObject.push(getKeyValueInputData(value.context));
            }
          } else if (value.type === 'input') {
            //@ts-ignore
            convertedObject.push(getInputData(value.context));
          }
        });

        Object.assign(updatedTargetSoftwareModel, ...convertedObject);
      } else if (data.type === 'softwareModel') {
        // Software Model 처리
        data.context.values.forEach(value => {
          if (value.type === 'input') {
            //@ts-ignore
            Object.assign(updatedSoftwareModel, getInputData(value.context));
          }
        });
      } else if (data.type === 'array') {
        // 배열 처리
        // @ts-ignore
        updatedTargetSoftwareModel[data.context.subject] = convertArrayContextToData(data);
      } else if (data.type === 'nestedObject') {
        // 중첩 객체 처리
        // @ts-ignore
        updatedTargetSoftwareModel[data.context.subject] = convertNestedObjectContextToData(data);
      } else if (data.type === 'accordion') {
        if (data.context.subject === 'servers') {
          updatedTargetSoftwareModel.servers = data.context.values.map(value =>
            // @ts-ignore
            getAccordionSlotData(value),
          );
        }
      }
    });
    
    // originalObject의 targetSoftwareModel과 softwareModel 업데이트하고 전체 객체 반환
    return {
      ...originalObject,
      targetSoftwareModel: updatedTargetSoftwareModel,
      softwareModel: updatedSoftwareModel
    };
  }

  function convertParamsModelToStepProperties() {
    const fixedModel: fixedModel = {
      path_params: {},
      query_params: {},
    };

    Object.assign(
      fixedModel.path_params,
      paramsContext.value?.path_params.context.values.reduce((acc, value) => {
        acc[value.context.title] = value.context.model.value;
        return acc;
      }, {}),
    );
    Object.assign(
      fixedModel.query_params,
      paramsContext.value?.query_params.context.values.reduce((acc, value) => {
        acc[value.context.title] = value.context.model.value;
        return acc;
      }, {}),
    );

    return fixedModel;
  }

  function getAccordionSlotData(accordionSlotContext: AccordionSlotContext) {
    const object = {};
    accordionSlotContext.content.forEach(data => {
      const inputData = getInputData(data.context);
      Object.entries(inputData).forEach(([key, value]) => {
        // JSON 문자열인 경우 파싱하여 객체로 변환
        if (typeof value === 'string' && ((value as string).startsWith('{') || (value as string).startsWith('['))) {
          try {
            object[key] = JSON.parse(value);
          } catch (e) {
            // JSON 파싱 실패 시 원본 문자열 유지
            object[key] = value;
          }
        } else {
          object[key] = value;
        }
      });
    });

    return object;
  }

  function getKeyValueInputData(object: KeyValueInputContext['context']) {
    return {
      // @ts-ignore
      [object.title.value]: object.model.value,
    };
  }

  function getInputData(inputContext: InputContext['context']) {
    return {
      [inputContext.title]: inputContext.model.value,
    };
  }

  // 새로운 Context 타입들을 데이터로 변환하는 함수들
  function convertArrayContextToData(arrayContext: ArrayContext): any[] {
    return arrayContext.context.values.map(value => {
      if (value.type === 'input') {
        return value.context.model.value;
      } else if (value.type === 'nestedObject') {
        return convertNestedObjectContextToData(value);
      } else if (value.type === 'array') {
        return convertArrayContextToData(value);
      }
      return value;
    });
  }

  function convertNestedObjectContextToData(nestedObjectContext: NestedObjectContext): any {
    const result: any = {};
    
    nestedObjectContext.context.values.forEach(value => {
      if (value.type === 'input') {
        result[value.context.title] = value.context.model.value;
      } else if (value.type === 'nestedObject') {
        result[value.context.subject] = convertNestedObjectContextToData(value);
      } else if (value.type === 'array') {
        result[value.context.subject] = convertArrayContextToData(value);
      }
    });
    
    return result;
  }

  function addEntity(
    target: UnwrapRef<Array<InputContext | KeyValueInputContext>>,
  ) {
    // @ts-ignore
    target.push(loadKeyValueInputContext());
  }

  function addArray(parentIndex: number) {
    if (formContext.value[parentIndex].type === 'accordion') {
      formContext.value[parentIndex].context.values.push(
        // @ts-ignore
        loadAccordionContext(formContext.value[parentIndex].originalData[0], 0),
      );
    }
  }

  //return 같은게 있으면 true 없으면 false
  function entityKeyValidation(
    model: UnwrapRef<ReturnType<typeof useInputModel<string>>>,
  ): boolean {
    if (formContext.value[0].type === 'entity') {
      const valid = formContext.value[0].context.values.some(value => {
        // @ts-ignore
        if (value.type === 'input') {
          // @ts-ignore
          return value.context.title === model.value;
        }
        return false;
      });
      model.isValid = !valid;
      return valid;
    }
    return false;
  }

  function deleteEntity(index: number) {
    if (formContext.value[0].type === 'entity') {
      formContext.value[0].context.values.splice(index, 1);
    }
  }

  function deleteArrayElement(
    targetArr:
      | UnwrapRef<Array<InputContext | KeyValueInputContext>>
      | UnwrapRef<Array<AccordionSlotContext>>,
    targetIndex: number,
  ) {
    targetArr.splice(targetIndex, 1);
  }

  return {
    componentNameModel,
    formContext,
    paramsContext,
    setComponentName,
    setParamsContext,
    setFormContext,
    convertFormModelToStepProperties,
    convertParamsModelToStepProperties,
    addEntity,
    addArray,
    entityKeyValidation,
    deleteEntity,
    deleteArrayElement,
  };
}
