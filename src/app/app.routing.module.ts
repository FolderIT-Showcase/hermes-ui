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
  /*  {path: 'login', component: LoginComponent},
    {path: 'recuperarpassword', component: RecuperarPasswordComponent},
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
    {path: 'periodosfiscales', component: PeriodosFiscalesComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'impresion', component: ImpresionComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'tiporetenciones', component: TipoRetencionComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'comprobantescompra', component: ComprobantesCompraComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'libroiva', component: LibroIvaComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'ctacteproveedores', component: CtaCteProveedoresComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'resumenventas', component: ResumenVentasComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'bancos', component: BancoComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'cuentasbancarias', component: CuentaBancariaComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'tipostarjeta', component: TipoTarjetaComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'carteravalores', component: CarteraValoresComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'cobros', component: CobrosComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},
    {path: 'composicionsaldos', component: ComposicionSaldosComponent, canActivate: [AuthGuard], canDeactivate: [DeactivateGuardService]},*/

  // otherwise redirect to home
  {path: '**', redirectTo: 'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
