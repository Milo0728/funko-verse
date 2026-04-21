import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
  User,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  docData,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';

import { AppUser, UserRole } from '../../shared/models';
import { stripUndefined } from '../../shared/utils/firestore.util';

/**
 * AuthService: maneja ciclo completo de autenticación con Firebase Auth
 * y sincroniza un perfil enriquecido en la colección `users` de Firestore.
 *
 * El flag `loading` pasa a `false` cuando Firebase hidrata la sesión (tras
 * leer IndexedDB) y se ha intentado leer el perfil. Los guards esperan a
 * este momento antes de decidir, evitando rebotes espurios al login.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);

  private readonly _firebaseUser = signal<User | null>(null);
  private readonly _appUser = signal<AppUser | null>(null);
  private readonly _loading = signal<boolean>(true);

  readonly firebaseUser = this._firebaseUser.asReadonly();
  readonly appUser = this._appUser.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly isLogged = computed(() => this._firebaseUser() !== null);
  readonly isAdmin = computed(() => this._appUser()?.role === 'admin');

  constructor() {
    // Nos suscribimos al docData en vivo para que cambios de rol o datos
    // se reflejen automáticamente en la UI sin requerir recarga.
    let profileSub: Subscription | null = null;

    user(this.auth).subscribe((fbUser) => {
      profileSub?.unsubscribe();
      this._firebaseUser.set(fbUser);

      if (!fbUser) {
        this._appUser.set(null);
        this._loading.set(false);
        return;
      }

      const ref = doc(this.firestore, `users/${fbUser.uid}`);
      profileSub = (docData(ref) as Observable<AppUser | undefined>).subscribe({
        next: (profile) => {
          this._appUser.set(profile ?? null);
          this._loading.set(false);
        },
        error: (err) => {
          // Típicamente un "permission-denied" por reglas de Firestore.
          console.error('[FunkoVerse] No se pudo leer el perfil:', err);
          this._loading.set(false);
        },
      });
    });
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(cred.user, { displayName });

    const newUser: AppUser = {
      uid: cred.user.uid,
      email: cred.user.email ?? email,
      displayName,
      role: 'user',
      createdAt: Date.now(),
    };
    await setDoc(doc(this.firestore, `users/${cred.user.uid}`), stripUndefined(newUser));
    this._appUser.set(newUser);
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this._appUser.set(null);
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  async updateUserProfile(partial: Partial<AppUser>): Promise<void> {
    const uid = this._firebaseUser()?.uid;
    if (!uid) return;
    await updateDoc(doc(this.firestore, `users/${uid}`), {
      ...stripUndefined(partial),
      updatedAt: serverTimestamp(),
    });
    this._appUser.update((u) => (u ? { ...u, ...partial } : u));
  }

  /** Helper para cambiar el rol de un usuario (se invoca desde dev/admin). */
  async setRole(uid: string, role: UserRole): Promise<void> {
    await updateDoc(doc(this.firestore, `users/${uid}`), { role });
  }
}
