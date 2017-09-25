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
import { OrdenesPagoComponent } from './ordenes-pago/ordenes-pago.component';
import { SeleccionChequesComponent } from './ordenes-pago/seleccion-cheques/seleccion-cheques.component';
import {FastAbmChequePropioComponent} from './ordenes-pago/fast-abm-cheque-propio/fast-abm-cheque-propio.component';

const modals = [
  ModalProveedorComponent,
  ModalTipoRetencionComponent,
  SeleccionChequesComponent,
  FastAbmChequePropioComponent,
];

@NgModule({
  imports: [
    SharedModule,
    ComprasRoutingModule,
  ],
  declarations: [
    ComprobantesCompraComponent,
    CtaCteProveedoresComponent,
    PeriodosFiscalesComponent,
    ProveedoresComponent,
    TipoRetencionComponent,
    modals,
    OrdenesPagoComponent,
    SeleccionChequesComponent,
    FastAbmChequePropioComponent,
  ],
  entryComponents: [
    modals
  ]
})
export class ComprasModule { }
