import { Ref, ref, UnwrapRef, watch } from 'vue';
import { debounce } from 'lodash';
import { IValidationResult } from '@/entities';

export function useInputModel<T = string>(
  initialValue: T,
  validateFn?: (
    newValue: UnwrapRef<T>,
  ) => Promise<IValidationResult> | IValidationResult,
  debounceTime = 100,
) {
  const value: Ref<T> = ref<T>(initialValue) as Ref<T>;
  const touched = ref(false);
  const errorMessage = ref<string | null>(null);
  const isValid = ref<boolean>(true);
  const validating = ref<boolean>(false);

  const exeValidation = async (newValue: UnwrapRef<T>) => {
    if (!validateFn) return;
    validating.value = true;
    const result = await validateFn(newValue);
    isValid.value = result.isValid;
    errorMessage.value = result.isValid
      ? null
      : result.message || 'Invalid input';
    validating.value = false;
  };

  const debouncedValidate = debounce(
    newValue => exeValidation(newValue),
    debounceTime,
  );

  watch(value, newValue => {
    debouncedValidate(newValue);
  });

  const onBlur = async () => {
    touched.value = true;
    debouncedValidate.cancel();
    await debouncedValidate(value.value);
  };

  return {
    value,
    errorMessage,
    isValid,
    validating,
    touched,
    onBlur,
    exeValidation,
    debouncedValidate,
  };
}
