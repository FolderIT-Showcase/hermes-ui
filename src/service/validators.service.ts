import { Injectable } from '@angular/core';
import {AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn} from '@angular/forms';
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
}
