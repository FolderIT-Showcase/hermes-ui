﻿import {RouterModule, Routes, PreloadAllModules} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {NgModule} from '@angular/core';
import {AuthGuard} from './shared/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  {
    path: 'administracion',
    loadChildren: './administracion/administracion.module#AdministracionModule',
    canActivate: [AuthGuard],
  },
  {
    path: 'compras',
    loadChildren: './compras/compras.module#ComprasModule',
    canActivate: [AuthGuard],
  },
  {
    path: 'general',
    loadChildren: './general/general.module#GeneralModule',
    canActivate: [AuthGuard],
  },
  {
    path: 'ventas',
    loadChildren: './ventas/ventas.module#VentasModule',
    canActivate: [AuthGuard],
  },
  {
    path: '',
    loadChildren: './auth/auth.module#AuthModule',
  },

  // otherwise redirect to home
  {path: '**', redirectTo: 'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
