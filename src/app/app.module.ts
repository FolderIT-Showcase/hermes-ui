import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';

import {AppComponent} from './app.component';
import {AuthGuard} from './shared/guards/auth.guard';
import {UserService} from './shared/services/user.service';
import {AlertService} from './shared/services/alert.service';
import {AuthenticationService} from './shared/services/authentication.service';
import {AppRoutingModule} from './app.routing.module';
import {ApiService} from './shared/services/api.service';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { FacturaComponent } from './ventas/facturas//factura/factura.component';
import {DeactivateGuardService} from './shared/services/deactivate-guard.service';
import {NavbarTitleService} from './shared/services/navbar-title.service';
import {HelperService} from './shared/services/helper.service';
import {ValidatorsService} from './shared/services/validators.service';
import {SharedModule} from './shared/shared.module';
import {HomeComponent} from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule
  ],
  providers: [
    AuthGuard,
    AlertService,
    AuthenticationService,
    UserService,
    ApiService,
    DeactivateGuardService,
    NavbarTitleService,
    HelperService,
    ValidatorsService,
    { provide: LOCALE_ID, useValue: 'es-AR' }
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA],
  entryComponents: [],
})
export class AppModule {
}
