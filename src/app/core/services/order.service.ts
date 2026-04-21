import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  docData,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';

import { Order, OrderStatus } from '../../shared/models';
import { stripUndefined } from '../../shared/utils/firestore.util';
import { ProductService } from './product.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly firestore = inject(Firestore);
  private readonly products = inject(ProductService);
  private readonly col: CollectionReference<DocumentData> = collection(
    this.firestore,
    'orders',
  );

  /** Crea la orden y descuenta stock de cada producto. */
  async createOrder(payload: Omit<Order, 'id'>): Promise<string> {
    const ref = await addDoc(this.col, stripUndefined(payload));
    // Actualizamos stock/popularidad en paralelo. Capturamos errores para que
    // un fallo de stock en un item no impida crear la orden (el admin puede revisar).
    await Promise.all(
      payload.items.map((it) =>
        this.products
          .decrementStock(it.funko.id, it.cantidad)
          .catch((err) => console.warn('[OrderService] stock update failed', err)),
      ),
    );
    return ref.id;
  }

  getByUser(userId: string): Observable<Order[]> {
    // Solo filtramos por userId en Firestore para no requerir un índice
    // compuesto (userId + createdAt). Ordenamos en cliente.
    const q = query(this.col, where('userId', '==', userId));
    return (collectionData(q, { idField: 'id' }) as Observable<Order[]>).pipe(
      map((orders) => [...orders].sort((a, b) => b.createdAt - a.createdAt)),
    );
  }

  getAll(): Observable<Order[]> {
    const q = query(this.col, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Order[]>;
  }

  getById(id: string): Observable<Order | undefined> {
    return docData(doc(this.firestore, `orders/${id}`), { idField: 'id' }) as Observable<
      Order | undefined
    >;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    await updateDoc(doc(this.firestore, `orders/${id}`), {
      status,
      updatedAt: Date.now(),
    });
  }
}
