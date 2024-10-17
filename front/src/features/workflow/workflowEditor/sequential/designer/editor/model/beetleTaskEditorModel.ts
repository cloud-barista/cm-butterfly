import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import { reactive } from 'vue';

export function useTaskEditorModel() {
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
    accordions: [loadAccordionSlotModel()],
  });

  function addAccordionSlot() {
    // @ts-ignore
    formValues.accordions.push(loadAccordionSlotModel());
  }
  function loadAccordionSlotModel() {
    return {
      header: {
        icon: 'ic_chevron-down',
        title: 'VM Name',
      },
      content: {
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
          model: useInputModel<string>(''),
          type: 'text',
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
