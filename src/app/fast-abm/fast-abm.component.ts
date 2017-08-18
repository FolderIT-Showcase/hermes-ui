import {Component, EventEmitter, Input, OnInit, Output, TemplateRef} from '@angular/core';
import {HelperService} from '../../service/helper.service';

@Component({
  selector: 'app-fast-abm',
  template: ''
})
export class FastAbmComponent<T> implements OnInit {
  @Input() data: any = {};
  @Input() nombreElemento = 'elemento';
  @Input() pluralElemento;
  @Input() elementClass: any;
  @Input() tableHeader: TemplateRef<any>;
  @Input() tableBody: TemplateRef<any>;
  @Input() elements: any[] = [];
  @Output() eventEdit = new EventEmitter<any>();
  element: T;
  elementOriginal: T;
  elementsCopy: T[] = [];
  submitted = false;
  enNuevo = true;
  myDatePickerOptions: any;

  static open() {
    (<any>$('#modalfastabm')).modal('show');
  }

  static close() {
    (<any>$('#modalfastabm')).modal('hide');
  }

  constructor() { }

  abrir() {
    FastAbmComponent.open();
  }

  ngOnInit() {
    this.myDatePickerOptions = HelperService.defaultDatePickerOptions();
    this.pluralElemento = this.pluralElemento ? this.pluralElemento : this.nombreElemento + 's';
    this.elementsCopy = JSON.parse(JSON.stringify(this.elements));
  }

  aceptar() {
    this.eventEdit.emit(this.elementsCopy);
    FastAbmComponent.close();
  }


  editar(elementAEditar: T) {
    this.elementOriginal = elementAEditar;
    this.enNuevo = false;
    this.element = JSON.parse(JSON.stringify(elementAEditar));
  }

  nuevo() {
    this.enNuevo = true;
    this.element = new this.elementClass();
  }

  protected editarONuevo(f: any) {
    this.submitted = true;
    if (f.valid) {
      this.submitted = false;
      const elementAEnviar = new this.elementClass();
      Object.assign(elementAEnviar, this.element);
      this.format(elementAEnviar);
      if (this.enNuevo) {
        this.elementsCopy.push(elementAEnviar);
      } else {
        Object.assign(this.elementOriginal, elementAEnviar);
      }
      this.elementOriginal = null;
      this.enNuevo = true;
      f.form.reset();
    }
  }

  eliminar(index) {
    if (index !== -1) {
      this.elementsCopy.splice(index, 1);
    }
  }

  cancelar(f: any) {
    this.elementOriginal = null;
    this.element = new this.elementClass();
    this.enNuevo = true;
    f.form.reset();
  }

  format(element) { return element; }
}
