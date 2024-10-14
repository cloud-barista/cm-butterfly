import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import { reactive } from 'vue';

export function useStepEditorProviderModel() {
  const formValues = reactive({
    entity: {
      targetModel: {
        title: 'Target Model ID',
        model: useInputModel<string>(''),
        type: 'text',
      },
      mciName: {
        title: 'MCI Name',
        model: useInputModel<string>(''),
        type: 'text',
      },
      mciDescription: {
        title: 'MCI Description',
        model: useInputModel<string>(''),
        type: 'text',
      },
    },
    accordions: [loadAccordionSlotModel(false)],
  });

  function addAccordionSlot() {
    // @ts-ignore
    formValues.accordions.push(loadAccordionSlotModel(false));
  }
  function loadAccordionSlotModel(visible: boolean) {
    return {
      icon: 'ic_chevron-down',
      visible,
      value: {
        vms: loadVmsModel(),
      },
    };
  }

  function loadVmsModel() {
    return {
      header: {
        vmName: {
          title: 'Vm Name',
          model: useInputModel<string>(''),
          type: 'text',
        },
      },
      body: {
        serverQuantity: {
          title: 'Server Quantity',
          model: useInputModel<string>(''),
          type: 'text',
        },
        commonSpec: {
          title: 'Common Spec',
          model: useInputModel<string>(''),
          type: 'text',
        },
        commonOsImage: {
          title: 'Common OS Image',
          model: useInputModel<string>(''),
          type: 'text',
        },
        rootDiskType: {
          title: 'Root Disk Type',
          options: [
            { value: null, text: 'Select Root Disk Type' },
            { value: 'a', text: 'This is First option' },
            { value: 'b', text: 'Selected Option' },
            {
              value: { C: '3PO' },
              text: 'This is an option with object value',
            },
          ],
          type: 'select',
          selected: null,
        },
        rootDiskSize: {
          title: 'Root Disk Size',
          model: useInputModel<string>(''),
          type: 'text',
        },
        userPassword: {
          title: 'User Password',
          model: useInputModel<string>(''),
          type: 'text',
        },
        connectionName: {
          title: 'Connection Name',
          model: useInputModel<string>(''),
          type: 'text',
        },
      },
    };
  }
  return { formValues, addAccordionSlot };
}
