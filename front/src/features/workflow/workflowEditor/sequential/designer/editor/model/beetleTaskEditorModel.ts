import { useInputModel } from '@/shared/hooks/input/useInputModel.ts';
import { computed, reactive } from 'vue';
import { FormValuesProps } from '@/features/workflow/workflowEditor/sequential/designer/editor/ui/BeetleTaskEditor.vue';

export function useTaskEditorModel(props: Readonly<FormValuesProps>) {
  const formValues = reactive({
    entity: {
      targetModel: {
        title: 'Target Model ID',
        model: useInputModel<string>(props.targetModel ?? ''),
        type: 'text',
      },
      mciName: {
        title: 'MCI Name',
        model: useInputModel<string>(props.mciName ?? ''),
        type: 'text',
      },
      mciDescription: {
        title: 'MCI Description',
        model: useInputModel<string>(props.mciDescription ?? ''),
        type: 'text',
      },
    },
    accordions:
      props.vms.length === 0
        ? [loadAccordionSlotModel({})]
        : props.vms.map(vm => loadAccordionSlotModel(vm)),
  });

  function addAccordionSlot(vm: FormValuesProps['vms']) {
    // @ts-ignore
    formValues.accordions.push(loadAccordionSlotModel(vm));
  }
  function loadAccordionSlotModel(vm: FormValuesProps['vms']) {
    return {
      header: {
        icon: 'ic_chevron-down',
        title: 'VM Name',
      },
      content: {
        vms: loadVmsModel(vm),
      },
    };
  }

  function loadVmsModel(vm: FormValuesProps['vms']) {
    return {
      header: {
        vmName: {
          title: 'Vm Name',
          model: useInputModel<string>(vm.vmName ?? ''),
          type: 'text',
        },
      },
      body: {
        serverQuantity: {
          title: 'Server Quantity',
          model: useInputModel<string>(vm.serverQuantity ?? ''),
          type: 'text',
        },
        commonSpec: {
          title: 'Common Spec',
          model: useInputModel<string>(vm.commonSpec ?? ''),
          type: 'text',
        },
        commonOsImage: {
          title: 'Common OS Image',
          model: useInputModel<string>(vm.commonOsImage ?? ''),
          type: 'text',
        },
        rootDiskType: {
          title: 'Root Disk Type',
          model: useInputModel<string>(vm.rootDiskType ?? ''),
          type: 'text',
        },
        rootDiskSize: {
          title: 'Root Disk Size',
          model: useInputModel<string>(vm.rootDiskSize ?? ''),
          type: 'text',
        },
        userPassword: {
          title: 'User Password',
          model: useInputModel<string>(vm.userPassword ?? ''),
          type: 'text',
        },
        connectionName: {
          title: 'Connection Name',
          model: useInputModel<string>(vm.connectionName ?? ''),
          type: 'text',
        },
      },
    };
  }
  return { formValues, addAccordionSlot };
}
