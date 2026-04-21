export type PromotionType = 'producto' | 'global' | 'elemento';

export interface Promotion {
  id: string;
  nombre: string;
  tipo: PromotionType;
  descuento: number; // porcentaje 0-100
  targetId?: string; // funkoId o elemento
  activo: boolean;
  desde: number;
  hasta: number;
  createdAt: number;
}
