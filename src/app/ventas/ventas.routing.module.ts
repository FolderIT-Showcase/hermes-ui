﻿import {RouterModule, Routes} from '@angular/router';
import {ComposicionSaldosComponent} from './composicion-saldos/composicion-saldos.component';
import {AuthGuard} from '../shared/guards/auth.guard';
import {NgModule} from '@angular/core';
import {DeactivateGuardService} from '../shared/services/deactivate-guard.service';
import {FacturasComponent} from './facturas/facturas.component';
import {CobrosComponent} from './cobros/cobros.component';
import {ResumenVentasComponent} from './resumen-ventas/resumen-ventas.component';
import {LibroIvaComponent} from './libro-iva/libro-iva.component';
import {ImpresionComponent} from './impresion/impresion.component';
import {NotaCreditoComponent} from './nota-credito/nota-credito.component';
import {NotaDebitoComponent} from './nota-debito/nota-debito.component';
import {CtaCteClientesComponent} from './cta-cte-clientes/cta-cte-clientes.component';
import {PresupuestosComponent} from './presupuestos/presupuestos.component';
import {PresupuestoComponent} from './presupuestos/presupuesto/presupuesto.component';

const routes: Routes = [
  {path: 'facturas', component: FacturasComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'presupuestos/presupuesto/:id', component: PresupuestoComponent,
      canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'presupuestos', component: PresupuestosComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'ctacteclientes', component: CtaCteClientesComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'notadebito', component: NotaDebitoComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'notacredito', component: NotaCreditoComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'impresion', component: ImpresionComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'libroiva', component: LibroIvaComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'resumenventas', component: ResumenVentasComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'cobros', component: CobrosComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'composicionsaldos', component: ComposicionSaldosComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VentasRoutingModule {
}
