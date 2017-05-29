import { Component, OnInit } from '@angular/core';
import { Cliente } from 'domain/cliente';
import { TipoComprobante } from 'domain/tipocomprobante';
import { Comprobante } from 'domain/comprobante';
import { Item } from 'domain/item';
import { Articulo } from 'domain/articulo';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../service/api.service';
import { AlertService } from '../../service/alert.service';
import {Marca} from '../../domain/marca';
import {Rubro} from '../../domain/rubro';
import {Subrubro} from '../../domain/subrubro';
import {ListaPrecios} from '../../domain/listaPrecios';
import {Parametro} from '../../domain/parametro';
import {AuthenticationService} from '../../service/authentication.service';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent {
  factura: Comprobante = new Comprobante;
}
