import {RouterModule, Routes} from '@angular/router';

import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {AuthGuard} from '../guard/auth.guard';
import {ClientesComponent} from './clientes/clientes.component';
import { VendedoresComponent } from 'app/vendedores/vendedores.component';
import { ArticulosComponent } from 'app/articulos/articulos.component';
import { ZonasComponent } from 'app/zonas/zonas.component';
import { RubrosComponent } from 'app/rubros/rubros.component';
import { SubrubrosComponent } from 'app/subrubros/subrubros.component';
import { MarcasComponent } from 'app/marcas/marcas.component';
import { FacturasComponent } from 'app/facturas/facturas.component';
import {ListaPreciosComponent} from './lista-precios/lista-precios.component';
import {PresupuestosComponent} from './presupuestos/presupuestos.component';
import {PresupuestoComponent} from './presupuestos/presupuesto/presupuesto.component';
import {CtaCteClientesComponent} from './cta-cte-clientes/cta-cte-clientes.component';
import {NotaDebitoComponent} from './nota-debito/nota-debito.component';
import {NotaCreditoComponent} from './nota-credito/nota-credito.component';
import {DeactivateGuardService} from 'service/deactivate-guard.service';
import {UsuariosComponent} from './usuarios/usuarios.component';
import {ProveedoresComponent} from './proveedores/proveedores.component';
import {ImpresionComponent} from './impresion/impresion.component';

const appRoutes: Routes = [
  {path: '', component: HomeComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'clientes', component: ClientesComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'proveedores', component: ProveedoresComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'vendedores', component: VendedoresComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'articulos', component: ArticulosComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'zonas', component: ZonasComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'rubros', component: RubrosComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'subrubros', component: SubrubrosComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'marcas', component: MarcasComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'facturas', component: FacturasComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'listaprecios', component: ListaPreciosComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'presupuestos/presupuesto/:id', component: PresupuestoComponent,
    canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'presupuestos', component: PresupuestosComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'ctacteclientes', component: CtaCteClientesComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'notadebito', component: NotaDebitoComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'notacredito', component: NotaCreditoComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'impresion', component: ImpresionComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},

  // otherwise redirect to home
  {path: '**', redirectTo: ''}
];

export const routing = RouterModule.forRoot(appRoutes);
