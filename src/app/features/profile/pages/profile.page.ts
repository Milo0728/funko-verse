import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, User, MapPin, Save, ClipboardList, Heart } from 'lucide-angular';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'fv-profile-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  template: `
    <section class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <header class="mb-6 sm:mb-8 fv-fade-in">
        <h1 class="text-3xl sm:text-4xl font-black fv-title" style="font-family: 'Orbitron', sans-serif">Mi perfil</h1>
        <p class="text-slate-400 mt-2 text-sm sm:text-base">Gestiona tus datos y tu dirección de envío.</p>
      </header>

      <div class="grid md:grid-cols-3 gap-6">
        <aside class="fv-card p-3 sm:p-4 h-fit space-y-1 md:sticky md:top-24">
          <a routerLink="/profile" class="flex items-center gap-2 px-3 py-2 rounded-lg text-white bg-white/5">
            <lucide-icon [img]="User" [size]="15"/> Datos personales
          </a>
          <a routerLink="/profile/orders" class="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white">
            <lucide-icon [img]="ClipboardList" [size]="15"/> Mis pedidos
          </a>
          <a routerLink="/wishlist" class="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white">
            <lucide-icon [img]="Heart" [size]="15"/> Wishlist
          </a>
        </aside>

        <div class="md:col-span-2 space-y-6">
          <div class="fv-card p-5 sm:p-6 fv-fade-in">
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <lucide-icon [img]="User" [size]="18"/> Datos
            </h2>
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-slate-400 mb-1 block">Nombre</label>
                <input type="text" formControlName="displayName" class="fv-input"/>
              </div>
              <div>
                <label class="text-xs text-slate-400 mb-1 block">Teléfono</label>
                <input type="tel" formControlName="phone" class="fv-input"/>
              </div>
              <div class="sm:col-span-2">
                <label class="text-xs text-slate-400 mb-1 block">Email</label>
                <input type="email" [value]="auth.appUser()?.email ?? ''" class="fv-input opacity-60" disabled/>
              </div>
              <div class="sm:col-span-2">
                <button type="submit" class="fv-btn fv-btn-primary" [disabled]="saving() || profileForm.invalid">
                  <lucide-icon [img]="Save" [size]="16"/>
                  {{ saving() ? 'Guardando…' : 'Guardar cambios' }}
                </button>
              </div>
            </form>
          </div>

          <div class="fv-card p-5 sm:p-6 fv-fade-in">
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <lucide-icon [img]="MapPin" [size]="18"/> Dirección de envío
            </h2>
            <form [formGroup]="addressForm" (ngSubmit)="saveAddress()" class="grid sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="text-xs text-slate-400 mb-1 block">Nombre completo</label>
                <input type="text" formControlName="fullName" class="fv-input"/>
              </div>
              <div class="sm:col-span-2">
                <label class="text-xs text-slate-400 mb-1 block">Dirección</label>
                <input type="text" formControlName="street" class="fv-input"/>
              </div>
              <div>
                <label class="text-xs text-slate-400 mb-1 block">Ciudad</label>
                <input type="text" formControlName="city" class="fv-input"/>
              </div>
              <div>
                <label class="text-xs text-slate-400 mb-1 block">Provincia</label>
                <input type="text" formControlName="state" class="fv-input"/>
              </div>
              <div>
                <label class="text-xs text-slate-400 mb-1 block">Código postal</label>
                <input type="text" formControlName="postalCode" class="fv-input"/>
              </div>
              <div>
                <label class="text-xs text-slate-400 mb-1 block">País</label>
                <input type="text" formControlName="country" class="fv-input"/>
              </div>
              <div class="sm:col-span-2">
                <button type="submit" class="fv-btn fv-btn-primary" [disabled]="savingAddress()">
                  <lucide-icon [img]="Save" [size]="16"/>
                  {{ savingAddress() ? 'Guardando…' : 'Guardar dirección' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ProfilePage {
  readonly User = User;
  readonly MapPin = MapPin;
  readonly Save = Save;
  readonly ClipboardList = ClipboardList;
  readonly Heart = Heart;

  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly saving = signal(false);
  readonly savingAddress = signal(false);

  readonly profileForm = this.fb.nonNullable.group({
    displayName: ['', Validators.required],
    phone: [''],
  });

  readonly addressForm = this.fb.nonNullable.group({
    fullName: [''],
    street: [''],
    city: [''],
    state: [''],
    postalCode: [''],
    country: ['España'],
  });

  constructor() {
    // Rellena los formularios cuando el perfil llega de Firestore.
    // Evita la race donde se inicializan vacíos en el ctor.
    effect(() => {
      const u = this.auth.appUser();
      if (!u) return;
      this.profileForm.patchValue(
        { displayName: u.displayName ?? '', phone: u.phone ?? '' },
        { emitEvent: false },
      );
      if (u.address) {
        this.addressForm.patchValue(u.address, { emitEvent: false });
      }
    });
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) return;
    this.saving.set(true);
    try {
      await this.auth.updateUserProfile(this.profileForm.getRawValue());
      this.toast.success('Datos actualizados');
    } catch (err) {
      console.error(err);
      this.toast.error('No pudimos guardar los cambios');
    } finally {
      this.saving.set(false);
    }
  }

  async saveAddress(): Promise<void> {
    this.savingAddress.set(true);
    try {
      await this.auth.updateUserProfile({ address: this.addressForm.getRawValue() });
      this.toast.success('Dirección guardada');
    } catch (err) {
      console.error(err);
      this.toast.error('No pudimos guardar la dirección');
    } finally {
      this.savingAddress.set(false);
    }
  }
}
