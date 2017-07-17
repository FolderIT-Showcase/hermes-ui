import { Injectable } from '@angular/core';
import { FormControl,  ValidatorFn } from '@angular/forms';

@Injectable()
export class NumberValidatorsService {

  constructor() { }

  max(max: number): ValidatorFn {
    return (control: FormControl): { [key: string]: boolean } | null => {

      const val: number = control.value;

      if (control.pristine || control.pristine) {
        return null;
      }
      if (val <= max) {
        return null;
      }
      return { 'max': true };
    };
  }

  min(min: number): ValidatorFn {
    return (control: FormControl): { [key: string]: boolean } | null => {

      const val: number = control.value;

      if (control.pristine || control.pristine) {
        return null;
      }
      if (val >= min) {
        return null;
      }
      return { 'min': true };
    };
  }
}


