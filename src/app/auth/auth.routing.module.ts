﻿import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {NgModule} from '@angular/core';
import {RecuperarPasswordComponent} from './recuperar-password/recuperar-password.component';


const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'recuperarpassword', component: RecuperarPasswordComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {
}
