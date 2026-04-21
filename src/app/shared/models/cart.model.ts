import { Funko } from './funko.model';

export interface CartItem {
  funko: Funko;
  cantidad: number;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  itemCount: number;
}
