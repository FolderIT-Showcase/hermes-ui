export class Articulo {
  id: number;
  marca_id: number;
  marca_nombre: string;
  subrubro_id: number;
  subrubro_nombre: string;
  rubro_nombre: string;
  codigo: string;
  codigo_fabrica: string;
  codigo_auxiliar: string;
  nombre: string;
  nombre_reducido: string;
  lleva_stock: Boolean = false;
  costo: number | string = 0;
  punto_pedido: number;
  bajo_minimo: number;
  activo: Boolean = true;
  motivo: string;
  enlista: boolean;
  precio_venta: number;
  nuevo_precio_venta: number | string;
  precio_de_costo: number | string;
}
