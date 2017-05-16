import {ItemListaPrecios} from './itemListaPrecios';
export class ListaPrecios {
  id: number;
  nombre: string;
  porcentaje: number | string;
  activo = true;
  lista_precio_item: ItemListaPrecios[] = [];
}
