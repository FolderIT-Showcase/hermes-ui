﻿import {RouterModule, Routes} from '@angular/router';

import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import {AuthGuard} from '../guard/auth.guard';
import {ClientesComponent} from './clientes/clientes.component';
import { VendedoresComponent } from 'app/vendedores/vendedores.component';
import { ArticulosComponent } from 'app/articulos/articulos.component';
import { ZonasComponent } from 'app/zonas/zonas.component';
import { RubrosComponent } from 'app/rubros/rubros.component';
import { SubrubrosComponent } from 'app/subrubros/subrubros.component';
import { MarcasComponent } from 'app/marcas/marcas.component';

const appRoutes: Routes = [
  {path: '', component: HomeComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'clientes', component: ClientesComponent, canActivate: [AuthGuard]},
  {path: 'vendedores', component: VendedoresComponent, canActivate: [AuthGuard]},
  {path: 'articulos', component: ArticulosComponent, canActivate: [AuthGuard]},
  {path: 'zonas', component: ZonasComponent, canActivate: [AuthGuard]},
  {path: 'rubros', component: RubrosComponent, canActivate: [AuthGuard]},
  {path: 'subrubros', component: SubrubrosComponent, canActivate: [AuthGuard]},
  {path: 'marcas', component: MarcasComponent, canActivate: [AuthGuard]},

  // otherwise redirect to home
  {path: '**', redirectTo: ''}
];

export const routing = RouterModule.forRoot(appRoutes);
