import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IMyDpOptions} from 'mydatepicker';
import {ApiService} from '../../../service/api.service';
import {HelperService} from '../../../service/helper.service';

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

  constructor(private apiService: ApiService) { }

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

  private cerrar() {
    this.submitted = false;
    ModalAbmComponent.close();
  }

  editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      this.cerrar();

      const elementAEnviar = new this.elementClass();
      Object.assign(elementAEnviar, this.element);

      if (this.enNuevo) {
        this.enNuevo = false;
        if (this.shouldSendApiRequest) {
          this.apiService.post(this.path, elementAEnviar).subscribe(
            json => {
              this.eventNew.emit(json);
              f.form.reset();
            }
          );
        } else {
          this.eventNew.emit(elementAEnviar);
          f.form.reset();
        }
      } else {
        if (this.shouldSendApiRequest) {
          this.apiService.put(this.path + '/' + elementAEnviar.id, elementAEnviar).subscribe(
            json => {
              this.eventEdit.emit(json);
              f.form.reset();
            }
          );
        } else {
          this.eventEdit.emit(elementAEnviar);
          f.form.reset();
        }
      }
    }
  }
}
