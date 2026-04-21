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
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { Promotion } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class PromotionService {
  private readonly firestore = inject(Firestore);
  private readonly col: CollectionReference<DocumentData> = collection(
    this.firestore,
    'promotions',
  );

  getAll(): Observable<Promotion[]> {
    return collectionData(this.col, { idField: 'id' }) as Observable<Promotion[]>;
  }

  async create(promo: Omit<Promotion, 'id'>): Promise<string> {
    const ref = await addDoc(this.col, promo);
    return ref.id;
  }

  async update(id: string, patch: Partial<Promotion>): Promise<void> {
    await updateDoc(doc(this.firestore, `promotions/${id}`), patch);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `promotions/${id}`));
  }
}
