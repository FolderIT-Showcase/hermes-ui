import { NgModule } from '@angular/core';
import {LoginComponent} from './login/login.component';
import {RecuperarPasswordComponent} from './recuperar-password/recuperar-password.component';
import {SharedModule} from '../shared/shared.module';
import {AuthRoutingModule} from './auth.routing.module';

@NgModule({
  imports: [
    SharedModule,
    AuthRoutingModule
  ],
  declarations: [
    LoginComponent,
    RecuperarPasswordComponent
  ]
})
export class AuthModule { }
