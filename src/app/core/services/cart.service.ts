import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

import { CartItem, CartSummary, Funko } from '../../shared/models';
import { stripUndefined } from '../../shared/utils/firestore.util';
import { AuthService } from './auth.service';

const STORAGE_KEY = 'funkoverse.cart.v1';
const SHIPPING_FLAT = 4.99;
const FREE_SHIPPING_THRESHOLD = 75;
const REMOTE_DEBOUNCE_MS = 800;

/**
 * CartService: mantiene el estado del carrito como signal global.
 * - Sin login  -> persistencia en localStorage.
 * - Con login  -> sincroniza a Firestore en `cart/{uid}`.
 *
 * Los writes remotos van con debounce para evitar ráfagas cuando el usuario
 * toca +/- rápido en el carrito.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(AuthService);

  private readonly _items = signal<CartItem[]>(this.loadLocal());
  private remoteTimer: ReturnType<typeof setTimeout> | null = null;
  private hasMergedForUid: string | null = null;

  readonly items = this._items.asReadonly();
  readonly count = computed(() =>
    this._items().reduce((acc, it) => acc + it.cantidad, 0),
  );
  readonly summary = computed<CartSummary>(() => this.computeSummary(this._items()));

  constructor() {
    // Persistencia local en cada cambio (modo invitado o backup).
    effect(() => {
      const items = this._items();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        /* noop */
      }
    });

    // Merge con Firestore cuando el usuario cambia. Guardamos el uid ya
    // mergeado para no repetir el fetch al siguiente change-detection.
    effect(async () => {
      const uid = this.auth.firebaseUser()?.uid ?? null;
      if (!uid) {
        this.hasMergedForUid = null;
        return;
      }
      if (this.hasMergedForUid === uid) return;
      this.hasMergedForUid = uid;
      await this.syncWithRemote(uid);
    });
  }

  add(funko: Funko, cantidad = 1): void {
    this._items.update((items) => {
      const existing = items.find((it) => it.funko.id === funko.id);
      if (existing) {
        const nextQty = Math.min(existing.cantidad + cantidad, funko.stock);
        return items.map((it) =>
          it.funko.id === funko.id ? { ...it, cantidad: nextQty } : it,
        );
      }
      return [...items, { funko, cantidad: Math.min(cantidad, funko.stock) }];
    });
    this.schedulePersistRemote();
  }

  remove(funkoId: string): void {
    this._items.update((items) => items.filter((it) => it.funko.id !== funkoId));
    this.schedulePersistRemote();
  }

  updateQuantity(funkoId: string, cantidad: number): void {
    if (cantidad <= 0) {
      this.remove(funkoId);
      return;
    }
    this._items.update((items) =>
      items.map((it) =>
        it.funko.id === funkoId
          ? { ...it, cantidad: Math.min(cantidad, it.funko.stock) }
          : it,
      ),
    );
    this.schedulePersistRemote();
  }

  clear(): void {
    this._items.set([]);
    this.schedulePersistRemote();
  }

  private computeSummary(items: CartItem[]): CartSummary {
    const subtotal = items.reduce(
      (acc, it) => acc + it.funko.precio * it.cantidad,
      0,
    );
    const discount = items.reduce((acc, it) => {
      const pct = it.funko.descuento ?? 0;
      return acc + (it.funko.precio * it.cantidad * pct) / 100;
    }, 0);
    const afterDiscount = subtotal - discount;
    const shipping =
      afterDiscount >= FREE_SHIPPING_THRESHOLD || items.length === 0
        ? 0
        : SHIPPING_FLAT;
    const total = afterDiscount + shipping;
    const itemCount = items.reduce((acc, it) => acc + it.cantidad, 0);
    return { items, subtotal, discount, shipping, total, itemCount };
  }

  private loadLocal(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }

  private async syncWithRemote(uid: string): Promise<void> {
    try {
      const ref = doc(this.firestore, `cart/${uid}`);
      const snap = await getDoc(ref);
      const remote = (snap.exists() ? (snap.data()['items'] as CartItem[]) : []) ?? [];
      const local = this._items();

      // Merge: prevalece mayor cantidad por si había items pendientes de migrar.
      const merged: Record<string, CartItem> = {};
      for (const it of remote) merged[it.funko.id] = it;
      for (const it of local) {
        merged[it.funko.id] = merged[it.funko.id]
          ? { ...it, cantidad: Math.max(it.cantidad, merged[it.funko.id].cantidad) }
          : it;
      }
      const mergedItems = Object.values(merged);
      this._items.set(mergedItems);
      await setDoc(ref, stripUndefined({ items: mergedItems, updatedAt: Date.now() }));
    } catch (err) {
      console.warn('[CartService] No se pudo sincronizar con Firestore', err);
    }
  }

  private schedulePersistRemote(): void {
    if (!this.auth.firebaseUser()?.uid) return;
    if (this.remoteTimer) clearTimeout(this.remoteTimer);
    this.remoteTimer = setTimeout(() => {
      void this.persistRemote();
    }, REMOTE_DEBOUNCE_MS);
  }

  private async persistRemote(): Promise<void> {
    const uid = this.auth.firebaseUser()?.uid;
    if (!uid) return;
    try {
      const ref = doc(this.firestore, `cart/${uid}`);
      await setDoc(ref, stripUndefined({ items: this._items(), updatedAt: Date.now() }));
    } catch (err) {
      console.warn('[CartService] persistRemote falló', err);
    }
  }
}
