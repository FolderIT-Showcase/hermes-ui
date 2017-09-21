import {DeactivateGuardService} from '../shared/services/deactivate-guard.service';

﻿import {RouterModule, Routes} from '@angular/router';
import {OrdenesPagoComponent} from './ordenes-pago/ordenes-pago.component';
import {NgModule} from '@angular/core';
import {ComprobantesCompraComponent} from './comprobantes-compra/comprobantes-compra.component';
import {CtaCteProveedoresComponent} from './cta-cte-proveedores/cta-cte-proveedores.component';
import {ProveedoresComponent} from './proveedores/proveedores.component';
import {PeriodosFiscalesComponent} from './periodos-fiscales/periodos-fiscales.component';
import {TipoRetencionComponent} from './tipo-retencion/tipo-retencion.component';


const routes: Routes = [
  {path: 'comprobantescompra', component: ComprobantesCompraComponent, canDeactivate: [DeactivateGuardService]},
  {path: 'ctacteproveedores', component: CtaCteProveedoresComponent, canDeactivate: [DeactivateGuardService]},
  {path: 'periodosfiscales', component: PeriodosFiscalesComponent, canDeactivate: [DeactivateGuardService]},
  {path: 'proveedores', component: ProveedoresComponent, canDeactivate: [DeactivateGuardService]},
  {path: 'tiporetenciones', component: TipoRetencionComponent, canDeactivate: [DeactivateGuardService]},
  {path: 'ordenpago', component: OrdenesPagoComponent, canDeactivate: [DeactivateGuardService]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComprasRoutingModule {
}
