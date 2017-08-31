import {Async, Decimal, MaxLength, Min, References, Required} from '../service/annotations';

export class Articulo {
  id: number;
  @Required @References('marcas') marca_id: number;
  marca_nombre: string;
  @Required @References('subrubros') subrubro_id: number;
  subrubro_nombre: string;
  rubro_nombre: string;
  @Required @Async('articulos') @MaxLength(10) codigo: string;
  @MaxLength(30) codigo_fabrica: string;
  @MaxLength(30) codigo_auxiliar: string;
  @Required @MaxLength(191) nombre: string;
  @MaxLength(20) nombre_reducido: string;
  lleva_stock: Boolean = false;
  @Decimal(15, 2) @Min(0) costo: number | string = 0;
  @Decimal(11, 0) @Min(0) punto_pedido: number;
  @Decimal(11, 0) @Min(0) bajo_minimo: number;
  activo: Boolean = true;
  @MaxLength(191) motivo: string;
  enlista: boolean;
  precio_venta: number;
  nuevo_precio_venta: number | string;
  precio_de_costo: number | string;
}
