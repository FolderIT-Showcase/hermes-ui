import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
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
    CtaCteProveedoresComponent
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
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
