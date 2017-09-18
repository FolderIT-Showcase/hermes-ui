import { NgModule } from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {AdministracionRoutingModule} from './administracion.routing.module';
import {UsuariosComponent} from './usuarios/usuarios.component';

@NgModule({
  imports: [
    SharedModule,
    AdministracionRoutingModule
  ],
  declarations: [
    UsuariosComponent
  ]
})
export class AdministracionModule { }
