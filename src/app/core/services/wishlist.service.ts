import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  Firestore,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';

import { WishlistEntry } from '../../shared/models';
import { AuthService } from './auth.service';

/**
 * Maneja la lista de favoritos del usuario autenticado.
 * Requiere login — no hay versión anónima.
 */
@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(AuthService);

  private readonly _ids = signal<Set<string>>(new Set());
  readonly ids = computed(() => this._ids());

  constructor() {
    effect(async () => {
      const uid = this.auth.firebaseUser()?.uid;
      if (!uid) {
        this._ids.set(new Set());
        return;
      }
      await this.refresh(uid);
    });
  }

  isFavorite(funkoId: string): boolean {
    return this._ids().has(funkoId);
  }

  async toggle(funkoId: string): Promise<void> {
    const uid = this.auth.firebaseUser()?.uid;
    if (!uid) throw new Error('Debes iniciar sesión para usar la wishlist');
    const docId = `${uid}_${funkoId}`;
    const ref = doc(this.firestore, `wishlist/${docId}`);

    if (this._ids().has(funkoId)) {
      await deleteDoc(ref);
      this._ids.update((set) => {
        const next = new Set(set);
        next.delete(funkoId);
        return next;
      });
      return;
    }

    const entry: WishlistEntry = { userId: uid, funkoId, addedAt: Date.now() };
    await setDoc(ref, entry);
    this._ids.update((set) => new Set(set).add(funkoId));
  }

  async refresh(uid: string): Promise<void> {
    const q = query(collection(this.firestore, 'wishlist'), where('userId', '==', uid));
    const snap = await getDocs(q);
    const ids = snap.docs.map((d) => (d.data() as WishlistEntry).funkoId);
    this._ids.set(new Set(ids));
  }

  async getFavoriteIds(uid: string): Promise<string[]> {
    const q = query(collection(this.firestore, 'wishlist'), where('userId', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => (d.data() as WishlistEntry).funkoId);
  }
}
