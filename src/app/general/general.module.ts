import { NgModule } from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {GeneralRoutingModule} from './general.routing.module';
import {ArticulosComponent} from './articulos/articulos.component';
import {BancoComponent} from './banco/banco.component';
import {CarteraValoresComponent} from './cartera-valores/cartera-valores.component';
import {ClientesComponent} from './clientes/clientes.component';
import {CuentaBancariaComponent} from './cuenta-bancaria/cuenta-bancaria.component';
import {ListaPreciosComponent} from './lista-precios/lista-precios.component';
import {MarcasComponent} from './marcas/marcas.component';
import {RubrosComponent} from './rubros/rubros.component';
import {SubrubrosComponent} from './subrubros/subrubros.component';
import {TipoTarjetaComponent} from './tipo-tarjeta/tipo-tarjeta.component';
import {VendedoresComponent} from './vendedores/vendedores.component';
import {ZonasComponent} from './zonas/zonas.component';
import {DecimalPipe} from '@angular/common';
import {TarjetasComponent} from './cartera-valores/tarjetas/tarjetas.component';
import {DepositosComponent} from './cartera-valores/depositos/depositos.component';
import {ChequesComponent} from './cartera-valores/cheques/cheques.component';
import {ModalArticuloComponent} from './articulos/modal-articulo/modal-articulo.component';
import {ModalDepositoComponent} from './cartera-valores/depositos/modal-deposito/modal-deposito.component';
import {ModalBancoComponent} from './banco/modal-banco/modal-banco.component';
import {ModalCuentaBancariaComponent} from './cuenta-bancaria/modal-cuenta-bancaria/modal-cuenta-bancaria.component';
import {ModalMarcaComponent} from './marcas/modal-marca/modal-marca.component';
import {ModalRubroComponent} from './rubros/modal-rubro/modal-rubro.component';
import {ModalSubrubroComponent} from './subrubros/modal-subrubro/modal-subrubro.component';
import {ModalTipoTarjetaComponent} from './tipo-tarjeta/modal-tipo-tarjeta/modal-tipo-tarjeta.component';
import {ModalVendedorComponent} from './vendedores/modal-vendedor/modal-vendedor.component';
import {ModalZonaComponent} from './zonas/modal-zona/modal-zona.component';
import {ModalChequeComponent} from './cartera-valores/cheques/modal-cheque/modal-cheque.component';
import {ModalTarjetaComponent} from './cartera-valores/tarjetas/modal-tarjeta/modal-tarjeta.component';
import {ModalClienteComponent} from './clientes/modal-cliente/modal-cliente.component';
import {ListadoClientesComponent} from './clientes/listado-clientes/listado-clientes.component';
import { PuntosVentaComponent } from './puntos-venta/puntos-venta.component';
import { ModalPuntoVentaComponent } from './puntos-venta/modal-punto-venta/modal-punto-venta.component';

const modals = [
  ModalArticuloComponent,
  ModalDepositoComponent,
  ModalBancoComponent,
  ModalCuentaBancariaComponent,
  ModalMarcaComponent,
  ModalRubroComponent,
  ModalSubrubroComponent,
  ModalTipoTarjetaComponent,
  ModalVendedorComponent,
  ModalZonaComponent,
  ModalChequeComponent,
  ModalTarjetaComponent,
  ModalClienteComponent,
  ModalPuntoVentaComponent
];

@NgModule({
  imports: [
    SharedModule,
    GeneralRoutingModule
  ],
  declarations: [
    ArticulosComponent,
    BancoComponent,
    CarteraValoresComponent,
    ChequesComponent,
    ClientesComponent,
    CuentaBancariaComponent,
    DepositosComponent,
    ListadoClientesComponent,
    ListaPreciosComponent,
    MarcasComponent,
    modals,
    RubrosComponent,
    SubrubrosComponent,
    TipoTarjetaComponent,
    VendedoresComponent,
    TarjetasComponent,
    ZonasComponent,
    PuntosVentaComponent
  ],
  providers: [
    DecimalPipe
  ],
  entryComponents: [
    modals
  ]
})
export class GeneralModule { }
