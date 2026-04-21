import { ElementType } from './element-type';

export interface Funko {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: ElementType;
  precio: number;
  stock: number;
  imagen_url: string;
  descuento?: number;
  fecha_creacion: number;
  vistas: number;
  popularidad: number;
  destacado?: boolean;
}

export type SortOption = 'precio_asc' | 'precio_desc' | 'popularidad' | 'nuevos';

export interface ProductFilters {
  search?: string;
  tipo?: ElementType | 'all';
  sort?: SortOption;
}
