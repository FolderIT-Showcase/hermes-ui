import {Component, ComponentFactoryResolver, HostListener, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {DataTableDirective} from 'angular-datatables';
import {ApiService} from '../../services/api.service';
import {AlertService} from '../../services/alert.service';
import {TitleService} from '../../services/title.service';
import {ModalAbmComponent} from './modal-abm/modal-abm.component';
import {HelperService} from '../../services/helper.service';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-abm',
  templateUrl: './abm.component.html',
  styleUrls: ['./abm.component.css']
})
export class AbmComponent implements OnInit, OnDestroy {
  @Input() data: any = {};
  @Input() dtOptions: any = {};
  @Input() femenino = false;
  @Input() nombreElemento = 'elemento';
  @Input() pluralElemento;
  @Input() path: string;
  @Input() elementClass: any;
  @Input() modalComponent: any;
  @Input() tableHeader: TemplateRef<any>;
  @Input() tableBody: TemplateRef<any>;
  @Input() beforeElementLoad: Function;
  @Input() beforeElementNew: Function;
  @Input() beforeElementEdit: Function;
  @Input() onElementLoad: Function;
  @Input() onElementNew: Function;
  @Input() onElementEdit: Function;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChild('modalContainer', { read: ViewContainerRef }) container;
  elements: any[] = [];
  dtTrigger: Subject<any> = new Subject();
  elementSeleccionado = {id: '0'};
  modalTitle: string;
  enNuevo: boolean;
  elementOriginal: any;
  mostrarTabla = false;
  mostrarBarraCarga = true;
  submitted = false;
  componentRef: any;
  articuloElemento = 'el';
  private subscriptions: Subscription = new Subscription();

  constructor(private apiService: ApiService,
              private alertService: AlertService,
              private titleService: TitleService,
              private resolver: ComponentFactoryResolver) {
    this.beforeElementLoad = (data) => Observable.of(data);
    this.beforeElementNew = (element, data) => Observable.of(element);
    this.beforeElementEdit = (element, data) => Observable.of(element);
    this.onElementLoad = (json, data) => Observable.of(json);
    this.onElementNew = (element, data) => Observable.of(element);
    this.onElementEdit = (element, data) => Observable.of(element);
  }

  ngOnInit(): void {
    this.articuloElemento = this.femenino ? 'la' : 'el';
    this.pluralElemento = this.pluralElemento ? this.pluralElemento : this.nombreElemento + 's';
    // noinspection JSUnusedGlobalSymbols
    this.dtOptions = {
      pagingType: 'full_numbers',
      autoWidth: true,
      pageLength: 13,
      scrollY: '70vh',
      language: HelperService.defaultDataTablesLanguage(),
      columnDefs: [ {
        'targets': -1,
        'searchable': false,
        'orderable': false
      } ],
      dom: 'Bfrtip',
      buttons: [
        {
          text: (this.femenino ? 'Nueva ' : 'Nuevo ') + this.nombreElemento,
          key: '1',
          className: 'btn btn-success a-override',
          action: () => {
            this.mostrarModalNuevo();
          }
        }
      ]
    };
    this.titleService.setTitle('Gestión de ' + this.pluralElemento);
    const observable1 = this.apiService.get(this.path);
    const observable2 = this.beforeElementLoad(this.data);
    this.subscriptions.add(Observable.zip(observable1, observable2).subscribe( result => {
        this.elements = result[0];
        this.onElementLoad(this.elements, this.data);
        this.mostrarBarraCarga = false;
        this.mostrarTabla = true;
        this.dtTrigger.next();
      },
      () => {
        this.mostrarBarraCarga = false;
    }));

    this.container.clear();
    const factory = this.resolver.resolveComponentFactory(this.modalComponent);
    this.componentRef = this.container.createComponent(factory);
    this.componentRef.instance.path = this.path;
    this.componentRef.instance.femenino = this.femenino;
    this.componentRef.instance.nombreElemento = this.nombreElemento;
    this.componentRef.instance.data = this.data;
    this.componentRef.instance.beforeElementEdit = this.beforeElementEdit;
    this.componentRef.instance.beforeElementNew = this.beforeElementNew;
    this.componentRef.instance.onElementEdit = this.onElementEdit;
    this.componentRef.instance.onElementNew = this.onElementNew;
    this.subscriptions.add(this.componentRef.instance.eventNew.subscribe( (event) => this.handleNew(event)));
    this.subscriptions.add(this.componentRef.instance.eventEdit.subscribe( (event) => this.handleEdit(event)));
  }

  handleNew(element: any) {
    this.onElementNew(element, this.data);
    this.elements.push(element);
    this.recargarTabla();
  }

  handleEdit(element: any) {
    this.onElementEdit(element, this.data);
    Object.assign(this.elements[element['__position']], element);
  }

  mostrarModalNuevo() {
    this.componentRef.instance.nuevo();
  }

  mostrarModalEditar(element: any, index: number) {
    this.componentRef.instance.editar(JSON.parse(JSON.stringify(element)), index);
  }

  mostrarModalEliminar(element: any) {
    this.elementSeleccionado = element;
  }

  eliminar() {
    this.subscriptions.add(this.apiService.delete(this.path + '/' + this.elementSeleccionado.id).subscribe( json => {
      if (json === 'ok') {
        const index: number = this.elements.indexOf(this.elementSeleccionado);
        if (index !== -1) {
          this.elements.splice(index, 1);
        }
        this.recargarTabla();
      } else {
        this.alertService.error(json['error']);
      }
    }));
  }

  private recargarTabla() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
      setTimeout(() => { this.mostrarTabla = true; }, 350);
    });
  }

  // Fix para modales que quedan abiertos, pero ocultos al cambiar de página y la bloquean
  // noinspection JSMethodCanBeStatic
  @HostListener('window:popstate', ['$event'])
  ocultarModals() {
    ModalAbmComponent.close();
    (<any>$('#modalEliminar')).modal('hide');
  }

  ngOnDestroy() {
    this.ocultarModals();
    this.subscriptions.unsubscribe();
  }

  canDeactivate() {
    this.ocultarModals();
    return true;
  }
}
