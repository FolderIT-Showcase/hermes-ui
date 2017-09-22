﻿import {RouterModule, Routes} from '@angular/router';
import {ComposicionSaldosComponent} from './composicion-saldos/composicion-saldos.component';
import {NgModule} from '@angular/core';
import {DeactivateGuardService} from '../shared/guards/can-deactivate.guard';
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
  {path: 'facturas', component: FacturasComponent, canDeactivate: [DeactivateGuardService]},
    {path: 'presupuestos/presupuesto/:id', component: PresupuestoComponent,
      canDeactivate: [DeactivateGuardService]},
    {path: 'presupuestos', component: PresupuestosComponent, canDeactivate: [DeactivateGuardService]},
    {path: 'ctacteclientes', component: CtaCteClientesComponent, canDeactivate: [DeactivateGuardService]},
    {path: 'notadebito', component: NotaDebitoComponent, canDeactivate: [DeactivateGuardService]},
    {path: 'notacredito', component: NotaCreditoComponent, canDeactivate: [DeactivateGuardService]},
    {path: 'impresion', component: ImpresionComponent, canDeactivate: [DeactivateGuardService]},
    {path: 'libroiva', component: LibroIvaComponent, canDeactivate: [DeactivateGuardService]},
    {path: 'resumenventas', component: ResumenVentasComponent, canDeactivate: [DeactivateGuardService]},
    {path: 'cobros', component: CobrosComponent, canDeactivate: [DeactivateGuardService]},
    {path: 'composicionsaldos', component: ComposicionSaldosComponent, canDeactivate: [DeactivateGuardService]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VentasRoutingModule {
}
