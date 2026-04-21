import { CartItem } from './cart.model';
import { ShippingAddress } from './user.model';

export type OrderStatus = 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado';

export type PaymentMethod = 'tarjeta' | 'paypal';

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  createdAt: number;
  updatedAt: number;
  trackingCode?: string;
}
