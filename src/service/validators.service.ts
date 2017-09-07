import { Injectable } from '@angular/core';
import {AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {ApiService} from './api.service';
import {isNullOrUndefined} from 'util';

@Injectable()
export class ValidatorsService {

  constructor(private apiService: ApiService) { }

  decimalPlacesValidator(max_places: number): ValidatorFn  {
    return function (c: AbstractControl) {
      const num = ('' + c.value).replace(',', '');
      const dec_pos = (num).indexOf('.');
      if (dec_pos === -1 || (num.length - 1 - dec_pos <= max_places)) {
        return null;
      } else {
        return {
          decimalPlaces: {
            decimalPlaces: max_places,
            currentdecimalPlaces: num.length - 1 - dec_pos
          }
        };
      }
    };
  }

  asyncUniqueCodeValidator(path: string): AsyncValidatorFn  {
    return function (c: AbstractControl): Promise<ValidationErrors | null> {
      return new Promise(resolve => {
        if (!isNullOrUndefined(c.value)) {
          this.apiService.get(path + '/codigo/' + c.value).subscribe(
            json => {
              if (json === '') {
                resolve(null);
              } else {
                console.log(this.element);
                if (json.id === this.element.id) {
                  resolve(null);
                } else {
                  resolve({
                    uniqueCode: true
                  });
                }
              }
            }
          );
        } else {
          resolve(null);
        }
      });
    };
  }


  composeValidatorsFromMetadata(field: any, element: any, data: any = {}): Array<ValidatorFn> {
    const validators: Array<ValidatorFn> = [];
    if (Reflect.getMetadata(field.name, element, 'min') !== undefined) {
      field.type = 'number';
      validators.push(Validators.min(Reflect.getMetadata(field.name, element, 'min')));
    }
    if (Reflect.getMetadata(field.name, element, 'max') !== undefined) {
      field.type = 'number';
      validators.push(Validators.max(Reflect.getMetadata(field.name, element, 'max')));
    }
    if (Reflect.getMetadata(field.name, element, 'required') !== undefined) {
      field.required = 'required';
      validators.push(Validators.required);
    }
    if (Reflect.getMetadata(field.name, element, 'requiredTrue') !== undefined) {
      field.required = 'required';
      validators.push(Validators.requiredTrue);
    }
    if (Reflect.getMetadata(field.name, element, 'email') !== undefined) {
      validators.push(Validators.email);
    }
    if (Reflect.getMetadata(field.name, element, 'minLength') !== undefined) {
      validators.push(Validators.minLength(Reflect.getMetadata(field.name, element, 'minLength')));
    }
    if (Reflect.getMetadata(field.name, element, 'maxLength') !== undefined) {
      validators.push(Validators.maxLength(Reflect.getMetadata(field.name, element, 'maxLength')));
    }
    if (Reflect.getMetadata(field.name, element, 'pattern') !== undefined) {
      validators.push(Validators.pattern(Reflect.getMetadata(field.name, element, 'pattern')));
    }
    if (Reflect.getMetadata(field.name, element, 'null') !== undefined) {
      validators.push(Validators.nullValidator);
    }
    if (Reflect.getMetadata(field.name, element, 'references') !== undefined) {
      field.type = 'select';
      field.references = Reflect.getMetadata(field.name, element, 'references');
    }
    if (Reflect.getMetadata(field.name, element, 'enum') !== undefined) {
      field.type = 'select';
      data[field.name] = Reflect.getMetadata(field.name, element, 'enum');
      field.references = field.name;
    }
    if (Reflect.getMetadata(field.name, element, 'decimal') !== undefined) {
      const metadata = Reflect.getMetadata(field.name, element, 'decimal');
      validators.push(this.decimalPlacesValidator(metadata['decimal_places']));
      if (Reflect.getMetadata(field.name, element, 'max') === undefined) {
        const max_number = Math.pow(10, (metadata['total'] - metadata['decimal_places'])) -
          Math.pow(0.1, metadata['decimal_places']);
        validators.push(Validators.max(max_number));
      }
    }

    return validators;
  }

  composeAsyncValidatorsFromMetadata(field: any, element: any): Array<AsyncValidatorFn> {
    const validators: Array<AsyncValidatorFn> = [];
    if (Reflect.getMetadata(field.name, element, 'async') !== undefined) {
      validators.push(this.asyncUniqueCodeValidator(Reflect.getMetadata(field.name, element, 'async')).bind(this));
    }
    return validators;
  }
}
