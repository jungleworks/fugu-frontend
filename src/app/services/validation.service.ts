 import { Injectable } from "@angular/core";
/**
 * Created by cl-macmini-10 on 19/09/16.
 */
@Injectable()
export class ValidationService {
  static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
    const config = {
      'required': 'This field is required.',
      'invalidCreditCard': 'Please enter a valid credit card number.',
      'invalidEmailAddress': 'Please enter a valid email address.',
      'invalidPassword': 'Please enter a valid password. Password must be at least 6 characters long.',
      'min': `This field must be greater than ${validatorValue.min}`,
      'minlength': `This field must be ${validatorValue.requiredLength} characters long.`,
      'invalidPhoneNumber': 'Please enter a valid phone number.',
      'invalidZipCode': 'Please enter a valid ZIP Code.',
      'invalidVIN': 'Please enter a valid VIN.',
      'invalidWeight': 'Weight value should not exceed 250.',
      'invalidCapacity': 'Vehicle Capcity should not exceed 5500.',
      'invalidOTP': 'Please enter a valid OTP',
      'pattern': 'Invalid characters',
      'invalidPhoneOrEmail' : 'Please enter a valid email address or phone number'
    };

    return config[validatorName];
  }

  static creditCardValidator(control: any) {
    // Visa, MasterCard, American Express, Diners Club, Discover, JCB
    if (control.value.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
      return null;
    } else {
      return { 'invalidCreditCard': true };
    }
  }

  static emailValidator(control: any) {
    // RFC 2822 compliant regex
    if (!control.value) {
      return null;
    }
    if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/) || control.value == '') {
      return null;
    } else {
      return { 'invalidEmailAddress': true };
    }
  }

  static alternateEmailValidator(control: any) {
    // RFC 2822 compliant regex
    if (control.value == '') {
      return null;
    } else if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/) || control.value == '') {
      return null;
    } else {
      return { 'invalidEmailAddress': true };
    }
  }

  static passwordValidator(control: any) {
    // {6,100}           - Assert password is between 6 and 100 characters
    // (?=.*[0-9])       - Assert a string has at least one number
    if (!control.value) {
      return null;
    }
    if (control.value.length > 5) {
      return null;
    } else {
      return { 'invalidPassword': true };
    }
  }

  static phoneNumberValidator(control: any) {
    // US Phone numbers
    if ((control.value.match(/^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i) && (control.value.length == 10)) || (control.value == '')) {
      return null;
    } else {
      return { 'invalidPhoneNumber': true };
    }
  }

  static zipCodeValidator(control: any) {
    // US Phone numbers
    if (control.value.match(/^[a-zA-Z0-9 ]*$/)) {
      return null;
    } else {
      return { 'invalidZipCode': true };
    }
  }

  static NumberValidator(control: any) {
    // Numbers
    if (!control.value) {
      return null;
    }
    if (control.value.match(/^[0-9 ]*$/)) {
      return null;
    } else {
      return { 'invalidPhoneNumber': true };
    }
  }
  static mobileNumberValidator(control: any) {
    if (control.value.match(/^\+?\d+$/)) {
      return null;
    } else {
      return { 'invalidPhoneNumber': true };
    }
  }
  static patternValidator(control: any, pattern: RegExp) {
    if (control.value.match(pattern) || control.value == '') {
      return null;
    } else {
      return { 'invalid characters': true };
    }
  }
  static emailOrPhoneValidator(control: any) {
    //tslint:disable-next-line:max-line-length
    if (!control.value) {
      return null;
    }
    // if (control.value.match(/^(?:\d{10}|\w+@\w+\.\w{2,3})$/) || control.value == '') {
      // if (control.value.match(/^\+?\d+$/) || control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/) || control.value == '') {

    if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])$|^\d{8}/) || control.value == '') {
      return null;
    } else {
      return { 'invalidPhoneOrEmail': true };
    }
  }
}
