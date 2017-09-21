import {RouterModule, Routes} from '@angular/router';
import {ClientesComponent} from './clientes/clientes.component';
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
  {path: 'articulos', component: ArticulosComponent, canDeactivate: [DeactivateGuardService]},
  {path: 'bancos', component: BancoComponent, canDeactivate: [DeactivateGuardService]},
  {path: 'carteravalores', component: CarteraValoresComponent, canDeactivate: [DeactivateGuardService]},
  {path: 'clientes', component: ClientesComponent, canDeactivate: [DeactivateGuardService]},
  {path: 'cuentasbancarias', component: CuentaBancariaComponent, canDeactivate: [DeactivateGuardService]},
  {path: 'listaprecios', component: ListaPreciosComponent, canDeactivate: [DeactivateGuardService]},
  {path: 'marcas', component: MarcasComponent, canDeactivate: [DeactivateGuardService]},
  {path: 'rubros', component: RubrosComponent, canDeactivate: [DeactivateGuardService]},
  {path: 'subrubros', component: SubrubrosComponent, canDeactivate: [DeactivateGuardService]},
  {path: 'tipostarjeta', component: TipoTarjetaComponent, canDeactivate: [DeactivateGuardService]},
  {path: 'vendedores', component: VendedoresComponent, canDeactivate: [DeactivateGuardService]},
  {path: 'zonas', component: ZonasComponent, canDeactivate: [DeactivateGuardService]},

  // otherwise redirect to home
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneralRoutingModule {
}
