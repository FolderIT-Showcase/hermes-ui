import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';
import {AlertComponent} from '../component/alert/alert.component';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
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
import {AsyncValidatorDirective} from './clientes/async.validator';
import { VendedoresComponent } from './vendedores/vendedores.component';
import { RubrosComponent } from './rubros/rubros.component';
import { SubrubrosComponent } from './subrubros/subrubros.component';
import { ArticulosComponent } from './articulos/articulos.component';
import { ZonasComponent } from './zonas/zonas.component';
import { MarcasComponent } from './marcas/marcas.component';

@NgModule({
  declarations: [
    AppComponent,
    AsyncValidatorDirective,
    AlertComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    NavbarComponent,
    SidebarComponent,
    ClientesComponent,
    VendedoresComponent,
    RubrosComponent,
    SubrubrosComponent,
    ArticulosComponent,
    ZonasComponent,
    MarcasComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing,
    DataTablesModule
  ],
  providers: [
    AuthGuard,
    AlertService,
    AuthenticationService,
    UserService,
    ApiService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
