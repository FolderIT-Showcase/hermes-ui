import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IMyDpOptions} from 'mydatepicker';
import {ApiService} from '../../../service/api.service';
import {HelperService} from '../../../service/helper.service';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-modal-abm',
  template: ''
})
export class ModalAbmComponent<T> implements OnInit {
  @Input() femenino = false;
  @Input() nombreElemento = 'elemento';
  @Input() data: any;
  @Input() shouldSendApiRequest = true;
  @Input() path: string;
  @Output() eventNew = new EventEmitter<T>();
  @Output() eventEdit = new EventEmitter<T>();
  @Input() beforeElementNew: Function;
  @Input() beforeElementEdit: Function;
  elementClass: any;
  element: T;
  myDatePickerOptions: IMyDpOptions;
  submitted = false;
  enNuevo = false;
  modalTitle: string;

  static open() {
    (<any>$('#modalEditar')).modal('show');
  }

  static close() {
    (<any>$('#modalEditar')).modal('hide');
  }

  constructor(private apiService: ApiService) {
    this.beforeElementEdit = (element, data) => Observable.of(element);
    this.beforeElementNew = (element, data) => Observable.of(element);
  }

  ngOnInit() {
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

  protected cerrar() {
    this.submitted = false;
    ModalAbmComponent.close();
  }

  protected editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
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
                f.form.reset();
              }
            );
          } else {
            this.eventNew.emit(element);
            f.form.reset();
          }
        });
      } else {
        this.beforeElementEdit(elementAEnviar, this.data).subscribe( (element) => {
          if (this.shouldSendApiRequest) {
            this.apiService.put(this.path + '/' + element.id, element).subscribe(
              json => {
                this.eventEdit.emit(json);
                f.form.reset();
              }
            );
          } else {
            this.eventEdit.emit(element);
            f.form.reset();
          }
        });
      }
    }
  }
}
