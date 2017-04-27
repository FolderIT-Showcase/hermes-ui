import {Domicilio} from './domicilio';
export class Cliente {
  id: number;
  // vendedor
  // zona
  // tipo_categoria
  codigo: string;
  nombre: string;
  tipo_responsable: string;
  cuit: string;
  telefono: string;
  celular: string;
  email: string;
  activo: Boolean;
  motivo: string;
  domicilios: Domicilio[];
}
