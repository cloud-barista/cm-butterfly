import { ref } from 'vue';
import { useInputModel } from '@/shared/hooks/input/useInputModel';
import {
  KeyValueContext,
  ObjectContext,
  ArrayContext,
  ObjectArrayContext,
  ComplexContext,
  FormContext,
  Context,
  ContextFactory,
  ContextConverter,
  ContextEditor,
} from './contextTypes';

export class ContextFactoryImpl implements ContextFactory {
  createKeyValueContext(key: string, value: string): KeyValueContext {
    const inputModel = useInputModel(value);
    return {
      type: 'keyValue',
      key,
      value: inputModel as any, // 타입 캐스팅으로 임시 해결
    };
  }

  createObjectContext(subject: string, fields: Array<Context>): ObjectContext {
    return {
      type: 'object',
      subject,
      fields,
    };
  }

  createArrayContext(subject: string, items: Array<KeyValueContext>): ArrayContext {
    return {
      type: 'array',
      subject,
      items,
    };
  }

  createObjectArrayContext(subject: string, items: Array<ObjectContext>): ObjectArrayContext {
    return {
      type: 'objectArray',
      subject,
      items,
    };
  }

  createComplexContext(subject: string, fields: Array<Context>): ComplexContext {
    return {
      type: 'complex',
      subject,
      fields,
    };
  }

  createFormContext(subject: string, fields: Array<Context>): FormContext {
    return {
      type: 'form',
      subject,
      fields,
    };
  }
}

export class ContextConverterImpl implements ContextConverter {
  private factory: ContextFactory;

  constructor(factory: ContextFactory) {
    this.factory = factory;
  }

  convertToFormContext(data: any): FormContext {
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        // 배열인 경우
        if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
          // 객체 배열인 경우
          const items = data.map((item, index) => 
            this.factory.createObjectContext(`Item ${index + 1}`, this.convertObjectToFields(item))
          );
          return this.factory.createFormContext('Array', [
            this.factory.createObjectArrayContext('Items', items)
          ]);
        } else {
          // 단순 배열인 경우
          const items = data.map((item, index) => 
            this.factory.createKeyValueContext(`item_${index}`, String(item))
          );
          return this.factory.createFormContext('Array', [
            this.factory.createArrayContext('Items', items)
          ]);
        }
      } else {
        // 객체인 경우
        const fields = this.convertObjectToFields(data);
        return this.factory.createFormContext('Object', fields);
      }
    } else {
      // 단순 값인 경우
      return this.factory.createFormContext('Value', [
        this.factory.createKeyValueContext('value', String(data))
      ]);
    }
  }

  convertFromFormContext(formContext: FormContext): any {
    return this.convertContextToData(formContext);
  }

  private convertObjectToFields(obj: any): Array<Context> {
    const fields: Array<Context> = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        fields.push(this.factory.createKeyValueContext(key, String(value)));
      } else if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
          // 객체 배열
          const items = value.map((item, index) => 
            this.factory.createObjectContext(`Item ${index + 1}`, this.convertObjectToFields(item))
          );
          fields.push(this.factory.createObjectArrayContext(key, items));
        } else {
          // 단순 배열
          const items = value.map((item, index) => 
            this.factory.createKeyValueContext(`item_${index}`, String(item))
          );
          fields.push(this.factory.createArrayContext(key, items));
        }
      } else if (typeof value === 'object' && value !== null) {
        // 중첩 객체
        fields.push(this.factory.createObjectContext(key, this.convertObjectToFields(value)));
      }
    });
    
    return fields;
  }

  private convertContextToData(context: Context): any {
    switch (context.type) {
      case 'keyValue':
        return context.value.value;
      case 'object':
        const obj: any = {};
        context.fields.forEach(field => {
          const fieldData = this.convertContextToData(field);
          if (field.type === 'keyValue') {
            obj[field.key] = fieldData;
          } else {
            obj[field.subject] = fieldData;
          }
        });
        return obj;
      case 'array':
        return context.items.map(item => this.convertContextToData(item));
      case 'objectArray':
        return context.items.map(item => this.convertContextToData(item));
      case 'complex':
        const complexObj: any = {};
        context.fields.forEach(field => {
          const fieldData = this.convertContextToData(field);
          if (field.type === 'keyValue') {
            complexObj[field.key] = fieldData;
          } else {
            complexObj[field.subject] = fieldData;
          }
        });
        return complexObj;
      default:
        return null;
    }
  }

  validateContext(context: Context): boolean {
    switch (context.type) {
      case 'keyValue':
        return context.value.isValid.value;
      case 'object':
        return context.fields.every(field => this.validateContext(field));
      case 'array':
        return context.items.every(item => this.validateContext(item));
      case 'objectArray':
        return context.items.every(item => this.validateContext(item));
      case 'complex':
        return context.fields.every(field => this.validateContext(field));
      default:
        return false;
    }
  }
}

export class ContextEditorImpl implements ContextEditor {
  addField(context: ObjectContext | ComplexContext, field: Context): void {
    context.fields.push(field);
  }

  removeField(context: ObjectContext | ComplexContext, fieldIndex: number): void {
    context.fields.splice(fieldIndex, 1);
  }

  updateField(context: ObjectContext | ComplexContext, fieldIndex: number, field: Context): void {
    context.fields[fieldIndex] = field;
  }

  addArrayItem(context: ArrayContext, item: KeyValueContext): void;
  addArrayItem(context: ObjectArrayContext, item: ObjectContext): void;
  addArrayItem(context: ArrayContext | ObjectArrayContext, item: KeyValueContext | ObjectContext): void {
    if (context.type === 'array') {
      (context as ArrayContext).items.push(item as KeyValueContext);
    } else if (context.type === 'objectArray') {
      (context as ObjectArrayContext).items.push(item as ObjectContext);
    }
  }

  removeArrayItem(context: ArrayContext | ObjectArrayContext, itemIndex: number): void {
    if (context.type === 'array') {
      (context as ArrayContext).items.splice(itemIndex, 1);
    } else if (context.type === 'objectArray') {
      (context as ObjectArrayContext).items.splice(itemIndex, 1);
    }
  }

  updateArrayItem(context: ArrayContext, itemIndex: number, item: KeyValueContext): void;
  updateArrayItem(context: ObjectArrayContext, itemIndex: number, item: ObjectContext): void;
  updateArrayItem(context: ArrayContext | ObjectArrayContext, itemIndex: number, item: KeyValueContext | ObjectContext): void {
    if (context.type === 'array') {
      (context as ArrayContext).items[itemIndex] = item as KeyValueContext;
    } else if (context.type === 'objectArray') {
      (context as ObjectArrayContext).items[itemIndex] = item as ObjectContext;
    }
  }
}

// 싱글톤 인스턴스들
export const contextFactory = new ContextFactoryImpl();
export const contextConverter = new ContextConverterImpl(contextFactory);
export const contextEditor = new ContextEditorImpl();
