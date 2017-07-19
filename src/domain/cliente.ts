import {Domicilio} from './domicilio';
export class Cliente {
  id: number;
  vendedor_id: Number;
  zona_id: Number;
  tipo_categoria_id: Number;
  codigo: string;
  nombre: string;
  tipo_responsable: string;
  tipo_responsable_str: string;
  cuit: string;
  telefono: string;
  celular: string;
  email: string;
  activo: Boolean;
  motivo: string;
  domicilios: Domicilio[];
  lista_id: number;
}
