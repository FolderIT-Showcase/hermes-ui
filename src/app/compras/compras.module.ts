import { NgModule } from '@angular/core';
import {ComprobantesCompraComponent} from './comprobantes-compra/comprobantes-compra.component';
import {CtaCteProveedoresComponent} from './cta-cte-proveedores/cta-cte-proveedores.component';
import {PeriodosFiscalesComponent} from './periodos-fiscales/periodos-fiscales.component';
import {ProveedoresComponent} from './proveedores/proveedores.component';
import {TipoRetencionComponent} from './tipo-retencion/tipo-retencion.component';
import {SharedModule} from '../shared/shared.module';
import {ComprasRoutingModule} from './compras.routing.module';
import {ModalProveedorComponent} from './proveedores/modal-proveedor/modal-proveedor.component';
import {ModalTipoRetencionComponent} from './tipo-retencion/modal-tipo-retencion/modal-tipo-retencion.component';

const modals = [
  ModalProveedorComponent,
  ModalTipoRetencionComponent
];

@NgModule({
  imports: [
    SharedModule,
    ComprasRoutingModule
  ],
  declarations: [
    ComprobantesCompraComponent,
    CtaCteProveedoresComponent,
    PeriodosFiscalesComponent,
    ProveedoresComponent,
    TipoRetencionComponent,
    modals,
  ],
  entryComponents: [
    modals
  ]
})
export class ComprasModule { }
