interface IValidationResult {
  isValid: boolean;
  message?: string | null;
}

export function validateFunc(value: string): IValidationResult {
  const result: IValidationResult = {
    isValid: false,
    message: null,
  };

  result.isValid = !!value.length;

  if (!result.isValid) {
    result.message = 'not empty';
  }

  return result;
}

export function validateNumberFunc(
  value: string,
  max: number,
): IValidationResult {
  const result: IValidationResult = {
    isValid: false,
    message: null,
  };

  const numberValue = parseFloat(value);
  if (max) {
    result.isValid =
      !isNaN(numberValue) && numberValue > 0 && numberValue <= max;
  } else {
    result.isValid = !isNaN(numberValue) && numberValue > 0;
  }

  if (!result.isValid) {
    result.message = 'must be a positive number';
  }

  return result;
}
