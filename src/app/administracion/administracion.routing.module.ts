﻿import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {UsuariosComponent} from './usuarios/usuarios.component';


const routes: Routes = [
  {path: 'usuarios', component: UsuariosComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministracionRoutingModule {
}
