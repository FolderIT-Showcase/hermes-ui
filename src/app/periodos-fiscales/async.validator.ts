import { Directive, forwardRef, Input } from '@angular/core';
import { NG_ASYNC_VALIDATORS, Validator, AbstractControl } from '@angular/forms';
import { ApiService } from '../../service/api.service';
import {PeriodoFiscal} from '../../domain/periodoFiscal';
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
    return this.validateExistingPromise(c.value);
  }

  validateExistingPromise(periodoFiscal: PeriodoFiscal) {
    return new Promise(resolve => {
      this.apiService.get(this.path).subscribe(
        json => {
          if (json === '') {
            return resolve(null);
          } else {
            if ((json.find(p => p.mes === periodoFiscal.mes && p.anio === periodoFiscal.anio)).isNullOrUndefined()) {
              return resolve({
                asyncInvalid: true
              });
            } else {
              return resolve(null);
            }
          }
        }
      );
    });
  }
}
