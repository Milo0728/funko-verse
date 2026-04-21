import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  increment,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';

import { ElementType, Funko } from '../../shared/models';

/**
 * Interactúa con la colección `products` de Firestore.
 * Un único servicio es responsable del CRUD y queries de funkos,
 * para que componentes y admin se mantengan simples.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly firestore = inject(Firestore);
  private readonly col: CollectionReference<DocumentData> = collection(
    this.firestore,
    'products',
  );

  getAll(): Observable<Funko[]> {
    const q = query(this.col, orderBy('fecha_creacion', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Funko[]>;
  }

  getByElement(tipo: ElementType): Observable<Funko[]> {
    const q = query(this.col, where('tipo', '==', tipo));
    return collectionData(q, { idField: 'id' }) as Observable<Funko[]>;
  }

  getById(id: string): Observable<Funko | undefined> {
    return docData(doc(this.firestore, `products/${id}`), { idField: 'id' }) as Observable<
      Funko | undefined
    >;
  }

  /** Retorna hasta `limitCount` funkos del mismo tipo, excluyendo el id actual. */
  getRelated(tipo: ElementType, excludeId: string, limitCount = 4): Observable<Funko[]> {
    return this.getByElement(tipo).pipe(
      map((items) => items.filter((f) => f.id !== excludeId).slice(0, limitCount)),
    );
  }

  async create(funko: Omit<Funko, 'id'>): Promise<string> {
    const ref = await addDoc(this.col, funko);
    return ref.id;
  }

  async update(id: string, patch: Partial<Funko>): Promise<void> {
    await updateDoc(doc(this.firestore, `products/${id}`), patch);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `products/${id}`));
  }

  async incrementViews(id: string): Promise<void> {
    // increment() atómico para evitar carreras entre tabs/usuarios viendo el mismo producto.
    await updateDoc(doc(this.firestore, `products/${id}`), {
      vistas: increment(1),
    });
  }

  async decrementStock(id: string, cantidad: number): Promise<void> {
    await updateDoc(doc(this.firestore, `products/${id}`), {
      stock: increment(-cantidad),
      popularidad: increment(cantidad),
    });
  }
}
