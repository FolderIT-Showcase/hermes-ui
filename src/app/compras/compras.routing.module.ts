﻿import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ComprobantesCompraComponent} from './comprobantes-compra/comprobantes-compra.component';
import {CtaCteProveedoresComponent} from './cta-cte-proveedores/cta-cte-proveedores.component';
import {ProveedoresComponent} from './proveedores/proveedores.component';
import {PeriodosFiscalesComponent} from './periodos-fiscales/periodos-fiscales.component';
import {TipoRetencionComponent} from './tipo-retencion/tipo-retencion.component';


const routes: Routes = [
  {path: 'comprobantescompra', component: ComprobantesCompraComponent},
  {path: 'ctacteproveedores', component: CtaCteProveedoresComponent},
  {path: 'periodosfiscales', component: PeriodosFiscalesComponent},
  {path: 'proveedores', component: ProveedoresComponent},
  {path: 'tiporetenciones', component: TipoRetencionComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComprasRoutingModule {
}
