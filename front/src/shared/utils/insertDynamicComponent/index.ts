import Vue from 'vue';

type InsertMethod = 'append' | 'prepend';

/**
 * @param {Object} component - 동적으로 생성할 Vue 컴포넌트
 */
export function insertDynamicComponent(
  component: any,
  propsData: object = {},
  listeners: { [key: string]: any } = {},
  targetElement: HTMLElement,
  insertMethod?: InsertMethod,
): Vue {
  const ComponentConstructor = Vue.extend(component);

  const instance = new ComponentConstructor({ propsData }).$mount();

  switch (insertMethod) {
    case 'append':
      targetElement.append(instance.$el);
      break;
    case 'prepend':
      targetElement.prepend(instance.$el);
      break;
    default:
      targetElement.appendChild(instance.$el);
  }

  Object.keys(listeners).forEach(event => {
    instance.$on(event, listeners[event]);
  });

  return instance;
}
