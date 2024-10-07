import { i18n } from '../../../app/i18n';
import { IPasswordConfirm, IValidationResult } from '../../index';

export function validateEmail(email: string): IValidationResult {
  const result: IValidationResult = {
    isValid: false,
    message: null,
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  result.isValid = emailPattern.test(email);
  result.message = result.isValid
    ? null
    : (i18n.t('AUTH.LOGIN.EMAIL_INVALID') as string);

  return result;
}

export function validatePassword(password: string): IValidationResult {
  const result: IValidationResult = {
    isValid: false,
    message: null,
  };

  result.isValid = !!password.length;

  if (!result.isValid) {
    result.message = i18n.t('AUTH.LOGIN.PASSWORD_REQUIRED') as string;
  } else if (password.includes(' ')) {
    result.message = i18n.t('AUTH.LOGIN.PASSWORD_INCLUDE_SPACES') as string;
  }
  return result;
}

export function validateId(id: string): IValidationResult {
  const result: IValidationResult = {
    isValid: false,
    message: null,
  };

  result.isValid = !!id.length;

  if (!result.isValid) {
    result.message = i18n.t('AUTH.LOGIN.USER_ID_REQUIRED') as string;
  }

  return result;
}

export function validateConfirmPassword({
  password,
  comparedPassword,
}: IPasswordConfirm): IValidationResult {
  const result: IValidationResult = {
    isValid: false,
    message: null,
  };

  result.isValid = password === comparedPassword;

  if (!result.isValid) {
    result.message = i18n.t('USER.REGISTER.PASSWORD_CONFIRM') as string;
  }
  return result;
}
