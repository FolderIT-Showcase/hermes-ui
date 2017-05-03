import { Directive, forwardRef, Input } from '@angular/core';
import { NG_ASYNC_VALIDATORS, Validator, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { ApiService } from '../../service/api.service';
import { Cliente } from 'domain/cliente';
@Directive({
  selector: '[app-asyncValidator][formControlName], [app-asyncValidator][ngModel]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => AsyncValidatorDirective), multi: true
    }
  ]
})

export default class AsyncValidatorDirective implements Validator {
  @Input() cliente: Cliente;
  constructor(private apiService: ApiService) {

  }

  validate( c: AbstractControl ): Promise<{[key: string]: any}> {
    return this.validateUniqueCodePromise(c.value);
  }

  validateUniqueCodePromise( codigo: string ) {
    return new Promise(resolve => {
      this.apiService.get('clientes/codigo/' + codigo).subscribe(
        json => {
          if (json === '') {
            return resolve(null);
          } else {
            if (json.id === this.cliente.id) {
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
