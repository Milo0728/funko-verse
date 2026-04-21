import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Mail, Lock, User, Sparkles, UserPlus } from 'lucide-angular';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'fv-register-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div class="fv-card p-8 max-w-md w-full fv-fade-in">
        <div class="flex items-center gap-2 mb-6">
          <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center">
            <lucide-icon [img]="Sparkles" [size]="20" class="text-white"/>
          </span>
          <h1 class="text-2xl font-black text-white">Únete a FunkoVerse</h1>
        </div>
        <p class="text-slate-400 text-sm mb-6">Crea tu cuenta y empieza a coleccionar.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label class="text-sm text-slate-300 flex items-center gap-2 mb-1">
              <lucide-icon [img]="User" [size]="14"/> Nombre
            </label>
            <input type="text" formControlName="displayName" class="fv-input" placeholder="Tu nombre"/>
          </div>
          <div>
            <label class="text-sm text-slate-300 flex items-center gap-2 mb-1">
              <lucide-icon [img]="Mail" [size]="14"/> Email
            </label>
            <input type="email" formControlName="email" class="fv-input" placeholder="tu@correo.com" autocomplete="email"/>
          </div>
          <div>
            <label class="text-sm text-slate-300 flex items-center gap-2 mb-1">
              <lucide-icon [img]="Lock" [size]="14"/> Contraseña
            </label>
            <input type="password" formControlName="password" class="fv-input" placeholder="Mínimo 6 caracteres" autocomplete="new-password"/>
          </div>

          @if (error()) {
            <p class="text-sm text-rose-400">{{ error() }}</p>
          }

          <button type="submit" class="fv-btn fv-btn-primary w-full" [disabled]="form.invalid || loading()">
            <lucide-icon [img]="UserPlus" [size]="16"/>
            {{ loading() ? 'Creando cuenta…' : 'Crear cuenta' }}
          </button>
        </form>

        <p class="text-sm text-slate-400 mt-5 text-center">
          ¿Ya tienes cuenta?
          <a routerLink="/auth/login" class="text-violet-300 hover:text-violet-200 font-semibold">Entrar</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterPage {
  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly User = User;
  readonly Sparkles = Sparkles;
  readonly UserPlus = UserPlus;

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const { displayName, email, password } = this.form.getRawValue();
      await this.auth.register(email, password, displayName);
      this.toast.success('¡Bienvenido a FunkoVerse!');
      await this.router.navigate(['/']);
    } catch (e) {
      const code = (e as { code?: string })?.code ?? '';
      if (code.includes('email-already-in-use')) {
        this.error.set('Ya existe un usuario con ese email.');
      } else if (code.includes('weak-password')) {
        this.error.set('La contraseña es demasiado débil.');
      } else {
        this.error.set('No pudimos registrar tu cuenta.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
