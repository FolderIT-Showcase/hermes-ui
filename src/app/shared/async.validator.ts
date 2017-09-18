import { Directive, forwardRef, Input } from '@angular/core';
import { NG_ASYNC_VALIDATORS, Validator, AbstractControl } from '@angular/forms';
import { ApiService } from './services/api.service';
@Directive({
  selector: '[app-asyncValidator][formControlName], [app-asyncValidator][ngModel]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => AsyncValidatorDirective), multi: true
    }
  ]
})

export class AsyncValidatorDirective implements Validator {
  @Input() objeto: any;
  @Input() path: any;
  constructor(private apiService: ApiService) {

  }

  validate( c: AbstractControl ): Promise<{[key: string]: any}> {
    return this.validateUniqueCodePromise(c.value);
  }

  validateUniqueCodePromise( codigo: string ) {
    return new Promise(resolve => {
      this.apiService.get(this.path + '/codigo/' + codigo).subscribe(
        json => {
          if (json === '') {
            return resolve(null);
          } else {
            if (json.id === this.objeto.id) {
              return resolve(null);
            } else {
              return resolve({
            asyncInvalid: true
          });
            }
          }
        }
      );
    });
  }
}
