import {Component, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Cliente} from 'domain/cliente';
import {ApiService} from '../../service/api.service';
import {DataTableDirective} from 'angular-datatables';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  clientes: Cliente[] = [];
  dtTrigger: Subject<any> = new Subject();
  clienteSeleccionado: Cliente = new Cliente();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      autoWidth: true
    };
    this.apiService.get('clientes')
      .subscribe(json => {
        this.clientes = json;
        this.dtTrigger.next();
      });
  }

  editar(cliente: Cliente) {
    this.clienteSeleccionado = cliente;
  }

  mostrarModalEliminar(cliente: Cliente) {
    this.clienteSeleccionado = cliente;
  }

  eliminar() {
    const index: number = this.clientes.indexOf(this.clienteSeleccionado);
    if (index !== -1) {
      this.clientes.splice(index, 1);
    }
    // TODO buscar otra forma de reflejar los cambios en la tabla
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
    this.apiService.delete('clientes/' + this.clienteSeleccionado.id).subscribe();

  }
}
