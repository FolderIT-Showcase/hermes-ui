import {RouterModule, Routes} from '@angular/router';
import {ClientesComponent} from './clientes/clientes.component';
import {AuthGuard} from '../shared/guards/auth.guard';
import {NgModule} from '@angular/core';
import {DeactivateGuardService} from '../shared/services/deactivate-guard.service';
import {VendedoresComponent} from './vendedores/vendedores.component';
import {ArticulosComponent} from './articulos/articulos.component';
import {ZonasComponent} from './zonas/zonas.component';
import {RubrosComponent} from './rubros/rubros.component';
import {SubrubrosComponent} from './subrubros/subrubros.component';
import {MarcasComponent} from './marcas/marcas.component';
import {ListaPreciosComponent} from './lista-precios/lista-precios.component';
import {BancoComponent} from './banco/banco.component';
import {CuentaBancariaComponent} from './cuenta-bancaria/cuenta-bancaria.component';
import {TipoTarjetaComponent} from './tipo-tarjeta/tipo-tarjeta.component';
import {CarteraValoresComponent} from './cartera-valores/cartera-valores.component';

const routes: Routes = [
  {path: 'articulos', component: ArticulosComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'bancos', component: BancoComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'carteravalores', component: CarteraValoresComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'clientes', component: ClientesComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'cuentasbancarias', component: CuentaBancariaComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'listaprecios', component: ListaPreciosComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'marcas', component: MarcasComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'rubros', component: RubrosComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'subrubros', component: SubrubrosComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'tipostarjeta', component: TipoTarjetaComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'vendedores', component: VendedoresComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
  {path: 'zonas', component: ZonasComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},

  // otherwise redirect to home
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneralRoutingModule {
}
