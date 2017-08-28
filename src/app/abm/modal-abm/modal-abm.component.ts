import {AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IMyDpOptions} from 'mydatepicker';
import {ApiService} from '../../../service/api.service';
import {HelperService} from '../../../service/helper.service';
import {Observable} from 'rxjs/Observable';
import {AsyncValidatorFn, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {ValidatorsService} from '../../../service/validators.service';

@Component({
  selector: 'app-modal-abm',
  template: ''
})
export class ModalAbmComponent<T> implements OnInit, AfterViewChecked {
  @Input() femenino = false;
  @Input() nombreElemento = 'elemento';
  @Input() data: any;
  @Input() shouldSendApiRequest = true;
  @Input() path: string;
  @Output() eventNew = new EventEmitter<T>();
  @Output() eventEdit = new EventEmitter<T>();
  @Input() beforeElementNew: Function;
  @Input() beforeElementEdit: Function;
  modalsize = '';
  elementClass: any;
  element: T;
  myDatePickerOptions: IMyDpOptions;
  submitted = false;
  enNuevo = false;
  modalTitle: string;
  form: FormGroup;
  formRows = [];

  static open() {
    (<any>$('#modalEditar')).modal('show');
  }

  static close() {
    (<any>$('#modalEditar')).modal('hide');
  }

  constructor(protected apiService: ApiService, protected formBuilder: FormBuilder, protected validatorsService: ValidatorsService, protected cdRef: ChangeDetectorRef) {
    this.beforeElementEdit = (element, data) => Observable.of(element);
    this.beforeElementNew = (element, data) => Observable.of(element);
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.makeForm();
    this.myDatePickerOptions = HelperService.defaultDatePickerOptions();
  }

  nuevo() {
    this.modalTitle = (this.femenino ? 'Nueva ' : 'Nuevo ') + this.nombreElemento;
    this.enNuevo = true;
    this.element = new this.elementClass();
    (<any>$('#modalEditar')).modal('show');
    ModalAbmComponent.open();
  }

  editar(elementAEditar: T) {
    this.modalTitle = 'Editar ' + this.nombreElemento;
    this.enNuevo = false;
    this.element = JSON.parse(JSON.stringify(elementAEditar));
    ModalAbmComponent.open();
  }

  cerrar() {
    this.submitted = false;
    ModalAbmComponent.close();
  }

  editarONuevo(f = null) {
    this.submitted = true;
    if (this.form.valid) {
      this.cerrar();

      const elementAEnviar = new this.elementClass();
      Object.assign(elementAEnviar, this.element);

      if (this.enNuevo) {
        this.enNuevo = false;
        this.beforeElementNew(elementAEnviar, this.data).subscribe( (element) => {
          if (this.shouldSendApiRequest) {
            this.apiService.post(this.path, element).subscribe(
              json => {
                this.eventNew.emit(json);
                this.form.reset();
              }
            );
          } else {
            this.eventNew.emit(element);
            this.form.reset();
          }
        });
      } else {
        this.beforeElementEdit(elementAEnviar, this.data).subscribe( (element) => {
          if (this.shouldSendApiRequest) {
            this.apiService.put(this.path + '/' + element.id, element).subscribe(
              json => {
                this.eventEdit.emit(json);
                this.form.reset();
              }
            );
          } else {
            this.eventEdit.emit(element);
            this.form.reset();
          }
        });
      }
    }
  }

  makeForm() {
    let fields = [];
    this.formRows.forEach( row => {
      fields = fields.concat(row);
    });
    const controlsConfig = [];
    fields.forEach( field => {
      field.labelsize = 'col-sm-' + field.labelsize;
      field.fieldsize = 'col-sm-' + field.fieldsize;
      field.offset = 'col-sm-offset-' + (field.offset ? field.offset : 0);
      field.placeholder = field.placeholder ? field.placeholder : field.label;
      field.type = field.type ? field.type : 'text';
      controlsConfig[field.name] = [this.element[field.name], this.composeValidators(field), this.composeAsyncValidators(field)];
    });
    this.form = this.formBuilder.group(controlsConfig);
  }

  protected composeValidators(field: any): Array<ValidatorFn> {
    const validators: Array<ValidatorFn> = [];
    if (Reflect.getMetadata(field.name, this.element, 'min') !== undefined) {
      field.type = 'number';
      validators.push(Validators.min(Reflect.getMetadata(field.name, this.element, 'min')));
    }
    if (Reflect.getMetadata(field.name, this.element, 'max') !== undefined) {
      field.type = 'number';
      validators.push(Validators.max(Reflect.getMetadata(field.name, this.element, 'max')));
    }
    if (Reflect.getMetadata(field.name, this.element, 'required') !== undefined) {
      field.required = 'required';
      validators.push(Validators.required);
    }
    if (Reflect.getMetadata(field.name, this.element, 'requiredTrue') !== undefined) {
      field.required = 'required';
      validators.push(Validators.requiredTrue);
    }
    if (Reflect.getMetadata(field.name, this.element, 'email') !== undefined) {
      validators.push(Validators.email);
    }
    if (Reflect.getMetadata(field.name, this.element, 'minLength') !== undefined) {
      validators.push(Validators.minLength(Reflect.getMetadata(field.name, this.element, 'minLength')));
    }
    if (Reflect.getMetadata(field.name, this.element, 'maxLength') !== undefined) {
      validators.push(Validators.maxLength(Reflect.getMetadata(field.name, this.element, 'maxLength')));
    }
    if (Reflect.getMetadata(field.name, this.element, 'pattern') !== undefined) {
      validators.push(Validators.pattern(Reflect.getMetadata(field.name, this.element, 'pattern')));
    }
    if (Reflect.getMetadata(field.name, this.element, 'null') !== undefined) {
      validators.push(Validators.nullValidator);
    }
    if (Reflect.getMetadata(field.name, this.element, 'references') !== undefined) {
      field.type = 'select';
      field.references = Reflect.getMetadata(field.name, this.element, 'references');
    }
    if (Reflect.getMetadata(field.name, this.element, 'enum') !== undefined) {
      field.type = 'select';
      this.data[field.name] = Reflect.getMetadata(field.name, this.element, 'enum');
      field.references = field.name;
    }
    if (Reflect.getMetadata(field.name, this.element, 'decimal') !== undefined) {
      const metadata = Reflect.getMetadata(field.name, this.element, 'decimal');
      validators.push(this.validatorsService.decimalPlacesValidator(metadata['decimal_places']));
      if (Reflect.getMetadata(field.name, this.element, 'max') === undefined) {
        const max_number = Math.pow(10, (metadata['total'] - metadata['decimal_places'])) -
          Math.pow(0.1, metadata['decimal_places']);
        validators.push(Validators.max(max_number));
      }
    }

    return validators;
  }

  protected composeAsyncValidators(field: any): Array<AsyncValidatorFn> {
    const validators: Array<AsyncValidatorFn> = [];
    if (Reflect.getMetadata(field.name, this.element, 'async') !== undefined) {
      validators.push(this.validatorsService.asyncUniqueCodeValidator(Reflect.getMetadata(field.name, this.element, 'async')).bind(this));
    }
    return validators;
  }
}
