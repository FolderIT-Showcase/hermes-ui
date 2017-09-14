import { NgModule } from '@angular/core';
import {CobrosComponent} from './cobros/cobros.component';
import {ComposicionSaldosComponent} from './composicion-saldos/composicion-saldos.component';
import {CtaCteClientesComponent} from './cta-cte-clientes/cta-cte-clientes.component';
import {FacturaComponent} from './facturas/factura/factura.component';
import {FacturasComponent} from './facturas/facturas.component';
import {ImpresionComponent} from './impresion/impresion.component';
import {LibroIvaComponent} from './libro-iva/libro-iva.component';
import {NotaCreditoComponent} from './nota-credito/nota-credito.component';
import {NotaDebitoComponent} from './nota-debito/nota-debito.component';
import {PresupuestosComponent} from './presupuestos/presupuestos.component';
import {PresupuestoComponent} from './presupuestos/presupuesto/presupuesto.component';
import {ResumenVentasComponent} from './resumen-ventas/resumen-ventas.component';
import {ArticuloTypeaheadComponent} from './facturas/typeahead/articuloTypeahead.component';
import {ArticuloCodigoTypeaheadComponent} from './facturas/typeahead/articuloCodigoTypeahead.component';
import {FastAbmChequeComponent} from './fast-abm-cheque/fast-abm-cheque.component';
import {FastAbmDepositoComponent} from './fast-abm-deposito/fast-abm-deposito.component';
import {FastAbmTarjetaComponent} from './fast-abm-tarjeta/fast-abm-tarjeta.component';
import {NotaComponent} from './nota-credito/nota/nota.component';
import {SharedModule} from '../shared/shared.module';
import {VentasRoutingModule} from './ventas.routing.module';

const modals = [
  FastAbmTarjetaComponent,
  FastAbmDepositoComponent,
  FastAbmChequeComponent
];

@NgModule({
  imports: [
    SharedModule,
    VentasRoutingModule
  ],
  declarations: [
    ArticuloCodigoTypeaheadComponent,
    ArticuloTypeaheadComponent,
    CobrosComponent,
    ComposicionSaldosComponent,
    CtaCteClientesComponent,
    FacturaComponent,
    FacturasComponent,
    ImpresionComponent,
    LibroIvaComponent,
    NotaComponent,
    NotaCreditoComponent,
    NotaDebitoComponent,
    PresupuestoComponent,
    PresupuestosComponent,
    ResumenVentasComponent,
    modals,
  ],
  entryComponents: [
    modals
  ]
})
export class VentasModule { }
