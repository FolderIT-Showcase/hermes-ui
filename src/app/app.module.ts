import {BrowserModule} from '@angular/platform-browser';
import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';
import {AlertComponent} from '../component/alert/alert.component';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {AuthGuard} from '../guard/auth.guard';
import {UserService} from '../service/user.service';
import {AlertService} from '../service/alert.service';
import {AuthenticationService} from '../service/authentication.service';
import {routing} from './app.routing';
import {ApiService} from '../service/api.service';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ClientesComponent } from './clientes/clientes.component';
import { DataTablesModule } from 'angular-datatables';
import { AsyncValidatorDirective } from './clientes/async.validator';
import { VendedoresComponent } from './vendedores/vendedores.component';
import { RubrosComponent } from './rubros/rubros.component';
import { SubrubrosComponent } from './subrubros/subrubros.component';
import { ArticulosComponent } from './articulos/articulos.component';
import { ZonasComponent } from './zonas/zonas.component';
import { MarcasComponent } from './marcas/marcas.component';
import { FacturasComponent } from './facturas/facturas.component';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ListaPreciosComponent } from './lista-precios/lista-precios.component';
import {TextMaskModule} from 'angular2-text-mask';
import { ArticuloCodigoTypeaheadComponent } from './facturas/typeahead/articuloCodigoTypeahead.component';
import {ArticuloTypeaheadComponent} from './facturas/typeahead/articuloTypeahead.component';
import { PresupuestosComponent } from './presupuestos/presupuestos.component';
import { FacturaComponent } from './facturas//factura/factura.component';
import { PresupuestoComponent } from './presupuestos/presupuesto/presupuesto.component';
import { CtaCteClientesComponent } from './cta-cte-clientes/cta-cte-clientes.component';
import { NotaDebitoComponent } from './nota-debito/nota-debito.component';
import { NotaCreditoComponent } from './nota-credito/nota-credito.component';
import { NotaComponent } from './nota-credito/nota/nota.component';
import { MyDatePickerModule } from 'mydatepicker';
import {DeactivateGuardService} from '../service/deactivate-guard.service';
import {TooltipModule} from 'ngx-bootstrap/tooltip';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ProveedoresComponent } from './proveedores/proveedores.component';
import { PeriodosFiscalesComponent } from './periodos-fiscales/periodos-fiscales.component';
import { ImpresionComponent } from './impresion/impresion.component';
import {NavbarTitleService} from '../service/navbar-title.service';
import { TipoRetencionComponent } from './tipo-retencion/tipo-retencion.component';
import { ComprobantesCompraComponent } from './comprobantes-compra/comprobantes-compra.component';
import { LibroIvaComponent } from './libro-iva/libro-iva.component';
import { UniquePipe } from './unique.pipe';
import { RecuperarPasswordComponent } from './recuperar-password/recuperar-password.component';
import { CtaCteProveedoresComponent } from './cta-cte-proveedores/cta-cte-proveedores.component';
import { ResumenVentasComponent } from './resumen-ventas/resumen-ventas.component';
import { BancoComponent } from './banco/banco.component';
import { CuentaBancariaComponent } from './cuenta-bancaria/cuenta-bancaria.component';
import { TipoTarjetaComponent } from './tipo-tarjeta/tipo-tarjeta.component';
import { CarteraValoresComponent } from './cartera-valores/cartera-valores.component';
import { ChequesComponent } from './cartera-valores/cheques/cheques.component';
import { DepositosComponent } from './cartera-valores/depositos/depositos.component';
import { TarjetasComponent } from './cartera-valores/tarjetas/tarjetas.component';
import { CobrosComponent } from './cobros/cobros.component';
import { ModalTarjetaComponent } from './cartera-valores/tarjetas/modal-tarjeta/modal-tarjeta.component';
import { ModalDepositoComponent } from './cartera-valores/depositos/modal-deposito/modal-deposito.component';
import { ModalChequeComponent } from './cartera-valores/cheques/modal-cheque/modal-cheque.component';
import {HelperService} from '../service/helper.service';
import { AbmComponent } from './abm/abm.component';
import { ModalAbmComponent } from './abm/modal-abm/modal-abm.component';
import { ModalZonaComponent } from './zonas/modal-zona/modal-zona.component';
import { ModalVendedorComponent } from './vendedores/modal-vendedor/modal-vendedor.component';
import { ModalTipoTarjetaComponent } from './tipo-tarjeta/modal-tipo-tarjeta/modal-tipo-tarjeta.component';
import { ModalTipoRetencionComponent } from './tipo-retencion/modal-tipo-retencion/modal-tipo-retencion.component';
import { ModalSubrubroComponent } from './subrubros/modal-subrubro/modal-subrubro.component';
import { ModalRubroComponent } from './rubros/modal-rubro/modal-rubro.component';
import { ModalProveedorComponent } from './proveedores/modal-proveedor/modal-proveedor.component';
import { ModalMarcaComponent } from './marcas/modal-marca/modal-marca.component';
import { ModalCuentaBancariaComponent } from './cuenta-bancaria/modal-cuenta-bancaria/modal-cuenta-bancaria.component';
import { ModalClienteComponent } from './clientes/modal-cliente/modal-cliente.component';
import { ModalBancoComponent } from './banco/modal-banco/modal-banco.component';
import { ModalArticuloComponent } from './articulos/modal-articulo/modal-articulo.component';
import { ProgressBarComponent } from './abm/progress-bar/progress-bar.component';
import { FastAbmComponent } from './fast-abm/fast-abm.component';
import { FastAbmChequeComponent } from './cartera-valores/cheques/fast-abm-cheque/fast-abm-cheque.component';
import { FastAbmDepositoComponent } from './cartera-valores/depositos/fast-abm-deposito/fast-abm-deposito.component';
import { FastAbmTarjetaComponent } from './cartera-valores/tarjetas/fast-abm-tarjeta/fast-abm-tarjeta.component';

@NgModule({
  declarations: [
    AppComponent,
    AsyncValidatorDirective,
    AlertComponent,
    HomeComponent,
    LoginComponent,
    NavbarComponent,
    SidebarComponent,
    ClientesComponent,
    VendedoresComponent,
    RubrosComponent,
    SubrubrosComponent,
    ArticulosComponent,
    ZonasComponent,
    MarcasComponent,
    FacturasComponent,
    ListaPreciosComponent,
    ArticuloTypeaheadComponent,
    ArticuloCodigoTypeaheadComponent,
    PresupuestosComponent,
    FacturaComponent,
    PresupuestoComponent,
    CtaCteClientesComponent,
    NotaDebitoComponent,
    NotaCreditoComponent,
    NotaComponent,
    UsuariosComponent,
    ProveedoresComponent,
    PeriodosFiscalesComponent,
    ImpresionComponent,
    TipoRetencionComponent,
    ComprobantesCompraComponent,
    LibroIvaComponent,
    UniquePipe,
    RecuperarPasswordComponent,
    CtaCteProveedoresComponent,
    ResumenVentasComponent,
    BancoComponent,
    CuentaBancariaComponent,
    TipoTarjetaComponent,
    CarteraValoresComponent,
    ChequesComponent,
    DepositosComponent,
    TarjetasComponent,
    CobrosComponent,
    ModalTarjetaComponent,
    ModalDepositoComponent,
    ModalChequeComponent,
    AbmComponent,
    ModalAbmComponent,
    ModalZonaComponent,
    ModalVendedorComponent,
    ModalTipoTarjetaComponent,
    ModalTipoRetencionComponent,
    ModalSubrubroComponent,
    ModalRubroComponent,
    ModalProveedorComponent,
    ModalMarcaComponent,
    ModalCuentaBancariaComponent,
    ModalClienteComponent,
    ModalBancoComponent,
    ModalArticuloComponent,
    ProgressBarComponent,
    FastAbmComponent,
    FastAbmChequeComponent,
    FastAbmDepositoComponent,
    FastAbmTarjetaComponent
  ],
  imports: [
    TypeaheadModule.forRoot(),
    TooltipModule.forRoot(),
    BrowserModule,
    FormsModule,
    HttpModule,
    routing,
    DataTablesModule,
    TextMaskModule,
    MyDatePickerModule
  ],
  providers: [
    AuthGuard,
    AlertService,
    AuthenticationService,
    UserService,
    ApiService,
    DeactivateGuardService,
    NavbarTitleService,
    HelperService
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA],
  entryComponents: [
    ModalZonaComponent,
    ModalVendedorComponent,
    ModalTipoTarjetaComponent,
    ModalTipoRetencionComponent,
    ModalSubrubroComponent,
    ModalRubroComponent,
    ModalProveedorComponent,
    ModalMarcaComponent,
    ModalCuentaBancariaComponent,
    ModalBancoComponent,
    ModalArticuloComponent,
    FastAbmChequeComponent,
    FastAbmDepositoComponent,
    FastAbmTarjetaComponent
  ],
})
export class AppModule {
}
